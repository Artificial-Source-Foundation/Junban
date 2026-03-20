/**
 * Shared fetch utility with timeout support for provider adapters.
 */

/** Default timeout for provider discovery/health-check requests (5 seconds). */
export const FETCH_TIMEOUT_MS = 5000;

/**
 * Fetch with an AbortController-based timeout.
 * Aborts the request if it exceeds `timeoutMs` milliseconds.
 */
export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
