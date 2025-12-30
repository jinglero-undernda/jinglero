# Website Diagnostic Playbook

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-12-29
- **Last Validated**: not yet validated
- **Code Reference**: N/A (operational diagnostics)

## Overview

This playbook provides comprehensive diagnostic procedures for troubleshooting website accessibility issues, with special focus on fail2ban, rate limiting, firewall, and service status checks. Use this when the website becomes inaccessible after security changes or when investigating potential bot attacks.

## When to Use This Playbook

- Website is not accessible from internet
- Website was working but stopped after security changes
- Suspecting fail2ban is blocking legitimate traffic
- Suspecting rate limiting is too aggressive
- Investigating potential DDoS or bot attacks
- Need to verify all services are running correctly

## Prerequisites

- SSH access to Raspberry Pi
- Root or sudo access
- Understanding of your network setup (IP ranges, subnets)

---

## Quick Diagnostic Checklist

Run through this checklist first to identify the issue quickly:

```bash
# 1. Check if services are running
sudo systemctl status nginx
sudo systemctl status jinglero-backend.service
sudo systemctl status fail2ban

# 2. Check if you can access locally
curl http://localhost/
curl http://localhost/api/health

# 3. Check fail2ban status
sudo fail2ban-client status
sudo fail2ban-client status nginx-limit-req
sudo fail2ban-client status sshd

# 4. Check firewall
sudo ufw status verbose

# 5. Check nginx logs for errors
sudo tail -50 /var/log/nginx/error.log

# 6. Check recent nginx access logs
sudo tail -100 /var/log/nginx/access.log
```

---

## Step 1: Verify Service Status

### 1.1 Check Nginx Status

**Purpose**: Verify nginx is running and serving requests.

**Commands**:

```bash
# Check service status
sudo systemctl status nginx

# Check if nginx is listening on ports
sudo netstat -tlnp | grep nginx
# or
sudo ss -tlnp | grep nginx

# Test nginx configuration
sudo nginx -t
```

**What to Look For**:

- ✅ Service should show "active (running)"
- ✅ Should be listening on port 80 (HTTP) and/or 443 (HTTPS)
- ✅ Configuration test should show "syntax is ok" and "test is successful"

**If nginx is not running**:

```bash
# Start nginx
sudo systemctl start nginx

# Enable on boot
sudo systemctl enable nginx

# Check logs for errors
sudo journalctl -u nginx -n 50 --no-pager
```

---

### 1.2 Check Backend Service Status

**Purpose**: Verify backend API is running and responding.

**Commands**:

```bash
# Check service status
sudo systemctl status jinglero-backend.service

# Check if backend is listening on port 3000
sudo netstat -tlnp | grep :3000
# or
sudo ss -tlnp | grep :3000

# Test backend directly
curl http://localhost:3000/health
```

**What to Look For**:

- ✅ Service should show "active (running)"
- ✅ Should be listening on `127.0.0.1:3000` (localhost only)
- ✅ Health check should return `{"status":"ok"}`

**If backend is not running**:

```bash
# Start backend
sudo systemctl start jinglero-backend.service

# Check logs for errors
sudo journalctl -u jinglero-backend.service -n 100 --no-pager

# Common issues:
# - Missing .env file
# - Database connection issues
# - Port already in use
# - Build errors (check dist/ directory exists)
```

---

### 1.3 Check Fail2ban Status

**Purpose**: Verify fail2ban is running and check which jails are active.

**Commands**:

```bash
# Check fail2ban service status
sudo systemctl status fail2ban

# List all active jails
sudo fail2ban-client status

# Check specific jail status (common jails)
sudo fail2ban-client status nginx-limit-req
sudo fail2ban-client status nginx-http-auth
sudo fail2ban-client status sshd

# Check banned IPs in a specific jail
sudo fail2ban-client status nginx-limit-req | grep "Banned IP"
```

**What to Look For**:

- ✅ Service should show "active (running)"
- ⚠️ Check if your own IP or legitimate IPs are banned
- ⚠️ High number of banned IPs might indicate aggressive rules

**If fail2ban is blocking legitimate traffic**:

See Step 4 for unbanning procedures.

---

