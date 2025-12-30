# Security Overview

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-12-29
- **Version**: 1.0

## Summary (Current)

- **Edge/Perimeter**: nginx + fail2ban in production (out of repo); scanners are probing common paths.
- **Backend**: Express API with JWT-based admin auth; baseline hardening added (CORS allowlist, rate limiting, sanitized production errors, localhost binding default).
- **Frontend**: Vite/React SPA; served separately (nginx should add security headers).

## Key Security Requirements

- **Admin access control**: `requirements/admin-access-control.md`
- **Backend API hardening**: `requirements/backend-api-security.md`
- **Edge/Perimeter security**: `requirements/edge-perimeter-security.md`

## Immediate Follow-ups (Production)

- Ensure nginx blocks `/.env`, `/.git/*`, and other dotfiles / backups.
- Restrict `/admin/*` and `/api/admin/*` to VPN/local IP allowlist (or add additional auth at nginx).
- Confirm `JWT_SECRET` is set (distinct from `ADMIN_PASSWORD`) and rotate any reused secrets.
- Confirm `CORS_ORIGINS` is set to your real frontend origin(s).


