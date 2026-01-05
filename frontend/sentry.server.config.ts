// =============================================================================
// Sentry Server Configuration - BVS Frontend
// =============================================================================
// This configuration file is used for server-side error tracking (Node.js)
// Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
// =============================================================================

import * as Sentry from "@sentry/nextjs";

// Initialize Sentry for server-side (Node.js runtime)
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
  // Lower rate in production to reduce volume and costs
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // =============================================================================
  // INTEGRATIONS
  // =============================================================================

  integrations: [
    // HTTP integration for tracing external API calls
    Sentry.httpIntegration({
      // Trace outgoing HTTP requests
      tracing: true,

      // Breadcrumbs for HTTP requests
      breadcrumbs: true,
    }),

    // Node.js specific integrations
    Sentry.nodeContextIntegration(),
    Sentry.contextLinesIntegration(),
    Sentry.linkedErrorsIntegration(),
    Sentry.requestDataIntegration(),
  ],

  // =============================================================================
  // ERROR FILTERING
  // =============================================================================

  beforeSend(event, hint) {
    // Don't send events in development if testing locally
    if (
      process.env.NODE_ENV === "development" &&
      !process.env.NEXT_PUBLIC_SENTRY_DSN
    ) {
      console.log("Sentry server event (not sent in dev without DSN):", event);
      return null;
    }

    // Filter out Next.js specific errors that are not critical
    if (event.exception?.values) {
      for (const exception of event.exception.values) {
        const message = exception.value || "";

        // Filter out ENOENT errors for optional files
        if (message.includes("ENOENT") && message.includes(".next")) {
          return null;
        }

        // Filter out common Next.js build errors in development
        if (
          process.env.NODE_ENV === "development" &&
          message.includes("Module build failed")
        ) {
          return null;
        }
      }
    }

    // Filter out health check errors
    if (event.request?.url) {
      if (
        event.request.url.includes("/health") ||
        event.request.url.includes("/api/health")
      ) {
        return null;
      }
    }

    // Add server-specific context
    event.contexts = {
      ...event.contexts,
      runtime: {
        name: "node",
        version: process.version,
      },
      app: {
        app_version: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "1.0.0",
        environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development",
      },
    };

    // Add server info
    event.tags = {
      ...event.tags,
      server: "nextjs-server",
    };

    return event;
  },

  // =============================================================================
  // IGNORE ERRORS
  // =============================================================================

  ignoreErrors: [
    // Next.js specific
    "ENOENT",
    "MODULE_NOT_FOUND",

    // Network errors
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ENOTFOUND",
    "socket hang up",

    // Common development noise
    "Unexpected token",
    "Failed to fetch",
  ],

  // =============================================================================
  // BREADCRUMBS
  // =============================================================================

  maxBreadcrumbs: 50,

  beforeBreadcrumb(breadcrumb, hint) {
    // Filter out verbose console logs in production
    if (
      breadcrumb.category === "console" &&
      process.env.NODE_ENV === "production" &&
      breadcrumb.level === "log"
    ) {
      return null;
    }

    // Filter out HTTP breadcrumbs for health checks
    if (breadcrumb.type === "http") {
      const url = breadcrumb.data?.url || "";
      if (url.includes("/health") || url.includes("/api/health")) {
        return null;
      }
    }

    return breadcrumb;
  },

  // =============================================================================
  // ADDITIONAL OPTIONS
  // =============================================================================

  // Send default PII (Personally Identifiable Information)
  send_default_pii: false, // More restrictive on server-side

  // Attach stack locals (variable values) to stack frames
  attachStacktrace: true,

  // Enable debug mode (verbose logging)
  debug: process.env.NODE_ENV === "development",

  // Server-side specific options
  serverName: process.env.HOSTNAME || "bvs-frontend-server",

  // Initial scope
  initialScope: {
    tags: {
      app: "bvs-frontend-server",
      runtime: "nodejs",
    },
  },
});

// Export Sentry for manual usage
export default Sentry;
