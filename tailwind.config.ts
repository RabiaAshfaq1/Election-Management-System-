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
        teal: {
          DEFAULT: "var(--teal)",
          light: "var(--teal-light)",
        },
        gold: "var(--gold)",
        accent: "var(--accent)",
        muted: "var(--muted)",
        border: "var(--border)",
      },
      fontFamily: {
        heading: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(10, 10, 15, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
