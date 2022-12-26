const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/core/components/**/*.{ts,tsx}',
  ],
  plugins: [],
  theme: {
    colors: {
      error: '#B52831',
      input: '#E2E2E2',
      neutral: {
        50: '#F4F4F4',
        100: '#e6e6e6',
        200: '#A6A7A6',
        300: '#7A7C79',
        400: '#4E504D',
        500: '#212420',
        600: '#1B1D1A',
        700: '#141613',
        800: '#0D0E0D',
        900: '#070706',
      },
      primary: {
        100: '#D9DED7',
        200: '#B3BEAF',
        300: '#8D9D86',
        400: '#677C5E',
        500: '#415C36',
        600: '#34492B',
        700: '#273720',
        800: '#1A2516',
        900: '#0D120B',
      },
      secondary: {
        100: '#DDCDCE',
        200: '#BB9C9E',
        300: '#9A6A6D',
        400: '#78393D',
        500: '#56070C',
        600: '#45060A',
        700: '#340407',
        800: '#220305',
        900: '#110102',
      },
      tertiary: {
        100: '#DEDAD7',
        200: '#BEB5AF',
        300: '#9D9086',
        400: '#7C6B5E',
        500: '#5C4636',
        600: '#49382B',
        700: '#372A20',
        800: '#251C16',
        900: '#120E0B',
      },
    },
    container: {
      padding: {
        DEFAULT: '1rem',
      },
    },
    extend: {
      fontSize: {
        base: '1rem',
        h1: '3.5rem',
        h2: '3rem',
        h3: '2.5rem',
        h4: '2rem',
        h5: '1.75rem',
        h6: '1.5rem',
        lg: '1.25rem',
        sm: '0.75rem',
        xs: '0.625rem',
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
    },
    fontFamily: {
      body: ['var(--font-inter)', ...fontFamily.sans],
      heading: ['var(--font-montserrat)', ...fontFamily.sans],
    },
  },
}
