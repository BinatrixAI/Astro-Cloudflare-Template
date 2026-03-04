# Astro + Cloudflare Workers Template

A production-ready template for building modern web applications with:

- **Astro 5** - Server-side rendering with React islands
- **React 19** - Interactive components
- **Tailwind CSS 4** - Utility-first styling (CSS-first config)
- **HeroUI v3** - Beautiful, accessible components (navbars, modals, etc.)
- **shadcn/ui** - Customizable primitives (forms, cards, badges)
- **Motion (Framer Motion) v12** - Smooth animations
- **Cloudflare Workers** - Edge deployment

## Use This Template

```bash
gh repo create NEW-PROJECT-NAME --template BinatrixAI/Astro-Cloudflare-Template
```

Or click **"Use this template"** button on the [GitHub page](https://github.com/BinatrixAI/Astro-Cloudflare-Template).

## Quick Start

1. **Create your project from template** (see above)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update configuration**
   - `package.json` - Update `name`
   - `wrangler.jsonc` - Update `name`, `account_id`, and routes
   - `astro.config.mjs` - Update `site` URL
   - `CLAUDE.md` - Update project description
   - `.devcontainer/devcontainer.json` - Update `name` and `workspaceFolder`

4. **Start development**
   ```bash
   npm run dev
   ```

5. **Deploy to Cloudflare**
   ```bash
   npm run deploy
   ```

## Project Structure

```
├── .claude/                 # Claude Code configuration
│   ├── settings.json        # Plugins and hooks
│   └── config/              # Additional config
├── .devcontainer/           # Dev container setup
├── .vscode/                 # VS Code settings
├── src/
│   ├── components/          # React components
│   │   ├── LandingPage.tsx  # Main landing page
│   │   └── ui/
│   │       ├── curved-menu.tsx   # Custom Motion component
│   │       └── shadcn/           # shadcn/ui components
│   │           ├── button.tsx
│   │           ├── card.tsx
│   │           ├── input.tsx
│   │           ├── badge.tsx
│   │           └── index.ts      # Barrel export
│   ├── content/             # Site content (JSON)
│   │   └── site.json        # Navigation, text, etc.
│   ├── icons/               # SVG icon components
│   ├── layouts/             # Astro layouts
│   │   └── Layout.astro     # Base HTML layout
│   ├── lib/                 # Utilities
│   │   └── utils.ts         # cn() helper for Tailwind
│   ├── pages/               # Astro pages
│   │   └── index.astro      # Home page
│   └── styles/
│       ├── global.css       # TW4 CSS-first config, variables, custom utilities
│       └── hero.ts          # HeroUI plugin wrapper for @plugin directive
├── astro.config.mjs         # Astro + @tailwindcss/vite configuration
├── components.json          # shadcn/ui CLI configuration
├── wrangler.jsonc           # Cloudflare Workers config
└── CLAUDE.md                # Claude Code instructions
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at localhost:4321 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run deploy` | Build and deploy to Cloudflare |

## UI Components

### HeroUI (Rich, Pre-styled Components)

```tsx
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Navbar, NavbarBrand, NavbarContent } from "@heroui/navbar";
```

Best for: Navbars, modals, dropdowns, complex interactive components.

### shadcn/ui (Customizable Primitives)

```tsx
import { Button, Card, Input, Badge } from "@/components/ui/shadcn";
```

Best for: Forms, basic cards, badges, components you want full control over.

**Adding more shadcn components:**
```bash
npx shadcn@latest add [component-name]
```

### Motion (Animations)

```tsx
import { motion, AnimatePresence } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.05 }}
  transition={{ duration: 0.6 }}
>
  Animated content
</motion.div>
```

## Customization

### Adding Fonts

1. Install from fontsource: `npm install @fontsource/your-font`
2. Import in `src/styles/global.css`

### Adding HeroUI Components

1. Import the component package (already included in dependencies)
2. HeroUI classes are auto-scanned via `@source` directive in `global.css`
3. Import in your React component

### Adding shadcn Components

```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
```

### Theming

CSS variables are defined in `src/styles/global.css`:
- Light/dark mode support via `.dark` class
- shadcn variables: `--primary`, `--secondary`, `--background`, etc.
- HeroUI theming via `@plugin` directive
- Tailwind CSS v4 CSS-first configuration — no `tailwind.config.js` needed

### Environment Variables

Add to `.env` and declare in `src/env.d.ts`:
```typescript
interface ImportMetaEnv {
  readonly PUBLIC_MY_VAR: string;
}
```

## Claude Code Configuration

### Custom Agents

Located in `.claude/agents/`:

| Agent | Description |
|-------|-------------|
| `cloudflare-expert` | Cloudflare Workers, R2, D1, AI Gateway expertise |
| `frontend-designer` | UI/UX design, React components, animations |

### Custom Commands

Located in `.claude/commands/`:

| Command | Description |
|---------|-------------|
| `/deploy` | Build and deploy to Cloudflare Workers |
| `/perf-check` | Run performance analysis |
| `/add-component` | Add a new HeroUI component |
| `/new-page` | Create a new Astro page with React component |

### Enabled Plugins

Configured in `.claude/settings.json`:

- `frontend-design` - UI/UX design assistance
- `claude-md-management` - CLAUDE.md file management
- `claude-code-setup` - Project setup automation
- `web-performance-optimization` - Performance tips
- `web-performance-audit` - Core Web Vitals analysis
- `cloudflare-workers` - Workers development
- `cloudflare-r2` - R2 storage integration
- `tailwind-v4-shadcn` - Tailwind CSS patterns
- `mcp-management` - MCP server management

### Safety Hooks

The template includes a pre-tool hook that prevents editing files while on the `main` branch. This encourages feature branch workflows.

### Custom Skills

Located in `.claude/skills/`:

| Skill | Description |
|-------|-------------|
| `heroui-patterns` | HeroUI component usage patterns and best practices |
| `motion-animations` | Framer Motion animation recipes |
| `cloudflare-deployment` | Cloudflare Workers deployment guide |

Skills provide context-specific knowledge that Claude can reference when working on related tasks.

## License

MIT
