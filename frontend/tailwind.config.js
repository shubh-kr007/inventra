/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        inventra: {
          bg: "#050816",
          card: "rgba(255, 255, 255, 0.05)",
          border: "rgba(255, 255, 255, 0.08)",
          cyan: "#00D9FF",
          green: "#22C55E",
          red: "#EF4444",
          text: "#FFFFFF",
          muted: "#94A3B8",
        }
      },
      fontFamily: {
        sans: ["Inter", "Outfit", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 15px rgba(0, 217, 255, 0.15)",
        "glow-lg": "0 0 25px rgba(0, 217, 255, 0.35)",
        "glow-green": "0 0 15px rgba(34, 197, 94, 0.2)",
        "glow-red": "0 0 15px rgba(239, 68, 68, 0.2)",
      }
    },
  },
  plugins: [],
}
