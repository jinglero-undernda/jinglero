import { NextFunction, Request, Response } from 'express';
import { HttpError, InternalServerError } from '../api/core';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const isHttpError = err instanceof HttpError;
  const normalized = isHttpError
    ? err
    : new InternalServerError(
        process.env.NODE_ENV !== 'production'
          ? ((err as any)?.message || 'Internal Server Error')
          : 'Internal Server Error'
      );

  // Always log server errors (safe: no secrets should be in message/stack; details are only sent to client in non-prod).
  // This is critical for debugging 500s behind the Vite proxy.
  // eslint-disable-next-line no-console
  console.error(
    `[ERROR] ${req.method} ${req.originalUrl} -> ${normalized.status} ${normalized.message}`,
    process.env.NODE_ENV !== 'production' ? (err as any)?.stack || err : undefined
  );

  const body: Record<string, unknown> = {
    error: normalized.message,
  };
  if (normalized.code) body.code = normalized.code;
  if (process.env.NODE_ENV !== 'production') {
    body.details = (normalized as any).details ?? undefined;
  }

  res.status(normalized.status).json(body);
}


