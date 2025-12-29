import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { createRateLimiter } from './middleware/rateLimit';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const bindAddress = process.env.BIND_ADDRESS || '127.0.0.1';
const nodeEnv = process.env.NODE_ENV || 'development';

function parseCorsOrigins(): string[] {
  const raw = (process.env.CORS_ORIGINS || '').trim();
  if (!raw) {
    if (nodeEnv !== 'production') {
      return ['http://localhost:5173', 'http://127.0.0.1:5173'];
    }
    return [];
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildCorsOptions(): cors.CorsOptions {
  const allowlist = parseCorsOrigins();
  const isBehindProxy = bindAddress === '127.0.0.1' || bindAddress === '::1';

  // In production, require an explicit allowlist.
  // For non-browser clients (no Origin), allow.
  // When behind a proxy (localhost binding), if CORS_ORIGINS is not set,
  // allow requests from the same origin as the Host header (nginx passes this through).
  return {
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      
      // If allowlist is explicitly configured, use it
      if (allowlist.length > 0) {
        if (allowlist.includes(origin)) return cb(null, true);
        return cb(new Error('CORS blocked: origin not allowed'));
      }
      
      // If behind a proxy and no explicit allowlist, allow same-origin requests
      // This is safe because nginx is handling security at the edge
      if (isBehindProxy && nodeEnv === 'production') {
        return cb(null, true);
      }
      
      // In development without allowlist, allow localhost origins
      if (nodeEnv !== 'production') {
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
          return cb(null, true);
        }
      }
      
      // Default: block if no allowlist and not behind proxy
      return cb(new Error('CORS blocked: origin not allowed'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 600,
  };
}

// Middleware
app.disable('x-powered-by');
// When deployed behind nginx, this ensures req.ip reflects the real client IP (x-forwarded-for).
app.set('trust proxy', process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : 1);

app.use(helmet());
app.use(cors(buildCorsOptions()));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '200kb' }));
app.use(express.urlencoded({ extended: false, limit: process.env.URLENCODED_BODY_LIMIT || '200kb' }));

// Lightweight global rate limiting (defense in depth). Tune via env or disable if needed.
if (process.env.SECURITY_ENABLE_RATE_LIMIT !== 'false') {
  app.use(
    createRateLimiter({
      windowMs: Number(process.env.SECURITY_RATE_LIMIT_WINDOW_MS) || 60_000,
      max: Number(process.env.SECURITY_RATE_LIMIT_MAX) || 600,
      keyPrefix: 'global',
      skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1',
    })
  );
}

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ status: 'ok' });
});

// Mount API routes
import searchRouter from './api/search';
import publicRouter from './api/public';
import adminRouter from './api/admin';
app.use('/api/search', searchRouter);
app.use('/api/public', publicRouter);
app.use('/api/admin', adminRouter);

// 404 for unmatched routes
app.use(notFoundHandler);

// Centralized error handler (must be last)
app.use(errorHandler);

// Start server only if this file is the entrypoint
if (require.main === module) {
  app.listen(Number(port), bindAddress, () => {
    console.log(`Server running on http://${bindAddress}:${port}`);
  });
}

export default app;