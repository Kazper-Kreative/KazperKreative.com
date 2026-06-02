import type { NextConfig } from "next";

// Security headers applied to every response.
// CSP is now enforced. It covers Next's inline bootstrap/JSON-LD
// ('unsafe-inline'), self-hosted next/font + Vercel Analytics ('self'),
// inline style attributes, local images, and Supabase REST/Auth/Realtime.
// If you add a third-party (script, font, API), widen the matching
// directive or it will be blocked.
const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js needs 'unsafe-inline' for its hydration bootstrap and JSON-LD.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // 'unsafe-inline' covers the inline style attributes used across pages.
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  // Supabase REST + Auth + Realtime (wss).
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Retired lead funnel → the unified contact page.
      { source: "/start", destination: "/contact", permanent: true },
      { source: "/discovery", destination: "/contact", permanent: true },
      { source: "/brief", destination: "/contact", permanent: true },
      // Retired recruitment routes → join.
      { source: "/agents", destination: "/join", permanent: true },
      { source: "/agents/join", destination: "/join", permanent: true },
      // Retired CRM / cinematic → home.
      { source: "/dashboard", destination: "/", permanent: true },
      { source: "/workstation", destination: "/", permanent: true },
      { source: "/experience", destination: "/", permanent: true },
      // Old Sanity-driven project pages → the new work index.
      { source: "/projects/:slug*", destination: "/work", permanent: true },
    ];
  },
};

export default nextConfig;
