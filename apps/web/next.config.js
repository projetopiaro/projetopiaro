/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.jiniusercontent.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_APP_URL: process.env.APP_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
