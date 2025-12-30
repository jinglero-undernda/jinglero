# Security Requirements: Edge/Perimeter Security

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-12-29
- **Last Validated**: not yet validated
- **Code Reference**: Production nginx + fail2ban configuration (out of repo)

## Overview

This document defines security requirements for edge/perimeter protection using nginx reverse proxy and fail2ban intrusion prevention. The edge layer provides defense-in-depth by blocking malicious traffic before it reaches the application backend.

## Security Requirements

### REQ-EDGE-001: Fail2ban Must Not Ban on Server Errors (5xx)

**Description**: fail2ban filters must exclude HTTP 5xx status codes (500, 502, 503, 504) from triggering IP bans. Server errors indicate backend problems, not malicious client requests.

**Security Goal**: Prevent false positives that block legitimate users when the backend is experiencing issues.

**Threat Model**:

- Backend database connection failures causing 500 errors
- Backend service unavailability causing 503 errors
- Upstream/proxy errors causing 502 errors
- Legitimate users being banned due to server-side problems

**Implementation**:

- fail2ban filter configuration must exclude 5xx status codes from `failregex`
- Filter should use `ignoreregex` to explicitly ignore 5xx errors
- Example: `ignoreregex = ^<HOST> -.*"(GET|POST|HEAD).*" (500|502|503|504) .*$`

**Code Reference**: `/etc/fail2ban/filter.d/nginx-bad-requests.conf` (production server)

**Context**:
When the backend returns 500 errors due to database issues or other server problems, legitimate users making normal requests will receive 500 responses. These are server-side errors and should not trigger IP bans.

**Validation**:

- Verify filter configuration excludes 5xx status codes
- Test that legitimate requests returning 500 errors do not trigger bans
- Confirm banned IPs are only from actual malicious activity (400, 404 scanner probes)

**Monitoring**:

- Monitor fail2ban logs for false positive bans
- Track 500 error rates separately from fail2ban triggers
- Alert on high 500 error rates (indicates backend issues)

---

### REQ-EDGE-002: Fail2ban Must Not Ban on Authentication Check Endpoints

**Description**: fail2ban filters must exclude `/api/admin/status` and other authentication check endpoints from triggering bans on 403 Forbidden responses. These endpoints are designed to return 403 when not authenticated.

**Security Goal**: Prevent false positives from legitimate authentication status checks.

**Threat Model**:

- Frontend making frequent `/api/admin/status` calls to check authentication state
- Browser tabs checking auth status on focus/visibility changes
- Legitimate users being banned for normal authentication checks

**Code Reference**:

- Frontend: `frontend/src/App.tsx:19-101` (AdminLink component checking auth status)
- Backend: `backend/src/server/api/admin.ts:308-314` (optionalAdminAuth middleware)
- Filter: `/etc/fail2ban/filter.d/nginx-bad-requests.conf` (production server)

**Implementation**:

- fail2ban filter must exclude `/api/admin/status` from 403 bans
- Filter should use `ignoreregex` to ignore 403 errors from auth check endpoints
- Example: `ignoreregex = ^<HOST> -.*"(GET|POST|HEAD).*\/api\/(admin|auth)\/status.*" 403 .*$`
- Alternative: Exclude all 403 errors if too many false positives occur

**Context**:
The frontend `AdminLink` component calls `/api/admin/status`:

- On every page load
- When switching browser tabs (window focus event)
- When tokens change in other tabs (storage event)

When not authenticated, the backend correctly returns 403 Forbidden. This is expected behavior, not an attack.

**Validation**:

- Verify filter excludes `/api/admin/status` from 403 bans
- Test that frequent auth status checks do not trigger bans
- Confirm only 403 errors to protected endpoints (not auth checks) trigger bans

**Monitoring**:

- Monitor `/api/admin/status` request frequency
- Track 403 error rates separately for auth checks vs protected endpoints
- Alert on unusual patterns of 403 errors to protected endpoints

---

### REQ-EDGE-003: Fail2ban Must Ban on Scanner Probes and Malicious Requests

**Description**: fail2ban must detect and ban IPs making malicious requests, including scanner probes, repeated 404s to common paths, and malformed requests.

**Security Goal**: Block automated scanners and attackers before they can exploit vulnerabilities.

**Threat Model**:

