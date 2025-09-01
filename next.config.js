/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', '127.0.0.1'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src'),
    };
    return config;
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  // Production optimizations
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig
