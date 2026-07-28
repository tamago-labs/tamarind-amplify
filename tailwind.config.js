/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#EEF0F4",
        panel: "#FFFFFF",
        ink: "#14161C",
        sub: "#5A5F6E",
        hair: "#D8DBE3",
        indigo: "#5B4FE8",
        indigosoft: "#EDEBFC",
        okgreen: "#1F9D55",
      },
      fontFamily: {
        display: ["var(--font-display)", "IBM Plex Sans", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
