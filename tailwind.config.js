/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        primary:'#ff5252',
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        gradient: {
          start: '#ff5252',
          end: '#f97316',
          orange: '#fb923c',
        }
      },
      backgroundColor:{
        primary:'#ff5252',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #ff5252, #f97316)',
        'gradient-orange': 'linear-gradient(to right, #f97316, #fb923c)',
        'gradient-radial': 'radial-gradient(circle, #ff5252, #f97316)',
      }
    },
  },
  plugins: [],
}

