---
name: heroui-patterns
description: HeroUI component patterns and best practices for this project
---

# HeroUI Component Patterns

## Installation Pattern
Always import from individual packages to reduce bundle size:
```typescript
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
```

## Provider Setup
Wrap your app with HeroUIProvider:
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

## Common Component Patterns

### Buttons
```typescript
<Button color="primary" variant="solid">Primary</Button>
<Button color="secondary" variant="bordered">Secondary</Button>
<Button color="danger" variant="light">Danger</Button>
<Button isLoading>Loading...</Button>
```

### Cards with Glass Effect
```typescript
<Card className="glass-card hover-lift">
  <CardBody className="p-6">
    <h3 className="text-xl font-semibold mb-2">Title</h3>
    <p className="text-foreground/70">Description</p>
  </CardBody>
</Card>
```

### Navbar
```typescript
<Navbar maxWidth="xl" className="bg-background/60 backdrop-blur-md">
  <NavbarBrand>Logo</NavbarBrand>
  <NavbarContent justify="center">
    <NavbarItem><a href="#">Link</a></NavbarItem>
  </NavbarContent>
  <NavbarContent justify="end">
    <NavbarItem>
      <Button color="primary">CTA</Button>
    </NavbarItem>
  </NavbarContent>
</Navbar>
```

## Adding New Components

1. Install: `npm install @heroui/[component]`
2. Add to `tailwind.config.js` content array:
   ```javascript
   "./node_modules/@heroui/theme/dist/components/[component].js"
   ```
3. Import and use in your component
