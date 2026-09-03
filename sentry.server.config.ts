import * as Sentry from "@sentry/nextjs";

// Runs once when the Node.js server starts. See docs/build-plan.md Phase 0:
// error logging is wired early so escrow bugs (Phase 5+) surface immediately.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  enabled: !!process.env.SENTRY_DSN,
});
