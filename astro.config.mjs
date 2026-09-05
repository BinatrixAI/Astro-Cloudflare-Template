import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import compress from '@playform/compress';

export default defineConfig({
  // TODO: Update with your domain
  site: 'https://your-domain.com',
  output: 'server',
  adapter: cloudflare({
    // Expose local Cloudflare bindings (D1, secrets from .dev.vars) to
    // Astro.locals.runtime.env during `astro dev`.
    platformProxy: { enabled: true },
  }),
  integrations: [
    react(),
    // Compress must be last - compresses CSS, HTML, JS, images, SVG, JSON
    compress(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
