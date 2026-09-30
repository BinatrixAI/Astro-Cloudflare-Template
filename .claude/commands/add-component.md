---
name: add-component
description: Add a new HeroUI component to the project
allowed_tools:
  - Read
  - Write
  - Edit
  - Bash
---

Add a new HeroUI component to the project:

1. Check the UI matrix in CLAUDE.md: HeroUI is only for chrome/overlays (Navbar, Modal, Dropdown,
   Chip, Link, Divider). Buttons, cards, inputs and forms are shadcn (`npx shadcn@latest add <name>`).
2. Check if the component package is already installed
3. If not, install it from @heroui/[component-name]
4. Add it to `vite.environments.ssr.optimizeDeps.include` in astro.config.mjs (Tailwind already
   scans all of @heroui/theme, so there is no Tailwind step)
5. Create a usage example

Ask the user which component they want to add (e.g., modal, dropdown, etc.)
