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
                typeof value === 'string' ? value : Object.values(value).map(color => color)

              return [key, modifiedValue]
            })
          ),
        }
      : undefined,
  defaultRadius: 4,
  fontFamily: 'Proxima Nova, sans-serif',
  headings: {
    fontFamily: 'Merriweather, Georgia, serif',
  },
  loader: 'dots',
  primaryColor: 'brand',
}
