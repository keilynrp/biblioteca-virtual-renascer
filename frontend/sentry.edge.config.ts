// =============================================================================
// Sentry Edge Configuration - BVS Frontend
// =============================================================================
// This configuration file is used for Edge Runtime (Vercel Edge Functions, Middleware)
// Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
// =============================================================================

import * as Sentry from "@sentry/nextjs";

// Initialize Sentry for Edge Runtime
Sentry.init({
  // DSN - Get from https://sentry.io/settings/projects/your-project/keys/
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment (development, staging, production)
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development",

  // Release version for tracking deployments
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "bvs-frontend@1.0.0",

  // =============================================================================
  // PERFORMANCE MONITORING
  // =============================================================================

  // Percentage of transactions to send to Sentry
  // Edge functions are lightweight, so we can sample more
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.3 : 1.0,

  // =============================================================================
  // ERROR FILTERING
  // =============================================================================

  beforeSend(event, hint) {
    // Don't send events in development if testing locally
    if (
      process.env.NODE_ENV === "development" &&
      !process.env.NEXT_PUBLIC_SENTRY_DSN
    ) {
      console.log("Sentry edge event (not sent in dev without DSN):", event);
      return null;
    }

    // Filter out middleware errors for health checks
    if (event.request?.url) {
      if (
        event.request.url.includes("/health") ||
        event.request.url.includes("/_next/")
      ) {
        return null;
      }
    }

    // Add edge-specific context
    event.contexts = {
      ...event.contexts,
      runtime: {
        name: "edge",
      },
      app: {
        app_version: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "1.0.0",
        environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development",
      },
    };

    // Add edge runtime tag
    event.tags = {
      ...event.tags,
      runtime: "edge",
    };

    return event;
  },

  // =============================================================================
  // IGNORE ERRORS
  // =============================================================================

  ignoreErrors: [
    // Network errors
    "Failed to fetch",
    "NetworkError",
    "Network request failed",

    // Common edge runtime noise
    "timeout exceeded",
  ],

  // =============================================================================
  // BREADCRUMBS
  // =============================================================================

  maxBreadcrumbs: 30, // Lower limit for edge runtime (memory constraints)

  beforeBreadcrumb(breadcrumb) {
    // Filter out verbose breadcrumbs in edge runtime
    if (breadcrumb.category === "console" && breadcrumb.level === "log") {
      return null;
    }

    return breadcrumb;
  },

  // =============================================================================
  // ADDITIONAL OPTIONS
  // =============================================================================

  // Send default PII
  send_default_pii: false, // More restrictive in edge runtime

  // Attach stack traces
  attachStacktrace: true,

  // Debug mode
  debug: process.env.NODE_ENV === "development",

  // Initial scope
  initialScope: {
    tags: {
      app: "bvs-frontend-edge",
      runtime: "edge",
    },
  },
});

// Export Sentry for manual usage
export default Sentry;
