const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        gray: colors.trueGray,
        red: {
          '50': '#FBECEB',
          '100': '#F7D8D6',
          '200': '#EFAFAB',
          '300': '#E78680',
          '400': '#DF5D55',
          '500': '#D7342A',
          '600': '#AD2921',
          '700': '#821F19',
          '800': '#581510',
          '900': '#2D0A08'
        }
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
