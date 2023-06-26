import * as Sentry from '@sentry/nextjs'

Sentry.init({
  debug: process.env.SENTRY_ENVIRONMENT === 'development',
  release: `dot-com@${process.env.npm_package_version}`,
  tracesSampleRate: process.env.SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
})
