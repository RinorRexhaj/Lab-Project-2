/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,tsx}"],
  theme: {
    screens: {
      lg: { max: "1440px" },
      tb: { max: "900px" },
      md: { max: "700px" },
      sm: { max: "500px" },
    },
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        primary: "#2D6A4F",
        gold: "#C4A352",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-100%)" },
          "60%": { opacity: "0.5" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        type: {
          "0%, 100%": {
            transform: "translateY(-50%)",
          },
          "50%": { transform: "translateY(0%)" },
        },
        "color-pulse": {
          "0%, 100%": { backgroundColor: "#10B981" }, // emerald-500
          "50%": { backgroundColor: "#34D399" }, // emerald-400
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-in-out",
        fadeOut: "fadeOut 0.3s ease-in-out",
        slideIn: "slideIn 0.5s ease-in-out",
        typing: "type 1s infinite",
        "color-pulse": "color-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
