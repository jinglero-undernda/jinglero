import type { Request, Response, NextFunction } from 'express';

export type RateLimitOptions = {
  /**
   * Time window in milliseconds.
   */
  windowMs: number;
  /**
   * Max requests allowed per window.
   */
  max: number;
  /**
   * Optional prefix used in the key (useful to separate limit buckets per route-group).
   */
  keyPrefix?: string;
  /**
   * Provide a custom key generator (defaults to req.ip).
   */
  keyGenerator?: (req: Request) => string;
  /**
   * Optional skip function (return true to skip limiting).
   */
  skip?: (req: Request) => boolean;
  /**
   * Optional handler override.
   */
  onLimit?: (req: Request, res: Response) => void;
};

type Bucket = { count: number; resetAt: number };

/**
 * Lightweight in-memory fixed-window rate limiter.
 *
 * Notes:
 * - This is per-process memory; if you run multiple instances, limits are per instance.
 * - Behind nginx, set `app.set('trust proxy', 1)` so `req.ip` reflects the real client IP.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const store = new Map<string, Bucket>();

  const windowMs = Math.max(100, options.windowMs);
  const max = Math.max(1, options.max);
  const keyPrefix = options.keyPrefix || 'rl';
  const keyGen = options.keyGenerator || ((req: Request) => req.ip || 'unknown');

  function cleanup(now: number) {
    // Best-effort cleanup to avoid unbounded growth.
    // Only do a small scan occasionally to keep overhead low.
    if (store.size < 5000) return;
    for (const [k, b] of store) {
      if (b.resetAt <= now) store.delete(k);
    }
  }

  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    if (options.skip && options.skip(req)) return next();

    const now = Date.now();
    cleanup(now);

    const key = `${keyPrefix}:${keyGen(req)}`;
    const existing = store.get(key);

    const bucket: Bucket =
      existing && existing.resetAt > now
        ? existing
        : { count: 0, resetAt: now + windowMs };

    bucket.count += 1;
    store.set(key, bucket);

    const remaining = Math.max(0, max - bucket.count);
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      if (options.onLimit) return options.onLimit(req, res);
      return res.status(429).json({ error: 'Too Many Requests' });
    }

    return next();
  };
}


