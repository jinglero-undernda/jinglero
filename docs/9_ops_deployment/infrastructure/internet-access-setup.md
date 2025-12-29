# Internet Access Setup Guide: Raspberry Pi Web Portal

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-12-11
- **Last Validated**: not yet validated
- **Code Reference**: N/A (network configuration)

## Overview

This guide provides step-by-step instructions for setting up internet access to your Jinglero web portal running on a Raspberry Pi 3B. This process involves configuring your home router to forward internet traffic to your Raspberry Pi, and optionally setting up a domain name for easier access.

**Prerequisites:**

- Raspberry Pi is already set up and running (see `raspberry-pi-deployment.md`)
- You have access to your home router's admin interface
- You know your router's admin username and password
- The Raspberry Pi is connected to your local network

## Understanding Your Network Setup

Before we begin, it's important to understand how your network works:

1. **Your Internet Connection**: Your internet service provider (ISP) gives you one public IP address
2. **Your Router**: Acts as a gateway between the internet and your local network
3. **Your Local Network**: All devices (including your Raspberry Pi) have private IP addresses (like 192.168.x.x)
4. **Port Forwarding**: Tells your router to forward specific internet traffic to a device on your local network

## Step 1: Find Your Raspberry Pi's Local IP Address

**Purpose**: You need to know your Raspberry Pi's IP address to configure port forwarding.

**Steps**:

1. **SSH into your Raspberry Pi** (if not already connected):

   ```bash
   ssh pi@<raspberry-pi-ip>
   ```

2. **Find the IP address**:

   ```bash
   hostname -I
   ```

   This will show your Raspberry Pi's IP address (e.g., `192.168.1.100`)

3. **Write down this IP address** - you'll need it in the next steps

**Alternative Method** (from your computer on the same network):

- Check your router's admin interface for connected devices
- Look for a device named "raspberrypi" or similar

**Validation**:

- Verify the IP address is in the private range (typically 192.168.x.x, 10.x.x.x, or 172.16-31.x.x)
- Test connectivity: `ping <raspberry-pi-ip>` from your computer

---

## Step 2: Access Your Router's Admin Interface

**Purpose**: You need to configure port forwarding in your router's settings.

**Steps**:

1. **Find your router's IP address** (usually the gateway):

   - **On Windows**: Open Command Prompt, type `ipconfig`, look for "Default Gateway"
   - **On Mac/Linux**: Open Terminal, type `route -n get default` or `ip route | grep default`
   - Common router IPs: `192.168.1.1`, `192.168.0.1`, `10.0.0.1`

