# Astro + Cloudflare Workers Template

A production-ready template for building modern web applications with:

- **Astro 5** - Server-side rendering with React islands
- **React 19** - Interactive components
- **Tailwind CSS 3** - Utility-first styling
- **HeroUI v3** - Beautiful, accessible components
- **Framer Motion** - Smooth animations
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
│   │   └── LandingPage.tsx  # Main landing page
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
│       └── global.css       # Tailwind + custom utilities
├── astro.config.mjs         # Astro configuration
├── tailwind.config.js       # Tailwind + HeroUI config
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

## Claude Code Features

This template includes:

- **Hooks**: Prevents editing on main branch (safety)
- **Plugins**: 
  - `frontend-design` - UI/UX assistance
  - `web-performance-optimization` - Performance tips
  - `web-performance-audit` - Core Web Vitals
  - `cloudflare-workers-ai` - Cloudflare integration

## Customization

### Adding Fonts

1. Install from fontsource: `npm install @fontsource/your-font`
2. Import in `src/styles/global.css`
3. Add to `tailwind.config.js` fontFamily

### Adding HeroUI Components

1. Import the component package (already included in dependencies)
2. Add to `tailwind.config.js` content array
3. Import in your React component

### Environment Variables

Add to `.env` and declare in `src/env.d.ts`:
```typescript
interface ImportMetaEnv {
  readonly PUBLIC_MY_VAR: string;
}
```

## License

MIT

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
