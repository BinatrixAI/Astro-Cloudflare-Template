# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

[PROJECT_NAME] - Built with Astro 5 + React 19, styled with Tailwind CSS 3 + HeroUI + shadcn/ui, animated with Motion (Framer Motion), and deployed to Cloudflare Workers.

## Commands

```bash
npm run dev        # Start Astro dev server with hot reload
npm run build      # Build for Cloudflare Workers
npm run preview    # Preview production build locally
npm run deploy     # Build and deploy to Cloudflare Workers

# Add new shadcn component (requires npx)
npx shadcn@latest add [component-name]

# Local testing with Wrangler
npx wrangler pages dev ./dist --port 8799
```

## Architecture

### Tech Stack
- **Framework**: Astro 5 (server mode) with React 19 for interactive components
- **Styling**: Tailwind CSS 3 + HeroUI v3 beta + shadcn/ui (New York style)
- **Animations**: Motion v12 (motion/react) - Framer Motion's new package
- **Deployment**: Cloudflare Workers with `@astrojs/cloudflare` adapter
- **Fonts**: [Configure fonts as needed]

### Key Files
| File | Purpose |
|------|---------|
| `src/pages/index.astro` | Main entry page |
| `src/layouts/Layout.astro` | Base HTML layout |
| `src/components/` | React components |
| `src/components/ui/shadcn/` | shadcn/ui components |
| `src/content/site.json` | Site content (text, navigation, etc.) |
| `src/styles/global.css` | Tailwind directives, CSS variables, custom utilities |
| `components.json` | shadcn/ui CLI configuration |
| `wrangler.jsonc` | Cloudflare Workers configuration |
| `tailwind.config.js` | HeroUI plugin, shadcn colors, animations |

### Path Aliases
```typescript
@/* → src/*  // Example: @/components, @/icons, @/lib/utils
```

## UI Components

### HeroUI Components (rich interactive components)
```typescript
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Navbar, NavbarBrand, NavbarContent } from "@heroui/navbar";
```

### shadcn/ui Components (customizable primitives)
```typescript
// Import from barrel export
import { Button, Card, Input, Badge } from "@/components/ui/shadcn";

// Or import individually
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardHeader, CardContent } from "@/components/ui/shadcn/card";
import { Input } from "@/components/ui/shadcn/input";
import { Badge } from "@/components/ui/shadcn/badge";
```

**Available shadcn components:**
- `Button` - with variants: default, destructive, outline, secondary, ghost, link
- `Card` - with CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `Input` - styled form input
- `Badge` - with variants: default, secondary, destructive, outline

**Adding more shadcn components:**
```bash
npx shadcn@latest add [component-name]
# Components will be added to src/components/ui/shadcn/
```

### When to use which?
- **HeroUI**: Rich, pre-styled components (navbars, modals, dropdowns)
- **shadcn/ui**: Highly customizable primitives (forms, basic cards, badges)
- **Both work together** - mix and match as needed

## Motion (Framer Motion)

### Basic Animation
```typescript
import { motion } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

### Scroll Animations
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  viewport={{ once: true }}
>
  Appears on scroll
</motion.div>
```

### AnimatePresence (for exit animations)
```typescript
import { motion, AnimatePresence } from "motion/react";

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
```

### Interactive Animations
```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

## Astro Integrations

| Integration | Purpose |
|-------------|---------|
| `@playform/compress` | Compresses CSS, HTML, JS, images, SVG, JSON on build |
| `astro-seo` | SEO meta tags, Open Graph, Twitter Cards |
| `astro-robots-txt` | Generates robots.txt for search engines |
| `astro-critters` | Inlines critical CSS for faster FCP |

## Deployment

- **Target**: Cloudflare Workers
- **Domain**: [YOUR_DOMAIN]
- **Node.js Compatibility**: Enabled via `nodejs_compat` flag
- **Assets**: Served from `./dist` directory

## Environment Variables

- `PUBLIC_CTA_URL` - Call-to-action booking URL (client-exposed)
- Add more as needed in `src/env.d.ts`

## CSS Variables & Theming

### shadcn/ui variables (defined in global.css)
```css
--background, --foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring
--radius
```

### Custom CSS Utilities
Available in `src/styles/global.css`:
- `.gradient-text` - Gradient text effect
- `.glass-card` - Glassmorphism with backdrop blur
- `.hover-lift` - Transform + shadow on hover
- `.animate-pulse-glow` - Pulsing glow effect for CTAs

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