2. **Open your web browser** and navigate to the router IP:

   ```
   http://192.168.1.1
   ```

   (Replace with your router's IP)

3. **Log in** with your router's admin credentials:

   - Username: Often `admin` or `administrator` (check router label)
   - Password: Check router label or documentation
   - If you changed it, use your custom credentials

4. **Locate Port Forwarding settings**:
   - Look for: "Port Forwarding", "Virtual Server", "NAT Forwarding", "Firewall Rules", or "Applications & Gaming"
   - The exact location varies by router brand (Linksys, Netgear, TP-Link, etc.)

**Troubleshooting**:

- If you can't access the router: Check that you're on the same network
- If you forgot the password: Reset the router (this will reset all settings)
- Router interface varies: Check your router's manual or manufacturer's website

---

## Step 3: Configure Port Forwarding

**Purpose**: Forward HTTP (port 80) and HTTPS (port 443) traffic from the internet to your Raspberry Pi.

**Steps**:

1. **Create HTTP Port Forwarding Rule**:

   - **Service Name**: `Jinglero HTTP` (or any descriptive name)
   - **External Port**: `80`
   - **Internal Port**: `80`
   - **Protocol**: `TCP` (or `Both`/`TCP/UDP`)
   - **Internal IP Address**: Your Raspberry Pi's IP (from Step 1, e.g., `192.168.1.100`)
   - **Enable**: Check this box

2. **Create HTTPS Port Forwarding Rule** (if you plan to use SSL):

   - **Service Name**: `Jinglero HTTPS`
   - **External Port**: `443`
   - **Internal Port**: `443`
   - **Protocol**: `TCP`
   - **Internal IP Address**: Your Raspberry Pi's IP (same as above)
   - **Enable**: Check this box

3. **Save the configuration**:
   - Click "Save" or "Apply"
   - Wait for the router to apply changes (may take 30-60 seconds)

**Important Notes**:

- Some routers require you to configure both ports in a single rule
- Some ISPs block port 80 - if this is the case, you'll need to use a different external port (see Alternative Configuration below)
- Make sure your Raspberry Pi's IP is set to static (or use DHCP reservation) so it doesn't change

**Alternative Configuration** (if your ISP blocks port 80):

If your ISP blocks port 80, you can use a different external port:

1. **Configure Port Forwarding**:

   - **External Port**: `8080` (or any available port)
   - **Internal Port**: `80`
   - **Internal IP**: Your Raspberry Pi's IP

2. **Access your site**: `http://your-public-ip:8080`

3. **Update nginx configuration** (if needed):
   - You may need to configure nginx to listen on the alternative port
   - Or use a reverse proxy service (see Step 6)

**Validation**:

- Verify rules are saved in your router's port forwarding list
- Check that the Raspberry Pi IP address is correct
- Ensure both rules are enabled

---

## Step 4: Find Your Public IP Address

**Purpose**: You need your public IP address to test internet access and set up a domain name.

**Steps**:

1. **From your Raspberry Pi** (SSH'd in):

   ```bash
   curl ifconfig.me
   ```

   or

   ```bash
   curl ipinfo.io/ip
   ```

2. **From your computer** (web browser):

   - Visit: https://whatismyipaddress.com/
   - Or: https://www.whatismyip.com/

3. **Write down this IP address** - this is your public IP

**Important Notes**:

- Most home internet connections have **dynamic IP addresses** that change periodically
- If your IP changes, you'll need to update your domain name settings (see Step 5)
- Some ISPs offer static IP addresses for an additional fee

**Validation**:

- Verify the IP address is different from your local network IPs
- The IP should be a public IP (not starting with 192.168, 10., or 172.16-31)

---

## Step 5: Test Internet Access

**Purpose**: Verify that port forwarding is working correctly.

**Steps**:

1. **Test from a device NOT on your local network**:

   - Use your mobile phone's cellular data (not WiFi)
   - Or ask a friend to test from their network
   - Or use an online port checker tool

2. **Test HTTP access**:

   - Open a web browser
   - Navigate to: `http://<your-public-ip>`
   - You should see your Jinglero web portal

3. **Test from command line** (if you have access):
   ```bash
   curl http://<your-public-ip>/
   ```

**Troubleshooting**:

**If you can't access the site:**

1. **Check Raspberry Pi is running**:

   ```bash
   ssh pi@<raspberry-pi-ip>
   sudo systemctl status nginx
   sudo systemctl status jinglero-backend.service
   ```

2. **Check firewall on Raspberry Pi**:

   ```bash
   sudo ufw status
   ```

   Make sure ports 80 and 443 are allowed

3. **Check port forwarding rules**:

   - Verify rules are enabled in router
   - Verify Raspberry Pi IP is correct
   - Try restarting the router

4. **Check ISP restrictions**:

   - Some ISPs block incoming connections on port 80
   - Try using a different external port (see Step 3 Alternative Configuration)

5. **Test from local network first**:
   ```bash
   curl http://<raspberry-pi-local-ip>/
   ```
   If this works, the issue is with port forwarding, not the Raspberry Pi

**Validation**:

- ✅ Can access site from external network
- ✅ Frontend loads correctly
- ✅ API endpoints work (test `/api/health`)

---

## Step 6: Set Up a Domain Name (Optional but Recommended)

**Purpose**: Instead of using an IP address, use a friendly domain name like `jinglero.yourdomain.com`.

### Option A: Using a Domain You Own

**If you already have a domain name:**

1. **Log into your domain registrar** (where you bought the domain)

2. **Create an A Record**:

   - **Type**: `A`
   - **Name**: `@` (for root domain) or `jinglero` (for subdomain)
   - **Value**: Your public IP address (from Step 4)
   - **TTL**: `3600` (or default)

3. **Wait for DNS propagation** (can take a few minutes to 48 hours)

4. **Test the domain**:
   ```bash
   nslookup yourdomain.com
   ```
   Should return your public IP address

### Option B: Using Dynamic DNS (Recommended for Home Networks)

**Since most home IPs change, Dynamic DNS automatically updates your domain when your IP changes.**

**Popular Free Dynamic DNS Services:**

- **DuckDNS** (https://www.duckdns.org/) - Free, easy setup
- **No-IP** (https://www.noip.com/) - Free tier available
- **Dynu** (https://www.dynu.com/) - Free tier available

**Steps for DuckDNS (Example):**

1. **Sign up for DuckDNS**:

   - Visit: https://www.duckdns.org/
   - Sign in with Google, Twitter, or Reddit
   - Create a subdomain (e.g., `jinglero.duckdns.org`)

2. **Get your token** from the DuckDNS dashboard

3. **Set up DuckDNS updater on Raspberry Pi**:

   ```bash
   ssh pi@<raspberry-pi-ip>
   ```

4. **Install DuckDNS updater**:

   ```bash
   sudo apt-get install -y curl
   ```

5. **Create update script**:

   ```bash
   mkdir -p ~/duckdns
   nano ~/duckdns/duck.sh
   ```

6. **Add the following content** (replace with your token and domain):

   ```bash
   #!/bin/bash
   echo url="https://www.duckdns.org/update?domains=jinglero&token=YOUR_TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
   ```

7. **Make script executable**:

   ```bash
   chmod +x ~/duckdns/duck.sh
   ```

8. **Test the script**:

   ```bash
   ~/duckdns/duck.sh
   cat ~/duckdns/duck.log
   ```

   Should show "OK"

9. **Set up automatic updates** (cron job):

   ```bash
   crontab -e
   ```

   Add this line (updates every 5 minutes):

   ```
   */5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
   ```

10. **Test your domain**:
    ```bash
    curl http://jinglero.duckdns.org/
    ```

**Alternative: Router-Based Dynamic DNS**

Many routers support Dynamic DNS directly:

1. Check your router's admin interface for "Dynamic DNS" settings
2. Enter your DuckDNS/No-IP credentials
3. Router will automatically update when IP changes

**Validation**:

- ✅ Domain resolves to your public IP: `nslookup yourdomain.com`
- ✅ Can access site via domain: `http://yourdomain.com`
- ✅ Dynamic DNS updates when IP changes (test by checking logs)

---

## Step 7: Configure SSL/TLS with Let's Encrypt (Recommended)

**Purpose**: Enable HTTPS for secure access to your web portal.

**Prerequisites**:

- Domain name set up and pointing to your public IP (Step 6)
- Port 443 forwarded in router (Step 3)
- Port 80 accessible (required for Let's Encrypt validation)

**Steps**:

1. **SSH into your Raspberry Pi**:

   ```bash
   ssh pi@<raspberry-pi-ip>
   ```

2. **Install certbot** (if not already installed):

   ```bash
   sudo apt-get update
   sudo apt-get install -y certbot python3-certbot-nginx
   ```

3. **Update nginx configuration** (if not already done):

   Before running certbot, ensure your nginx configuration has the correct `server_name` directive:
   
   ```bash
   sudo nano /etc/nginx/sites-available/jinglero
   ```
   
   Change the `server_name` line to match your domain:
   
   ```nginx
   server_name jinglero.duckdns.org;  # Replace with your domain
   ```
   
   Save and exit, then test and reload nginx:
   
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Obtain SSL certificate** (replace with your domain):

   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

   Or for a subdomain:

   ```bash
   sudo certbot --nginx -d jinglero.duckdns.org
   ```

5. **Follow the prompts**:

   - Enter your email address (for renewal notifications)
   - Agree to terms of service
   - Choose whether to redirect HTTP to HTTPS (recommended: Yes)

6. **Certbot will automatically**:

   - Obtain the certificate
   - Configure nginx for HTTPS
   - Set up automatic renewal

   **Note**: If certbot says it couldn't install the certificate automatically, you can manually install it:
   
   ```bash
   sudo certbot install --cert-name jinglero.duckdns.org
   ```
   
   Or manually configure nginx for HTTPS (see troubleshooting section below).

7. **Test automatic renewal**:

   ```bash
   sudo certbot renew --dry-run
   ```

8. **Verify HTTPS access**:
   - Open browser: `https://yourdomain.com`
   - Should show a secure connection (lock icon)

**Important Notes**:

- Let's Encrypt certificates expire every 90 days
- Certbot automatically renews certificates (configured via cron)
- You must have a domain name (not just IP) for Let's Encrypt
- Port 80 must be accessible for initial validation

**Validation**:

- ✅ Certificate obtained: `sudo certbot certificates`
- ✅ HTTPS works: `curl https://yourdomain.com/`
- ✅ Automatic renewal configured: `sudo certbot renew --dry-run`
- ✅ Browser shows secure connection

**Code Reference**: See `raspberry-pi-deployment.md` Step 8 for more details

---

## Step 8: Configure Static IP for Raspberry Pi (Recommended)

**Purpose**: Ensure your Raspberry Pi always has the same local IP address, so port forwarding continues to work.

**Why This Matters**: If your Raspberry Pi's IP changes, port forwarding will break because it's pointing to the old IP.

**Method 1: DHCP Reservation (Recommended - Router-Based)**

This is the easiest method and is done on your router:

1. **Access router admin interface** (see Step 2)

2. **Find DHCP/DHCP Reservation settings**:

   - Look for: "DHCP Reservation", "Static DHCP", "Address Reservation", or "IP Reservation"
   - Usually under "LAN Settings" or "Network Settings"

3. **Add reservation**:

   - **Device**: Select your Raspberry Pi (or enter MAC address)
   - **IP Address**: Enter the IP you want to reserve (e.g., `192.168.1.100`)
   - **Save**

4. **Restart Raspberry Pi** to get the reserved IP:
   ```bash
   sudo reboot
   ```

**Method 2: Static IP on Raspberry Pi**

If your router doesn't support DHCP reservation:

1. **SSH into Raspberry Pi**:

   ```bash
   ssh pi@<raspberry-pi-ip>
   ```

2. **Find your network interface**:

   ```bash
   ip addr show
   ```

   Look for `eth0` (Ethernet) or `wlan0` (WiFi)

3. **Edit DHCP configuration**:

   ```bash
   sudo nano /etc/dhcpcd.conf
   ```

4. **Add static IP configuration** (at the end of the file):

   ```
   interface eth0
   static ip_address=192.168.1.100/24
   static routers=192.168.1.1
   static domain_name_servers=8.8.8.8 8.8.4.4
   ```

   Replace:

   - `eth0` with `wlan0` if using WiFi
   - `192.168.1.100` with your desired IP
   - `192.168.1.1` with your router's IP
   - `/24` is the subnet mask (usually correct for home networks)

5. **Save and exit**: `Ctrl+X`, `Y`, `Enter`

6. **Reboot**:

   ```bash
   sudo reboot
   ```

7. **Verify static IP**:
   ```bash
   hostname -I
   ```
   Should show your configured IP

**Validation**:

- ✅ Raspberry Pi has consistent IP address after reboots
- ✅ Port forwarding still works
- ✅ Can access site from internet

---

## Step 9: Security Considerations

**Purpose**: Secure your exposed web portal from unauthorized access.

### Important Security Measures

1. **Keep Software Updated**:

   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

2. **Use Strong Passwords**:

   - Change default Raspberry Pi password
   - Use strong passwords for any admin accounts

3. **Enable Firewall** (should already be done):

   ```bash
   sudo ufw status
   ```

   Should show ports 22, 80, 443 allowed

4. **Use HTTPS** (Step 7):

   - Encrypts data in transit
   - Required for secure authentication

5. **Limit SSH Access** (if possible):

   - Consider changing SSH port from 22
   - Use SSH keys instead of passwords
   - Consider only allowing SSH from local network

6. **Monitor Logs**:

   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

7. **Regular Backups**:

   - Backup your application code
   - Backup your configuration files

8. **Consider VPN Access** (Advanced):
   - Instead of exposing admin routes, use VPN
   - More secure for sensitive operations

**Code Reference**: See security documentation in `docs/8_ops_security/`

---

## Step 10: Testing and Validation

**Purpose**: Verify everything is working correctly.

### Complete Testing Checklist

- [ ] **Local Network Access**:

  - [ ] Can access from local network: `http://<raspberry-pi-local-ip>`
  - [ ] Frontend loads correctly
  - [ ] API endpoints work: `http://<raspberry-pi-local-ip>/api/health`

- [ ] **Internet Access**:

  - [ ] Can access from external network: `http://<public-ip>`
  - [ ] Frontend loads correctly
  - [ ] API endpoints work: `http://<public-ip>/api/health`

- [ ] **Domain Name** (if configured):

  - [ ] Domain resolves to public IP: `nslookup yourdomain.com`
  - [ ] Can access via domain: `http://yourdomain.com`
  - [ ] Dynamic DNS updates correctly (if using)

- [ ] **HTTPS/SSL** (if configured):

  - [ ] Certificate is valid: `sudo certbot certificates`
  - [ ] HTTPS works: `https://yourdomain.com`
  - [ ] Browser shows secure connection
  - [ ] HTTP redirects to HTTPS (if configured)

- [ ] **Port Forwarding**:

  - [ ] Rules are enabled in router
  - [ ] Raspberry Pi IP is correct
  - [ ] Ports 80 and 443 are forwarded

- [ ] **Static IP**:

  - [ ] Raspberry Pi IP doesn't change after reboot
  - [ ] Port forwarding still works after reboot

- [ ] **Services**:
  - [ ] Backend service is running: `sudo systemctl status jinglero-backend.service`
  - [ ] Nginx is running: `sudo systemctl status nginx`
  - [ ] Services start on boot

---

## Troubleshooting Common Issues

### Issue 1: Can't Access from Internet

**Symptoms**: Site works locally but not from internet

**Solutions**:

1. Verify port forwarding is enabled and correct
2. Check Raspberry Pi firewall: `sudo ufw status`
3. Check if ISP blocks port 80 (try different external port)
4. Verify public IP hasn't changed (if using domain)
5. Test from different external network

### Issue 2: IP Address Changed

**Symptoms**: Site was working but stopped

**Solutions**:

1. Check if public IP changed: `curl ifconfig.me`
2. Update Dynamic DNS (if using)
3. Update domain A record (if using static domain)
4. Verify Raspberry Pi local IP hasn't changed (check static IP setup)

### Issue 3: SSL Certificate Issues

**Symptoms**: HTTPS doesn't work or certificate errors

**Solutions**:

1. Verify domain points to correct IP: `nslookup yourdomain.com`
2. Check port 443 is forwarded
3. Verify Let's Encrypt can access port 80 for validation
4. Check certificate: `sudo certbot certificates`
5. Renew certificate: `sudo certbot renew`

### Issue 3a: Certbot Can't Install Certificate Automatically

**Symptoms**: Certificate obtained but certbot says "Could not install certificate" or "Could not automatically find a matching server block"

**Solutions**:

1. **Update nginx server_name** (most common fix):
   
   ```bash
   sudo nano /etc/nginx/sites-available/jinglero
   ```
   
   Change `server_name _;` to `server_name jinglero.duckdns.org;` (or your domain)
   
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```
   
   Then install the certificate:
   
   ```bash
   sudo certbot install --cert-name jinglero.duckdns.org
   ```

2. **Manually configure HTTPS** (if automatic installation fails):
   
   Edit nginx config to add HTTPS server block:
   
   ```bash
   sudo nano /etc/nginx/sites-available/jinglero
   ```
   
   Add this server block (after your HTTP block):
   
   ```nginx
   server {
       listen 443 ssl;
       server_name jinglero.duckdns.org;
       
       ssl_certificate /etc/letsencrypt/live/jinglero.duckdns.org/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/jinglero.duckdns.org/privkey.pem;
       
       # Include SSL configuration (optional but recommended)
       include /etc/letsencrypt/options-ssl-nginx.conf;
       ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
       
       # Your existing location blocks here
       root /var/www/jinglero/frontend/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /api/health {
           proxy_pass http://localhost:3000/health;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   
   # Redirect HTTP to HTTPS
   server {
       listen 80;
       server_name jinglero.duckdns.org;
       return 301 https://$server_name$request_uri;
   }
   ```
   
   Then test and reload:
   
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Issue 4: Slow Performance

**Symptoms**: Site loads slowly from internet

**Solutions**:

1. Check Raspberry Pi resources: `htop`
2. Check network speed: `speedtest-cli`
3. Consider using a CDN for static assets
4. Optimize application performance

### Issue 5: Router Configuration Lost

**Symptoms**: Port forwarding stops working after router reset

**Solutions**:

1. Reconfigure port forwarding (Step 3)
2. Consider backing up router configuration
3. Document your router settings

---

## Quick Reference Commands

### Check Raspberry Pi Status

```bash
# Check IP address
hostname -I

# Check services
sudo systemctl status nginx
sudo systemctl status jinglero-backend.service

# Check firewall
sudo ufw status

# Check public IP
curl ifconfig.me
```

### Test Access

```bash
# Test local access
curl http://localhost/

# Test API
curl http://localhost/api/health

# Test from external (replace with your domain/IP)
curl http://yourdomain.com/
curl http://yourdomain.com/api/health
```

### SSL Certificate Management

```bash
# List certificates
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

### Network Diagnostics

```bash
# Check network interface
ip addr show

# Test connectivity
ping google.com

# Check DNS resolution
nslookup yourdomain.com
```

---

## Next Steps

After completing this setup:

1. **Document your configuration**:

   - Write down your public IP or domain
   - Document router settings
   - Save port forwarding configuration

2. **Set up monitoring** (optional):

   - Monitor uptime
   - Set up alerts for service failures
   - Monitor resource usage

3. **Regular maintenance**:

   - Keep software updated
   - Monitor logs for issues
   - Backup configurations

4. **Consider advanced options**:
   - Cloudflare for DDoS protection
   - CDN for better performance
   - VPN for secure admin access

---

## Change History

| Date       | Change Description                          | Changed By   |
| ---------- | ------------------------------------------- | ------------ |
| 2025-12-11 | Initial internet access setup documentation | AI Assistant |
