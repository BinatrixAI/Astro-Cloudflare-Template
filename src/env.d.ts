/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// This file is deliberately a SCRIPT, not a module: it has no top-level
// `import` / `export`. That keeps everything below global, and it is what makes
// the ambient `declare module "cloudflare:workers"` further down legal (inside a
// module it would be read as an augmentation of an unresolvable module, TS2664).
//
// Binding types come from @cloudflare/workers-types via `import("…")` type
// positions ONLY. Do NOT add `/// <reference types="@cloudflare/workers-types" />`,
// and do NOT put the wrangler-generated worker-configuration.d.ts into tsconfig
// `include` / `compilerOptions.types`: both load the *global* flavour of the
// workerd types, which redeclares DOM globals and breaks the React/motion types
// (AnimationEvent, onAnimationStart). The `import("…")` form resolves to the
// package's module flavour and leaks nothing.
//
// Regression check — must print nothing:
//   npx tsc --noEmit --listFiles | grep -E 'workers-types/index\.d\.ts|worker-configuration\.d\.ts'
type D1Database = import("@cloudflare/workers-types").D1Database;
type Fetcher = import("@cloudflare/workers-types").Fetcher;

/**
 * Worker bindings + secrets. Keep in sync with wrangler.jsonc (`vars`,
 * `d1_databases`), `wrangler secret put`, and .dev.vars.example.
 */
type ENV = {
  DB: D1Database;
  ASSETS: Fetcher;
  // Payment provider switch: "mock" (UAT, default) | "yaad" (production)
  PAYMENT_PROVIDER: string;
  MOCK_SECRET: string;
  // Yaad Sarig / Hyp secrets (only needed when PAYMENT_PROVIDER=yaad)
  YAAD_MASOF: string;
  YAAD_PASSP: string;
  YAAD_KEY: string;
  ADMIN_USER: string;
  ADMIN_PASSWORD: string;
  PUBLIC_BASE_URL: string;
};

// @astrojs/cloudflare v13+ removed `Astro.locals.runtime`; reading it now throws
// at runtime (not at build time). Bindings and secrets are imported instead:
//   import { env } from "cloudflare:workers";
// We declare only the member we use, so tsc never needs the global workerd types.
// The rest of the old `runtime` object, should you need it:
//   runtime.cf     -> Astro.request.cf
//   runtime.caches -> the global `caches` object
//   runtime (ctx)  -> Astro.locals.cfContext
declare module "cloudflare:workers" {
  export const env: ENV;
}

interface ImportMetaEnv {
  readonly PUBLIC_CTA_URL: string;
  readonly PUBLIC_BASE_URL: string;
  // Add more PUBLIC_ (client-exposed) environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
