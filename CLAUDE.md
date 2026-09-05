# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

[PROJECT_NAME] - Built with Astro 5 + React 19, styled with Tailwind CSS 4 + HeroUI v3 + shadcn/ui, animated with Motion (Framer Motion), and deployed to Cloudflare Workers.

## Commands

```bash
npm run dev             # Start Astro dev server with hot reload (local D1 + .dev.vars)
npm run build           # Build for Cloudflare Workers
npm run preview         # Preview production build locally
npm run deploy          # Build and deploy to Cloudflare Workers
npm run cf-types        # Regenerate worker-configuration.d.ts after editing wrangler.jsonc
npm run db:migrate:local # Apply D1 migrations to the local database
npm run db:migrate      # Apply D1 migrations to the remote (production) database

# Add new shadcn component (requires npx)
npx shadcn@latest add [component-name]

# Local testing with Wrangler
npx wrangler pages dev ./dist --port 8799
```

## UI libraries — when to use which (decision matrix)

This template ships **both** libraries on purpose. Follow this matrix so the two coexist cleanly — do **not** mix a HeroUI `Button` and a shadcn `Button` in the same UI region.

| Need | Use | Why |
|------|-----|-----|
| App chrome / overlays: Navbar, Modal, Dropdown, Chip, Link, Divider | **HeroUI** | Rich, pre-styled, interactive shells |
| Forms & content primitives: Button, Input, Card, Label, Select, Form | **shadcn/ui** | Token-driven, customizable, ideal with react-hook-form + zod |
| Animation (entrance, scroll, exit, hover) | **Motion** (`motion/react`) | Single animation source |

Rules of thumb:
- **Forms are always shadcn** (Form + react-hook-form + zod). The payment checkout form uses this stack.
- **App chrome / overlays are HeroUI.**
- Theming is unified on the shadcn token set (`--background`, `--card`, `--border`, …). Custom utilities like `.glass-card` use these tokens (via `color-mix`) so they render correctly regardless of which library is on the page — they no longer depend on `--heroui-*` vars.
- `CurvedMenu` (`src/components/ui/curved-menu.tsx`) is a deliberate Motion-based workaround for HeroUI's navbar-menu toggle; re-evaluate on the next HeroUI bump.
- Only stable per-package HeroUI deps are installed (`@heroui/button`, `@heroui/card`, `@heroui/navbar`, `@heroui/system`, `@heroui/theme`, plus `chip`/`divider`/`link` for the matrix). The beta `@heroui/react` / `@heroui/styles` meta packages were removed.

## Deployment

- **Target**: Cloudflare Workers
- **Domain**: [YOUR_DOMAIN]
- **Node.js Compatibility**: Enabled via `nodejs_compat` flag
- **Assets**: Served from `./dist` directory

## Environment Variables

**Client-exposed (`PUBLIC_*`, in `.env` / `import.meta.env`):**
- `PUBLIC_CTA_URL` - Call-to-action booking URL
- `PUBLIC_BASE_URL` - Site origin, used to build Yaad callback/return URLs

**Server vars/secrets** — set in `wrangler.jsonc` `vars` (non-secret) or with `wrangler secret put <NAME>` (secret), and in `.dev.vars` (local; gitignored). Accessed via `Astro.locals.runtime.env`:
- `PAYMENT_PROVIDER` - `mock` (default) or `yaad`
- `MOCK_SECRET` - HMAC key for the mock provider's signed links
- `YAAD_MASOF` - Yaad Sarig / Hyp terminal number (only when provider=yaad)
- `YAAD_PASSP` - Yaad API password
- `YAAD_KEY` - Yaad API signing key
- `ADMIN_USER` / `ADMIN_PASSWORD` - HTTP Basic Auth for `/admin`

Types for bindings + secrets live in `src/env.d.ts` (the `ENV` type). After editing `wrangler.jsonc`, run `npm run cf-types`.

> Demo Yaad terminal for local testing: `YAAD_MASOF=0010131918`, `YAAD_PASSP=yaad`, `YAAD_KEY=7110eda4d09e062aa5e4a390b0a572ac0d2c0220`.

## Payments (provider abstraction: mock | Yaad Sarig / Hyp)

Server-priced cart → hosted payment link → verified callback → D1 records + audit log. No user accounts.

