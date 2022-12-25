import type { Config } from 'prismic-ts-codegen'

const config: Config = {
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  customTypesAPIToken: process.env.PRISMIC_CUSTOM_TYPES_API_TOKEN,
  models: ['./customtypes/**/index.json', './slices/**/model.json'],
  output: './types.generated.ts',
}

export default config
