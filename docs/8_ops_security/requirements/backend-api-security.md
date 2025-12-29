# Security Requirements: Backend API Hardening

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-12-29
- **Last Validated**: not yet validated
- **Code Reference**: `backend/src/server/index.ts:13-69`, `backend/src/server/middleware/rateLimit.ts:1-86`, `backend/src/server/middleware/errorHandler.ts:8-35`, `backend/src/server/api/public.ts:6-17`, `backend/src/server/api/admin.ts:45-305`, `backend/src/server/middleware/auth.ts:11-131`

## Overview

This document captures the current backend security posture for the MVP deployment and defines baseline hardening requirements to reduce common opportunistic attacks observed in access logs (probing for `.env`, `/api/admin/status`, framework fingerprints, etc.).

## Security Requirements

### REQ-API-001: Do Not Expose Secrets via HTTP

**Description**: The application must never serve `.env`, `.git`, or other sensitive dotfiles and must not expose secret values in responses.

**Security Goal**: Prevent credential and configuration leakage.

**Threat Model**:
- Automated scanners requesting `.env`, `.git/config`, backup files, and debug artifacts
- Error-message leakage revealing internal paths/config

**Implementation**:
- Backend responses must not include stack traces or raw internal error messages in production.
- Reverse proxy (nginx) must deny dotfiles and common secret filenames at the edge.

**Validation**:
- Confirm production responses never include stack traces or internal exception messages.
- Confirm nginx denies requests to `/.env`, `/.git/*`, `/*.bak`, `/*.sql`, etc.

**Monitoring**:
- Alert on repeated dotfile probes and secret-path requests.

---

### REQ-API-002: Restrict CORS to an Explicit Allowlist (Production)

**Description**: Browser-originated requests must only be allowed from explicitly configured origins.

**Security Goal**: Reduce CSRF-like abuse patterns and cross-origin data exposure.

**Threat Model**:
- Malicious sites making browser-based requests to your API

**Code Reference**: `backend/src/server/index.ts:16-56`

**Implementation**:
- Use `CORS_ORIGINS` (comma-separated) in production.

**Validation**:
- Confirm a browser request from an unlisted origin is rejected.

---

### REQ-API-003: Rate Limit High-Risk Endpoints

**Description**: Admin authentication and other high-risk endpoints must be rate limited.

**Security Goal**: Slow brute-force attempts and reduce abuse impact.

**Threat Model**:
- Password brute-force on `/api/admin/login`
- High-volume scraping / abuse

**Code Reference**: `backend/src/server/middleware/rateLimit.ts:1-78`, `backend/src/server/api/admin.ts:67-80,235-273`, `backend/src/server/index.ts:59-69`

**Implementation**:
- Global lightweight rate limit (configurable, can be disabled).
- Tight per-IP rate limit on `/api/admin/login`.

**Validation**:
- Confirm repeated requests trigger HTTP 429.

---

### REQ-API-004: Require Strong JWT Secret Configuration (Production)

**Description**: JWT signing/verification must use a dedicated `JWT_SECRET` in production (not derived from the admin password).

**Security Goal**: Prevent token forgery and limit blast radius if the admin password leaks.

**Threat Model**:
- Token forgery when secret is weak or shared with password

**Code Reference**: `backend/src/server/api/admin.ts:52-65,253-266`, `backend/src/server/middleware/auth.ts:11-29`

**Implementation**:
- Production must set `JWT_SECRET`.
- Token expiry must be configurable (`ADMIN_JWT_EXPIRES_IN`) and should be short-lived by default.

**Validation**:
- Confirm production refuses to authenticate admin if `JWT_SECRET` is not configured.

---

### REQ-API-005: Minimize Information Leakage in Error Responses

**Description**: Production error responses must not disclose internal exception messages or stack traces.

**Security Goal**: Reduce attacker feedback loops and prevent sensitive information disclosure.

**Threat Model**:
- Attackers using error output for recon (paths, query fragments, environment details)

**Code Reference**: `backend/src/server/middleware/errorHandler.ts:8-34`, `backend/src/server/api/public.ts:6-25`

**Implementation**:
- Centralized error handler must return generic messages for unhandled errors in production.
- Route-local error handling must also return generic messages in production.

**Validation**:
- Force an internal error and verify production response is generic (`Internal Server Error`).

---

### REQ-API-006: Prefer Localhost Binding Behind nginx

**Description**: When running behind nginx on the same host, the backend should bind to localhost by default.

**Security Goal**: Reduce exposed attack surface by ensuring the backend is not directly reachable from the internet.

**Threat Model**:
- Direct-to-backend probing bypassing nginx controls

**Code Reference**: `backend/src/server/index.ts:13-15,91-96`

**Implementation**:
- Default `BIND_ADDRESS=127.0.0.1` (override only when required).

**Validation**:
- Confirm the backend is not reachable directly from the internet (only via nginx).

---

## Deployment Notes (nginx / fail2ban)

These are not implemented in this repo, but are required for defense-in-depth:

- **Deny dotfiles**: block `/.env`, `/.git/`, etc. at nginx.
- **Admin IP allowlist**: restrict `/admin/*` and `/api/admin/*` to VPN/local IPs.
- **WAF rules**: optionally block common scanner paths and suspicious user agents.
- **Fail2ban**: continue jailing repeat offenders; ensure jails are scoped to real client IP (respect `X-Forwarded-For`).


