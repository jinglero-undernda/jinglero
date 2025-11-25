# Security Requirements: Admin Access Control

## Status
- **Status**: draft
- **Last Updated**: [DATE_PLACEHOLDER - TO BE CONFIRMED]
- **Last Validated**: not yet validated
- **Code Reference**: `backend/src/server/index.ts:38-42`, `backend/src/server/api/admin.ts:180-250`, `frontend/src/pages/AdminPage.tsx:31-96`

## Overview

This document defines security requirements for admin access control, specifically addressing the requirement that admin functionality should only be accessible through local network connections, not through public internet routes.

## Security Requirements

### REQ-ADMIN-001: Local Network Access Only

**Description**: Admin section must only be accessible from local network connections. Public internet access to admin routes must be blocked.

**Security Goal**: Prevent unauthorized access to admin functionality from external networks, reducing attack surface and protecting administrative operations.

**Threat Model**: 
- External attackers attempting to access admin endpoints
- Unauthorized users discovering admin routes through public internet
- Credential brute-force attacks from external networks
- Network-based attacks targeting admin functionality

**Code Reference**: 
- Backend: `backend/src/server/index.ts:38-42` (server binding)
- Backend API: `backend/src/server/api/admin.ts:180-250` (admin routes)
- Frontend: `frontend/src/pages/AdminPage.tsx:31-96` (admin routes)

**Context**:
This requirement applies to the initial local deployment phase. Admin functionality includes:
- Admin authentication (`/api/admin/login`)
- Admin dashboard and entity management (`/admin/*`)
- All admin API endpoints (`/api/admin/*`)

**Validation**:
- Verify backend only accepts connections from localhost/local network
- Verify reverse proxy blocks admin routes from external access
- Verify admin frontend routes are not accessible from public internet
- Test that external IP addresses cannot access admin endpoints

**Monitoring**:
- Monitor failed authentication attempts
- Log all admin access attempts with source IP
- Alert on admin access from non-local IP addresses

---

### REQ-ADMIN-002: Admin Authentication

**Description**: All admin functionality requires authentication via JWT token. Login endpoint must be protected at network level.

**Security Goal**: Ensure only authenticated users can access admin functionality.

**Threat Model**:
- Unauthorized access to admin endpoints
- Session hijacking
- Token theft

**Code Reference**: 
- `backend/src/server/middleware/auth.ts:16-50` (requireAdminAuth)
- `backend/src/server/api/admin.ts:188-219` (login endpoint)

**Context**:
Authentication is implemented via JWT tokens. The login endpoint (`/api/admin/login`) is currently publicly accessible but should be restricted to local network only.

**Validation**:
- Verify all admin routes require authentication
- Verify JWT tokens are validated correctly
- Verify tokens expire appropriately (7 days)
- Test that unauthenticated requests are rejected

**Monitoring**:
- Monitor authentication success/failure rates
- Track token generation and usage
- Alert on suspicious authentication patterns

---

## Implementation Options

### Option 1: Network-Level Restrictions (Recommended for Local Deployment)

**Approach**: Bind backend to localhost only and use reverse proxy to block admin routes externally.

**Implementation**:
1. **Backend Binding**: Configure backend to listen only on `127.0.0.1` (localhost) instead of `0.0.0.0`
   - Modify `backend/src/server/index.ts` to bind to localhost
   - Use environment variable `BIND_ADDRESS=127.0.0.1`

2. **Reverse Proxy Configuration**: Use nginx to:
   - Serve public frontend routes normally
   - Block `/admin/*` and `/api/admin/*` from external access
   - Allow local network access to admin routes
   - Proxy backend API to localhost

**Pros**:
- ✅ Simple to implement
- ✅ No code changes to frontend
- ✅ Single frontend application
- ✅ Network-level security (defense in depth)
- ✅ Easy to configure and maintain

**Cons**:
- ⚠️ Requires reverse proxy setup
- ⚠️ Admin access limited to local network

**Code Changes Required**:
- `backend/src/server/index.ts`: Add binding address configuration
- nginx configuration file (new)

---

### Option 2: Separate Admin Frontend Application

**Approach**: Create a completely separate React application for admin functionality, deployed separately and only accessible on localhost.

**Implementation**:
1. **Separate Frontend**: Create `frontend-admin/` directory with separate React app
2. **Separate Build**: Build admin frontend separately
3. **Separate Deployment**: Serve admin frontend only on localhost (127.0.0.1)
4. **Backend Binding**: Bind backend admin routes to localhost only

**Pros**:
- ✅ Complete separation of public and admin code
- ✅ No admin routes in public frontend bundle
- ✅ Smaller public frontend bundle size
- ✅ Clear separation of concerns

**Cons**:
- ⚠️ More complex deployment (two frontend apps)
- ⚠️ Code duplication potential
- ⚠️ More maintenance overhead
- ⚠️ Requires separate build/deploy process

**Code Changes Required**:
- New `frontend-admin/` directory structure
- Separate build configuration
- Deployment configuration for two frontends

---

### Option 3: Hybrid Approach

**Approach**: Same frontend app, but conditionally exclude admin routes in production build. Backend admin routes only accessible from localhost.

**Implementation**:
1. **Build-time Exclusion**: Use environment variable to exclude admin routes from production build
2. **Backend Binding**: Bind backend to localhost only
3. **Route Guarding**: Add runtime checks to prevent admin route access in production

**Pros**:
- ✅ Single codebase
- ✅ Admin routes not in production bundle
- ✅ Flexible deployment options

**Cons**:
- ⚠️ More complex build configuration
- ⚠️ Runtime checks add complexity
- ⚠️ Potential for configuration errors

**Code Changes Required**:
- Build configuration changes
- Runtime route guards
- Environment variable management

---

## Recommended Implementation: Option 1

For initial local deployment, **Option 1 (Network-Level Restrictions)** is recommended because:

1. **Simplicity**: Minimal code changes, leverages existing infrastructure
2. **Security**: Network-level blocking provides defense in depth
3. **Maintainability**: Single frontend application is easier to maintain
4. **Flexibility**: Can be extended later if needed (e.g., VPN access)

### Implementation Steps

1. **Backend Configuration**:
   - Add `BIND_ADDRESS` environment variable support
   - Default to `127.0.0.1` for local deployment
   - Update `backend/src/server/index.ts` to use binding address

2. **Reverse Proxy Setup**:
   - Configure nginx to serve public frontend
   - Block `/admin/*` and `/api/admin/*` from external IPs
   - Allow local network (192.168.x.x, 10.x.x.x, 127.0.0.1) access
   - Proxy backend API to localhost:3000

3. **Testing**:
   - Verify public routes work from external network
   - Verify admin routes blocked from external network
   - Verify admin routes accessible from local network
   - Test authentication flow from local network

---

## Related Requirements

- **Authentication Requirements**: See `authentication.md` (to be created)
- **Authorization Requirements**: See `authorization.md` (to be created)
- **Network Security**: See deployment infrastructure documentation

---

## Change History

| Date | Change | Author | Notes |
|------|--------|--------|-------|
| [DATE] | Initial requirement definition | - | Local deployment security requirements |