## Step 2: Check Network and Firewall

### 2.1 Check Firewall Rules

**Purpose**: Verify firewall is not blocking legitimate traffic.

**Commands**:

```bash
# Check firewall status
sudo ufw status verbose

# Check firewall logs
sudo tail -50 /var/log/ufw.log

# Check if specific ports are open
sudo ufw status | grep -E "(80|443|22)"
```

**What to Look For**:

- ✅ Ports 80 (HTTP) and 443 (HTTPS) should be allowed
- ✅ Port 22 (SSH) should be allowed
- ⚠️ Check if any rules are blocking your IP range

**If firewall is blocking traffic**:

```bash
# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Reload firewall
sudo ufw reload
```

---

### 2.2 Check Port Forwarding

**Purpose**: Verify router port forwarding is still configured correctly.

**Steps**:

1. **Check your public IP**:

   ```bash
   curl ifconfig.me
   ```

2. **Check if port forwarding is working**:

   - Access your router admin interface
   - Verify port forwarding rules for ports 80 and 443
   - Ensure they point to your Raspberry Pi's local IP

3. **Test from external network**:

   ```bash
   # From a device NOT on your local network (use mobile data)
   curl http://<your-public-ip>/
   curl http://<your-domain>/
   ```

**If port forwarding is broken**:

- Reconfigure port forwarding in router (see `internet-access-setup.md`)
- Verify Raspberry Pi's local IP hasn't changed
- Check if your public IP changed (update Dynamic DNS if using)

---

### 2.3 Check DNS Resolution

**Purpose**: Verify domain name resolves to correct IP.

**Commands**:

```bash
# Check if domain resolves
nslookup jinglero.duckdns.org
# or
dig jinglero.duckdns.org

# Check your current public IP
curl ifconfig.me

# Compare: domain should resolve to your public IP
```

**What to Look For**:

- ✅ Domain should resolve to your current public IP
- ⚠️ If IPs don't match, update Dynamic DNS or DNS records

**If DNS is incorrect**:

- Update Dynamic DNS (if using DuckDNS, run updater script)
- Update DNS A record (if using static domain)
- Wait for DNS propagation (can take up to 48 hours)

---

## Step 3: Check Logs for Errors

### 3.1 Check Nginx Error Logs

**Purpose**: Identify nginx configuration errors or access issues.

**Commands**:

```bash
# View recent error logs
sudo tail -100 /var/log/nginx/error.log

# Follow error log in real-time
sudo tail -f /var/log/nginx/error.log

# Search for specific errors
sudo grep -i "error" /var/log/nginx/error.log | tail -50
sudo grep -i "denied" /var/log/nginx/error.log | tail -50
```

**Common Errors to Look For**:

- `Permission denied` - Check file permissions
- `Connection refused` - Backend not running or wrong port
- `502 Bad Gateway` - Backend not responding
- `403 Forbidden` - IP restrictions or file permissions
- `404 Not Found` - Missing files or incorrect root path

---

### 3.2 Check Nginx Access Logs

**Purpose**: Identify patterns in access attempts, including bot traffic.

**Commands**:

```bash
# View recent access logs
sudo tail -100 /var/log/nginx/access.log

# Count requests by IP (identify suspicious traffic)
sudo tail -1000 /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -20

# Find most requested paths
sudo tail -1000 /var/log/nginx/access.log | awk '{print $7}' | sort | uniq -c | sort -rn | head -20

# Find 4xx and 5xx errors
sudo tail -1000 /var/log/nginx/access.log | grep -E " (4|5)[0-9]{2} " | tail -50

# Find requests from specific IP
sudo grep "1.2.3.4" /var/log/nginx/access.log | tail -50
```

**What to Look For**:

- ⚠️ High number of requests from single IP (potential bot)
- ⚠️ Many 403/404 errors (scanner probes)
- ⚠️ Requests to `/admin`, `/api/admin` from external IPs (should be blocked)
- ⚠️ Requests to `/.env`, `/.git` (scanner probes)

---

### 3.3 Check Fail2ban Logs

**Purpose**: Understand what fail2ban is doing and why IPs are banned.

**Commands**:

