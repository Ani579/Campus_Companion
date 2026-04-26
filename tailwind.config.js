/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0A1D56',
          blue: '#1A73E8',
          green: '#00B074',
          purple: '#8C52FF',
          orange: '#FF914D',
          lightBlue: '#00C2FF'
        }
      }
    },
  },
  plugins: [],
}
