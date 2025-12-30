# Fail2ban Filter Configuration - nginx-bad-requests

## The Problem

The error `option 'failregex' in section 'Definition' already exists` means there are duplicate `failregex` lines in your filter configuration file.

## Solution: Correct Filter Configuration

Here's the correct configuration for `/etc/fail2ban/filter.d/nginx-bad-requests.conf`:

```ini
[Definition]
# Match 400 Bad Request errors (malformed requests)
failregex = ^<HOST> -.*"(GET|POST|HEAD).*" 400 .*$

# Match 404 errors (scanner probes) - but be lenient
failregex = ^<HOST> -.*"(GET|POST|HEAD).*" 404 .*$

# Exclude:
# - 403 errors (too many false positives from auth checks)
# - 5xx errors (server errors, not client errors)
# - Auth check endpoints
ignoreregex = ^<HOST> -.*"(GET|POST|HEAD).*" (403|500|502|503|504) .*$
              ^<HOST> -.*"(GET|POST|HEAD).*\/api\/(admin|auth)\/status.*" .*$
```

## Alternative: Simpler Configuration (Recommended)

If you want a simpler configuration that avoids false positives:

```ini
[Definition]
# Only match 400 Bad Request errors (malformed requests)
failregex = ^<HOST> -.*"(GET|POST|HEAD).*" 400 .*$

# Match 404 errors (scanner probes)
failregex = ^<HOST> -.*"(GET|POST|HEAD).*" 404 .*$

# Exclude all 403 and 5xx errors (prevents false positives)
ignoreregex = ^<HOST> -.*"(GET|POST|HEAD).*" (403|500|502|503|504) .*$
```

## How to Fix

1. **Backup the current file:**
   ```bash
   sudo cp /etc/fail2ban/filter.d/nginx-bad-requests.conf /etc/fail2ban/filter.d/nginx-bad-requests.conf.backup
   ```

2. **Edit the file:**
   ```bash
   sudo nano /etc/fail2ban/filter.d/nginx-bad-requests.conf
   ```

3. **Replace the entire `[Definition]` section** with one of the configurations above.

4. **Test the configuration:**
   ```bash
   sudo fail2ban-client -t
   ```

5. **If test passes, reload fail2ban:**
   ```bash
   sudo fail2ban-client reload
   ```

6. **Verify it's working:**
   ```bash
   sudo fail2ban-client status nginx-bad-requests
   ```

## What Each Line Does

- **First `failregex`**: Matches 400 Bad Request errors (malformed HTTP requests)
- **Second `failregex`**: Matches 404 Not Found errors (scanner probes)
- **`ignoreregex`**: Excludes 403 and 5xx errors from triggering bans

## Why This Configuration

- **400 errors**: Always indicate bad client requests → should ban
- **404 errors**: Often scanner probes → should ban (but be lenient with thresholds)
- **403 errors**: Too many false positives from auth checks → exclude
- **5xx errors**: Server errors, not client errors → exclude

## Notes

- Multiple `failregex` lines are allowed (they're combined with OR logic)
- Only one `ignoreregex` line is needed (can have multiple patterns separated by newlines)
- The `ignoreregex` takes precedence over `failregex` (if a line matches `ignoreregex`, it won't trigger a ban even if it matches `failregex`)

