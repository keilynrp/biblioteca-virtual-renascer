// =============================================================================
// Sentry Client Configuration - BVS Frontend
// =============================================================================
// This configuration file is used for client-side error tracking
// Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
// =============================================================================

import * as Sentry from "@sentry/nextjs";

// Initialize Sentry for client-side
Sentry.init({
  // DSN - Get from https://sentry.io/settings/projects/your-project/keys/
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment (development, staging, production)
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development",

  // Release version for tracking deployments
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "bvs-frontend@1.0.0",

  // =============================================================================
  // PERFORMANCE MONITORING (Transactions)
  // =============================================================================

  // Percentage of transactions to send to Sentry
  // 1.0 = 100% (recommended for development)
  // 0.1 = 10% (recommended for production to reduce costs)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // =============================================================================
  // SESSION REPLAY
  // =============================================================================

  // Session Replay - Records user sessions for debugging
  // Sample rate for regular sessions (10% in production)
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Always capture replays when an error occurs (100%)
  replaysOnErrorSampleRate: 1.0,

  // =============================================================================
  // INTEGRATIONS
  // =============================================================================

  integrations: [
    // Session Replay integration
    Sentry.replayIntegration({
      // Mask all text content (privacy)
      maskAllText: true,

      // Block all media elements (images, videos) from being recorded
      blockAllMedia: true,

      // Mask all input fields
      maskAllInputs: true,

      // Network details
      networkDetailAllowUrls: [
        // Only capture network details for our API
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
      ],

      // Additional privacy settings
      networkCaptureBodies: true,
      networkRequestHeaders: ["X-Request-ID"],
      networkResponseHeaders: ["X-Request-ID"],
    }),

    // Browser Tracing (automatically capture page load performance)
    Sentry.browserTracingIntegration({
      // Trace all fetch and XHR requests
      traceFetch: true,
      traceXHR: true,

      // Enable interaction tracking
      enableLongTask: true,

      // Custom page load transaction name
      beforeNavigate: (context) => {
        return {
          ...context,
          name: window.location.pathname,
        };
      },
    }),
  ],

  // =============================================================================
  // ERROR FILTERING
  // =============================================================================

  // Before send hook - filter/modify events before sending to Sentry
  beforeSend(event, hint) {
    // Don't send events in development if testing locally
    if (
      process.env.NODE_ENV === "development" &&
      !process.env.NEXT_PUBLIC_SENTRY_DSN
    ) {
      console.log("Sentry event (not sent in dev without DSN):", event);
      return null;
    }

    // Filter out errors from browser extensions
    if (event.exception) {
      const error = hint.originalException as Error;

      // Chrome extensions
      if (
        error?.message?.includes("chrome-extension") ||
        error?.stack?.includes("chrome-extension")
      ) {
        return null;
      }

      // Firefox extensions
      if (
        error?.message?.includes("moz-extension") ||
        error?.stack?.includes("moz-extension")
      ) {
        return null;
      }

      // Safari extensions
      if (
        error?.message?.includes("safari-extension") ||
        error?.stack?.includes("safari-extension")
      ) {
        return null;
      }
    }

    // Filter out errors from third-party scripts
    if (event.exception?.values) {
      for (const exception of event.exception.values) {
        if (exception.stacktrace?.frames) {
          const frames = exception.stacktrace.frames;

          // Check if error originated from third-party script
          const isThirdParty = frames.some((frame) => {
            const filename = frame.filename || "";
            return (
              filename.includes("googleapis.com") ||
              filename.includes("facebook.net") ||
              filename.includes("google-analytics.com") ||
              filename.includes("gtag/js")
            );
          });

          if (isThirdParty) {
            return null;
          }
        }
      }
    }

    // Add custom context
    event.contexts = {
      ...event.contexts,
      app: {
        app_version: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "1.0.0",
        environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development",
      },
    };

    return event;
  },

  // =============================================================================
  // IGNORE ERRORS
  // =============================================================================

  // Errors to ignore (won't be sent to Sentry)
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "chrome-extension",
    "moz-extension",
    "safari-extension",

    // Network errors (often not actionable)
    "NetworkError",
    "Failed to fetch",
    "Load failed",
    "Network request failed",
    "timeout of 0ms exceeded",

    // ResizeObserver (common and not critical)
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",

    // Script loading errors (third-party)
    "Script error.",
    "Can't find variable: ZiteReader",

    // iOS specific
    "WebKitBlobResource error",

    // Random plugins
    "atomicFindClose",
    "conduitPage",

    // Common noise
    "Non-Error promise rejection captured",
    "Unexpected token '<'", // Often HTML error pages
  ],

  // =============================================================================
  // BREADCRUMBS
  // =============================================================================

  // Maximum number of breadcrumbs (trail of events before error)
  maxBreadcrumbs: 50,

  // Breadcrumbs for console logs
  beforeBreadcrumb(breadcrumb, hint) {
    // Don't capture console.log breadcrumbs in production (too verbose)
    if (breadcrumb.category === "console" && process.env.NODE_ENV === "production") {
      return null;
    }

    // Filter out noisy breadcrumbs
    if (breadcrumb.message?.includes("react-hot-loader")) {
      return null;
    }

    return breadcrumb;
  },

  // =============================================================================
  // ADDITIONAL OPTIONS
  // =============================================================================

  // Send default PII (Personally Identifiable Information)
  // Set to false if you want to avoid sending user data
  send_default_pii: true,

  // Attach stack locals (variable values) to stack frames
  attachStacktrace: true,

  // Enable debug mode (verbose logging to console)
  debug: process.env.NODE_ENV === "development",

  // Automatically set user context from authentication
  // This will be populated from your auth system
  initialScope: {
    tags: {
      app: "bvs-frontend",
    },
  },
});

// Export Sentry for manual usage
export default Sentry;