```bash
# Check fail2ban main log
sudo tail -100 /var/log/fail2ban.log

# Check specific jail logs
sudo tail -100 /var/log/fail2ban.log | grep "nginx-limit-req"
sudo tail -100 /var/log/fail2ban.log | grep "sshd"

# Find recent bans
sudo grep "Ban" /var/log/fail2ban.log | tail -50

# Find recent unbans
sudo grep "Unban" /var/log/fail2ban.log | tail -50
```

**What to Look For**:

- ⚠️ Your legitimate IP being banned
- ⚠️ Too many IPs being banned (aggressive rules)
- ⚠️ Bans happening too quickly (low threshold)

---

### 3.4 Check Backend Logs

**Purpose**: Identify backend errors that might affect website functionality.

**Commands**:

```bash
# View recent backend logs
sudo journalctl -u jinglero-backend.service -n 100 --no-pager

# Follow logs in real-time
sudo journalctl -u jinglero-backend.service -f

# Search for errors
sudo journalctl -u jinglero-backend.service | grep -i error | tail -50
```

**Common Errors to Look For**:

- Database connection errors
- Environment variable missing
- Port already in use
- Rate limiting errors (429 responses)

---

## Step 4: Diagnose Fail2ban Issues

### 4.1 Check Which IPs Are Banned

**Purpose**: Identify if legitimate IPs (including yours) are banned.

**Commands**:

```bash
# List all banned IPs across all jails
sudo fail2ban-client status | grep "Jail list" -A 20

# For each active jail, check banned IPs
sudo fail2ban-client status nginx-limit-req
sudo fail2ban-client status nginx-http-auth
sudo fail2ban-client status sshd

# Check if your IP is banned (replace with your IP)
YOUR_IP="1.2.3.4"
sudo fail2ban-client status nginx-limit-req | grep "$YOUR_IP"
```

**What to Look For**:

- ⚠️ Your own IP address in banned list
- ⚠️ Your local network IPs (192.168.x.x) in banned list
- ⚠️ Legitimate service IPs (e.g., monitoring services) in banned list

---

### 4.2 Check Fail2ban Configuration

**Purpose**: Verify fail2ban rules are not too aggressive.

**Commands**:

```bash
# View fail2ban configuration files
sudo cat /etc/fail2ban/jail.local
sudo cat /etc/fail2ban/jail.d/*.conf

# Check nginx-specific jail configuration
sudo cat /etc/fail2ban/filter.d/nginx-limit-req.conf
sudo cat /etc/fail2ban/filter.d/nginx-http-auth.conf

# Check fail2ban main configuration
sudo cat /etc/fail2ban/fail2ban.conf
```

**Key Configuration Parameters to Check**:

- `bantime` - How long IPs are banned (default: 600 seconds = 10 minutes)
- `findtime` - Time window for counting failures (default: 600 seconds)
- `maxretry` - Number of failures before ban (default: 5)
- `ignoreip` - IPs to never ban (should include your local network)

**Example Configuration** (`/etc/fail2ban/jail.local`):

```ini
[DEFAULT]
bantime = 3600        # Ban for 1 hour (3600 seconds)
findtime = 600        # Count failures in last 10 minutes
maxretry = 5          # Ban after 5 failures
ignoreip = 127.0.0.1/8 ::1 192.168.1.0/24 192.168.68.0/24

[nginx-limit-req]
enabled = true
port = http,https
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10         # More lenient for rate limiting
findtime = 300        # 5 minute window
bantime = 1800        # 30 minute ban
```

---

### 4.3 Unban IP Addresses

**Purpose**: Temporarily unban legitimate IPs to restore access.

**Commands**:

```bash
# Unban specific IP from specific jail
sudo fail2ban-client set nginx-limit-req unbanip 1.2.3.4

# Unban IP from all jails
sudo fail2ban-client unban 1.2.3.4

# Unban all IPs from specific jail (USE WITH CAUTION)
sudo fail2ban-client set nginx-limit-req unbanall

# Verify IP is unbanned
sudo fail2ban-client status nginx-limit-req | grep "1.2.3.4"
```

**⚠️ Warning**: Unbanning all IPs removes protection. Only do this if you're certain it's safe.

---