**Provider switch** (`PAYMENT_PROVIDER` env, default `mock`):
- `mock` — self-contained UAT provider (`src/lib/payments/mock.ts`): builds a link to `/mock-pay` (our own "hosted page"), HMAC-signs `order|amount` with `MOCK_SECRET`. Full cycle runs with no gateway/credentials. See `docs/UAT.md`.
- `yaad` — real Yaad Sarig / Hyp (`src/lib/payments/yaad.ts`): SIGN/VERIFY server round-trips. Needs `YAAD_MASOF/PASSP/KEY` + the Hyp terminal return URL set to `<PUBLIC_BASE_URL>/api/payments/callback`.
- Selected by `getProvider(env)` in `src/lib/payments/index.ts`. Both implement `PaymentProvider` (`createPaymentLink` + `verifyCallback`).

**Catalog:** items resolve via `src/lib/catalog.ts` (`getPriceableItem`, sourced from `src/content/products.json`). The cart endpoint supports multiple line items with quantities — extend `getPriceableItem` to merge additional catalogs (e.g. event tickets) when needed.

**Add a single-product payment page** = add a product to `src/content/products.json` (price in **minor units** / agorot). A checkout page is served at `/checkout/<id>` via `src/pages/checkout/[product].astro`. All checkouts POST a cart `{ items:[{id,qty}], ...buyer }` to `/api/checkout`, which **recomputes the total server-side** from the catalog.

**Flow:**
1. `/checkout/[product]` renders `CheckoutForm` (shadcn Form + react-hook-form + zod). No amount field — price is server-side.
2. `POST /api/checkout` validates, looks up the product price, inserts a `pending` row, then calls Yaad `APISign&What=SIGN` and returns the signed `https://pay.hyp.co.il/p/?...&action=pay&signature=...` URL. The client redirects to it.
3. Yaad returns the buyer to `GET /api/payments/callback`, which **verifies** authenticity via `APISign&What=VERIFY` (never trusts the raw redirect), cross-checks the amount, then marks the row `paid` (idempotent) and redirects to `/checkout/success` or `/checkout/failed`.

**Records & logs:** `purchases` (records) + `payment_events` (audit trail) in D1, plus structured `console.log` to Workers observability. View at `/admin` (Basic Auth).

**Key files:** `src/lib/yaad.ts` (sign/verify, pure `fetch`), `src/lib/db.ts` (D1), `src/lib/products.ts`, `src/lib/validation.ts`, `src/middleware.ts` (admin auth), `migrations/0001_init.sql`.

**Setup checklist for a real deployment:**
1. `wrangler d1 create astro-template-db` → paste `database_id` into `wrangler.jsonc`.
2. `npm run db:migrate` (and `npm run db:migrate:local` for dev).
3. `wrangler secret put YAAD_MASOF` / `YAAD_PASSP` / `YAAD_KEY` / `ADMIN_USER` / `ADMIN_PASSWORD`.
4. In the Hyp terminal dashboard, set the success/return URL to `<PUBLIC_BASE_URL>/api/payments/callback`.

> Yaad signing/verifying are **server round-trips** (no local crypto — Workers-friendly). Always send `UTF8=True`/`UTF8out=True`; append the SIGN response **verbatim** (re-encoding breaks the signature). Later stage (full API): refund `zikoyAPI`, cancel `CancelTrans`, charge/token `soft`/`getToken` — same endpoint, different `action`.

## CSS Variables & Theming

### Custom CSS Utilities
Available in `src/styles/global.css`:
- `.gradient-text` - Gradient text effect
- `.glass-card` - Glassmorphism with backdrop blur
- `.hover-lift` - Transform + shadow on hover
- `.animate-pulse-glow` - Pulsing glow effect for CTAs

## RTL Layout Guidelines (if needed)

### Text Alignment
- Section headers: Keep `text-center` for visual balance
- Card content: Use `text-right` for proper RTL alignment

### Card Layouts
- Always add `w-full h-full` to card wrappers for equal sizing in grids
- Use `flex-row-reverse` with RTL to position icons correctly

### Responsive Section Spacing
- Section padding: `py-12 md:py-24` (48px mobile, 96px desktop)
- Section header margins: `mb-8 md:mb-16` (32px mobile, 64px desktop)
