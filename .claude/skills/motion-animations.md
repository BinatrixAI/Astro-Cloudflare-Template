---
name: motion-animations
description: Framer Motion animation patterns for this project
---

# Motion Animation Patterns

## Import
Use the modern import path:
```typescript
import { motion, AnimatePresence } from "motion/react";
```

## Common Animation Patterns

### Fade In on Scroll
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  viewport={{ once: true }}
>
  Content
</motion.div>
```

### Staggered Children
```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(i => (
    <motion.div key={i} variants={item}>{i}</motion.div>
  ))}
</motion.div>
```

### Hover Effects
```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  Click me
</motion.button>
```

### Page Transitions with AnimatePresence
```typescript
<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Modal content
    </motion.div>
  )}
</AnimatePresence>
```

### SVG Path Animation
```typescript
<motion.path
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 1, ease: "easeInOut" }}
  d="M0 0 L100 100"
/>
```

## Performance Tips
- Use `layoutId` for shared element transitions
- Add `viewport={{ once: true }}` for scroll animations
- Use `will-change: transform` sparingly
- Prefer `transform` and `opacity` for 60fps animations