### 4.4 Temporarily Disable Fail2ban (For Testing)

**Purpose**: Test if fail2ban is causing the accessibility issue.

**Commands**:

```bash
# Stop fail2ban service
sudo systemctl stop fail2ban

# Test website accessibility
curl http://your-domain.com/

# If website works, fail2ban was likely the issue
# Re-enable fail2ban after fixing configuration
sudo systemctl start fail2ban
```

**⚠️ Important**: Only disable fail2ban temporarily for testing. Re-enable it immediately after diagnosis.

---

### 4.5 Adjust Fail2ban Rules

**Purpose**: Make fail2ban less aggressive if it's blocking legitimate traffic.

**Steps**:

1. **Edit fail2ban jail configuration**:

   ```bash
   sudo nano /etc/fail2ban/jail.local
   ```

2. **Add your local network to ignoreip**:

   ```ini
   [DEFAULT]
   ignoreip = 127.0.0.1/8 ::1 192.168.1.0/24 192.168.68.0/24
   ```

3. **Make nginx-limit-req jail more lenient**:

   ```ini
   [nginx-limit-req]
   enabled = true
   maxretry = 20        # Increase from default 5
   findtime = 600        # 10 minute window
   bantime = 1800        # 30 minute ban (instead of default 600)
   ```

4. **Reload fail2ban**:

   ```bash
   sudo fail2ban-client reload
   sudo fail2ban-client status
   ```

---

## Step 5: Diagnose Rate Limiting Issues

### 5.1 Check Backend Rate Limiting

**Purpose**: Verify rate limiting is not too aggressive.

**Commands**:

```bash
# Check backend environment variables
sudo cat /var/www/jinglero/backend/.env | grep -i rate

# Check rate limit configuration in code
grep -r "SECURITY_RATE_LIMIT" /var/www/jinglero/backend/

# Test rate limiting
for i in {1..10}; do curl -v http://localhost:3000/health; done
```

**Rate Limit Configuration**:

- `SECURITY_ENABLE_RATE_LIMIT` - Enable/disable rate limiting (default: enabled)
- `SECURITY_RATE_LIMIT_WINDOW_MS` - Time window in milliseconds (default: 60000 = 1 minute)
- `SECURITY_RATE_LIMIT_MAX` - Max requests per window (default: 600)

**If rate limiting is too aggressive**:

1. **Edit backend .env file**:

   ```bash
   sudo nano /var/www/jinglero/backend/.env
   ```

2. **Adjust rate limit settings**:

   ```bash
   # Increase max requests
   SECURITY_RATE_LIMIT_MAX=1200

   # Increase time window
   SECURITY_RATE_LIMIT_WINDOW_MS=120000

   # Or disable temporarily for testing
   SECURITY_ENABLE_RATE_LIMIT=false
   ```

3. **Restart backend service**:

   ```bash
   sudo systemctl restart jinglero-backend.service
   ```

---

### 5.2 Check Nginx Rate Limiting

**Purpose**: Verify nginx rate limiting (if configured) is not blocking traffic.

**Commands**:

```bash
# Check nginx configuration for rate limiting
sudo grep -r "limit_req" /etc/nginx/

# Check nginx error logs for rate limit messages
sudo grep -i "limiting requests" /var/log/nginx/error.log | tail -50
```

**If nginx rate limiting is too aggressive**:

1. **Edit nginx configuration**:

   ```bash
   sudo nano /etc/nginx/sites-available/jinglero
   ```

2. **Adjust rate limit settings** (if present):

   ```nginx
   # Increase rate limit zone
   limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

   # Use in location blocks
   location / {
       limit_req zone=general burst=50 nodelay;
       # ... rest of config
   }
   ```

3. **Test and reload nginx**:

   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## Step 6: Diagnose Bot Attacks

### 6.1 Identify Bot Traffic Patterns

**Purpose**: Understand if the site is under attack and what type.

**Commands**:

```bash
# Find top attacking IPs
sudo tail -10000 /var/log/nginx/access.log | \
  awk '{print $1}' | sort | uniq -c | sort -rn | head -20

# Find most probed paths
sudo tail -10000 /var/log/nginx/access.log | \
  awk '{print $7}' | sort | uniq -c | sort -rn | head -20

# Find suspicious user agents
sudo tail -10000 /var/log/nginx/access.log | \
  awk -F'"' '{print $6}' | sort | uniq -c | sort -rn | head -20

# Find requests to admin endpoints from external IPs
sudo tail -10000 /var/log/nginx/access.log | \
  grep -E "(/admin|/api/admin)" | \
  awk '{print $1, $7}' | sort | uniq -c | sort -rn

# Find scanner probes
sudo tail -10000 /var/log/nginx/access.log | \
  grep -E "(\.env|\.git|wp-admin|phpmyadmin)" | \
  awk '{print $1, $7}' | sort | uniq -c | sort -rn
```

**What to Look For**:

- ⚠️ Single IP making hundreds/thousands of requests
- ⚠️ Many requests to `/admin`, `/api/admin` from external IPs
- ⚠️ Requests to `/.env`, `/.git`, `wp-admin`, etc. (scanner probes)
- ⚠️ Suspicious user agents (scanners, bots)

---

### 6.2 Check if Bot Traffic Triggered Fail2ban

**Purpose**: Understand if aggressive bot traffic caused fail2ban to ban IPs.

**Commands**:

```bash
# Check fail2ban log for recent bans
sudo grep "Ban" /var/log/fail2ban.log | tail -50

# Cross-reference banned IPs with access logs
BANNED_IP="1.2.3.4"
sudo grep "$BANNED_IP" /var/log/nginx/access.log | tail -50

# Count requests from banned IP before ban
sudo grep "$BANNED_IP" /var/log/nginx/access.log | wc -l
```

**Analysis**:

- If banned IP made many requests → Legitimate ban (bot/scanner)
- If banned IP made few requests → False positive (too aggressive rules)
- If your IP is banned → Need to whitelist or adjust rules

---

### 6.3 Mitigate Bot Attacks

**Purpose**: Reduce impact of bot attacks without blocking legitimate traffic.

**Options**:

1. **Whitelist Your IPs in Fail2ban**:

   ```bash
   sudo nano /etc/fail2ban/jail.local
   ```

   Add to `[DEFAULT]` section:

   ```ini
   ignoreip = 127.0.0.1/8 ::1 192.168.1.0/24 192.168.68.0/24 YOUR_PUBLIC_IP
   ```

2. **Increase Fail2ban Thresholds** (make it less sensitive):

   ```ini
   [nginx-limit-req]
   maxretry = 20        # Ban after 20 failures (instead of 5)
   findtime = 600       # Count failures in 10 minute window
   bantime = 3600       # Ban for 1 hour
   ```

3. **Use Cloudflare** (if available):

   - Provides DDoS protection
   - Hides your real IP
   - Filters bot traffic before it reaches your server

4. **Block Known Bad IPs at Firewall Level**:

   ```bash
   # Block specific IP
   sudo ufw deny from 1.2.3.4

   # Block IP range
   sudo ufw deny from 1.2.3.0/24
   ```

---

## Step 7: Test Website Accessibility

### 7.1 Test from Local Network

**Purpose**: Verify website works from local network.

**Commands**:

```bash
# Get Raspberry Pi local IP
hostname -I

# Test from Raspberry Pi itself
curl http://localhost/
curl http://localhost/api/health

# Test from another device on local network
# (run from your computer)
curl http://<raspberry-pi-local-ip>/
curl http://<raspberry-pi-local-ip>/api/health
```

**Expected Results**:

- ✅ Should return HTML content for frontend
- ✅ Should return `{"status":"ok"}` for health check
- ✅ Should work without errors

---

### 7.2 Test from External Network

**Purpose**: Verify website is accessible from internet.

**Steps**:

1. **Use mobile data** (not WiFi) or ask someone on different network

2. **Test via public IP**:

   ```bash
   curl http://<your-public-ip>/
   curl http://<your-public-ip>/api/health
   ```

3. **Test via domain**:

   ```bash
   curl http://jinglero.duckdns.org/
   curl http://jinglero.duckdns.org/api/health
   ```

4. **Test HTTPS** (if configured):

   ```bash
   curl https://jinglero.duckdns.org/
   curl -k https://jinglero.duckdns.org/api/health
   ```

