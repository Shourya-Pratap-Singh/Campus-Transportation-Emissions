import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#081849",
          900: "#081849",
          800: "#0e2463",
          700: "#163486",
          600: "#224ca9",
          100: "#e7effd",
          50: "#f4f7fe",
        },
        accentGreen: {
          DEFAULT: "#15803d",
          dark: "#166534",
          light: "#dcfce7",
          border: "#86efac",
        },
        accentAmber: {
          DEFAULT: "#b45309",
          dark: "#92400e",
          light: "#fef3c7",
          border: "#fde68a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
