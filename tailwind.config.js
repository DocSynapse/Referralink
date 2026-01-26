/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Geist", "sans-serif"],
        technical: ["JetBrains Mono", "monospace"],
      },
      colors: {
        oxford: "#002147",
        accent: "#FF4500",
      }
    },
  },
  plugins: [],
}
