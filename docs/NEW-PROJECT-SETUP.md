# New Project Setup Guide

Step-by-step instructions for creating a new project from the Astro + Cloudflare Workers template.

---

## 1. Create the Project

### Option A: GitHub CLI (recommended)

```bash
gh repo create my-new-site --template BinatrixAI/Astro-Cloudflare-Template --private --clone
cd my-new-site
```

### Option B: GitHub Web UI

1. Go to https://github.com/BinatrixAI/Astro-Cloudflare-Template
2. Click **"Use this template"** > **"Create a new repository"**
3. Clone the new repo locally:
   ```bash
   git clone https://github.com/BinatrixAI/my-new-site.git
   cd my-new-site
   ```

### Option C: Local copy (no GitHub template)

```bash
cp -r /Users/dima/Binatrix/astro-cloudflare-template /Users/dima/Binatrix/my-new-site
cd /Users/dima/Binatrix/my-new-site
rm -rf .git node_modules dist .astro .wrangler
find . -name '.DS_Store' -delete
git init && git checkout -b main
git remote add origin https://github.com/BinatrixAI/my-new-site.git
```

---

## 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is needed because HeroUI v3 beta has peer dependency conflicts with React 19.

---

## 3. Verify Template Files

Run this checklist to confirm all Claude Code configuration, agents, skills, and project files are present.

### Claude Code Configuration (`.claude/`)

```bash
# Run from project root:
echo "=== Settings ===" && \
ls -1 .claude/settings.json .claude/config/ccp-config.json && \
echo "" && \
echo "=== Agents ===" && \
ls -1 .claude/agents/ && \
echo "" && \
echo "=== Commands ===" && \
ls -1 .claude/commands/ && \
echo "" && \
echo "=== Skills ===" && \
ls -1 .claude/skills/
```

**Expected output:**

```
=== Settings ===
.claude/settings.json           # Plugins, hooks config
.claude/config/ccp-config.json  # CCP install mode

=== Agents ===
cloudflare-expert.md            # Cloudflare Workers/R2/D1 expert
frontend-designer.md            # UI/UX design expert

=== Commands ===
add-component.md                # /add-component - scaffold HeroUI component
deploy.md                       # /deploy - full deployment workflow
new-page.md                     # /new-page - create Astro page + React component
perf-check.md                   # /perf-check - run performance analysis

=== Skills ===
cloudflare-deployment.md        # Cloudflare deployment patterns
heroui-patterns.md              # HeroUI component best practices
motion-animations.md            # Motion/Framer Motion recipes
```

> **Note:** `.claude/settings.local.json` is gitignored and won't be present in clones. See [Optional: Local Plugin Overrides](#optional-local-plugin-overrides) to create it.

### Agent Skills (`.agent/`)

```bash
ls -1 .agent/skills/wrangler/
```

**Expected output:**

```
SKILL.md                        # Comprehensive Wrangler CLI reference (877 lines)
```

### Project Configuration

```bash
ls -1 wrangler.jsonc astro.config.mjs tailwind.config.js components.json \
      tsconfig.json postcss.config.js .editorconfig .env.example CLAUDE.md README.md
```

All 10 files should be listed without errors.

### VS Code & Dev Container

```bash
ls -1 .vscode/extensions.json .devcontainer/Dockerfile .devcontainer/devcontainer.json
```

All 3 files should be listed without errors.

### Source Structure

```bash
ls -1 src/pages/index.astro \
      src/layouts/Layout.astro \
      src/components/LandingPage.tsx \
      src/components/ui/curved-menu.tsx \
      src/components/ui/shadcn/index.ts \
      src/content/site.json \
      src/icons/AnimatedIcon.tsx \
      src/lib/utils.ts \
      src/styles/global.css
```

All 9 files should be listed without errors.

### One-Liner Full Check

Copy-paste this to verify everything at once:

```bash
missing=0; \
for f in \
  .claude/settings.json \
  .claude/config/ccp-config.json \
  .claude/agents/cloudflare-expert.md \
  .claude/agents/frontend-designer.md \
  .claude/commands/deploy.md \
  .claude/commands/add-component.md \
  .claude/commands/new-page.md \
  .claude/commands/perf-check.md \
  .claude/skills/cloudflare-deployment.md \
  .claude/skills/heroui-patterns.md \
  .claude/skills/motion-animations.md \
  .agent/skills/wrangler/SKILL.md \
  .vscode/extensions.json \
  .devcontainer/Dockerfile \
  .devcontainer/devcontainer.json \
  wrangler.jsonc \
  astro.config.mjs \
  tailwind.config.js \
  components.json \
  tsconfig.json \
  postcss.config.js \
  .editorconfig \
  .env.example \
  CLAUDE.md \
  README.md \
  src/pages/index.astro \
  src/layouts/Layout.astro \
  src/components/LandingPage.tsx \
  src/components/ui/curved-menu.tsx \
  src/components/ui/shadcn/index.ts \
  src/content/site.json \
  src/icons/AnimatedIcon.tsx \
  src/lib/utils.ts \
  src/styles/global.css; \
do \
  [ -f "$f" ] || { echo "MISSING: $f"; missing=$((missing+1)); }; \
done; \
[ $missing -eq 0 ] && echo "All 35 files present."
```

