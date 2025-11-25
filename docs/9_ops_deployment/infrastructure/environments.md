# Environment Configuration

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-25
- **Last Validated**: not yet validated

## Overview

This document describes the environment configuration for the Jinglero application deployed on Raspberry Pi 3B. The application uses environment variables to configure runtime behavior, database connections, and optional features.

## Environment Configuration

### Production (Raspberry Pi 3B)

**Purpose**: Production environment running on Raspberry Pi 3B hardware.

**Variables**:

#### Required Environment Variables

| Variable         | Description                        | Example                                      | Code Reference                      |
| ---------------- | ---------------------------------- | -------------------------------------------- | ----------------------------------- |
| `PORT`           | Backend server port                | `3000`                                       | `backend/src/server/index.ts:11`    |
| `NEO4J_URI`      | Neo4j Aura database connection URI | `neo4j+s://your-instance.databases.neo4j.io` | `backend/src/server/db/index.ts:17` |
| `NEO4J_PASSWORD` | Neo4j database password            | `your-secure-password`                       | `backend/src/server/db/index.ts:20` |

#### Optional Environment Variables

| Variable                     | Description                                            | Default                 | Code Reference                                |
| ---------------------------- | ------------------------------------------------------ | ----------------------- | --------------------------------------------- |
| `NODE_ENV`                   | Node.js environment                                    | `production` (when set) | Used by various dependencies                  |
| `NEO4J_AURA_CLIENT_ID`       | Neo4j Aura API client ID (for auto-resume)             | Not set                 | `backend/src/server/db/aura-manager.ts:24`    |
| `NEO4J_AURA_CLIENT_SECRET`   | Neo4j Aura API client secret (for auto-resume)         | Not set                 | `backend/src/server/db/aura-manager.ts:25`    |
| `NEO4J_AURA_API_TOKEN`       | Neo4j Aura API token (alternative to client ID/secret) | Not set                 | `backend/src/server/db/aura-manager.ts:26`    |
| `NEO4J_AURA_API_USERNAME`    | Neo4j Aura API username (alternative auth)             | Not set                 | `backend/src/server/db/aura-manager.ts:27`    |
| `NEO4J_AURA_API_PASSWORD`    | Neo4j Aura API password (alternative auth)             | Not set                 | `backend/src/server/db/aura-manager.ts:28`    |
| `NEO4J_AURA_INSTANCE_ID`     | Neo4j Aura instance ID (for auto-resume)               | Not set                 | `backend/src/server/db/aura-manager.ts:29`    |
| `NEO4J_AUTO_RESUME_ENABLED`  | Enable automatic resume of paused Aura instances       | `true`                  | `backend/src/server/db/aura-manager.ts:32`    |
| `NEO4J_RESUME_RETRY_MAX`     | Maximum retry attempts for database operations         | `3`                     | `backend/src/server/db/index.ts:36`           |
| `NEO4J_RESUME_INITIAL_DELAY` | Initial delay before retry (ms)                        | `15000`                 | `backend/src/server/db/index.ts:37`           |
| `NEO4J_RESUME_COOLDOWN`      | Cooldown period between resume attempts (ms)           | `60000`                 | `backend/src/server/db/aura-manager.ts:35-37` |

**Code Reference**:

- `backend/src/server/index.ts:8` (dotenv.config())
- `backend/src/server/db/index.ts:16-38` (Neo4j configuration)
- `backend/src/server/db/aura-manager.ts:22-64` (Aura Manager configuration)

**Configuration**:

Environment variables are loaded from a `.env` file in the `backend/` directory using the `dotenv` package. The file should:

1. Be located at `/home/pi/jinglero/backend/.env`
2. Have secure file permissions: `chmod 600 .env`
3. Never be committed to version control (should be in `.gitignore`)

Example `.env` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Neo4j Aura Database Connection
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_PASSWORD=your-secure-password

