---
name: new-page
description: Create a new Astro page with React component
allowed_tools:
  - Read
  - Write
  - Edit
---

Create a new page in the Astro project:

1. Ask for the page name/route (e.g., "about", "contact", "pricing")
2. Create src/pages/[name].astro using the Layout
3. Create src/components/[Name]Page.tsx with React component
4. Add navigation link to site.json if appropriate

Template structure:
- Page uses Layout.astro for consistent HTML structure
- React component handles all interactive content
- Content can be added to site.json for easy editing
