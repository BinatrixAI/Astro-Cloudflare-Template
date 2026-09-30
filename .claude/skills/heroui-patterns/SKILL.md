---
name: heroui-patterns
description: HeroUI component patterns and best practices for this project
---

# HeroUI Component Patterns

HeroUI is for **app chrome and overlays only**: Navbar, Modal, Dropdown, Chip, Link, Divider.
Buttons, cards, inputs and forms are **shadcn** (`@/components/ui/shadcn`). See the UI matrix in `CLAUDE.md`.

## Installation Pattern
Import from individual stable packages (never the `@heroui/react` meta package):
```typescript
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Chip } from "@heroui/chip";
```

## Provider Setup
Wrap the island that uses HeroUI with HeroUIProvider:
```typescript
import { HeroUIProvider } from "@heroui/system";

export default function App() {
  return (
    <HeroUIProvider>
      {/* Your app content */}
    </HeroUIProvider>
  );
}
```

## Navbar (with a shadcn CTA)
```typescript
import { Button } from "@/components/ui/shadcn";

<Navbar maxWidth="xl" className="bg-background/60 backdrop-blur-md">
  <NavbarBrand>Logo</NavbarBrand>
  <NavbarContent justify="center">
    <NavbarItem><a href="#">Link</a></NavbarItem>
  </NavbarContent>
  <NavbarContent justify="end">
    <NavbarItem>
      <Button asChild><a href="/contact">CTA</a></Button>
    </NavbarItem>
  </NavbarContent>
</Navbar>
```

## Adding New Components

1. Install: `npm install @heroui/[component]`
2. Add it to `vite.environments.ssr.optimizeDeps.include` in `astro.config.mjs`
   (otherwise the first cold dev request fails with "Invalid hook call").
3. Nothing to add for Tailwind: `src/styles/global.css` already scans all of `@heroui/theme`.
