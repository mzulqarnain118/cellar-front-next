/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
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
}

module.exports = nextConfig
