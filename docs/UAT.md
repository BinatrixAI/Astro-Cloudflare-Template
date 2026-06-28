# UAT — Payment flow

User-acceptance test plan + log/record verification for the checkout → payment → records
cycle. Runs against the **mock payment provider** so the full cycle is exercised without a
real gateway. Swapping to real Yaad Sarig / Hyp is a one-flag change (see the bottom).

- **Provider:** `PAYMENT_PROVIDER=mock` (default). The mock "signs" links with an HMAC over
  `order|amount` (`MOCK_SECRET`), so forged callbacks fail verification — just like the real gateway.
- **Demo product:** `starter` in `src/content/products.json` (₪50). The flow is identical for any product.

## Preconditions

```bash
npm install
npm run db:migrate:local           # applies migrations to the local D1
npm run dev                        # reads .dev.vars (PAYMENT_PROVIDER=mock, MOCK_SECRET, ADMIN_*)
```

`BASE=http://localhost:4321` (or your deployed URL once live).

## Test cases

| # | Case | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 1 | Checkout page renders | GET `/checkout/starter` | 200; product name, price, buyer form | ☐ |
| 2 | Unknown product | GET `/checkout/does-not-exist` | 404 | ☐ |
| 3 | Validation | POST `/api/checkout` with empty/invalid fields | 400 with field issues | ☐ |
| 4 | Server-side pricing (tamper) | POST `/api/checkout` with a bogus client total | Server ignores it, prices from catalog; `pending` row has correct `amount` | ☐ |
| 5 | Link + record | POST valid checkout | Response `url` → `/mock-pay`; `pending` row + `link_created` event; `items_json` stored | ☐ |
| 6 | Mock hosted page | GET the `url`; then with a bad `sig` | Valid: order/total + Approve/Decline; bad sig → **400** | ☐ |
| 7 | Approve → paid | Approve (CCode=0) | Verify → row `paid` (stores `Id`/`ACode`), `verified_paid` event → `/checkout/success` | ☐ |
| 8 | Decline → failed | Callback CCode=901 | Row `failed`, `verify_failed` event → `/checkout/failed` | ☐ |
| 9 | Tamper callback | Approve with wrong `Amount` | Sig/amount mismatch → rejected, row `failed` | ☐ |
| 10 | Idempotency | Replay the Approve callback | Still one `paid` row, no double-count | ☐ |
| 11 | Admin + logs | GET `/admin` (Basic Auth) | Lists purchases + events; no-auth → **401** | ☐ |

## Reproducible API checks (copy/paste)

```bash
BASE=http://localhost:4321

# 4/5 — create an order (single product; bogus total is ignored server-side)
curl -s -X POST $BASE/api/checkout -H 'content-type: application/json' \
  -d '{"items":[{"id":"starter","qty":1}],"name":"Dana","lname":"Cohen","email":"dana@example.com","phone":"+972 50 1234567","bogusTotal":999}'
# -> { "url": ".../mock-pay?order=...&amount=50.00&sig=...", "order": "BN-..." }

# 7 — approve (take order=$O, amount=$A, sig=$S from the url above)
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' \
  "$BASE/api/payments/callback?Order=$O&Amount=$A&Sign=$S&CCode=0&Id=MOCK-$O&ACode=MOCKAUTH"
# -> 302 .../checkout/success

# 9 — tamper (wrong amount) -> 302 .../checkout/failed
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' \
  "$BASE/api/payments/callback?Order=$O&Amount=1.00&Sign=$S&CCode=0"
```

## Logs & records — how to verify

**Records** = `purchases` table (order of record). **Audit log** = `payment_events`
(`link_created` → `callback_received` → `verified_paid`/`verify_failed`). Plus structured
`console.log` JSON to Workers observability. Everything keys off the `order` id.

```bash
# Local D1
wrangler d1 execute DB --local  --command "SELECT id,amount,status,yaad_txn_id FROM purchases ORDER BY created_at DESC LIMIT 10;"
wrangler d1 execute DB --local  --command "SELECT order_id,type,message FROM payment_events ORDER BY id DESC LIMIT 20;"

# Remote D1 (after deploy)
wrangler d1 execute DB --remote --command "SELECT id,amount,status FROM purchases ORDER BY created_at DESC LIMIT 10;"

# Live request/console logs
wrangler tail <worker-name> --format pretty
```
- Admin UI: `/admin` (Basic Auth) — purchases + items + events.
- Workers observability MCP: `query_worker_observability` for `evt:"checkout.*"` / `evt:"callback.*"`.

## Switching to the real Yaad Sarig / Hyp gateway

1. Set `PAYMENT_PROVIDER=yaad` (Worker var) and add secrets `YAAD_MASOF`, `YAAD_PASSP`, `YAAD_KEY`.
2. In the Hyp terminal dashboard, set the success/return URL to `<PUBLIC_BASE_URL>/api/payments/callback`.
3. Re-run TC4–TC11 using Yaad **test cards** on the real hosted page.
- Implementation: `src/lib/payments/yaad.ts` (pure `fetch`, no Node deps). The callback's
  VERIFY round-trip + amount cross-check + idempotency are provider-agnostic and already tested.
