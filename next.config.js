/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fullcalendar'],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
    }
    return config
  },
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig 