import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
// import compress from '@playform/compress';

export default defineConfig({
  // TODO: Update with your domain
  site: 'https://your-domain.com',
  output: 'server',
  adapter: cloudflare({
    // This template renders no images through Astro's image service, so opt out
    // of the adapter's default `cloudflare-binding` mode. Without this the build
    // auto-provisions an IMAGES binding, which a one-click deploy would then
    // need to satisfy.
    imageService: 'passthrough',
  }),
  // No sessions in this template. Without this the adapter auto-wires a
  // Cloudflare KV session driver and provisions a SESSION binding.
  session: false,
  integrations: [
    react(),
    // TEMPORARILY DISABLED for the Astro 7 bump — re-enabled in the next commit
    // once the new dist layout is known. Compress must be last.
    // compress(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
