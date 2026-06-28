import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import robotsTxt from 'astro-robots-txt';
import critters from 'astro-critters';
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
    robotsTxt({
      host: true,
      sitemap: false, // Enable when you add @astrojs/sitemap
      policy: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/api/', '/admin/'],
        },
      ],
    }),
    // Critters inlines critical CSS for faster FCP
    critters(),
    // Compress must be last - compresses CSS, HTML, JS, images, SVG, JSON
    compress(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
