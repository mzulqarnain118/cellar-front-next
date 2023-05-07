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
        },
      },
    ],
    // themes: [
    //   {
    //     theme: {
    //       accent: '#826145',
    //       'base-100': '#f8fcfc',
    //       error: '#b91c1c',
    //       ghost: '#f5f5f5',
    //       info: '#3176bd',
    //       neutral: '#151215',
    //       primary: '#464c2c',
    //       secondary: '#864f4e',
    //       success: '#6e9f5e',
    //       warning: '#f9b230',
    //     },
    //   },
    // ],
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
          DEFAULT: '#d3cfcf',
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
          DEFAULT: '#5c7f67',
          dark: '#4b6853',
          light: '#5c7f67',
        },
        secondary: {
          DEFAULT: '#ecf4e7',
          dark: '#b9d7a8',
          light: '#ecf4e7',
        },
        success: '#36D399',
        warning: '#FBBD23',
        // accent: {
        //   50: '#FBF3E7',
        //   100: '#EBDCC6',
        //   200: '#DDC5A3',
        //   300: '#CFAE7F',
        //   400: '#C2985A',
        //   500: '#A87F40',
        //   600: '#836232',
        //   700: '#5E4623',
        //   800: '#392A14',
        //   900: '#160D00',
        // },
        // // accent: {
        // //   50: '#FCFBFA',
        // //   100: '#DDD0C6',
        // //   200: '#C2AC9A',
        // //   300: '#AD8F76',
        // //   400: '#97765B',
        // //   500: '#7E624C',
        // //   600: '#69523F',
        // //   700: '#544232',
        // //   800: '#433428',
        // //   900: '#362A20',
        // //   DEFAULT: '#69523F',
        // // },
        // black: '#000000',
        // brand: {
        //   50: '#E8F8E8',
        //   100: '#CBE4CD',
        //   200: '#ADD1AF',
        //   300: '#8EBD90',
        //   400: '#6FAA72',
        //   500: '#569058',
        //   600: '#427044',
        //   700: '#2E5030',
        //   800: '#19311A',
        //   900: '#021202',
        // },
        // // brand: {
        // //   50: '#C0C79F',
        // //   100: '#A7B179',
        // //   200: '#919E5B',
        // //   300: '#79834C',
        // //   400: '#656D3F',
        // //   500: '#545B35',
        // //   600: '#464C2C',
        // //   700: '#383D23',
        // //   800: '#2D311C',
        // //   900: '#242717',
        // //   DEFAULT: '#464C2C',
        // // },
        // // error: '#b91c1c',
        // // ghost: '#f5f5f5',
        // // info: '#3176bd',
        // neutral: {
        //   50: '#F5F5F5',
        //   100: '#EFEFEF',
        //   200: '#DCDCDC',
        //   300: '#BDBDBD',
        //   400: '#989898',
        //   500: '#7C7C7C',
        //   600: '#656565',
        //   700: '#525252',
        //   800: '#464646',
        //   900: '#3D3D3D',
        //   DEFAULT: '#EFEFEFEF',
        // },
        // product: {
        //   50: '#FFE6E8',
        //   100: '#F6BEC3',
        //   200: '#EA969B',
        //   300: '#E06C75',
        //   400: '#D5434D',
        //   500: '#BC2A34',
        //   600: '#931F28',
        //   700: '#69151C',
        //   800: '#420A0F',
        //   900: '#1D0103',
        // },
        // // product: {
        // //   50: '#E6D4D4',
        // //   100: '#CAA6A6',
        // //   200: '#B47F7F',
        // //   300: '#A15F5F',
        // //   400: '#864F4F',
        // //   500: '#6B3F3F',
        // //   600: '#563333',
        // //   700: '#452828',
        // //   800: '#372020',
        // //   900: '#2C1A1A',
        // //   DEFAULT: '#864F4F',
        // // },
        // // success: '#6e9f5e',
        // transparent: 'transparent',
        // // warning: '#f9b230',
        // white: '#FFFFFF',
      },
      fontSize: {
        14: '0.875rem',
        base: '1rem',
        h1: '3.5rem',
        h2: '3rem',
        h3: '2.5rem',
        h4: '2rem',
        h5: '1.75rem',
        h6: '1.5rem',
        lg: '1.25rem',
        md: '1.125rem',
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
