/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f1f5fa',
          100: '#e1eaf4',
          200: '#c3d3e8',
          300: '#93aecf',
          400: '#5c82b0',
          500: '#3a6194',
          600: '#284b7a',
          700: '#1d3a62',
          800: '#142b4b',
          900: '#0d1f38',
          950: '#08142a',
        },
        gold: {
          300: '#efd488',
          400: '#e3b94f',
          500: '#c99a2e',
          600: '#a77b1d',
        },
        paper: '#f7f5f0',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4 Variable"', 'Georgia', 'serif'],
      },
      maxWidth: {
        page: '80rem',
      },
      boxShadow: {
        card: '0 1px 2px rgb(8 20 42 / 0.04), 0 8px 24px -12px rgb(8 20 42 / 0.12)',
        lift: '0 2px 4px rgb(8 20 42 / 0.05), 0 18px 36px -16px rgb(8 20 42 / 0.25)',
      },
    },
  },
  plugins: [],
}
