/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f7f5',
          100: '#edeae6',
          200: '#d5cec6',
          300: '#b8aca0',
          400: '#a69686', // base
          500: '#8a7d6d',
          600: '#6e6458',
          700: '#5a5248',
          800: '#4d443c',
          900: '#423a33',
        },
        secondary: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#8c8c8c',
          500: '#666666',
          600: '#4d4d4d',
          700: '#333333',
        },
        accent: {
          50: '#faf8f6',
          100: '#f2ede7',
          200: '#e5dbd0',
          300: '#d5c5b4',
          400: '#c7b39b',
          500: '#bba187',
          600: '#a08a70',
          700: '#8a755c',
          800: '#75624d',
          900: '#615341',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to bottom right, #a69686, #75624d)',
      },
    },
  },
  plugins: [],
};