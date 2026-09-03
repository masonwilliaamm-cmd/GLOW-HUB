import * as Sentry from "@sentry/nextjs";

// Runs for middleware and edge routes.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  enabled: !!process.env.SENTRY_DSN,
});
