/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      // This maps the Tailwind utility classes (e.g., bg-app-canvas)
      // to the CSS variables defined in index.css
      colors: {
        app: {
          canvas: "rgb(var(--bg-canvas) / <alpha-value>)",
          frame: "rgb(var(--bg-frame) / <alpha-value>)",
          surface: "rgb(var(--bg-surface) / <alpha-value>)",
          overlay: "rgb(var(--bg-overlay) / <alpha-value>)",
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--text-tertiary) / <alpha-value>)",
          border: "rgb(var(--border-base) / <alpha-value>)",
          highlight: "rgb(var(--border-highlight) / <alpha-value>)",
          brand: "rgb(var(--color-brand) / <alpha-value>)",
          "brand-dim": "rgb(var(--color-brand-dim) / <alpha-value>)",
        },
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
