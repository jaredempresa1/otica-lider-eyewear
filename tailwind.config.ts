import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#1E211D",
          black: "#1E211D",
          gold: "#B88A45",
          orange: "#B88A45",
          "orange-dark": "#946A2F",
          sage: "#DCE2D2",
          moss: "#465348",
          cream: "#F4F1EA",
          paper: "#FBFAF7",
        },
      },
      fontFamily: {
        heading: ["var(--font-piazzolla)", "serif"],
        body: ["var(--font-instrument-sans)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 16px 50px rgba(30, 33, 29, 0.08)",
        card: "0 8px 30px rgba(30, 33, 29, 0.06)",
      },
      transitionTimingFunction: {
        "premium-out": "cubic-bezier(0.23, 1, 0.32, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