- Automated scanners probing for `.env`, `.git`, `wp-admin`, `phpmyadmin`, etc.
- Repeated 404 errors indicating directory/file enumeration attempts
- Malformed HTTP requests (400 Bad Request)
- Brute-force attempts on admin endpoints

**Implementation**:

- fail2ban filter should match 400 Bad Request errors
- Filter should match repeated 404 errors (scanner probes)
- Filter should match requests to known scanner paths (`.env`, `.git`, etc.)
- Configuration should use appropriate thresholds (`maxretry`, `findtime`, `bantime`)

**Code Reference**: `/etc/fail2ban/filter.d/nginx-bad-requests.conf` (production server)

**Context**:
Common scanner patterns include:

- Requests to `/.env`, `/.git/config`, `/.git/HEAD`
- Requests to `/wp-admin`, `/phpmyadmin`, `/adminer.php`
- Repeated 404s to random paths (directory enumeration)
- Malformed HTTP requests (400 errors)

**Validation**:

- Verify filter matches known scanner patterns
- Test that scanner probes trigger bans
- Confirm legitimate requests are not banned
- Verify ban thresholds are appropriate (not too aggressive)

**Monitoring**:

- Monitor fail2ban ban rates
- Track banned IP addresses and their request patterns
- Alert on high ban rates (may indicate attack or false positives)
- Review banned IPs regularly to identify false positives

---

### REQ-EDGE-004: Fail2ban Must Whitelist Legitimate IPs

**Description**: fail2ban configuration must include an `ignoreip` list containing localhost, local network ranges, and legitimate service IPs that should never be banned.

**Security Goal**: Prevent false positives by ensuring legitimate IPs are never banned.

**Threat Model**:

- Administrators being locked out due to false positives
- Local network devices being banned
- Monitoring services being banned
- Search engine crawlers (if desired) being banned

**Implementation**:

- `ignoreip` must include `127.0.0.1/8` (localhost)
- `ignoreip` must include `::1` (IPv6 localhost)
- `ignoreip` must include local network ranges (e.g., `192.168.1.0/24`)
- `ignoreip` should include administrator public IPs (if static)
- `ignoreip` may include search engine crawler IPs (if desired)

**Code Reference**: `/etc/fail2ban/jail.local` (production server)

**Context**:
Common IPs to whitelist:

- Localhost: `127.0.0.1/8`, `::1`
- Local network: `192.168.1.0/24`, `192.168.68.0/24` (adjust for actual network)
- Administrator IPs: Add specific public IPs if static
- Googlebot: `66.249.64.0/19` (if search indexing is desired)

**Validation**:

- Verify `ignoreip` includes localhost and local network
- Test that whitelisted IPs are never banned
- Confirm administrator can access site even with false positives
- Verify whitelist is applied to all active jails

**Monitoring**:

- Monitor fail2ban status for whitelisted IPs
- Alert if administrator IP is banned (indicates configuration issue)
- Review whitelist regularly to ensure it's up to date

---

### REQ-EDGE-005: Fail2ban Configuration Must Use Appropriate Thresholds

**Description**: fail2ban jail configurations must use thresholds that balance security (catching attacks) with usability (avoiding false positives).

**Security Goal**: Ensure fail2ban effectively blocks attacks without disrupting legitimate users.

**Threat Model**:

- Too aggressive thresholds causing false positives
- Too lenient thresholds allowing attacks to proceed
- Rapid-fire requests from legitimate users being mistaken for attacks

**Implementation**:

- `maxretry` should be high enough to avoid false positives (recommended: 20-30 for nginx-bad-requests)
- `findtime` should define a reasonable time window (recommended: 600 seconds = 10 minutes)
- `bantime` should be long enough to deter attacks but not permanent (recommended: 1800 seconds = 30 minutes)
- Different jails may need different thresholds (e.g., SSH vs HTTP)

**Code Reference**: `/etc/fail2ban/jail.local` (production server)

**Context**:
Recommended thresholds for `nginx-bad-requests`:

- `maxretry = 30`: Ban after 30 bad requests (allows for legitimate errors)
- `findtime = 600`: Count failures in 10-minute window
- `bantime = 1800`: Ban for 30 minutes (not permanent)

SSH jail may use stricter thresholds:

- `maxretry = 5`: Ban after 5 failed login attempts
- `findtime = 600`: 10-minute window
- `bantime = 3600`: Ban for 1 hour

