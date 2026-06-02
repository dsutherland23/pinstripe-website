/**
 * In-Memory Rate Limiter
 * Token bucket algorithm for protecting API routes
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  /** Maximum number of requests in the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 10 minutes
const CLEANUP_INTERVAL = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    if (now - entry.lastRefill > windowMs * 2) {
      store.delete(key);
    }
  }
}

/**
 * Check if a request from the given identifier is within rate limits.
 * @returns { success, remaining, retryAfterMs }
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 5, windowMs: 60 * 60 * 1000 }
): { success: boolean; remaining: number; retryAfterMs?: number } {
  const { maxRequests, windowMs } = config;
  const now = Date.now();

  cleanup(windowMs);

  let entry = store.get(identifier);

  if (!entry) {
    // First request — initialize with full tokens minus 1
    store.set(identifier, { tokens: maxRequests - 1, lastRefill: now });
    return { success: true, remaining: maxRequests - 1 };
  }

  // Refill tokens based on elapsed time
  const elapsed = now - entry.lastRefill;
  const refillRate = maxRequests / windowMs; // tokens per ms
  const refilled = Math.min(maxRequests, entry.tokens + elapsed * refillRate);

  entry.tokens = refilled;
  entry.lastRefill = now;

  if (entry.tokens < 1) {
    // Rate limited
    const waitMs = Math.ceil((1 - entry.tokens) / refillRate);
    return { success: false, remaining: 0, retryAfterMs: waitMs };
  }

  // Consume a token
  entry.tokens -= 1;
  store.set(identifier, entry);

  return { success: true, remaining: Math.floor(entry.tokens) };
}
