const path = require("path");
const createNextIntlPlugin = require("next-intl/plugin");
const { withSentryConfig } = require("@sentry/nextjs");

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: i18n configuration removed - unsupported in App Router (Next.js 15)
  // Locale routing is now handled by next-intl middleware
  // See: middleware.ts and app/[locale]/ structure

  outputFileTracingRoot: path.resolve(__dirname),

  // Production domain configuration
  async headers() {
    return [
      {
        // CORS headers for validation API
        source: "/api/:path*",
        headers: [
          { key: "Vary", value: "Origin" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,OPTIONS"
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Admin-Token"
          }
        ]
      }
    ];
  },

  // Redirect www to non-www
  async redirects() {
    return process.env.NODE_ENV === "production"
      ? [
          {
            source: "/:path*",
            has: [{ type: "host", value: "www.bizsproutai.com" }],
            destination: "https://bizsproutai.com/:path*",
            permanent: true
          }
        ]
      : [];
  },

  // Environment variables to expose to client
  env: {
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000"
  }
};

module.exports = withSentryConfig(withNextIntl(nextConfig), {
  silent: !process.env.CI
});
