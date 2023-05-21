/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

module.exports = nextConfig
