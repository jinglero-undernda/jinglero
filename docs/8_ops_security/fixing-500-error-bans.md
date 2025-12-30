# Fixing Fail2ban Banning on 500 Errors

## The Problem

Your IP (`92.40.178.144`) is being banned because your legitimate requests are returning **500 Internal Server Errors**.

**500 errors are SERVER errors, not bad client requests!** They should NOT trigger fail2ban bans.

Looking at your logs:

- `/api/public/fabricas/latest` → 500 error
- `/api/public/volumetrics` → 500 error
- `/api/public/fabricas` → 500 error
- `/api/admin/status` → 403 error (expected if not authenticated)

The `nginx-bad-requests` filter is incorrectly treating these 500 errors as "bad requests" and banning your IP.

## Immediate Fix

### Step 1: Unban Your IP

```bash
sudo fail2ban-client set nginx-bad-requests unbanip 92.40.178.144
```

### Step 2: Whitelist Your IP (Temporary)

```bash
sudo nano /etc/fail2ban/jail.local
```

Add:

```ini
[nginx-bad-requests]
enabled = true
ignoreip = 127.0.0.1/8 ::1 192.168.1.0/24 192.168.68.0/24 92.40.178.144
```

Then reload:

```bash
sudo fail2ban-client reload
```

## Permanent Fix: Exclude 500 Errors from Filter

The `nginx-bad-requests` filter should NOT ban on 500 errors. Let's check and fix the filter:

### Step 1: Check Current Filter Configuration

```bash
sudo cat /etc/fail2ban/filter.d/nginx-bad-requests.conf
```

### Step 2: Modify Filter to Exclude 500 Errors

The filter should only catch:

- **400 Bad Request** - Malformed client requests
- **404 Not Found** - Repeated 404s (scanner probes)
- **Invalid HTTP requests** - Malformed headers/protocol

It should **NOT** catch:

- **500 Internal Server Error** - Server-side errors
- **502 Bad Gateway** - Proxy/upstream errors
- **503 Service Unavailable** - Service down errors

Edit the filter:

```bash
sudo nano /etc/fail2ban/filter.d/nginx-bad-requests.conf
```

The filter should look something like this (excluding 500 errors):

```ini
[Definition]
# Match 400 Bad Request errors
failregex = ^<HOST> -.*"(GET|POST|HEAD).*" (400|401|403|404) .*$

# Exclude 500 errors (server errors, not bad client requests)
ignoreregex = ^<HOST> -.*"(GET|POST|HEAD).*" (500|502|503|504) .*$
```

Or if the filter uses a different pattern, modify it to exclude 5xx status codes.

### Step 3: Alternative - Use nginx-limit-req Instead

If `nginx-bad-requests` is too problematic, consider using `nginx-limit-req` which only bans on rate limiting violations, not error codes:

```bash
sudo nano /etc/fail2ban/jail.local
```

```ini
[nginx-limit-req]
enabled = true
port = http,https
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 600
bantime = 1800
```

Then disable `nginx-bad-requests`:

```ini
[nginx-bad-requests]
enabled = false
```

### Step 4: Reload Fail2ban

```bash
sudo fail2ban-client reload
```

## Fix the Backend 500 Errors

While fixing fail2ban, you should also fix the backend issues causing 500 errors:

### Check Backend Logs

```bash
# Check backend service logs
sudo journalctl -u jinglero-backend.service -n 100 --no-pager

# Check for database connection errors
sudo journalctl -u jinglero-backend.service | grep -i "database\|neo4j\|connection" | tail -50
```

### Common Causes of 500 Errors

1. **Database connection issues** - Neo4j not running or wrong credentials
2. **Missing environment variables** - Check `.env` file
3. **Database query errors** - Check backend logs for Cypher query errors
4. **Memory/resource issues** - Backend running out of resources

### Test Backend Directly

```bash
# Test backend health
curl http://localhost:3000/health

# Test the failing endpoints
curl http://localhost:3000/api/public/volumetrics
curl http://localhost:3000/api/public/fabricas
curl http://localhost:3000/api/public/fabricas/latest
```

## Recommended Configuration

Here's a better fail2ban configuration that won't ban on server errors:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 10
ignoreip = 127.0.0.1/8 ::1 192.168.1.0/24 192.168.68.0/24 92.40.178.144

[nginx-bad-requests]
enabled = true
port = http,https
filter = nginx-bad-requests
logpath = /var/log/nginx/access.log
maxretry = 30         # More lenient
findtime = 600        # 10 minute window
bantime = 1800        # 30 minute ban
# Filter should exclude 500 errors (check filter.d/nginx-bad-requests.conf)

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
findtime = 600
bantime = 3600
```

## Verify the Fix

```bash
# 1. Verify your IP is unbanned
sudo fail2ban-client status nginx-bad-requests | grep "92.40.178.144"
# Should return nothing

# 2. Check filter configuration
sudo cat /etc/fail2ban/filter.d/nginx-bad-requests.conf

# 3. Test your website
curl -I https://jingle.ar/
# Should work now

# 4. Monitor fail2ban logs
sudo tail -f /var/log/fail2ban.log | grep -E "(Ban|Unban|92.40.178.144)"
```

## Summary

1. ✅ **Immediate**: Unban your IP (`92.40.178.144`)
2. ✅ **Short-term**: Whitelist your IP in `ignoreip`
3. ✅ **Long-term**: Fix the filter to exclude 500 errors (server errors)
4. ✅ **Backend**: Fix the 500 errors in your backend (database/connection issues)

The root cause is that fail2ban is treating server errors (500) as bad client requests. Server errors should never trigger IP bans!
