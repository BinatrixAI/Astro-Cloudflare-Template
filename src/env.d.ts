/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Pull ONLY the binding types we use from @cloudflare/workers-types via scoped
// imports. A global `/// <reference types="@cloudflare/workers-types" />` would
// add the full workerd global set, which conflicts with the DOM lib used by the
// React components (e.g. breaks AnimationEvent / motion types).
import type {
  D1Database as CF_D1Database,
  Fetcher as CF_Fetcher,
} from "@cloudflare/workers-types";

declare global {
  type D1Database = CF_D1Database;
  type Fetcher = CF_Fetcher;

  // Cloudflare Workers bindings + secrets, exposed in API routes / middleware /
  // pages via `Astro.locals.runtime.env`. Keep in sync with wrangler.jsonc +
  // `wrangler secret put` / .dev.vars.
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

  type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;

  namespace App {
    interface Locals extends Runtime {}
  }

  interface ImportMetaEnv {
    readonly PUBLIC_CTA_URL: string;
    readonly PUBLIC_BASE_URL: string;
    // Add more PUBLIC_ (client-exposed) environment variables as needed
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
