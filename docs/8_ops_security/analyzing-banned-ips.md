# Analyzing Banned IPs in Fail2ban

## Your Current Status

From your `nginx-bad-requests` jail:
- **27 total failed requests** detected
- **25 currently banned IPs**
- **0 currently failed** (fail2ban is actively blocking)

This is **good** - fail2ban is working and protecting your server!

## Identifying Legitimate vs. Malicious IPs

Looking at your banned IP list, I can identify some patterns:

### Likely Legitimate IPs (May Need Whitelisting)

**Googlebot Crawlers:**
- `66.249.66.201` - Googlebot
- `66.249.66.40` - Googlebot  
- `66.249.66.43` - Googlebot

These are Google's search engine crawlers. If you want your site indexed by Google, you may want to whitelist these IPs or adjust your fail2ban rules to be less aggressive for legitimate crawlers.

**AWS/Cloud Service IPs (Possibly Legitimate):**
- `54.87.131.76` - AWS (could be legitimate service)
- `35.91.182.41` - AWS (could be legitimate service)

### Likely Malicious/Scanner IPs

Most of the other IPs appear to be scanners or bots:
- Various international IPs making bad requests
- Scanner bots probing for vulnerabilities
- These bans are **correct** - they should stay banned

## How to Investigate What These IPs Were Doing

### 1. Check What Requests Triggered the Bans

For each banned IP, you can see what they were doing:

```bash
# Check what a specific banned IP was doing
BANNED_IP="66.249.66.201"  # Example: Googlebot
sudo grep "$BANNED_IP" /var/log/nginx/access.log | tail -20

# Check for scanner patterns from banned IPs
sudo grep -E "(\.env|\.git|wp-admin|phpmyadmin|/admin)" /var/log/nginx/access.log | \
  grep -f <(sudo fail2ban-client status nginx-bad-requests | grep "Banned IP" | cut -d: -f2 | tr ' ' '\n' | grep -v '^$') | \
  awk '{print $1, $7}' | sort | uniq -c | sort -rn
```

### 2. Check Fail2ban Log for Ban Reasons

```bash
# See why each IP was banned
sudo grep "Ban" /var/log/fail2ban.log | tail -50

# See recent bans with timestamps
sudo grep "nginx-bad-requests.*Ban" /var/log/fail2ban.log | tail -30
```

### 3. Check What "Bad Requests" Means

The `nginx-bad-requests` filter typically catches:
- 400 Bad Request errors
- 404 Not Found errors (repeated)
- Invalid HTTP requests
- Malformed requests

Check your nginx filter configuration:
```bash
sudo cat /etc/fail2ban/filter.d/nginx-bad-requests.conf
```

## Recommendations

### Option 1: Whitelist Googlebot (If You Want Search Indexing)

If you want Google to index your site, whitelist Googlebot IPs:

```bash
# Edit fail2ban jail configuration
sudo nano /etc/fail2ban/jail.local
```

Add to `[DEFAULT]` section:
```ini
[DEFAULT]
ignoreip = 127.0.0.1/8 ::1 192.168.1.0/24 192.168.68.0/24 \
           66.249.64.0/19  # Googlebot IP range
```

Or add to specific jail:
```ini
[nginx-bad-requests]
ignoreip = 66.249.64.0/19  # Googlebot
```

Then reload:
```bash
sudo fail2ban-client reload
sudo fail2ban-client set nginx-bad-requests unbanip 66.249.66.201
sudo fail2ban-client set nginx-bad-requests unbanip 66.249.66.40
sudo fail2ban-client set nginx-bad-requests unbanip 66.249.66.43
```

### Option 2: Make Rules Less Aggressive for Crawlers

Adjust the `nginx-bad-requests` jail to be less sensitive:

```bash
sudo nano /etc/fail2ban/jail.local
```

```ini
[nginx-bad-requests]
enabled = true
maxretry = 20        # Increase from default (allow more failures)
findtime = 600       # 10 minute window
bantime = 1800       # 30 minute ban (instead of permanent)
```

Then reload:
```bash
sudo fail2ban-client reload
```

### Option 3: Keep Current Settings (Recommended for Security)

If you don't need search engine indexing or the site is private:
- **Keep the current bans** - they're protecting you
- Googlebot will retry later with different IPs
- Most other IPs are scanners and should stay banned

## Quick Commands to Investigate

```bash
# 1. See what Googlebot was doing
sudo grep "66.249.66" /var/log/nginx/access.log | tail -30

# 2. Count requests per banned IP
for ip in $(sudo fail2ban-client status nginx-bad-requests | grep "Banned IP" | cut -d: -f2); do
  echo "=== $ip ==="
  sudo grep "$ip" /var/log/nginx/access.log | wc -l
done

# 3. See recent ban activity
sudo tail -100 /var/log/fail2ban.log | grep -E "(Ban|Unban)" | tail -30

# 4. Check if your own IP is banned (replace with your IP)
YOUR_IP="your.ip.here"
sudo fail2ban-client status nginx-bad-requests | grep "$YOUR_IP"
```

## Summary

✅ **Your fail2ban is working correctly** - 25 IPs banned for bad requests
✅ **Most bans are legitimate** - scanners and bots being blocked
⚠️ **Googlebot IPs are banned** - decide if you want to whitelist them
✅ **No evidence of attack** - this is normal internet background noise being filtered

The journal rotation notice is completely normal and unrelated to these bans. Your security setup is working as intended!

