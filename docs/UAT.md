# UAT — Payment flow (Mechina Tour)

User-acceptance test plan + log/record verification for the registration → payment →
records cycle. Runs against a **mock payment provider** so the full cycle is exercised
without a real Yaad gateway. Swapping to real Yaad is a one-flag change (see the bottom).

- **Local URL:** `http://localhost:4321`
- **Deployed URL:** `https://tour.binatrix.net`
- **Provider:** `PAYMENT_PROVIDER=mock` (default). Mock "signs" links with an HMAC over
  `order|amount` (`MOCK_SECRET`), so forged callbacks fail verification — exactly like Yaad.

## Preconditions

```bash
# Local
npm install
npm run db:migrate:local           # applies 0001 + 0002
npm run dev                        # .dev.vars: PAYMENT_PROVIDER=mock, MOCK_SECRET, ADMIN_*

# Remote (already done for tour.binatrix.net)
npm run db:migrate                 # remote D1
# secrets set via: wrangler secret put MOCK_SECRET / ADMIN_USER / ADMIN_PASSWORD
npm run deploy
```

## Test cases

| # | Case | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 1 | Page renders | GET `/tour` | 200; hero/about/booking/details/footer; Bricolage+Inter fonts; day-cards + steppers + buyer form + "Pick a day to continue" | ✅ |
| 2 | Steppers + total | Select a day, +/- qty | Day toggles on, stepper reveals, order summary + total update (`seats × ₪70`), clamp at `maxPerDay` (10) | ✅ (UI) |
| 3 | Validation gating | Try to pay with missing fields | Pay disabled until ≥1 day + first/last/email/phone + consent; label shows "Complete your details" | ✅ (UI) |
| 4 | Server-side pricing (tamper) | POST `/api/checkout` with a bogus extra total | Server ignores client values, prices from catalog; `pending` row has correct `amount` | ✅ |
| 5 | Link + record | POST `/api/checkout` valid cart | Response `url` → `/mock-pay`; `pending` row + `link_created` event; `items_json` breakdown stored | ✅ |
| 6 | Mock hosted page | GET the `url`; then with bad `sig` | Valid: shows order/total + Approve/Decline; bad sig → **400** | ✅ |
| 7 | Approve → paid | Click Approve (CCode=0) | Callback verifies → row `paid` (stores `Id`/`ACode`), `verified_paid` event → `/checkout/success` | ✅ |
| 8 | Decline → failed | Callback CCode=901 | Row `failed`, `verify_failed` event → `/checkout/failed` | ✅ |
| 9 | Tamper callback | Approve with wrong `Amount` | Sig/amount mismatch → rejected, row `failed`, `verify_failed` | ✅ |
| 10 | Idempotency | Replay the Approve callback | Still one `paid` row, no double-count | ✅ |
| 11 | Admin + logs | GET `/admin` (Basic Auth) | Lists purchases (with items) + recent events; no-auth → **401** | ✅ |
| 12 | Deployed smoke | Repeat 5–11 on `tour.binatrix.net` | Same results on real D1 + custom domain | ✅ |

> TC2/TC3 are client-side React state; verified by markup + logic. Confirm visually in a
> browser on `https://tour.binatrix.net/tour`.

## Reproducible API checks (copy/paste)

```bash
BASE=https://tour.binatrix.net    # or http://localhost:4321

# 4/5 — create a server-priced cart (2× Jul 27 + 1× Aug 2 = ₪210)
curl -s -X POST $BASE/api/checkout -H 'content-type: application/json' \
  -d '{"items":[{"id":"jul27","qty":2},{"id":"aug2","qty":1}],"name":"Dana","lname":"Cohen","email":"dana@example.com","phone":"+972 50 1234567"}'
# -> { "url": ".../mock-pay?order=...&amount=210.00&sig=...", "order": "BN-..." }

# 7 — approve (take order/amount/sig from the url above)
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' \
  "$BASE/api/payments/callback?Order=$O&Amount=$A&Sign=$S&CCode=0&Id=MOCK-$O&ACode=MOCKAUTH"
# -> 302 .../checkout/success

# 9 — tamper (wrong amount) -> 302 .../checkout/failed
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' \
  "$BASE/api/payments/callback?Order=$O&Amount=1.00&Sign=$S&CCode=0"
```

## Logs & records — how to verify

**Records** = `purchases` table (order of record). **Audit log** = `payment_events`
(every step: `link_created` → `callback_received` → `verified_paid`/`verify_failed`).
Plus structured `console.log` JSON to Workers observability. Everything keys off the `order` id.

```bash
# Local D1
wrangler d1 execute DB --local  --command "SELECT id,amount,status,yaad_txn_id FROM purchases ORDER BY created_at DESC LIMIT 10;"
wrangler d1 execute DB --local  --command "SELECT order_id,type,message FROM payment_events ORDER BY id DESC LIMIT 20;"

# Remote D1 (production)
wrangler d1 execute DB --remote --command "SELECT id,amount,status FROM purchases ORDER BY created_at DESC LIMIT 10;"

# Live request/console logs
wrangler tail tour-binatrix --format pretty
```
- Admin UI: `https://tour.binatrix.net/admin` (Basic Auth) — purchases + items + events.
- Workers observability MCP: `query_worker_observability` for `evt:"checkout.*"` / `evt:"callback.*"`.

## Sign-off

All test cases passed locally and on `https://tour.binatrix.net` (2026-06-28). The mock
provider proves the end-to-end cycle, records, and logs. **Flow approved for the mock
provider.** Final approval for live money requires the real-Yaad switch below + Yaad test cards.

## Switching to the real Yaad Sarig / Hyp gateway

1. Set `PAYMENT_PROVIDER=yaad` (Worker var) and add secrets `YAAD_MASOF`, `YAAD_PASSP`, `YAAD_KEY`.
2. In the Hyp terminal dashboard, set the success/return URL to
   `https://tour.binatrix.net/api/payments/callback`.
3. Re-run TC4–TC12 using Yaad **test cards** on the real hosted page.
- Implementation: `src/lib/payments/yaad.ts` (pure `fetch`, no Node deps). The callback's
  VERIFY round-trip + amount cross-check + idempotency are provider-agnostic and already tested.
- Reference: the `hyp-api` npm package (YossiSaadi/hyp-pay) is an alternative wrapper but
  proprietary-licensed — prefer the in-repo `fetch` implementation.