**Validation**:

- Verify thresholds are not too aggressive (test with legitimate traffic)
- Verify thresholds are not too lenient (test with scanner probes)
- Monitor ban rates and adjust if needed
- Review false positive rates regularly

**Monitoring**:

- Track fail2ban ban rates over time
- Monitor false positive reports
- Alert on unusual ban patterns
- Review and adjust thresholds based on observed patterns

---

### REQ-EDGE-006: Nginx Must Block Access to Sensitive Files

**Description**: nginx configuration must deny requests to sensitive files and directories, including `.env`, `.git`, backup files, and other dotfiles.

**Security Goal**: Prevent information disclosure by blocking access to sensitive files at the edge.

**Threat Model**:

- Automated scanners requesting `.env` files containing secrets
- Requests to `.git` directories exposing source code
- Access to backup files containing sensitive data
- Directory listing exposing file structure

**Code Reference**: nginx configuration (production server, out of repo)

**Implementation**:

- nginx must deny requests to `/.env`, `/.env.*`
- nginx must deny requests to `/.git/*`
- nginx must deny requests to `/*.bak`, `/*.sql`, `/*.backup`
- nginx should deny directory listing
- nginx should return 404 (not 403) to avoid revealing file existence

**Context**:
Common sensitive paths to block:

- `/.env`, `/.env.local`, `/.env.production`
- `/.git/config`, `/.git/HEAD`, `/.git/*`
- `/*.bak`, `/*.sql`, `/*.backup`, `/*.old`
- `/wp-config.php`, `/config.php`
- `/package.json`, `/composer.json` (may reveal dependencies)

**Validation**:

- Test that requests to `/.env` are denied
- Test that requests to `/.git/config` are denied
- Verify nginx returns 404 (not 403) for blocked paths
- Confirm blocked paths don't reveal file existence

**Monitoring**:

- Monitor nginx access logs for blocked path requests
- Alert on repeated requests to sensitive paths
- Track which IPs are probing for sensitive files

---

### REQ-EDGE-007: Fail2ban Must Monitor and Log Ban Activity

**Description**: fail2ban must log all ban and unban activities to enable monitoring, analysis, and troubleshooting.

**Security Goal**: Enable security monitoring and incident response through comprehensive logging.

**Threat Model**:

- Need to identify attack patterns and trends
- Need to investigate false positives
- Need to track which IPs are being banned and why
- Need to audit fail2ban effectiveness

**Implementation**:

- fail2ban must log all ban events with IP, jail, and reason
- fail2ban must log all unban events
- Logs should be accessible for analysis (`/var/log/fail2ban.log`)
- Logs should be retained for sufficient time period

**Code Reference**: `/etc/fail2ban/fail2ban.conf` (production server)

**Context**:
Fail2ban logs should include:

- Ban events: IP address, jail name, timestamp, reason
- Unban events: IP address, jail name, timestamp
- Filter matches: IP address, matched pattern, timestamp
- Configuration changes: reload events, configuration errors

**Validation**:

- Verify fail2ban logs are being written
- Test that ban events are logged correctly
- Confirm log retention is appropriate
- Verify logs are accessible for analysis

**Monitoring**:

- Monitor fail2ban log for ban patterns
- Alert on unusual ban rates
- Review logs regularly for false positives
- Track ban effectiveness over time

---

## Deployment Notes

These requirements apply to production deployment where nginx and fail2ban are configured on the server (out of repo):

- **Nginx Configuration**: Block sensitive files, configure security headers, set up reverse proxy
- **Fail2ban Configuration**: Configure jails, filters, and thresholds appropriately
- **Monitoring**: Set up log monitoring and alerting for fail2ban activity
- **Regular Review**: Review banned IPs and false positive rates regularly

## Related Documentation

- `fixing-false-positives.md`: Guide for fixing false positive bans
- `fixing-500-error-bans.md`: Guide for excluding server errors from bans
- `analyzing-banned-ips.md`: Guide for analyzing banned IP addresses
- `journal-rotation-explanation.md`: Explanation of journal rotation (not an attack)
- `website-diagnostic-playbook.md`: Comprehensive diagnostic guide

## Change History

| Date       | Change                                | Author |
| ---------- | ------------------------------------- | ------ |
| 2025-12-29 | Initial requirements document created | System |
