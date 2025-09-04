/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable TypeScript checking during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable experimental features
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  // Optimize images
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  // Environment variables (remove if not needed)
  // env: {
  //   CUSTOM_KEY: process.env.CUSTOM_KEY,
  // },
}

module.exports = nextConfig