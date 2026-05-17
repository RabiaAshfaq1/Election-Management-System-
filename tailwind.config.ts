import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        paper: "var(--paper)",
        paper2: "var(--paper2)",
        teal: {
          DEFAULT: "var(--teal)",
          light: "var(--teal-light)",
          2: "var(--teal2)",
          3: "var(--teal3)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          2: "var(--gold2)",
        },
        accent: "var(--accent)",
        muted: "var(--muted)",
        border: "var(--border)",
        glass: {
          DEFAULT: "var(--glass-bg)",
          border: "var(--glass-border)",
        },
      },
      fontFamily: {
        heading: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-geist)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
        hover: "var(--shadow-hover)",
      },
    },
  },
  plugins: [],
};

export default config;
