# Deployment Process: Raspberry Pi 3B Server

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-25
- **Last Validated**: not yet validated
- **Code Reference**: `backend/src/server/index.ts:1-43`, `frontend/vite.config.ts:1-44`

## Overview

This document describes the deployment process for running the Jinglero application on a Raspberry Pi 3B. The deployment includes:

- **Backend Server**: Node.js/Express/TypeScript API server
- **Frontend Application**: React/Vite application served as static files
- **Database**: Neo4j Aura (cloud-hosted, no local database required)
- **Hardware**: Raspberry Pi 3B with Raspberry Pi OS

The application is a full-stack YouTube clips curation platform ("La Usina de la Fabrica de Jingles") that requires both backend API services and frontend web interface.

## Deployment Process

### 1. Hardware Setup

**Description**: Initial setup and configuration of Raspberry Pi 3B hardware and operating system.

**Steps**:

1. Flash Raspberry Pi OS (64-bit recommended) to microSD card (minimum 16GB, Class 10)
2. Enable SSH access by creating `ssh` file in boot partition
3. Configure WiFi (if using wireless) by creating `wpa_supplicant.conf` in boot partition
4. Insert microSD card into Raspberry Pi 3B
5. Connect to power and boot the device
6. SSH into the device: `ssh pi@<raspberry-pi-ip>`
7. Update system packages: `sudo apt update && sudo apt upgrade -y`
8. Set up static IP address (optional but recommended for server deployment)

**Automation**: Manual setup required for initial hardware configuration.

**Code Reference**: N/A (hardware setup)

**Context**:
This process applies to the initial deployment of the server. The Raspberry Pi 3B provides a cost-effective, low-power server solution suitable for hosting the application. The 64-bit OS is recommended for better Node.js compatibility and performance.

**Validation**:

- Verify SSH access works
- Verify system is up to date: `uname -a`
- Verify network connectivity: `ping google.com`
- Verify disk space: `df -h` (should have at least 5GB free)

**Monitoring**:

- Monitor system temperature: `vcgencmd measure_temp`
- Monitor CPU usage: `top` or `htop`
- Monitor memory usage: `free -h`
- Monitor disk usage: `df -h`

---

### 2. Node.js Installation

**Description**: Install Node.js runtime environment on Raspberry Pi 3B.

**Steps**:

1. Install Node.js using NodeSource repository (recommended for latest LTS version):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
2. Verify Node.js installation: `node --version` (should be v20.x or later)
3. Verify npm installation: `npm --version`
4. Install build tools (required for native modules):
   ```bash
   sudo apt-get install -y build-essential python3
   ```

**Automation**: Can be scripted, but typically done once during initial setup.

**Code Reference**: N/A (system configuration)

**Context**:
Node.js is required to run the backend server. The LTS version is recommended for stability. Build tools are needed for compiling native Node.js modules that may be used by dependencies.

**Validation**:

- Verify Node.js version: `node --version` (should be v20.x or later)
- Verify npm version: `npm --version`
- Test Node.js execution: `node -e "console.log('Node.js works')"`

**Monitoring**:

- Check Node.js version periodically for security updates
- Monitor npm cache size: `npm cache verify`

---

### 3. Application Code Deployment

**Description**: Clone and set up the application codebase on the Raspberry Pi.

**Steps**:

