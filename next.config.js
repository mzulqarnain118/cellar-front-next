const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        hostname: 'i.ytimg.com',
        pathname: '**',
        protocol: 'https',
      },
      {
        hostname: 'images.prismic.io',
        pathname: '**',
        protocol: 'https',
      },
      {
        hostname: 'scoutandcellar.blob.core.windows.net',
        pathname: '**',
        protocol: 'https',
      },
      {
        hostname: 'storage.googleapis.com',
        pathname: '**',
        protocol: 'https',
      },
    ],
  },
  reactStrictMode: true,
  redirects: async () => [
    {
      destination: '/my-account/profile',
      permanent: true,
      source: '/my-account',
    },
  ],
  sentry: {
    hideSourceMaps: true,
  },
  eslint: {
    // Ignore ESLint during the build process
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript type errors during the build process
    ignoreBuildErrors: true,
  },
}

/** @type {import('@sentry/nextjs').SentryWebpackPluginOptions} */
const sentryWebpackPluginOptions = {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: 'scout-cellar',
  project: 'dot-com',
  // Suppresses source map uploading logs during build
  silent: true,
}

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions, {
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,
  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: '/monitoring',
  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,
})
