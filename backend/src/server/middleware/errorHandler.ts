import { NextFunction, Request, Response } from 'express';
import { HttpError, InternalServerError } from '../api/core';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const isHttpError = err instanceof HttpError;
  
  // Check for Neo4j authentication/connection errors
  const errorMessage = (err as any)?.message || '';
  const errorCode = (err as any)?.code || '';
  
  let normalized: HttpError;
  if (isHttpError) {
    normalized = err as HttpError;
  } else if (errorMessage.includes('authentication failure') || 
             errorMessage.includes('authentication details') ||
             errorCode.includes('Security.Unauthorized')) {
    // Neo4j authentication error
    normalized = new InternalServerError(
      process.env.NODE_ENV !== 'production'
        ? 'Database authentication failed. Please check NEO4J_PASSWORD and database connection settings.'
        : 'Database connection error. Please contact the administrator.'
    );
    (normalized as any).code = 'DATABASE_AUTH_ERROR';
  } else if (errorMessage.includes('ServiceUnavailable') || 
             errorCode.includes('ServiceUnavailable') ||
             (errorMessage.includes('connection') && errorMessage.includes('refused'))) {
    // Neo4j connection error
    normalized = new InternalServerError(
      process.env.NODE_ENV !== 'production'
        ? 'Database connection unavailable. The database may be paused or unreachable.'
        : 'Database connection error. Please contact the administrator.'
    );
    (normalized as any).code = 'DATABASE_CONNECTION_ERROR';
  } else {
    normalized = new InternalServerError(
      process.env.NODE_ENV !== 'production'
        ? (errorMessage || 'Internal Server Error')
        : 'Internal Server Error'
    );
  }

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
  if ((normalized as any).code) body.code = (normalized as any).code;
  if (process.env.NODE_ENV !== 'production') {
    body.details = (normalized as any).details ?? (errorMessage ? errorMessage : undefined);
  }

  // Use 503 for database connection errors instead of 500
  const status = ((normalized as any).code === 'DATABASE_AUTH_ERROR' || 
                  (normalized as any).code === 'DATABASE_CONNECTION_ERROR') 
    ? 503 
    : normalized.status;

  res.status(status).json(body);
}


