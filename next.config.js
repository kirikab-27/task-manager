/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config) => {
    config.externals.push({
      '@prisma/client': 'commonjs @prisma/client',
    });
    return config;
  },
}

module.exports = nextConfig