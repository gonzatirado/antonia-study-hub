import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: ['firebase', '@firebase/firestore', '@firebase/auth', '@firebase/storage', '@firebase/app'],
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