1. Install Git if not already installed: `sudo apt-get install -y git`
2. Clone the repository:
   ```bash
   cd /home/pi
   git clone <repository-url> jinglero
   cd jinglero
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
5. Build backend TypeScript code:
   ```bash
   cd ../backend
   npm run build
   ```
6. Build frontend React application:
   ```bash
   cd ../frontend
   npm run build
   ```

**Automation**: Can be automated with deployment scripts or CI/CD pipeline.

**Code Reference**:

- `backend/package.json:6-8` (build and start scripts)
- `frontend/package.json:6-9` (build script)

**Context**:
This process sets up the application code on the server. The backend is compiled from TypeScript to JavaScript, and the frontend is built into static files for serving.

**Validation**:

- Verify backend build succeeded: Check `backend/dist/` directory exists
- Verify frontend build succeeded: Check `frontend/dist/` directory exists
- Verify no build errors in console output

**Monitoring**:

- Monitor build times for performance issues
- Check for dependency vulnerabilities: `npm audit`

---

### 4. Environment Configuration

**Description**: Configure environment variables for backend and frontend applications.

**Steps**:

1. Create backend `.env` file:
   ```bash
   cd /home/pi/jinglero/backend
   nano .env
   ```
2. Add required environment variables (see `infrastructure/environments.md` for details):
   ```
   PORT=3000
   NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
   NEO4J_PASSWORD=your-password
   NEO4J_AURA_CLIENT_ID=your-client-id (optional)
   NEO4J_AURA_CLIENT_SECRET=your-client-secret (optional)
   NEO4J_AURA_INSTANCE_ID=your-instance-id (optional)
   NEO4J_AUTO_RESUME_ENABLED=true (optional)
   ```
3. Save and exit: `Ctrl+X`, `Y`, `Enter`
4. Set appropriate file permissions: `chmod 600 .env`

**Automation**: Environment variables can be managed via configuration management tools.

**Code Reference**:

- `backend/src/server/index.ts:8` (dotenv.config())
- `backend/src/server/db/index.ts:17-20` (Neo4j environment variables)

**Context**:
Environment variables configure the application's connection to Neo4j Aura database and other runtime settings. The `.env` file should never be committed to version control.

**Validation**:

- Verify `.env` file exists: `ls -la backend/.env`
- Verify file permissions are secure: `ls -l backend/.env` (should show 600)
- Test backend can read environment variables: Start server and check logs

**Monitoring**:

- Monitor for environment variable changes
- Verify database connection on startup

---

### 5. Backend Service Setup

**Description**: Configure backend server to run as a systemd service for automatic startup and management.

**Steps**:

1. Create systemd service file:
   ```bash
   sudo nano /etc/systemd/system/jinglero-backend.service
   ```
2. Add service configuration:

   ```ini
   [Unit]
   Description=Jinglero Backend API Server
   After=network.target

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/jinglero/backend
   Environment="NODE_ENV=production"
   ExecStart=/usr/bin/node dist/server/index.js
   Restart=always
   RestartSec=10
   StandardOutput=syslog
   StandardError=syslog
   SyslogIdentifier=jinglero-backend

   [Install]
   WantedBy=multi-user.target
   ```

3. Reload systemd: `sudo systemctl daemon-reload`
4. Enable service to start on boot: `sudo systemctl enable jinglero-backend.service`
5. Start the service: `sudo systemctl start jinglero-backend.service`
6. Check service status: `sudo systemctl status jinglero-backend.service`

**Automation**: Service file can be deployed via configuration management.

**Code Reference**:

- `backend/src/server/index.ts:38-42` (server startup)
- `backend/package.json:8` (start script)

**Context**:
Running the backend as a systemd service ensures it starts automatically on boot and restarts if it crashes. This provides production-grade reliability for the API server.

**Validation**:

- Verify service is running: `sudo systemctl status jinglero-backend.service`
- Verify service starts on boot: `sudo systemctl is-enabled jinglero-backend.service`
- Test API endpoint: `curl http://localhost:3000/health`
- Check logs: `sudo journalctl -u jinglero-backend.service -f`

**Monitoring**:

- Monitor service status: `sudo systemctl status jinglero-backend.service`
- Monitor logs: `sudo journalctl -u jinglero-backend.service -n 50`
- Monitor resource usage: `systemctl status jinglero-backend.service` (shows memory/CPU)

---

### 6. Frontend Web Server Setup

**Description**: Configure web server (nginx) to serve the frontend application and proxy API requests to the backend.

**Steps**:

1. Install nginx: `sudo apt-get install -y nginx`
2. Create nginx configuration file:
   ```bash
   sudo nano /etc/nginx/sites-available/jinglero
   ```
3. Add nginx configuration:

   ```nginx
   server {
       listen 80;
       server_name _;  # Replace with domain name if available

       # Serve frontend static files
       root /home/pi/jinglero/frontend/dist;
       index index.html;

       # Frontend routes (SPA routing)
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Proxy API requests to backend
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

       # Health check endpoint
       location /health {
           proxy_pass http://localhost:3000/health;
       }
   }
   ```

4. Enable the site: `sudo ln -s /etc/nginx/sites-available/jinglero /etc/nginx/sites-enabled/`
5. Remove default site (optional): `sudo rm /etc/nginx/sites-enabled/default`
6. Test nginx configuration: `sudo nginx -t`
7. Reload nginx: `sudo systemctl reload nginx`
8. Enable nginx to start on boot: `sudo systemctl enable nginx`

**Automation**: Nginx configuration can be deployed via configuration management.

**Code Reference**:

- `frontend/vite.config.ts:24-30` (API proxy configuration for development)
- `frontend/vite.config.ts:32-43` (build configuration)

**Context**:
Nginx serves the frontend static files and proxies API requests to the backend server. This provides a single entry point (port 80) for the entire application.

**Validation**:

- Verify nginx is running: `sudo systemctl status nginx`
- Verify nginx configuration: `sudo nginx -t`
- Test frontend access: `curl http://localhost/` (should return HTML)
- Test API proxy: `curl http://localhost/api/health`
- Test from browser: Navigate to Raspberry Pi IP address

**Monitoring**:

- Monitor nginx status: `sudo systemctl status nginx`
- Monitor nginx logs: `sudo tail -f /var/log/nginx/access.log`
- Monitor error logs: `sudo tail -f /var/log/nginx/error.log`

---

### 7. Firewall Configuration

**Description**: Configure firewall to allow HTTP/HTTPS traffic while securing other ports.

**Steps**:

1. Check if ufw is installed: `sudo ufw status`
2. If not installed, install it: `sudo apt-get install -y ufw`
3. Allow SSH (important!): `sudo ufw allow 22/tcp`
4. Allow HTTP: `sudo ufw allow 80/tcp`
5. Allow HTTPS (if using SSL): `sudo ufw allow 443/tcp`
6. Enable firewall: `sudo ufw enable`
7. Verify firewall status: `sudo ufw status verbose`

