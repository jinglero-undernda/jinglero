import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../api/core';

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
    // Use JWT_SECRET if available, otherwise fall back to ADMIN_PASSWORD
    // Note: For production, JWT_SECRET should be a separate, strong secret
    const secret = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD;
    
    if (!secret) {
      throw new UnauthorizedError('JWT secret not configured');
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, secret) as { admin: boolean; iat?: number; exp?: number };
    
    // Check if token is for admin
    if (!decoded.admin) {
      throw new UnauthorizedError('Invalid admin token');
    }
    
    // Attach admin info to request for use in route handlers
    (req as any).admin = { authenticated: true };
    
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
    const secret = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD;
    
    if (!secret) {
      (req as any).admin = { authenticated: false };
      return next();
    }
    
    const decoded = jwt.verify(token, secret) as { admin: boolean };
    
    if (decoded.admin) {
      (req as any).admin = { authenticated: true };
    } else {
      (req as any).admin = { authenticated: false };
    }
  } catch (error) {
    // Invalid token, treat as unauthenticated
    (req as any).admin = { authenticated: false };
  }
  
  next();
}