---

## 4. Update Placeholders

These files contain placeholder values that must be changed for each new project. Each placeholder is marked with a `TODO` comment in the file.

### `package.json`

```json
"name": "my-new-site",
"version": "0.1.0"
```

### `wrangler.jsonc`

```jsonc
// TODO: Update worker name
"name": "my-new-site",
// TODO: Update with your Cloudflare account ID
"account_id": "YOUR_ACCOUNT_ID",
// TODO: Update with your domain
"routes": [
  { "pattern": "your-domain.com", "custom_domain": true },
  { "pattern": "www.your-domain.com/*", "zone_name": "your-domain.com" }
]
```

> **Where to find your Account ID:** Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com) > select your account > **Workers & Pages** > the Account ID is shown in the right sidebar.

### `astro.config.mjs`

```js
// TODO: Update with your domain
site: 'https://your-domain.com',
```

### `CLAUDE.md`

Update the project description on the first line:

```markdown
[PROJECT_NAME] - Built with Astro 5 + React 19...
```

Also update any project-specific sections (deployment URL, environment variables, etc.)

### `README.md`

Update project name, description, features list, and remove template-specific instructions.

### `.devcontainer/devcontainer.json`

```json
"name": "my-new-site",
"workspaceFolder": "/workspaces/my-new-site"
```

### `.env` (create from example)

```bash
cp .env.example .env
# Edit .env with your values
```

---

## 5. Set Up Git Workflow

The template includes a hook that blocks edits on the `main` branch. Use feature branches:

```bash
git checkout -b develop
git push -u origin develop
```

The hook is defined in `.claude/settings.json` under `hooks.PreToolUse` — it prevents Claude Code from editing files when on `main`, encouraging a feature branch workflow.

---

## 6. Start Development

```bash
npm run dev
# Opens at http://localhost:4321
```

---

## 7. Deploy to Cloudflare

### First-time setup

1. Authenticate with Cloudflare:
   ```bash
   npx wrangler login
   ```

2. Verify your account:
   ```bash
   npx wrangler whoami
   ```

3. Make sure `wrangler.jsonc` has your account ID and domain (see [Step 4](#4-update-placeholders)).

### Deploy

```bash
npm run deploy
```

Or use the Claude Code command:

```
/deploy
```

---

## Optional: Local Plugin Overrides

`.claude/settings.local.json` is gitignored (per-machine settings). To enable extra plugins, create it:

```bash
cat > .claude/settings.local.json << 'EOF'
{
  "enabledPlugins": {
    "cloudflare-workers-ai@claude-skills": true,
    "aceternity-ui@claude-skills": true
  }
}
EOF
```

These provide:
- **cloudflare-workers-ai** — Workers AI model integration patterns
- **aceternity-ui** — 100+ animated React components for Next.js/React

---

## Quick Reference: What Each Directory Does

| Path | Purpose | In Git |
|------|---------|:------:|
| `.claude/settings.json` | Plugin config, git protection hook | Yes |
| `.claude/settings.local.json` | Local plugin overrides (create manually) | No |
| `.claude/agents/` | Custom AI agents (cloudflare-expert, frontend-designer) | Yes |
| `.claude/commands/` | Slash commands (/deploy, /add-component, /new-page, /perf-check) | Yes |
| `.claude/skills/` | Context skills (heroui, motion, cloudflare) | Yes |
| `.claude/config/` | CCP install configuration | Yes |
| `.agent/skills/` | Wrangler CLI reference skill | Yes |
| `.vscode/` | VS Code extensions recommendations | Yes |
| `.devcontainer/` | Docker dev container config | Yes |
| `.astro/` | Astro build cache (auto-generated) | No |
| `.wrangler/` | Wrangler local state | No |
| `dist/` | Production build output | No |
| `node_modules/` | npm dependencies | No |

---

## Enabled Claude Code Plugins

Pre-configured in `.claude/settings.json`:

| Plugin | Purpose |
|--------|---------|
| `frontend-design` | UI/UX design assistance |
| `claude-md-management` | CLAUDE.md file management |
| `claude-code-setup` | Project setup automation |
| `web-performance-optimization` | Performance tips |
| `web-performance-audit` | Core Web Vitals analysis |
| `cloudflare-workers` | Workers development |
| `cloudflare-r2` | R2 storage integration |
| `tailwind-v4-shadcn` | Tailwind CSS patterns |
| `mcp-management` | MCP server management |

Optional (via `settings.local.json`, see [above](#optional-local-plugin-overrides)):

| Plugin | Purpose |
|--------|---------|
| `cloudflare-workers-ai` | Workers AI integration |
| `aceternity-ui` | Animated React components |

---

## Available Claude Code Commands

| Command | File | Description |
|---------|------|-------------|
| `/deploy` | `.claude/commands/deploy.md` | Full deployment: version bump, git tag, Cloudflare deploy, GitHub release |
| `/add-component` | `.claude/commands/add-component.md` | Add a new HeroUI component with Tailwind config |
| `/new-page` | `.claude/commands/new-page.md` | Create new Astro page with React component |
| `/perf-check` | `.claude/commands/perf-check.md` | Run performance analysis on built site |