**Automation**: Firewall rules can be configured via scripts or configuration management.

**Code Reference**: N/A (system configuration)

**Context**:
Firewall configuration secures the server by only allowing necessary network traffic. SSH access must be allowed before enabling the firewall to avoid being locked out.

**Validation**:

- Verify firewall is active: `sudo ufw status` (should show "Status: active")
- Verify rules are correct: `sudo ufw status verbose`
- Test HTTP access from external machine: `curl http://<raspberry-pi-ip>/`
- Test SSH access: `ssh pi@<raspberry-pi-ip>`

**Monitoring**:

- Monitor firewall logs: `sudo tail -f /var/log/ufw.log`
- Review blocked connections periodically

---

### 8. SSL/TLS Configuration (Optional but Recommended)

**Description**: Configure SSL/TLS certificate for HTTPS access using Let's Encrypt.

**Steps**:

1. Install certbot: `sudo apt-get install -y certbot python3-certbot-nginx`
2. Obtain SSL certificate (replace with your domain):
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```
3. Certbot will automatically configure nginx for HTTPS
4. Test automatic renewal: `sudo certbot renew --dry-run`
5. Certbot automatically sets up renewal via cron

**Automation**: Certbot handles automatic certificate renewal.

**Code Reference**: N/A (system configuration)

**Context**:
SSL/TLS encryption secures data transmission between clients and the server. Let's Encrypt provides free SSL certificates with automatic renewal.

**Validation**:

- Verify certificate is valid: `sudo certbot certificates`
- Test HTTPS access: `curl https://yourdomain.com/`
- Verify automatic renewal: `sudo certbot renew --dry-run`

**Monitoring**:

- Monitor certificate expiration: `sudo certbot certificates`
- Check renewal logs: `sudo tail -f /var/log/letsencrypt/letsencrypt.log`

---

## Deployment Validation Checklist

- [ ] Hardware setup complete (Raspberry Pi 3B booted and accessible)
- [ ] Node.js installed and verified (v20.x or later)
- [ ] Application code cloned and dependencies installed
- [ ] Backend built successfully (`backend/dist/` exists)
- [ ] Frontend built successfully (`frontend/dist/` exists)
- [ ] Environment variables configured (`.env` file exists with required variables)
- [ ] Backend service running (`systemctl status jinglero-backend.service`)
- [ ] Backend API accessible (`curl http://localhost:3000/health`)
- [ ] Nginx installed and configured
- [ ] Frontend accessible via nginx (`curl http://localhost/`)
- [ ] API proxy working (`curl http://localhost/api/health`)
- [ ] Firewall configured and active
- [ ] Services start on boot (backend and nginx enabled)
- [ ] SSL/TLS configured (if using HTTPS)

## Troubleshooting

### Frontend Build Errors

**Issue**: TypeScript compilation errors during `npm run build` with "Cannot find module" errors.

**Symptoms**:

- Multiple TypeScript errors like `error TS2307: Cannot find module './lib/api/client'`
- Build fails at `tsc -b` step
- All errors are module resolution issues
- Errors occur because `tsc -b` doesn't support `moduleResolution: "bundler"` required for Vite

**Root Cause**:

The build script uses `tsc -b` (TypeScript build with project references), which doesn't work with `moduleResolution: "bundler"` mode required by Vite. The solution is to use `tsc --noEmit` for type checking instead, letting Vite handle the actual build.

**Solution**:

1. **Verify TypeScript Configuration**: Ensure `tsconfig.app.json` uses bundler mode (required for Vite):

   ```json
   {
     "compilerOptions": {
       "moduleResolution": "bundler",
       "allowImportingTsExtensions": true,
       "verbatimModuleSyntax": true,
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"],
         "@lib/*": ["./src/lib/*"]
       }
     }
   }
   ```

2. **Verify Build Script**: Ensure `package.json` uses `tsc --noEmit` instead of `tsc -b`:

   ```json
   {
     "scripts": {
       "build": "tsc --noEmit && vite build"
     }
   }
   ```

3. **Verify Files Exist**: Ensure all imported files exist:

   ```bash
   cd /home/pi/jinglero/frontend
   ls -la src/lib/api/client.ts  # Should exist
   ```

4. **Clean and Rebuild**:

   ```bash
   cd /home/pi/jinglero/frontend
   rm -rf node_modules dist
   npm install
   npm run build
   ```

**Explanation**:

- `tsc --noEmit` performs type checking without emitting files, compatible with bundler mode
- `tsc -b` uses project references and doesn't support bundler mode
- Vite handles the actual build with its own bundler resolution
- This configuration works identically on local machines and Raspberry Pi

**Code Reference**:

- `frontend/tsconfig.app.json` (TypeScript configuration)
- `frontend/package.json:8` (build script)

---

## Change History

| Date       | Change Description               | Changed By   |
| ---------- | -------------------------------- | ------------ |
| 2025-11-25 | Initial deployment documentation | AI Assistant |
