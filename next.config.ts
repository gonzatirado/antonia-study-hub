import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mammoth', 'xlsx', 'jszip', 'require-in-the-middle'],
  transpilePackages: ['firebase', '@firebase/firestore', '@firebase/auth', '@firebase/storage', '@firebase/app'],
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};

export default withSentryConfig(nextConfig, {
  org: "tiba-03",
  project: "studyhub",

  // Suppress source map upload warnings in dev
  silent: !process.env.CI,

  // Upload source maps for better stack traces
  widenClientFileUpload: true,

  // Source maps config
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
