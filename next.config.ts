import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Seed data placeholder images.
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      // Real product image uploads (Phase 3).
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  // No org/project configured yet — the wizard-driven auth-token setup
  // (SENTRY_AUTH_TOKEN, source map upload) is a founder decision to make
  // when a real Sentry project is created.
});
