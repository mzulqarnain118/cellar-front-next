import * as Sentry from '@sentry/nextjs'

Sentry.init({
  debug: process.env.SENTRY_ENVIRONMENT === 'development',
  integrations: [new Sentry.Replay()],
  release: `dot-com@${process.env.npm_package_version}`,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  tracesSampleRate: process.env.SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
})