**Expected Results**:

- ✅ Should return HTML content
- ✅ Should return health check response
- ✅ HTTPS should work without certificate errors

**If external access fails but local works**:

- Check port forwarding (Step 2.2)
- Check firewall (Step 2.1)
- Check fail2ban (Step 4)
- Check DNS (Step 2.3)

---

### 7.3 Test Admin Routes (Should Be Blocked Externally)

**Purpose**: Verify admin routes are properly restricted.

**Commands**:

```bash
# Test from external network (should be blocked)
curl http://<your-domain>/admin
curl http://<your-domain>/api/admin/status

# Test from local network (should work)
curl http://<raspberry-pi-local-ip>/admin
curl http://<raspberry-pi-local-ip>/api/admin/status
```

**Expected Results**:

- ✅ External access should return 403 Forbidden
- ✅ Local access should work (if authenticated)

---

## Step 8: Common Fixes

### 8.1 Website Not Accessible - Quick Fixes

**Scenario 1: Services Not Running**

```bash
# Start all services
sudo systemctl start nginx
sudo systemctl start jinglero-backend.service
sudo systemctl start fail2ban

# Verify
sudo systemctl status nginx
sudo systemctl status jinglero-backend.service
```

**Scenario 2: Your IP Banned by Fail2ban**

```bash
# Find your IP
curl ifconfig.me

# Unban your IP
YOUR_IP=$(curl -s ifconfig.me)
sudo fail2ban-client unban $YOUR_IP

# Add to whitelist
sudo nano /etc/fail2ban/jail.local
# Add to ignoreip: YOUR_IP
sudo fail2ban-client reload
```

**Scenario 3: Rate Limiting Too Aggressive**

```bash
# Temporarily disable backend rate limiting
sudo nano /var/www/jinglero/backend/.env
# Add: SECURITY_ENABLE_RATE_LIMIT=false
sudo systemctl restart jinglero-backend.service

# Or increase limits
# SECURITY_RATE_LIMIT_MAX=1200
# SECURITY_RATE_LIMIT_WINDOW_MS=120000
```

**Scenario 4: Nginx Configuration Error**

```bash
# Test configuration
sudo nginx -t

# If errors, fix configuration
sudo nano /etc/nginx/sites-available/jinglero

# Reload nginx
sudo systemctl reload nginx
```

**Scenario 5: Firewall Blocking Traffic**

```bash
# Check firewall
sudo ufw status

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Reload
sudo ufw reload
```

---

### 8.2 Fail2ban Too Aggressive - Fix

**Steps**:

1. **Edit fail2ban configuration**:

   ```bash
   sudo nano /etc/fail2ban/jail.local
   ```

2. **Add your networks to ignoreip**:

   ```ini
   [DEFAULT]
   ignoreip = 127.0.0.1/8 ::1 192.168.1.0/24 192.168.68.0/24
   ```

3. **Increase thresholds for nginx-limit-req**:

   ```ini
   [nginx-limit-req]
   enabled = true
   maxretry = 20        # Increase from 5
   findtime = 600       # 10 minutes
   bantime = 1800       # 30 minutes (instead of 10)
   ```

4. **Reload fail2ban**:

   ```bash
   sudo fail2ban-client reload
   ```

5. **Unban all IPs** (if needed):

   ```bash
   sudo fail2ban-client set nginx-limit-req unbanall
   ```

---

### 8.3 Bot Attack - Mitigation

**If under active bot attack**:

1. **Temporarily increase fail2ban sensitivity**:

   ```ini
   [nginx-limit-req]
   maxretry = 3         # Ban faster
   findtime = 60         # 1 minute window
   bantime = 7200        # 2 hour ban
   ```

2. **Block known bad IPs at firewall**:

   ```bash
   # Find top attacking IPs
   sudo tail -10000 /var/log/nginx/access.log | \
     awk '{print $1}' | sort | uniq -c | sort -rn | head -10

   # Block them
   sudo ufw deny from <bad-ip>
   ```

3. **Consider using Cloudflare**:

   - Sign up for free Cloudflare account
   - Point DNS to Cloudflare
   - Enable DDoS protection
   - This hides your real IP and filters traffic

