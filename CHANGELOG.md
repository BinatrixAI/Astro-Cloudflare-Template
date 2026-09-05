# Changelog

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
