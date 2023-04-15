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
          success: '#6e9f5e',
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
        accent: {
          50: '#FCFBFA',
          100: '#DDD0C6',
          200: '#C2AC9A',
          300: '#AD8F76',
          400: '#97765B',
          500: '#7E624C',
          600: '#69523F',
          700: '#544232',
          800: '#433428',
          900: '#362A20',
          DEFAULT: '#69523F',
        },
        black: '#000000',
        brand: {
          50: '#C0C79F',
          100: '#A7B179',
          200: '#919E5B',
          300: '#79834C',
          400: '#656D3F',
          500: '#545B35',
          600: '#464C2C',
          700: '#383D23',
          800: '#2D311C',
          900: '#242717',
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
          DEFAULT: '#EFEFEFEF',
        },
        product: {
          50: '#E6D4D4',
          100: '#CAA6A6',
          200: '#B47F7F',
          300: '#A15F5F',
          400: '#864F4F',
          500: '#6B3F3F',
          600: '#563333',
          700: '#452828',
          800: '#372020',
          900: '#2C1A1A',
          DEFAULT: '#864F4F',
        },
        success: '#6e9f5e',
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
