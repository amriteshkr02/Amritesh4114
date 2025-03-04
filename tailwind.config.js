/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      backgroundImage: {
        'custom-gradient': 'linear-gradient(to right, #669219, #3ca0a3)',
      },
    },
  },
  plugins: [],
}