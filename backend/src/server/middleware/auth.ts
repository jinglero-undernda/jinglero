import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../api/core';

type JwtVerifyOptions = {
  secret: string;
  issuer?: string;
  audience?: string;
};

function getJwtVerifyOptions(): JwtVerifyOptions {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const secret = process.env.JWT_SECRET;

  // Backwards-compat (DEV ONLY): allow falling back to ADMIN_PASSWORD if JWT_SECRET isn't set.
  // In production, JWT_SECRET must be set and distinct from the admin password.
  const fallbackSecret = nodeEnv !== 'production' ? process.env.ADMIN_PASSWORD : undefined;

  const finalSecret = secret || fallbackSecret;
  if (!finalSecret) {
    throw new UnauthorizedError('JWT secret not configured');
  }

  return {
    secret: finalSecret,
    issuer: process.env.JWT_ISSUER || undefined,
    audience: process.env.JWT_AUDIENCE || undefined,
  };
}

/**
 * Admin authentication middleware
 * 
 * Checks for authentication token in:
 * 1. Authorization header: "Bearer <token>"
 * 2. Cookie: "adminToken"
 * 
 * Validates token against JWT_SECRET and ADMIN_PASSWORD environment variables.
 * 
 * @throws UnauthorizedError if authentication fails
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  
  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }

  try {
    const { secret, issuer, audience } = getJwtVerifyOptions();
    
    // Verify JWT token
    const decoded = jwt.verify(
      token,
      secret,
      {
        algorithms: ['HS256'],
        issuer: issuer || undefined,
        audience: audience || undefined,
      }
    ) as { admin: boolean; iat?: number; exp?: number; jti?: string; sub?: string };
    
    // Check if token is for admin
    if (!decoded.admin) {
      throw new UnauthorizedError('Invalid admin token');
    }
    
    // Attach admin info to request for use in route handlers
    (req as any).admin = { authenticated: true, token: decoded };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Invalid or expired token');
    }
    throw error;
  }
}

/**
 * Extract authentication token from request
 * Checks Authorization header and cookies (if cookie-parser is installed)
 */
function extractToken(req: Request): string | null {
  // Check Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookie (if cookie-parser middleware is installed)
  // Note: cookie-parser is optional - if not installed, cookies won't be parsed
  if ((req as any).cookies && (req as any).cookies.adminToken) {
    return (req as any).cookies.adminToken;
  }
  
  return null;
}

/**
 * Optional middleware to check authentication status without throwing error
 * Useful for endpoints that have different behavior for authenticated vs unauthenticated users
 */
export function optionalAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  
  if (!token) {
    (req as any).admin = { authenticated: false };
    return next();
  }

  try {
    const { secret, issuer, audience } = getJwtVerifyOptions();
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: issuer || undefined,
      audience: audience || undefined,
    }) as { admin: boolean; iat?: number; exp?: number; jti?: string; sub?: string };
    
    if (decoded.admin) {
      (req as any).admin = { authenticated: true, token: decoded };
    } else {
      (req as any).admin = { authenticated: false };
    }
  } catch (error) {
    // Invalid token, treat as unauthenticated
    (req as any).admin = { authenticated: false };
  }
  
  next();
}