---

## Step 9: Monitoring and Prevention

### 9.1 Set Up Monitoring

**Purpose**: Detect issues before they become critical.

**Commands**:

```bash
# Monitor nginx access log in real-time
sudo tail -f /var/log/nginx/access.log

# Monitor fail2ban bans
sudo tail -f /var/log/fail2ban.log | grep -i ban

# Monitor service status
watch -n 5 'sudo systemctl status nginx jinglero-backend.service fail2ban'
```

**Automated Monitoring** (optional):

- Set up uptime monitoring service (UptimeRobot, Pingdom)
- Configure alerts for service failures
- Monitor disk space and system resources

---

### 9.2 Regular Maintenance

**Weekly Tasks**:

```bash
# Review fail2ban bans
sudo fail2ban-client status

# Review nginx logs for patterns
sudo tail -1000 /var/log/nginx/access.log | \
  awk '{print $1}' | sort | uniq -c | sort -rn | head -20

# Check service status
sudo systemctl status nginx jinglero-backend.service fail2ban

# Check disk space
df -h

# Update system packages
sudo apt-get update && sudo apt-get upgrade -y
```

---

## Troubleshooting Decision Tree

```
Website Not Accessible?
│
├─ Can you access locally? (curl http://localhost/)
│  │
│  ├─ NO → Check services (Step 1)
│  │   ├─ nginx running? → Start nginx
│  │   ├─ backend running? → Start backend, check logs
│  │   └─ Check nginx config: sudo nginx -t
│  │
│  └─ YES → Can you access from external network?
│      │
│      ├─ NO → Check network (Step 2)
│      │   ├─ Port forwarding correct?
│      │   ├─ Firewall blocking?
│      │   ├─ DNS correct?
│      │   └─ Check fail2ban (Step 4)
│      │       ├─ Your IP banned? → Unban
│      │       ├─ Too aggressive? → Adjust rules
│      │       └─ Many bots? → Mitigate (Step 6.3)
│      │
│      └─ YES → Check specific issues
│          ├─ Admin routes accessible externally? → Fix nginx config
│          ├─ Rate limiting issues? → Adjust limits (Step 5)
│          └─ Bot attacks? → Mitigate (Step 6.3)
```

---

## Quick Reference Commands

### Service Management

```bash
# Check all services
sudo systemctl status nginx jinglero-backend.service fail2ban

# Restart all services
sudo systemctl restart nginx
sudo systemctl restart jinglero-backend.service
sudo systemctl restart fail2ban

# View logs
sudo journalctl -u jinglero-backend.service -n 100
sudo tail -100 /var/log/nginx/error.log
sudo tail -100 /var/log/fail2ban.log
```

### Fail2ban Management

```bash
# Check status
sudo fail2ban-client status
sudo fail2ban-client status nginx-limit-req

# Unban IP
sudo fail2ban-client unban 1.2.3.4

# Reload configuration
sudo fail2ban-client reload
```

### Network Diagnostics

```bash
# Check listening ports
sudo netstat -tlnp | grep -E "(nginx|node|:80|:443|:3000)"

# Test connectivity
curl http://localhost/
curl http://localhost:3000/health
curl http://localhost/api/health

# Check public IP
curl ifconfig.me
```

### Log Analysis

```bash
# Top IPs
sudo tail -10000 /var/log/nginx/access.log | \
  awk '{print $1}' | sort | uniq -c | sort -rn | head -20

# Top paths
sudo tail -10000 /var/log/nginx/access.log | \
  awk '{print $7}' | sort | uniq -c | sort -rn | head -20

# Recent errors
sudo tail -100 /var/log/nginx/error.log
```

---

## Related Documentation

- `internet-access-setup.md` - Network and port forwarding setup
- `manual-update-process.md` - Application update procedures
- `raspberry-pi-deployment.md` - Initial deployment setup
- `docs/8_ops_security/` - Security requirements and configurations

---

## Change History

| Date       | Change Description                           | Changed By   |
| ---------- | -------------------------------------------- | ------------ |
| 2025-12-29 | Initial website diagnostic playbook creation | AI Assistant |
