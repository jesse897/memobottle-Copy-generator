import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        memo: {
          navy: "#323250",
          terracotta: "#c96226",
          text: "#3D4246",
          muted: "#555555",
          "sea-mist": "#ADDADF",
          "midnight-blue": "#4B5F85",
          "moss-green": "#58735A",
          "wild-plum": "#BB3C55",
          mandarin: "#FFB466",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
