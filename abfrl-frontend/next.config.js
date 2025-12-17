/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Increase timeout for font fetching or handle network issues gracefully
  staticPageGenerationTimeout: 1000,
}

module.exports = nextConfig