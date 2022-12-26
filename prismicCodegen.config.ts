import dotenv from 'dotenv'
import type { Config } from 'prismic-ts-codegen'

dotenv.config({ path: '.env.local' })

const config: Config = {
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  customTypesAPIToken: process.env.PRISMIC_CUSTOM_TYPES_API_TOKEN,
  locales: {
    fetchFromRepository: true,
    ids: ['en-us', 'en-bz'],
  },
  models: {
    fetchFromRepository: true,
    files: ['./customtypes/**/index.json', './slices/**/model.json'],
  },
  output: './types.generated.ts',
  repositoryName: 'cellar-front-dev',
}

export default config
