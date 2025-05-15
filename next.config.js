/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/starinsight',
  assetPrefix: '/starinsight',
  output: 'standalone',
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
  },
}

module.exports = nextConfig 