---
name: perf-check
description: Run performance analysis on the built site
---

Analyze the site's performance:

1. Build the site first
2. Run Lighthouse or similar performance audit
3. Check bundle sizes
4. Analyze Core Web Vitals

Steps:
1. Run `npm run build` to create production build
2. Analyze the dist folder for bundle sizes
3. Preview with `npm run preview` and run Lighthouse
4. Check for unused CSS and JavaScript
5. Verify image optimization

Report findings and suggest optimizations.
