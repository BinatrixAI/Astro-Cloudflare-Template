const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx}",
    // Only include HeroUI components you actually use (reduces CSS bloat)
    "./node_modules/@heroui/theme/dist/components/button.js",
    "./node_modules/@heroui/theme/dist/components/card.js",
    "./node_modules/@heroui/theme/dist/components/chip.js",
    "./node_modules/@heroui/theme/dist/components/divider.js",
    "./node_modules/@heroui/theme/dist/components/link.js",
    "./node_modules/@heroui/theme/dist/components/navbar.js",
    // Add more HeroUI components as needed:
    // "./node_modules/@heroui/theme/dist/components/modal.js",
    // "./node_modules/@heroui/theme/dist/components/input.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Add your fonts here
        // heebo: ["Heebo", "sans-serif"],
      },
      colors: {
        // Add your brand colors here
        // "brand-primary": "#0073ea",
        // "brand-secondary": "#7950f2",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
