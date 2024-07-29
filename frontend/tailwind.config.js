/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js, jsx}"],
    theme: {
      extend: {
        colors: {
          primary: '#FF6363',
          secondary: {
            100: '#2E2D5',
            200: '#888883'
          }
        }
      },
    },
    plugins: [],
  }