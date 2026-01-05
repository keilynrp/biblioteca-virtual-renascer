// =============================================================================
// Instrumentation - Next.js Observability
// =============================================================================
// This file is used to register instrumentation hooks for Next.js
// It's called once when the server starts and before any other code runs
// Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
// =============================================================================

/**
 * Register instrumentation hooks
 * This function is called once when the server/edge runtime starts
 */
export async function register() {
  // Only load Sentry in Node.js runtime
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  // Only load Sentry in Edge runtime
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }

  // Log initialization (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log(
      `✓ Sentry initialized for ${process.env.NEXT_RUNTIME || "unknown"} runtime`
    );
  }
}

/**
 * Error handler for all requests
 * This is called whenever an error occurs during request processing
 *
 * @param err - The error that occurred
 * @param request - The incoming request
 * @param context - Additional context about the error
 */
export const onRequestError = async (
  err: Error & { digest?: string },
  request: {
    path: string;
    method: string;
    headers: Headers;
  },
  context: {
    routerKind: "Pages Router" | "App Router";
    routePath: string;
    routeType: "render" | "route" | "action" | "middleware";
    revalidateReason?: "on-demand" | "stale";
    renderSource?: "react-server-components" | "react-server-components-payload" | "server-rendering";
  }
) => {
  // Import Sentry dynamically to avoid issues
  const Sentry = await import("@sentry/nextjs");

  // Capture the exception with additional context
  Sentry.captureException(err, {
    extra: {
      // Request details
      url: request.path,
      method: request.method,

      // Next.js specific context
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      revalidateReason: context.revalidateReason,
      renderSource: context.renderSource,

      // Error digest (Next.js error ID)
      digest: err.digest,
    },
    tags: {
      // Tag for filtering in Sentry
      router: context.routerKind,
      route_type: context.routeType,
    },
    level: "error",
  });

  // Also log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("Request error captured by Sentry:", {
      error: err.message,
      path: request.path,
      method: request.method,
      digest: err.digest,
    });
  }
};
