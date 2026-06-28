# Astro + Cloudflare Workers Template

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/BinatrixAI/Astro-Cloudflare-Template)

A production-ready template for building modern web applications with:

- **Astro 5** - Server-side rendering with React islands
- **React 19** - Interactive components
- **Tailwind CSS 4** - Utility-first styling (CSS-first config)
- **HeroUI v3** - Beautiful, accessible components (navbars, modals, etc.)
- **shadcn/ui** - Customizable primitives (forms, cards, inputs, badges)
- **Motion (Framer Motion) v12** - Smooth animations
- **Cloudflare Workers + D1** - Edge deployment with a SQLite database
- **Payments** - Optional payment pages (Yaad Sarig / Hyp) with a mock provider for local testing

## Use This Template

```bash
gh repo create NEW-PROJECT-NAME --template BinatrixAI/Astro-Cloudflare-Template
```

Or click **"Use this template"** on the [GitHub page](https://github.com/BinatrixAI/Astro-Cloudflare-Template).

## Deploy to Cloudflare (one click)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/BinatrixAI/Astro-Cloudflare-Template)

Clicking the button clones the repo to your account and deploys it. Cloudflare reads
`wrangler.jsonc` and:
- **provisions a D1 database** for the `DB` binding (and writes its id back to your config),
- **prompts for secrets** listed in `.dev.vars.example` (`MOCK_SECRET`, `ADMIN_USER`, `ADMIN_PASSWORD`, and optional `YAAD_*`),
- deploys the Worker to a `*.workers.dev` URL.

After the first deploy: run `npm run db:migrate` to apply the payments schema, and add a custom
domain by uncommenting `routes` in `wrangler.jsonc` (then redeploy). The repository must be
**public** for others to use the button.

## Quick Start

1. **Create your project from template** (see above)
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Authenticate** with Cloudflare: `npx wrangler login` (set `CLOUDFLARE_ACCOUNT_ID` if you belong to multiple accounts).
4. **Update configuration**
   - `package.json` - `name`
   - `wrangler.jsonc` - `name` (and D1 `database_id` once created; uncomment `routes` to add a custom domain)
   - `astro.config.mjs` - `site` URL
   - `CLAUDE.md` - project description
5. **Local env** (optional, for payments/admin): `cp .dev.vars.example .dev.vars` and fill values.
6. **Start development**
   ```bash
   npm run dev
   ```
7. **Deploy to Cloudflare**
   ```bash
   npm run deploy
   ```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at localhost:4321 (local D1 + `.dev.vars`) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run deploy` | Build and deploy to Cloudflare |
| `npm run cf-types` | Regenerate `worker-configuration.d.ts` after editing `wrangler.jsonc` |
| `npm run db:migrate:local` | Apply D1 migrations to the local database |
| `npm run db:migrate` | Apply D1 migrations to the remote (production) database |

## Project Structure

```
├── migrations/              # D1 SQL migrations (payments schema)
├── public/                  # Static assets (+ .assetsignore for Workers deploy)
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx      # Demo landing page
│   │   ├── CheckoutForm.tsx     # Payment buyer form (shadcn + react-hook-form + zod)
│   │   └── ui/
│   │       ├── curved-menu.tsx
│   │       └── shadcn/          # button, card, input, badge, label, select, form
│   ├── content/
│   │   ├── site.json           # Navigation, hero, features, footer copy
│   │   └── products.json       # Payment catalog (id, name, price in minor units)
│   ├── icons/
│   ├── layouts/Layout.astro    # Base layout (has a `head` slot for fonts, etc.)
│   ├── lib/
│   │   ├── utils.ts            # cn() helper
│   │   ├── products.ts         # Product catalog access
│   │   ├── catalog.ts          # getPriceableItem() resolver
│   │   ├── validation.ts       # zod schemas (buyer + cart)
│   │   ├── db.ts               # D1 helpers (purchases, payment_events)
│   │   └── payments/           # Provider abstraction: mock | yaad
│   ├── middleware.ts           # Basic-Auth guard for /admin
│   ├── pages/
│   │   ├── index.astro
│   │   ├── checkout/[product].astro, success.astro, failed.astro
│   │   ├── mock-pay.astro      # Mock "hosted payment" page (UAT)
│   │   ├── admin/index.astro   # Purchases + audit log (Basic Auth)
│   │   └── api/checkout.ts, api/payments/callback.ts
│   └── styles/global.css, hero.ts
├── astro.config.mjs · components.json · wrangler.jsonc · CLAUDE.md · docs/UAT.md
```

## Creating New Pages

Astro routes live in `src/pages/`. A file `src/pages/about.astro` → `/about`.

**1. Static / content page**
```astro
---
import Layout from "@/layouts/Layout.astro";
---
<Layout title="About" description="…">
  <main class="mx-auto max-w-3xl px-4 py-12">…</main>
</Layout>
```
Centralize copy in `src/content/site.json` and add the route to its `navigation.links`.

**2. Interactive page (React island)** — create `src/components/MyWidget.tsx`, then hydrate it:
```astro
---
import Layout from "@/layouts/Layout.astro";
import MyWidget from "@/components/MyWidget";
---
<Layout title="…"><MyWidget client:load /></Layout>
```
Use shadcn primitives (`@/components/ui/shadcn`) for forms/cards and HeroUI for rich chrome
(navbars, modals). Add more primitives with `npx shadcn@latest add <component>`.

**3. Page-specific `<head>`** (fonts, meta) — use the Layout's `head` slot:
```astro
<Layout title="…">
  <Fragment slot="head"><link rel="stylesheet" href="https://fonts.googleapis.com/…" /></Fragment>
  …
</Layout>
```

> The `/new-page` Claude Code command scaffolds a page + React component for you.

## Payments (optional)

Server-priced checkout → hosted payment page → verified callback → D1 records + audit log. No user accounts.

**Provider switch** via `PAYMENT_PROVIDER`:
- `mock` (default) — self-contained: a built-in `/mock-pay` page + HMAC-signed links. Test the
  **entire** cycle locally with no gateway or credentials.
- `yaad` — real **Yaad Sarig / Hyp** (`pay.hyp.co.il`); SIGN/VERIFY server round-trips (`src/lib/payments/yaad.ts`).

**Add a payment page** = add a product to `src/content/products.json` (price in **minor units**, e.g. `5000` = ₪50). A checkout page is served at `/checkout/<id>` via `src/pages/checkout/[product].astro`. All checkouts `POST` a cart `{ items:[{id,qty}], …buyer }` to `/api/checkout`, which **recomputes the total server-side** (never trusts the client). For custom layouts, build your own form that posts the same payload (see `CheckoutForm.tsx`).

**Records & logs:** the `purchases` table (records) + `payment_events` (audit trail) in D1, viewable at `/admin` (Basic Auth). Full test plan: [`docs/UAT.md`](docs/UAT.md).

**Set up D1:**
```bash
wrangler d1 create my-astro-site-db          # paste database_id into wrangler.jsonc
npm run db:migrate:local                       # local
npm run db:migrate                             # remote
```

**Go live with Yaad:** set `PAYMENT_PROVIDER=yaad`, add `YAAD_MASOF/PASSP/KEY` secrets, and point
the Hyp terminal's return URL at `<PUBLIC_BASE_URL>/api/payments/callback`. Then re-run the UAT
with Yaad test cards.

## Environment & Secrets

Bindings/secrets are accessed via `Astro.locals.runtime.env` (typed in `src/env.d.ts`).
Set locally in `.dev.vars` (copy from `.dev.vars.example`); set in production with `wrangler secret put <NAME>`
(or `vars` in `wrangler.jsonc` for non-secrets). Client-exposed values use the `PUBLIC_` prefix and `import.meta.env`.

| Name | Where | Purpose |
|------|-------|---------|
| `PAYMENT_PROVIDER` | var | `mock` (default) or `yaad` |
| `MOCK_SECRET` | secret | HMAC key for the mock provider |
| `ADMIN_USER` / `ADMIN_PASSWORD` | secret | Basic Auth for `/admin` |
| `YAAD_MASOF` / `YAAD_PASSP` / `YAAD_KEY` | secret | Yaad terminal (only when `PAYMENT_PROVIDER=yaad`) |
| `PUBLIC_BASE_URL` | var | Origin for building callback URLs |

## UI Components

### HeroUI (rich, pre-styled)
```tsx
import { Button } from "@heroui/button";
import { Navbar, NavbarBrand, NavbarContent } from "@heroui/navbar";
```
Best for: navbars, modals, dropdowns, complex interactive chrome.

### shadcn/ui (customizable primitives)
```tsx
import { Button, Card, Input, Label, Select, Form } from "@/components/ui/shadcn";
```
Best for: forms (with react-hook-form + zod), cards, badges. Add more: `npx shadcn@latest add <component>`.

### Motion (animations)
```tsx
import { motion } from "motion/react";
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} />
```

**Which to use?** HeroUI = app chrome/overlays · shadcn = primitives & forms · Motion = animation.
Don't mix a HeroUI and a shadcn `Button` in the same region. See `CLAUDE.md` for the full matrix.

## Theming

CSS variables in `src/styles/global.css` (Tailwind v4 CSS-first — no `tailwind.config.js`):
- Light/dark via `.dark` class; shadcn tokens (`--primary`, `--background`, …)
- HeroUI theming via the `@plugin` directive (`src/styles/hero.ts`)
- Custom utilities: `.gradient-text`, `.glass-card`, `.hover-lift`, `.animate-pulse-glow`

## Claude Code Configuration

Custom agents (`.claude/agents/`), commands (`.claude/commands/`: `/deploy`, `/perf-check`,
`/add-component`, `/new-page`), skills (`.claude/skills/`), and a pre-tool hook that blocks
edits on `main` to encourage feature-branch workflows. See `CLAUDE.md` for details.

## License

MIT
