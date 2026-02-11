import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enable dark mode based on 'class'
  theme: {
    extend: {
      colors: {
        // Define a dark, technical color palette
        background: "var(--background)", // Uses CSS variable from globals.css
        foreground: "var(--foreground)", // Uses CSS variable from globals.css
        primary: {
          DEFAULT: "#8B5CF6", // A deep purple for primary actions
          dark: "#7C3AED",
        },
        secondary: {
          DEFAULT: "#4B5563", // A dark gray for secondary actions
          dark: "#374151",
        },
        accent: {
          DEFAULT: "#06B6D4", // A vibrant cyan for accents
          dark: "#0891B2",
        },
        // Additional technical/dark mode colors
        dark_surface: "#1A1A1A",
        dark_border: "#2C2C2C",
        dark_text: "#E0E0E0",
        dark_subtle_text: "#A0A0A0",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"], // Use Geist Sans from layout.tsx
        mono: ["var(--font-geist-mono)"], // Use Geist Mono from layout.tsx
      },
      // You can extend other properties like spacing, typography, etc.
    },
  },
  plugins: [],
};
export default config;
