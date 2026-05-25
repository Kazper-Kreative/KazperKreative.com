import type { NextConfig } from "next";

// Security headers applied to every response.
// CSP is Report-Only here so the team can monitor violations in DevTools
// before flipping to enforce. Once you've watched for breakage for a
// release or two, swap "Content-Security-Policy-Report-Only" for
// "Content-Security-Policy".
const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js needs 'unsafe-inline' for its hydration bootstrap and JSON-LD.
  // Move to nonces if you want stricter CSP later.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://cdn.sanity.io https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
  "connect-src 'self' https://api.sanity.io https://*.api.sanity.io https://cdn.sanity.io https://ipapi.co https://accounts.google.com https://api.github.com",
  "frame-src 'self' https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
];

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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: '/discovery', destination: '/start', permanent: true },
      { source: '/brief', destination: '/start', permanent: true },
    ];
  },
};

export default nextConfig;
