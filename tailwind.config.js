const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
    './src/core/components/**/*.{ts,tsx}',
  ],
  daisyui: {
    themes: [
      {
        theme: {
          accent: '#826145',
          'base-100': '#f8fcfc',
          error: '#e84e48',
          ghost: '#f5f5f5',
          info: '#3176bd',
          neutral: '#151215',
          primary: '#464c2c',
          secondary: '#864f4e',
          success: '#36D399',
          warning: '#f9b230',
        },
      },
    ],
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('tailwindcss/plugin')(({ addVariant }) => {
      addVariant('search-cancel', '&::-webkit-search-cancel-button')
    }),
    require('@tailwindcss/typography'),
    require('daisyui'),
    require('@headlessui/tailwindcss'),
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
        black: '#000000',
        brand: {
          50: '#EDEFE4',
          100: '#E5E8D7',
          200: '#D4D9BD',
          300: '#C3CAA3',
          400: '#B1BB89',
          500: '#A1AC6F',
          600: '#8D9A59',
          700: '#76804A',
          800: '#5E663B',
          900: '#464c2c',
          DEFAULT: '#464C2C',
        },
        error: '#e84e48',
        ghost: '#f5f5f5',
        info: '#3176bd',
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
        success: '#36D399',
        transparent: 'transparent',
        warning: '#f9b230',
        white: '#FFFFFF',
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
      body: ['proxima-nova', ...fontFamily.sans],
      heading: ['var(--font-merriweather)', ...fontFamily.sans],
    },
  },
}
