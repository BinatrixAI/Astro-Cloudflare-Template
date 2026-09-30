import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import emdash from 'emdash/astro';
import { d1, r2, access } from '@emdash-cms/cloudflare';

export default defineConfig({
  // TODO: Update with your domain
  site: 'https://your-domain.com',
  output: 'server',
  // Default image service is `cloudflare-binding`: the adapter adds an IMAGES
  // binding so EmDash media is resized at the edge (billed as Images transforms).
  adapter: cloudflare(),
  // Sessions stay on: EmDash's admin uses Astro.session, so the adapter
  // auto-wires its KV session driver and provisions a SESSION binding.
  integrations: [
    react(),
    // CMS admin at /_emdash/admin. Shares the payments D1 (`DB`); media in R2.
    emdash({
      // TODO: your site's public origin. Production setup refuses to run
      // without it (EmDash does not read Astro's `site`); the EMDASH_SITE_URL
      // var works too.
      siteUrl: 'https://your-domain.com',
      database: d1({ binding: 'DB' }),
      storage: r2({ binding: 'MEDIA' }),
      // Production login is Cloudflare Access only (local dev falls back to
      // passkeys). Create an Access app covering /_emdash/* and put its AUD tag
      // in the CF_ACCESS_AUDIENCE secret. Everyone the Access policy admits is
      // an Admin — keep the policy tight.
      auth: access({
        // TODO: your Zero Trust team domain
        teamDomain: 'YOUR_TEAM.cloudflareaccess.com',
        audienceEnvVar: 'CF_ACCESS_AUDIENCE',
        defaultRole: 50,
      }),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
