import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import robotsTxt from 'astro-robots-txt';
import critters from 'astro-critters';
import compress from '@playform/compress';
import webVitals from '@casoon/astro-webvitals';

export default defineConfig({
  // TODO: Update with your domain
  site: 'https://your-domain.com',
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
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
    // Web Vitals monitoring (debug overlay in dev mode)
    webVitals(),
    // Compress must be last - compresses CSS, HTML, JS, images, SVG, JSON
    compress(),
  ],
});
