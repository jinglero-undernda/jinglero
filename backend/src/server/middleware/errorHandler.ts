import { NextFunction, Request, Response } from 'express';
import { HttpError, InternalServerError } from '../api/core';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const isHttpError = err instanceof HttpError;
  const normalized = isHttpError ? err : new InternalServerError((err as any)?.message || 'Internal Server Error');

  const body: Record<string, unknown> = {
    error: normalized.message,
  };
  if (normalized.code) body.code = normalized.code;
  if (process.env.NODE_ENV !== 'production') {
    body.details = (normalized as any).details ?? undefined;
  }

  res.status(normalized.status).json(body);
}


