/**
 * @type {import('next').NextConfig}
 */
const config = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  swcMinify: false,
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false }
    return config
  },
  images: {
    domains: ['avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: { esmExternals: 'loose' },
}
