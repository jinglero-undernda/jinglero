# Manual Update Process: Raspberry Pi Deployment

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-27
- **Last Validated**: not yet validated
- **Code Reference**: `backend/package.json:6-8`, `frontend/package.json:6-9`

## Overview

This document provides step-by-step instructions for manually updating the Jinglero application on Raspberry Pi 3B after code changes have been pushed to git. This is a manual process suitable for pre-MVP development.

**When to use this process:**

- After pushing code changes to git
- When you need to update the application running on Raspberry Pi
- For pre-MVP manual deployments

**Prerequisites:**

- Code changes have been committed and pushed to git
- SSH access to Raspberry Pi
- Application is already deployed (initial setup complete)
- Backend service is running as systemd service: `jinglero-backend.service`

## Update Process

### Step 1: Connect to Raspberry Pi

**Description**: Establish SSH connection to the Raspberry Pi.

**Steps**:

1. Open terminal on your local machine
2. Connect via SSH:
   ```bash
   ssh pi@<raspberry-pi-ip-address>
   ```
   Replace `<raspberry-pi-ip-address>` with your Raspberry Pi's IP address.

**Validation**:

- Verify you can connect successfully
- Verify you're in the home directory: `pwd` (should show `/home/pi`)

---

### Step 2: Navigate to Application Directory

**Description**: Navigate to the application code directory.

**Steps**:

1. Navigate to the application directory:
   ```bash
   cd /var/www/jinglero
   ```
2. Verify you're in the correct directory: `pwd` (should show `/var/www/jinglero`)

**Validation**:

- Verify directory exists: `ls -la` (should show `backend/` and `frontend/` directories)

---

### Step 3: Stop Backend Service

**Description**: Stop the backend service to prevent conflicts during update.

**Steps**:

1. Stop the backend service:
   ```bash
   sudo systemctl stop jinglero-backend.service
   ```
2. Verify service is stopped:
   ```bash
   sudo systemctl status jinglero-backend.service
   ```
   The status should show "inactive (dead)" or "stopped".

**Validation**:

- Verify service status shows stopped: `sudo systemctl status jinglero-backend.service`
- Verify no process is running on port 3000: `sudo lsof -i :3000` (should return nothing or "command not found")

**Context**:
Stopping the service ensures that:

- No file conflicts occur during git pull
- The service doesn't try to run with partially updated code
- Clean restart after update

---

### Step 4: Pull Latest Code from Git

**Description**: Pull the latest code changes from the git repository.

**Steps**:

1. Check current git status:
   ```bash
   git status
   ```
2. Check current branch:
   ```bash
   git branch
   ```
   Note: Make sure you're on the correct branch (usually `main` or `master`).
3. Pull latest changes:
   ```bash
   git pull origin <branch-name>
   ```
   Replace `<branch-name>` with your branch name (e.g., `main` or `master`).

**If you have local changes:**

- If you have uncommitted local changes, you may need to stash them first:
  ```bash
  git stash
  git pull origin <branch-name>
  git stash pop  # Only if you want to restore stashed changes
  ```

**Validation**:

- Verify git pull completed successfully (no errors)
- Check what files were updated: `git log -1 --stat`
- Verify you're on the latest commit: `git log -1`

**Troubleshooting**:

- **Merge conflicts**: If you see merge conflicts, resolve them manually or contact the team
- **Authentication issues**: Ensure your SSH keys or credentials are set up for git access
- **Network issues**: Verify internet connectivity: `ping github.com` (or your git host)

---

### Step 5: Update Backend Dependencies (if needed)

**Description**: Install or update backend dependencies if `package.json` or `package-lock.json` changed.

**Steps**:

1. Navigate to backend directory:
   ```bash
   cd /var/www/jinglero/backend
   ```
2. Check if dependencies need updating:
   ```bash
   git diff HEAD@{1} package.json package-lock.json
   ```
   Or simply check if `package-lock.json` was updated in the last pull.
3. If dependencies changed, install/update them:
   ```bash
   npm install
   ```
   This will install new dependencies or update existing ones based on `package-lock.json`.

**When to skip this step:**

- If `package.json` and `package-lock.json` were not modified in the latest pull
- If you're certain no dependencies changed

**Validation**:

- Verify `npm install` completed without errors
- Check for any warnings (they're usually okay, but review them)
- Verify `node_modules/` directory exists: `ls -la node_modules/ | head -5`

**Context**:
This step ensures that any new or updated dependencies are installed before building. Skipping this when dependencies changed can cause build failures.

---

### Step 6: Build Backend

**Description**: Compile TypeScript code to JavaScript.

**Steps**:

1. Ensure you're in the backend directory:
   ```bash
   cd /var/www/jinglero/backend
   ```
2. Build the backend:
   ```bash
   npm run build
   ```
   This compiles TypeScript files in `src/` to JavaScript in `dist/`.

**Validation**:

- Verify build completed successfully (no errors)
- Check that `dist/` directory exists: `ls -la dist/`
- Verify main entry point exists: `ls -la dist/server/index.js`
- Check for any TypeScript compilation errors in the output

**Troubleshooting**:

- **Build errors**: Review error messages and fix code issues, or contact the team
- **Missing dependencies**: Run `npm install` again
- **TypeScript errors**: Check `tsconfig.json` and ensure all dependencies are installed

**Code Reference**:

- `backend/package.json:7` (build script: `tsc`)

---

### Step 7: Update Frontend Dependencies (if needed)

**Description**: Install or update frontend dependencies if `package.json` or `package-lock.json` changed.

**Steps**:

1. Navigate to frontend directory:
   ```bash
   cd /var/www/jinglero/frontend
   ```
2. Check if dependencies need updating:
   ```bash
   git diff HEAD@{1} package.json package-lock.json
   ```
   Or check if `package-lock.json` was updated in the last pull.
3. If dependencies changed, install/update them:
   ```bash
   npm install
   ```

**When to skip this step:**

- If `package.json` and `package-lock.json` were not modified in the latest pull
- If you're certain no dependencies changed

**Validation**:

- Verify `npm install` completed without errors
- Check for any warnings
- Verify `node_modules/` directory exists: `ls -la node_modules/ | head -5`

---

### Step 8: Build Frontend

**Description**: Build the React frontend application into static files.

**Steps**:

1. Ensure you're in the frontend directory:
   ```bash
   cd /var/www/jinglero/frontend
   ```
2. Build the frontend:
   ```bash
   npm run build
   ```
   This creates optimized static files in `frontend/dist/` that nginx will serve.

**Validation**:

- Verify build completed successfully (no errors)
- Check that `dist/` directory exists: `ls -la dist/`
- Verify `index.html` exists: `ls -la dist/index.html`
- Verify `assets/` directory exists: `ls -la dist/assets/ | head -5`
- Check for any build errors in the output

**Troubleshooting**:

- **Build errors**: Review error messages, check TypeScript configuration
- **Missing dependencies**: Run `npm install` again
- **Vite build errors**: Check `vite.config.ts` and ensure all dependencies are installed
- **TypeScript errors**: See troubleshooting section in `raspberry-pi-deployment.md` for frontend build issues

**Code Reference**:

- `frontend/package.json:8` (build script: `tsc --noEmit && vite build`)

---

### Step 9: Restart Backend Service

**Description**: Start the backend service with the updated code.

**Steps**:

1. Start the backend service:
   ```bash
   sudo systemctl start jinglero-backend.service
   ```
2. Verify service started successfully:
   ```bash
   sudo systemctl status jinglero-backend.service
   ```
   The status should show "active (running)".

**Validation**:

- Verify service status shows "active (running)": `sudo systemctl status jinglero-backend.service`
- Check service logs for errors:
  ```bash
  sudo journalctl -u jinglero-backend.service -n 50 --no-pager
  ```
- Test backend API endpoint:
  ```bash
  curl http://localhost:3000/health
  ```
  Should return a successful response.
- Verify process is running: `ps aux | grep node` (should show the backend process)

**Troubleshooting**:

- **Service fails to start**: Check logs with `sudo journalctl -u jinglero-backend.service -n 100`
- **Port already in use**: Check if another process is using port 3000: `sudo lsof -i :3000`
- **Environment variable issues**: Verify `.env` file exists and has correct values
- **Database connection issues**: Check Neo4j connection in logs

**Code Reference**:

- `/etc/systemd/system/jinglero-backend.service` (systemd service file)
- `backend/src/server/index.ts:38-42` (server startup)

---

### Step 10: Reload Nginx (if frontend changed)

**Description**: Reload nginx to serve the updated frontend files.

**Steps**:

1. Test nginx configuration (important!):
   ```bash
   sudo nginx -t
   ```
   This should show "syntax is ok" and "test is successful".
2. If configuration is valid, reload nginx:
   ```bash
   sudo systemctl reload nginx
   ```
   Or restart nginx:
   ```bash
   sudo systemctl restart nginx
   ```

**When to skip this step:**

- If only backend code changed (no frontend changes)
- If nginx configuration didn't change

**Validation**:

- Verify nginx configuration test passed: `sudo nginx -t`
- Verify nginx is running: `sudo systemctl status nginx`
- Test frontend access:
  ```bash
  curl http://localhost/
  ```
  Should return HTML content.
- Test API proxy:
  ```bash
  curl http://localhost/api/health
  ```
  Should return backend health check response.

**Troubleshooting**:

- **Configuration errors**: Fix nginx configuration file: `/etc/nginx/sites-available/jinglero`
- **Permission issues**: Verify nginx can read `frontend/dist/` directory
- **Port conflicts**: Check if port 80 is available: `sudo lsof -i :80`
- **API proxy returns "Not Found" for `/api/health`**: This occurs when nginx proxies `/api/health` to `http://localhost:3000/api/health`, but the backend only has `/health` (root level) and `/api/public/health`, not `/api/health`. Fix by adding a specific location block for `/api/health` in the nginx configuration:
  ```nginx
  # Health check endpoint - map /api/health to root /health
  # This must come before the general /api block for proper matching
  location /api/health {
      proxy_pass http://localhost:3000/health;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
  }
  ```
  Place this block **before** the general `/api` location block in `/etc/nginx/sites-available/jinglero`, then test and reload: `sudo nginx -t && sudo systemctl reload nginx`

**Code Reference**:

- `/etc/nginx/sites-available/jinglero` (nginx configuration)

---

### Step 11: Verify Application is Working

**Description**: Perform final verification that the application is working correctly.

**Steps**:

1. Test backend health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```
2. Test frontend via nginx:
   ```bash
   curl http://localhost/
   ```
3. Test API proxy:
   ```bash
   curl http://localhost/api/health
   ```
4. (Optional) Test from a browser:
   - Navigate to `http://<raspberry-pi-ip-address>/`
   - Verify the application loads
   - Test a few key features

**Validation Checklist**:

- [ ] Backend service is running: `sudo systemctl status jinglero-backend.service`
- [ ] Backend health check responds: `curl http://localhost:3000/health`
- [ ] Nginx is running: `sudo systemctl status nginx`
- [ ] Frontend loads: `curl http://localhost/` returns HTML
- [ ] API proxy works: `curl http://localhost/api/health` returns backend response
- [ ] (Optional) Browser test shows application working

**Troubleshooting**:

- **Backend not responding**: Check logs: `sudo journalctl -u jinglero-backend.service -n 100`
- **Frontend not loading**: Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
- **API proxy not working**: Verify nginx configuration and backend is running

---

## Quick Reference: Complete Update Command Sequence

For experienced users, here's the complete sequence of commands:

```bash
# 1. Connect to Raspberry Pi (from local machine)
ssh pi@<raspberry-pi-ip>

# 2. Navigate to application
cd /var/www/jinglero

# 3. Stop backend service
sudo systemctl stop jinglero-backend.service

# 4. Pull latest code
git pull origin main  # or your branch name

# 5. Update backend dependencies (if needed)
cd backend
npm install  # Only if package.json changed
npm run build

# 6. Update frontend dependencies (if needed)
cd ../frontend
npm install  # Only if package.json changed
npm run build

# 7. Restart backend service
sudo systemctl start jinglero-backend.service

# 8. Reload nginx (if frontend changed)
sudo nginx -t && sudo systemctl reload nginx

# 9. Verify
sudo systemctl status jinglero-backend.service
curl http://localhost:3000/health
curl http://localhost/api/health
```

---

## Common Scenarios

### Scenario 1: Backend-only Update

If only backend code changed:

1. Stop backend: `sudo systemctl stop jinglero-backend.service`
2. Pull code: `cd /var/www/jinglero && git pull origin main`
3. Update dependencies (if needed): `cd backend && npm install`
4. Build backend: `npm run build`
5. Start backend: `sudo systemctl start jinglero-backend.service`
6. Verify: `curl http://localhost:3000/health`

**Skip**: Frontend build, nginx reload

---

### Scenario 2: Frontend-only Update

If only frontend code changed:

1. Pull code: `cd /var/www/jinglero && git pull origin main`
2. Update dependencies (if needed): `cd frontend && npm install`
3. Build frontend: `npm run build`
4. Reload nginx: `sudo nginx -t && sudo systemctl reload nginx`
5. Verify: `curl http://localhost/`

**Skip**: Backend service restart

---

### Scenario 3: Dependencies Update

If `package.json` or `package-lock.json` changed:

1. Follow full update process
2. **Important**: Run `npm install` in both `backend/` and `frontend/` directories
3. Then proceed with builds

---

### Scenario 4: Environment Variable Changes

If `.env` file needs updating:

1. Edit `.env` file: `nano /var/www/jinglero/backend/.env`
2. Make changes
3. Save file: `Ctrl+X`, `Y`, `Enter`
4. Restart backend service: `sudo systemctl restart jinglero-backend.service`
5. Verify: `sudo systemctl status jinglero-backend.service`

**Note**: `.env` file is not in git, so this is a manual step.

---

## Rollback Procedure

If something goes wrong and you need to rollback:

1. **Stop the service**:

   ```bash
   sudo systemctl stop jinglero-backend.service
   ```

2. **Revert to previous commit**:

   ```bash
   cd /var/www/jinglero
   git log --oneline -5  # Find the previous commit hash
   git reset --hard <previous-commit-hash>
   ```

3. **Rebuild and restart**:

   ```bash
   cd backend
   npm run build
   cd ../frontend
   npm run build
   sudo systemctl start jinglero-backend.service
   sudo systemctl reload nginx
   ```

4. **Verify**: Test the application

---

## Troubleshooting

### Issue: Git pull fails with "permission denied"

**Solution**:

```bash
# Check ownership
ls -la /var/www/jinglero

# Fix ownership if needed
sudo chown -R pi:pi /var/www/jinglero
```

---

### Issue: Backend service fails to start

**Solution**:

1. Check logs: `sudo journalctl -u jinglero-backend.service -n 100`
2. Verify `.env` file exists and has correct values
3. Verify `dist/server/index.js` exists: `ls -la /var/www/jinglero/backend/dist/server/index.js`
4. Test manually: `cd /var/www/jinglero/backend && node dist/server/index.js`

---

### Issue: Frontend build fails

**Solution**:

1. Check error messages in build output
2. Verify all dependencies installed: `cd frontend && npm install`
3. Check TypeScript configuration: See troubleshooting in `raspberry-pi-deployment.md`
4. Clean and rebuild:
   ```bash
   cd frontend
   rm -rf node_modules dist
   npm install
   npm run build
   ```

---

### Issue: Nginx shows 502 Bad Gateway

**Solution**:

1. Verify backend is running: `sudo systemctl status jinglero-backend.service`
2. Test backend directly: `curl http://localhost:3000/health`
3. Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify nginx configuration: `sudo nginx -t`

---

## Best Practices

1. **Always stop the service before pulling code**: Prevents file conflicts
2. **Check git status before pulling**: `git status` to see if you have local changes
3. **Verify builds succeed**: Don't restart service if build failed
4. **Test after update**: Always verify the application works
5. **Keep backups**: Consider backing up before major updates
6. **Check logs**: Review service logs after restart to catch issues early
7. **Update dependencies when needed**: Don't skip `npm install` if `package.json` changed

---

## Change History

| Date       | Change Description                                | Changed By   |
| ---------- | ------------------------------------------------- | ------------ |
| 2025-11-27 | Added troubleshooting for /api/health nginx issue | AI Assistant |
| 2025-11-27 | Initial manual update process documentation       | AI Assistant |

---

## Related Documentation

- `raspberry-pi-deployment.md` - Initial deployment setup
- `environments.md` - Environment variable configuration
- `deployment-overview.md` - High-level deployment architecture
