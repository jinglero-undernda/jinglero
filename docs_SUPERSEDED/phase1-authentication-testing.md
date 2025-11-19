# Phase 1: Authentication Testing Guide

This document provides step-by-step instructions for testing the authentication system implemented in Phase 1.

## Prerequisites

1. Backend server running on port 3000 (default)
2. Frontend development server running on port 5173 (default)
3. Environment variables configured

## Setup

### 1. Configure Environment Variables

Create or update `backend/.env` file with:

```env
ADMIN_PASSWORD=test-admin-password-123
JWT_SECRET=your-jwt-secret-key-here  # Optional, will use ADMIN_PASSWORD if not set
PORT=3000
```

**Important:** 
- `ADMIN_PASSWORD` is required
- `JWT_SECRET` is optional (will fall back to `ADMIN_PASSWORD` if not set)
- For production, use a strong, unique `JWT_SECRET` separate from `ADMIN_PASSWORD`

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

You should see: `Server running on port 3000`

### 3. Start Frontend Server

```bash
cd frontend
npm run dev
```

You should see the frontend running at `http://localhost:5173`

## Testing Backend Endpoints

### Test 1: Health Check (No Auth Required)

```bash
curl http://localhost:3000/health
```

**Expected:** `{"status":"ok"}`

### Test 2: Login with Correct Password

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"test-admin-password-123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d"
}
```

**Save the token** from the response for subsequent tests.

### Test 3: Login with Incorrect Password

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"wrong-password"}'
```

**Expected Response:**
```json
{
  "error": "Invalid credentials",
  "code": "UNAUTHORIZED"
}
```

**Status Code:** 401

### Test 4: Check Authentication Status (Without Token)

```bash
curl http://localhost:3000/api/admin/status
```

**Expected Response:**
```json
{
  "authenticated": false
}
```

### Test 5: Check Authentication Status (With Valid Token)

Replace `YOUR_TOKEN_HERE` with the token from Test 2:

```bash
curl http://localhost:3000/api/admin/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "authenticated": true
}
```

### Test 6: Access Protected Route (Without Token)

```bash
curl http://localhost:3000/api/admin/schema
```

**Expected Response:**
```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

**Status Code:** 401

### Test 7: Access Protected Route (With Valid Token)

Replace `YOUR_TOKEN_HERE` with the token from Test 2:

```bash
curl http://localhost:3000/api/admin/schema \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:** Schema information (should succeed)

### Test 8: Access Protected Route (With Invalid Token)

```bash
curl http://localhost:3000/api/admin/schema \
  -H "Authorization: Bearer invalid-token-here"
```

**Expected Response:**
```json
{
  "error": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}
```

**Status Code:** 401

### Test 9: Logout

Replace `YOUR_TOKEN_HERE` with the token from Test 2:

```bash
curl -X POST http://localhost:3000/api/admin/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Note:** For JWT-based auth, logout is handled client-side by removing the token. The endpoint exists for consistency.

## Testing Frontend

### Test 10: Access Admin Page Without Authentication

1. Open browser and navigate to: `http://localhost:5173/admin`
2. **Expected:** Should redirect to `/admin/login`

### Test 11: Login Page Display

1. Navigate to: `http://localhost:5173/admin/login`
2. **Expected:**
   - See "Admin - Iniciar Sesión" heading
   - Password input field
   - "Iniciar Sesión" button
   - Link to go back to home

### Test 12: Login with Correct Password

1. On login page, enter password: `test-admin-password-123`
2. Click "Iniciar Sesión"
3. **Expected:**
   - Button shows "Iniciando sesión..." while loading
   - Redirects to `/admin` (AdminHome page)
   - Token stored in localStorage (check browser DevTools > Application > Local Storage > `adminToken`)

### Test 13: Login with Incorrect Password

1. On login page, enter wrong password: `wrong-password`
2. Click "Iniciar Sesión"
3. **Expected:**
   - Error message displayed: "Invalid credentials"
   - Stays on login page
   - No redirect

### Test 14: Access Protected Admin Routes After Login

1. After successful login, navigate to: `http://localhost:5173/admin`
2. **Expected:** AdminHome page loads (entity selection dropdowns)

3. Try accessing: `http://localhost:5173/admin/j/some-id`
4. **Expected:** AdminEntityAnalyze page loads (or shows entity not found, but doesn't redirect to login)

### Test 15: Authentication Persistence

1. After logging in, refresh the page (F5)
2. **Expected:** Should remain on admin page, not redirect to login

3. Close browser tab and open new tab
4. Navigate to: `http://localhost:5173/admin`
5. **Expected:** Should remain authenticated (token in localStorage persists)

### Test 16: Logout (Manual)

1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Delete the `adminToken` key
4. Navigate to: `http://localhost:5173/admin`
5. **Expected:** Should redirect to `/admin/login`

### Test 17: Direct Access to Protected Route

1. Clear localStorage (or use incognito window)
2. Navigate directly to: `http://localhost:5173/admin/j/some-id`
3. **Expected:** Should redirect to `/admin/login`

## Testing Checklist

### Backend Tests
- [ ] Health check endpoint works
- [ ] Login with correct password returns token
- [ ] Login with incorrect password returns 401
- [ ] Status endpoint returns `authenticated: false` without token
- [ ] Status endpoint returns `authenticated: true` with valid token
- [ ] Protected routes return 401 without token
- [ ] Protected routes work with valid token
- [ ] Invalid token returns 401
- [ ] Logout endpoint works

### Frontend Tests
- [ ] Accessing `/admin` without auth redirects to login
- [ ] Login page displays correctly
- [ ] Login with correct password redirects to admin
- [ ] Login with incorrect password shows error
- [ ] Token stored in localStorage after login
- [ ] Protected routes accessible after login
- [ ] Authentication persists across page refreshes
- [ ] Authentication persists across browser sessions
- [ ] Removing token redirects to login
- [ ] Direct access to protected route redirects to login

## Troubleshooting

### Issue: "JWT secret not configured" error

**Solution:** Make sure `ADMIN_PASSWORD` is set in `backend/.env`

### Issue: Login works but protected routes still return 401

**Possible causes:**
1. Token not being sent in Authorization header
2. Token expired (check token expiration - should be 7 days)
3. JWT_SECRET mismatch between login and verification

**Solution:**
- Check browser DevTools > Network tab to see if Authorization header is sent
- Verify token in localStorage matches the one being sent
- Check that `JWT_SECRET` (or `ADMIN_PASSWORD`) is the same for both login and verification

### Issue: Frontend redirects to login even after successful login

**Possible causes:**
1. `getAuthStatus` endpoint returning `authenticated: false`
2. Token not being stored in localStorage
3. CORS issues

**Solution:**
- Check browser console for errors
- Verify token is in localStorage
- Check Network tab to see if `/api/admin/status` request succeeds
- Verify CORS is configured correctly in backend

### Issue: "Admin authentication not configured" error

**Solution:** Make sure `ADMIN_PASSWORD` is set in `backend/.env` and server is restarted

## Next Steps

Once all tests pass, Phase 1 is complete and you can proceed to Phase 2: Knowledge Graph Validation Backend.

