import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9dffd",
          300: "#7cc5fb",
          400: "#36a7f7",
          500: "#0c8ce9",
          600: "#006ec7",
          700: "#0158a1",
          800: "#054a85",
          900: "#0a3f6f",
          950: "#07284a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
