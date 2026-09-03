import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  silent: true,
  // No org/project configured yet — the wizard-driven auth-token setup
  // (SENTRY_AUTH_TOKEN, source map upload) is a founder decision to make
  // when a real Sentry project is created.
});
