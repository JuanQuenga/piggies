/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./convex/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Use CSS variables for theme colors
        background: "var(--color-background)",
        card: "var(--color-card)",
        border: "var(--color-border)",
        primary: "var(--color-primary)",
        "primary-foreground": "var(--color-primary-foreground)",
        accent: "var(--color-accent)",
        muted: "var(--color-muted)",
        "muted-foreground": "var(--color-muted-foreground)",
        foreground: "var(--color-foreground)",
      },
      boxShadow: {
        card: "0 2px 16px 0 rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