# Neo4j Aura Auto-Resume (Optional)
NEO4J_AURA_CLIENT_ID=your-client-id
NEO4J_AURA_CLIENT_SECRET=your-client-secret
NEO4J_AURA_INSTANCE_ID=your-instance-id
NEO4J_AUTO_RESUME_ENABLED=true
NEO4J_RESUME_RETRY_MAX=3
NEO4J_RESUME_INITIAL_DELAY=15000
NEO4J_RESUME_COOLDOWN=60000
```

**Security Measures**:

1. **File Permissions**: `.env` file should have permissions `600` (read/write for owner only)
2. **No Version Control**: `.env` file must be in `.gitignore` and never committed
3. **Secure Passwords**: Use strong, unique passwords for database connections
4. **Environment Isolation**: Production environment variables should be separate from development
5. **Secret Management**: Consider using secret management tools for production (future enhancement)

**Validation**:

1. Verify `.env` file exists: `ls -la /home/pi/jinglero/backend/.env`
2. Verify file permissions: `ls -l /home/pi/jinglero/backend/.env` (should show `-rw-------`)
3. Verify required variables are set:
   ```bash
   cd /home/pi/jinglero/backend
   node -e "require('dotenv').config(); console.log('PORT:', process.env.PORT); console.log('NEO4J_URI:', process.env.NEO4J_URI ? 'Set' : 'Not set'); console.log('NEO4J_PASSWORD:', process.env.NEO4J_PASSWORD ? 'Set' : 'Not set');"
   ```
4. Test database connection: Start backend server and verify it connects to Neo4j
5. Verify `.env` is in `.gitignore`: `grep -q "^\.env$" .gitignore && echo "OK" || echo "Missing"`

---

### Development (Local Machine)

**Purpose**: Development environment for local development and testing.

**Variables**: Similar to production, but may use different values:

- `PORT`: May use different port (e.g., `3000`)
- `NEO4J_URI`: May point to local Neo4j instance or development Aura instance
- `NEO4J_PASSWORD`: Development database password
- `NODE_ENV`: Typically `development` or not set

**Code Reference**: Same as production environment.

**Configuration**:

Development environment uses the same `.env` file structure but with development-specific values. Developers should maintain their own `.env` file locally.

**Security Measures**:

1. Use separate development database credentials
2. Never commit `.env` files
3. Use different passwords than production

**Validation**:

1. Verify development environment variables are set correctly
2. Test local development server starts successfully
3. Verify connection to development database

---

## Environment Setup Process

### Initial Setup

1. Navigate to backend directory: `cd /home/pi/jinglero/backend`
2. Create `.env` file: `nano .env`
3. Add required environment variables (see example above)
4. Save file: `Ctrl+X`, `Y`, `Enter`
5. Set secure permissions: `chmod 600 .env`
6. Verify `.env` is in `.gitignore`: Check `backend/.gitignore` file

### Updating Environment Variables

1. Edit `.env` file: `nano /home/pi/jinglero/backend/.env`
2. Make changes to environment variables
3. Save file
4. Restart backend service: `sudo systemctl restart jinglero-backend.service`
5. Verify service started successfully: `sudo systemctl status jinglero-backend.service`

### Environment Variable Validation

Run validation script (to be created):

```bash
cd /home/pi/jinglero/backend
node -e "
require('dotenv').config();
const required = ['PORT', 'NEO4J_URI', 'NEO4J_PASSWORD'];
const missing = required.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error('Missing required variables:', missing.join(', '));
  process.exit(1);
}
console.log('All required environment variables are set');
"
```

## Security Best Practices

1. **Never commit `.env` files**: Always ensure `.env` is in `.gitignore`
2. **Use strong passwords**: Generate secure, random passwords for database connections
3. **Restrict file permissions**: `.env` files should have `600` permissions
4. **Rotate credentials**: Regularly update passwords and API keys
5. **Use separate environments**: Never use production credentials in development
6. **Monitor access**: Log and monitor access to environment configuration
7. **Backup securely**: If backing up `.env` files, encrypt them

## Troubleshooting

### Backend fails to start

- Check if `.env` file exists: `ls -la backend/.env`
- Verify required variables are set: Check environment variable validation
- Check backend logs: `sudo journalctl -u jinglero-backend.service -n 50`

### Database connection fails

- Verify `NEO4J_URI` is correct and accessible
- Verify `NEO4J_PASSWORD` is correct
- Test connection manually: Use Neo4j browser or connection test script
- Check network connectivity: `ping <neo4j-host>`

### Auto-resume not working

- Verify Aura Management API credentials are set
- Check `NEO4J_AUTO_RESUME_ENABLED` is `true`
- Verify `NEO4J_AURA_INSTANCE_ID` is correct
- Check backend logs for auto-resume attempts

## Change History

| Date       | Change Description                              | Changed By   |
| ---------- | ----------------------------------------------- | ------------ |
| 2025-11-25 | Initial environment configuration documentation | AI Assistant |
