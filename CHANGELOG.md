# Changelog

## 3.1.0 — 2026-09-30

Adds the **EmDash CMS** and hardens payments. Validated end to end on a separate test site
(locally and live behind Cloudflare Access), which found 14 issues, all fixed here.
**`npm audit`: 0.**

### Before you deploy

- **Set up the CMS login first.** Set `siteUrl` and `teamDomain` in `astro.config.mjs`, create a
  Cloudflare Access app for `<your-domain>/_emdash/*`, then `wrangler secret put CF_ACCESS_AUDIENCE`
  and `EMDASH_ENCRYPTION_KEY` (back the key up). Until the setup wizard has run it is reachable
  without login, and production setup refuses to run without `siteUrl`.
- **`*.workers.dev` is not covered** by an Access app on a custom domain. Set `workers_dev: false`
  once your domain is live, or add the workers.dev host to the app.
- New bindings: R2 `MEDIA`, `IMAGES`, KV `SESSION` (sessions are back on because EmDash uses
  `Astro.session`), plus a `* * * * *` cron. The Worker entry is now `@emdash-cms/cloudflare/worker`.

### Added

- EmDash at `/_emdash/admin`. It shares the payments D1 `DB`, stores media in R2 and resizes it
  through `IMAGES`. The content model is in `seed/seed.json`: `landing`, `products`, `posts`,
  `pages` and the `primary` menu.
- The landing page, products and prices come from the CMS. `src/content/products.json` was removed,
  and `site.json` is only the pre-setup fallback.
- `/blog`, `/blog/[slug]` and `/[slug]` routes.
- UAT TC12 (an unpublished product can't be bought) and TC13 (a preview token can't change the price).
- A placeholder `public/og-image.jpg`.

### Fixed

- **Payments (security):**
  - A `?_preview=` token made checkout charge a product's unpublished draft price. Preview entries
    are now never priced or sold.
  - A forged callback could block or downgrade a payment. Unverified callbacks no longer write
    status, and a paid row can never be downgraded. Declines now stay `pending`, with a
    `verify_failed` audit event.
- **Cold dev start:** the first request failed with React's "Invalid hook call". SSR deps are now
  pre-bundled via `vite.environments.ssr.optimizeDeps.include`.
- **HeroUI styles:** the Tailwind `@source` glob pointed one directory too high and never matched,
  so HeroUI class strings (e.g. the navbar's) were missing. CSS grows by about 23 KB gzipped.
- **CMS links:** products have a `urlPattern` (`/checkout/{slug}`), so admin preview and
  view-on-site links work.
- **UI matrix:** `LandingPage.tsx` uses shadcn Button/Card, and the checkout copy is
  provider-neutral.

### Removed

- `@heroui/button` and `@heroui/card` (use shadcn). HeroUI remains for chrome: navbar, chip,
  divider and link.

## 3.0.0 — 2026-09-05

Astro 5 → 7, `@astrojs/cloudflare` 12 → 14, and a full dependency refresh.
**`npm audit` goes from 22 findings (16 high) to 0.**

### Breaking

**Env access changed.** `@astrojs/cloudflare` v13 removed `Astro.locals.runtime.env`;
reading it now *throws at runtime*, so a build can pass while every route 500s.

```diff
-const env = Astro.locals.runtime.env;      // or locals.runtime.env in API routes
+import { env } from "cloudflare:workers";
```

Also: `runtime.cf` → `Astro.request.cf`, `runtime.caches` → the global `caches`,
`runtime` (ExecutionContext) → `Astro.locals.cfContext`.

`src/env.d.ts` is now a *script* (no top-level import/export) so it can declare the
`cloudflare:workers` module and type `env` as the hand-written `ENV`. Do not add
`/// <reference types="@cloudflare/workers-types" />` or put the generated
`worker-configuration.d.ts` into tsconfig — both pull in the global workerd types,
which redeclare DOM globals and break the React/motion types. The file carries a
one-line regression check.

**Deploy command changed.** Adapter 14 emits `dist/server/wrangler.json`, and
`wrangler deploy` cannot resolve the bare-specifier `main` from the root config:

```diff
-"deploy": "npm run build && wrangler deploy"
+"deploy": "npm run build && wrangler deploy -c dist/server/wrangler.json"
```

If you deploy through Workers Builds or the Deploy button, set your **deploy**
command to `npx wrangler deploy -c dist/server/wrangler.json`.

**`dist/` layout changed** to `dist/client` + `dist/server`. `_worker.js` and
`_routes.json` are gone (the latter was a Pages concept; adapter 13 dropped Pages
support), so `public/.assetsignore` was deleted and `assets.directory` is now
`./dist/client`.

**Removed dependencies.** `astro-critters` (abandoned since Jan 2025; no
replacement — critical CSS is no longer inlined), `astro-robots-txt` (unmaintained
since 2023, and it pulled zod 3 — replaced by a static `public/robots.txt`), and
`@playform/compress` (see below).

**zod 3 → 4.** `z.string().email()` → `z.email()`, `error.flatten()` →
`z.flattenError(error)`.

### Changed

- `imageService: 'passthrough'` and `session: false` are now set explicitly. Without
  them the adapter auto-provisions `IMAGES` and `SESSION` bindings, which a one-click
  deploy would then have to satisfy.
- `platformProxy` removed — `astro dev` now runs the real workerd runtime via
  `@cloudflare/vite-plugin`, and still reads `.dev.vars`.
- `astro dev` is now a background daemon: `astro dev stop` / `status` / `logs`.
- Added `npm run typecheck` (`astro check`). The project previously had no typecheck
  at all, which mattered because 4 of the 7 env-access sites are `.astro` files.

### Dependencies

astro 7.3.1 · @astrojs/cloudflare 14.3.0 · @astrojs/react 6.0.5 · vite 8.2.2 ·
wrangler 4.129.0 · @cloudflare/workers-types 5 · zod 4.5.4 · typescript 6.0.3 ·
motion 13.2.0 · lucide-react 1.41.0 · tailwindcss 4.3.3 · @hookform/resolvers 5.9.1 ·
plus React, HeroUI, Radix and react-hook-form refreshes.

Requires **Node >= 22.12**.

### Why `@playform/compress` was dropped

Measured, not assumed. Per-file brotli sum of `dist/client` — what Cloudflare
actually ships — was **200,426 bytes with it and 200,399 without**: it made the
payload 27 bytes *larger*. Astro/Vite already minify, Cloudflare brotli-compresses
at the edge, and the repo has one SVG and no raster images. It was also the entire
residual vulnerability set (3 high via `@playform/pipe` → `deepmerge-ts`), with
npm's only offered fix being a major downgrade.

### Verification

All 11 `docs/UAT.md` cases pass locally against real workerd **and** live on a
throwaway `*.workers.dev` deployment (since torn down): server-priced cart ignoring
a bogus client total, signed mock-pay link, tampered signature rejected, approve →
paid, decline → failed, tampered amount → failed, replay leaving exactly one paid
row, and `/admin` Basic Auth 401/200. `astro check` reports 0 errors across 34
files; a clean `npm ci` builds and audits clean.

## 2.0.1 — 2026-07-06

- fix(payments): send `Sign=True` on the Yaad SIGN request so `What=VERIFY` works.

## 2.0.0 — 2026-06-28

- Payment capability finalized: mock | Yaad provider switch, server-priced cart,
  D1 records + audit log, `/admin`, `/mock-pay`.
- README rewritten, `docs/UAT.md` added, Deploy to Cloudflare button.
