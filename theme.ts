import { MantineThemeOverride } from '@mantine/core'
import resolveConfig from 'tailwindcss/resolveConfig'

import config from 'tailwind.config'

export const tailwindConfig = resolveConfig(config)
const tailwindColors = tailwindConfig.theme?.colors

export const theme: MantineThemeOverride = {
  colorScheme: 'light',
  // @ts-ignore
  colors:
    tailwindColors !== undefined
      ? {
          ...Object.fromEntries(
            Object.entries(tailwindColors).map(([key, value]) => {
              const modifiedValue =
                typeof value === 'string'
                  ? [value, value, value, value, value, value, value, value, value, value]
                  : Object.values(value).map(color => color)

              return [key, modifiedValue]
            })
          ),
        }
      : undefined,
  components: {
    Input: {
      classNames: {
        input: `
        h-10 w-full rounded-lg border border-neutral-300 bg-neutral-100 px-3 outline-brand-300
        transition-all duration-500 placeholder:text-neutral-700 focus:!outline focus:outline-1
        focus:outline-offset-0 focus:outline-brand-300 tracking-widest rounded-r-none
      `,
      },
    },
  },
  defaultRadius: 4,
  fontFamily: 'Proxima Nova, sans-serif',
  headings: {
    fontFamily: 'Merriweather, Georgia, serif',
  },
  loader: 'dots',
  primaryColor: 'brand',
}
