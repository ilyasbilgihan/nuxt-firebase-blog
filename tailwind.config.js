const defaultTheme = require('tailwindcss/defaultTheme')

const fontFamily = defaultTheme.fontFamily;
fontFamily['sans'] = [
  "'Quicksand', Roboto, system-ui, -apple-system, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'"
];


module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: fontFamily,
    extend: {},
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
    }
  },
  plugins: [],
}
