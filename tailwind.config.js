/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0f172a", 
          primary: "#1e293b",
          accent: "#3b82f6", 
          bg: "#f8fafc",   
        }
      }
    },
  },
  plugins: [],
}