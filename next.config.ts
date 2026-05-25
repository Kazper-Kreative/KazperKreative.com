import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/discovery', destination: '/start', permanent: true },
      { source: '/brief', destination: '/start', permanent: true },
    ];
  },
};

export default nextConfig;
