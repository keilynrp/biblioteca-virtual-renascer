// =============================================================================
// Instrumentation - Next.js Observability
// =============================================================================
// This file is used to register instrumentation hooks for Next.js
// It's called once when the server starts and before any other code runs
// Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
// =============================================================================
// Note: Sentry has been removed due to incompatibility with Next.js 16
// =============================================================================

/**
 * Register instrumentation hooks
 * This function is called once when the server/edge runtime starts
 */
export async function register() {
  // Log initialization (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log(
      `✓ Instrumentation initialized for ${process.env.NEXT_RUNTIME || "unknown"} runtime`
    );
  }
}
