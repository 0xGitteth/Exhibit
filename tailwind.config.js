/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './Pages/**/*.{js,jsx,ts,tsx}',
    './Components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        serenity: {
          50: '#e1f1fd',
          100: '#d2deeb',
          200: '#c8d9ed',
          300: '#c1d8f0',
          400: '#9db8e0',
          500: '#6f92c8',
          600: '#4663ac',
          700: '#324c8a',
          800: '#273c70',
          900: '#1e315c',
          950: '#131c35',
        },
        midnight: {
          50: '#1b2436',
          100: '#172032',
          200: '#141c2d',
          300: '#111927',
          400: '#0f1521',
          500: '#0c111b',
          600: '#0a0e17',
          700: '#080b12',
          800: '#05070c',
          900: '#030507',
          950: '#020304',
        },
      },
      boxShadow: {
        floating: '0 18px 45px rgba(70, 99, 172, 0.25)',
        soft: '0 10px 30px rgba(24, 38, 76, 0.15)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
