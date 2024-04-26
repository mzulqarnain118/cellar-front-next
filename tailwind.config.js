const { fontFamily } = require('tailwindcss/defaultTheme')

const round = num =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, '$1')
    .replace(/\.0$/, '')
const em = (px, base) => `${round(px / base)}em`
const rem = px => `${round(px / 16)}rem`

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
    './src/core/components/**/*.{ts,tsx}',
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/react-daisyui/dist/**/*.js',
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/colors/themes')['[data-theme=garden]'],
          brown: '#eeddcd',
          primary: '#464c2c',
          secondary: '#864f4f',
        },
      },
    ],
  },
  plugins: [
    require('tailwindcss/plugin')(({ addVariant }) => {
      addVariant('search-cancel', '&::-webkit-search-cancel-button')
    }),
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
  theme: {
    container: {
      padding: {
        DEFAULT: '1rem',
      },
    },
    extend: {
      animation: {
        'fade-in': 'fadeIn 300ms',
      },
      colors: {
        accent: {
          DEFAULT: '#fae5e5',
          dark: '#eb9494',
          light: '#fae5e5',
        },
        base: {
          dark: '#d3cfcf',
          light: '#efefef',
        },
        brown: {
          DEFAULT: '#eeddcd',
          light: '#eeddcd',
          text: '#333333',
        },
        error: '#F87272',
        info: '#3ABFF8',
        neutral: {
          DEFAULT: '#bdb7b7',
          dark: '#312c2c',
          light: '#bdb7b7',
        },
        primary: {
          DEFAULT: '#464c2c',
          dark: '#',
          light: '#464c2c',
        },
        // primary: {
        //   DEFAULT: '#5c7f67',
        //   dark: '#4b6853',
        //   light: '#5c7f67',
        // },
        secondary: {
          DEFAULT: '#ecf4e7',
          dark: '#b9d7a8',
          light: '#ecf4e7',
        },
        success: '#36D399',
        warning: '#FBBD23',
        white: '#F5F5F5',
      },
      fontSize: {
        14: '0.875rem',
        18: '1.125rem',
        base: '1rem',
        h1: '3.5rem',
        h2: '3rem',
        h3: '2.5rem',
        h4: '2rem',
        h5: '1.75rem',
        h6: '1.5rem',
        lg: '1.125rem',
        md: '1rem',
        sm: '0.75rem',
        xs: '0.625rem',
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
      screens: {
        '1/2xl':'1180px',
        '1xl': '1460px',
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
      typography: {
        lg: {
          css: {
            fontSize: rem(16),
            h1: {
              fontSize: em(48, 16),
              lineHeight: round(48 / 48),
              marginBottom: em(40, 48),
              marginTop: '0',
            },
            h2: {
              fontSize: em(30, 16),
              lineHeight: round(40 / 30),
              marginBottom: em(32, 30),
              marginTop: em(56, 30),
            },
            h3: {
              fontSize: em(24, 16),
              lineHeight: round(36 / 24),
              marginBottom: em(16, 24),
              marginTop: em(40, 24),
            },
            h4: {
              lineHeight: round(28 / 16),
              marginBottom: em(8, 16),
              marginTop: em(32, 16),
            },
            lineHeight: round(32 / 16),
            p: {
              marginBottom: em(24, 16),
              marginTop: em(24, 16),
            },
          },
        },
      },
    },
    fontFamily: {
      body: ['proxima-nova', ...fontFamily.sans],
      heading: ['var(--font-merriweather)', ...fontFamily.sans],
    },
  },
}
