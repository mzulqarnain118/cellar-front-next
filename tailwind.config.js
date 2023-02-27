const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/core/components/**/*.{ts,tsx}',
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#464c2c',
        },
      },
    ],
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('daisyui'),
  ],
  theme: {
    colors: {
      accent: {
        50: '#FAF6F6',
        100: '#F5EBEB',
        200: '#EDDBDB',
        300: '#E0C1C1',
        400: '#CC9D9D',
        500: '#BB7777',
        600: '#A16161',
        700: '#864F4F',
        800: '#704444',
        900: '#5C3B3B',
      },
      alternate: {
        50: '#F6F4F0',
        100: '#E8E5D9',
        200: '#D4CCB4',
        300: '#BBAC89',
        400: '#A69269',
        500: '#82694C',
        600: '#82694C',
        700: '#69523F',
        800: '#5C483B',
        900: '#4E3E35',
      },
      black: '#000000',
      brand: {
        50: '#F5F8F5',
        100: '#E8F1E7',
        200: '#D1E2D0',
        300: '#ADCAAB',
        400: '#7FAB7D',
        500: '#5D8C5B',
        600: '#487247',
        700: '#3C5C3B',
        800: '#314A31',
        900: '#2A3D2A',
      },
      neutral: {
        50: '#F5F5F5',
        100: '#EFEFEF',
        200: '#DCDCDC',
        300: '#BDBDBD',
        400: '#989898',
        500: '#7C7C7C',
        600: '#656565',
        700: '#525252',
        800: '#464646',
        900: '#3D3D3D',
      },
      transparent: 'transparent',
      white: '#FFFFFF',
    },
    container: {
      padding: {
        DEFAULT: '1rem',
      },
    },
    extend: {
      animation: {
        'fade-in': 'fadeIn 300ms',
      },
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
      gridTemplateRows: {
        'product-card': '300px 1fr',
      },
      keyframes: {
        fadeIn: {
          from: {
            opacity: '0%',
          },
          to: {
            opacity: '100%',
          },
        },
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
    },
    fontFamily: {
      // body: ['var(--font-inter)', ...fontFamily.sans],
      body: ['proxima-nova', 'sans-serif'],
      heading: ['var(--font-merriweather)', ...fontFamily.sans],
    },
  },
}
