/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Custom theme colors
        background: {
          light: "#ffffff",
          dark: "#0f172a",
        },
        surface: {
          light: "#f8fafc",
          dark: "#1e293b",
        },
        card: {
          light: "#ffffff",
          dark: "#334155",
        },
        border: {
          light: "#e2e8f0",
          dark: "#475569",
        },
        text: {
          primary: {
            light: "#0f172a",
            dark: "#f8fafc",
          },
          secondary: {
            light: "#64748b",
            dark: "#cbd5e1",
          },
          muted: {
            light: "#94a3b8",
            dark: "#64748b",
          },
        },
        // Category colors (we'll use these for customization later)
        categories: {
          red: "#ef4444",
          orange: "#f97316",
          amber: "#f59e0b",
          yellow: "#eab308",
          lime: "#84cc16",
          green: "#22c55e",
          emerald: "#10b981",
          teal: "#14b8a6",
          cyan: "#06b6d4",
          sky: "#0ea5e9",
          blue: "#3b82f6",
          indigo: "#6366f1",
          violet: "#8b5cf6",
          purple: "#a855f7",
          fuchsia: "#d946ef",
          pink: "#ec4899",
          rose: "#f43f5e",
        },
      },
      animation: {
        "theme-transition": "theme-transition 0.3s ease-in-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
      keyframes: {
        "theme-transition": {
          "0%": { opacity: "0.8" },
          "100%": { opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
