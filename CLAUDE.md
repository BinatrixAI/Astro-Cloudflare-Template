# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

[PROJECT_NAME] - Built with Astro 5 + React 19, styled with Tailwind CSS 3 + HeroUI, animated with Framer Motion, and deployed to Cloudflare Workers.

## Commands

```bash
npm run dev        # Start Astro dev server with hot reload
npm run build      # Build for Cloudflare Workers
npm run preview    # Preview production build locally
npm run deploy     # Build and deploy to Cloudflare Workers

# Local testing with Wrangler
npx wrangler pages dev ./dist --port 8799
```

## Architecture

### Tech Stack
- **Framework**: Astro 5 (server mode) with React 19 for interactive components
- **Styling**: Tailwind CSS 3 + HeroUI v3 beta components
- **Animations**: Framer Motion (motion/react)
- **Deployment**: Cloudflare Workers with `@astrojs/cloudflare` adapter
- **Fonts**: [Configure fonts as needed]

### Key Files
| File | Purpose |
|------|---------|
| `src/pages/index.astro` | Main entry page |
| `src/layouts/Layout.astro` | Base HTML layout |
| `src/components/` | React components |
| `src/content/site.json` | Site content (text, navigation, etc.) |
| `src/styles/global.css` | Font imports, Tailwind directives, custom utilities |
| `wrangler.jsonc` | Cloudflare Workers configuration |
| `tailwind.config.js` | HeroUI plugin, brand colors |

### Path Aliases
```typescript
@/* → src/*  // Example: @/components, @/icons, @/lib/utils
```

### HeroUI Components (import from individual packages)
```typescript
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Navbar, NavbarBrand, NavbarContent } from "@heroui/navbar";
```

## Astro Integrations

| Integration | Purpose |
|-------------|---------|
| `@playform/compress` | Compresses CSS, HTML, JS, images, SVG, JSON on build |
| `astro-seo` | SEO meta tags, Open Graph, Twitter Cards |
| `astro-robots-txt` | Generates robots.txt for search engines |
| `astro-critters` | Inlines critical CSS for faster FCP |
| `@casoon/astro-webvitals` | Core Web Vitals monitoring (debug overlay in dev) |

## Deployment

- **Target**: Cloudflare Workers
- **Domain**: [YOUR_DOMAIN]
- **Node.js Compatibility**: Enabled via `nodejs_compat` flag
- **Assets**: Served from `./dist` directory

## Environment Variables

- `PUBLIC_CTA_URL` - Call-to-action booking URL (client-exposed)
- Add more as needed in `src/env.d.ts`

## Custom CSS Utilities

Available in `src/styles/global.css`:
- `.gradient-text` - Gradient text effect
- `.glass-card` - Glassmorphism with backdrop blur
- `.hover-lift` - Transform + shadow on hover

## RTL Layout Guidelines (if needed)

### Text Alignment
- Section headers: Keep `text-center` for visual balance
- Card content: Use `text-right` for proper RTL alignment

### Card Layouts
- Always add `w-full h-full` to card wrappers for equal sizing in grids
- Use `flex-row-reverse` with RTL to position icons correctly

### Responsive Section Spacing
- Section padding: `py-12 md:py-24` (48px mobile, 96px desktop)
- Section header margins: `mb-8 md:mb-16` (32px mobile, 64px desktop)
