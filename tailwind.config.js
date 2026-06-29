/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 4px 16px rgba(16,24,40,0.06)",
        cardHover: "0 6px 24px rgba(16,24,40,0.12)",
        panel: "-8px 0 40px rgba(16,24,40,0.12)",
        pop: "0 8px 30px rgba(16,24,40,0.16)",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn: {
          from: { opacity: 0, transform: "scale(0.96)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
        slideIn: {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.18s ease-out",
        scaleIn: "scaleIn 0.14s ease-out",
        slideIn: "slideIn 0.28s cubic-bezier(0.16,1,0.3,1)",
        slideUp: "slideUp 0.22s ease-out",
      },
    },
  },
  plugins: [],
};
