# Neo4j Aura Free Instance Auto-Resume Implementation Plan

## Problem Statement

Neo4j Aura Free instances automatically pause after 72 hours of inactivity. When paused, the database is unavailable and all connection attempts fail. This causes the application to break until the instance is manually resumed via the Neo4j Aura Console.

## Solution Overview

Implement an automatic detection and resume mechanism in the backend API that:

1. **Detects** when the Neo4j instance is paused by catching specific connection errors
2. **Resumes** the paused instance using the Neo4j Aura Management API
3. **Retries** database operations with exponential backoff after initiating resume
4. **Handles** edge cases and prevents infinite retry loops

## Architecture

### Components

1. **Aura Management Service** (`backend/src/server/db/aura-manager.ts`)

   - Handles communication with Neo4j Aura Management API
   - Provides methods to resume paused instances
   - Manages authentication and API requests

2. **Enhanced Neo4j Client** (`backend/src/server/db/index.ts`)

   - Wraps database operations with pause detection
   - Automatically triggers resume on pause detection
   - Implements retry logic with exponential backoff

3. **Error Detection**
   - Identifies pause-related errors from connection failures
   - Distinguishes between pause errors and other connection issues

## Implementation Details

### 1. Environment Variables

Add the following to `.env`:

```env
# Existing Neo4j connection variables
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_PASSWORD=your-password

# New Aura Management API variables
# Option 1: Use OAuth 2.0 Client Credentials (Recommended - for API Key with Client ID/Secret)
NEO4J_AURA_CLIENT_ID=your-client-id
NEO4J_AURA_CLIENT_SECRET=your-client-secret

# Option 2: Use Direct API Token (if you have a pre-generated access token)
# NEO4J_AURA_API_TOKEN=your-api-token

# Option 3: Use Username/Password (Alternative - for accounts with password)
# NEO4J_AURA_API_USERNAME=your-aura-username
# NEO4J_AURA_API_PASSWORD=your-aura-api-password

NEO4J_AURA_INSTANCE_ID=your-instance-id
```

**How to obtain these values:**

**For API Key with Client ID and Secret (Recommended):**

If you've generated an API Key in the Neo4j Aura Console, you received:

- **Client Name**: Just a label/identifier (not needed for authentication)
- **Client ID**: Use this as `NEO4J_AURA_CLIENT_ID`
- **Client Secret**: Use this as `NEO4J_AURA_CLIENT_SECRET`

**Steps:**

1. Log into [Neo4j Aura Console](https://console.neo4j.io/)
2. Navigate to your account settings → "API Access" or "API Keys"
3. Generate a new API Key
4. Copy the **Client ID** and **Client Secret** (not the Client Name)
5. Add them to your `.env` file as shown above

The system will automatically use these credentials to obtain an OAuth 2.0 access token for API requests.

**For Direct API Token (Alternative):**

If you have a pre-generated access token:

- `NEO4J_AURA_API_TOKEN`: Your access token (used directly as Bearer token)

**For Username/Password (Legacy):**

- `NEO4J_AURA_API_USERNAME`: Your Neo4j Aura account username (email)
- `NEO4J_AURA_API_PASSWORD`: Your Neo4j Aura account password

**Instance ID:**

- `NEO4J_AURA_INSTANCE_ID`: Found in the Aura Console:
  - Go to your instance details page
  - The instance ID is typically in the URL: `https://console.neo4j.io/instances/{INSTANCE_ID}`
  - Or look for "Instance ID" in the instance information panel

### 2. Aura Management Service

**File**: `backend/src/server/db/aura-manager.ts`

```typescript
import axios, { AxiosInstance } from "axios";

export class AuraManager {
  private apiClient: AxiosInstance;
  private instanceId: string;
  private isResuming: boolean = false;
  private lastResumeAttempt: number = 0;
  private readonly RESUME_COOLDOWN = 60000; // 1 minute cooldown between resume attempts
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private clientId: string;
  private clientSecret: string;
  private apiToken: string;
  private username: string;
  private password: string;

  constructor() {
    // Support OAuth 2.0 Client Credentials, direct API token, or username/password
    const clientId = process.env.NEO4J_AURA_CLIENT_ID;
    const clientSecret = process.env.NEO4J_AURA_CLIENT_SECRET;
    const apiToken = process.env.NEO4J_AURA_API_TOKEN;
    const username = process.env.NEO4J_AURA_API_USERNAME;
    const password = process.env.NEO4J_AURA_API_PASSWORD;
    this.instanceId = process.env.NEO4J_AURA_INSTANCE_ID || "";

    if ((!clientId || !clientSecret) && !apiToken && (!username || !password)) {
      console.warn(
        "Aura Management API credentials not configured. Auto-resume will be disabled."
      );
    }

    // Configure axios - authentication will be handled per-request
    this.apiClient = axios.create({
      baseURL: "https://api.neo4j.io/v1",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Store credentials for token generation
    this.clientId = clientId || "";
    this.clientSecret = clientSecret || "";
    this.apiToken = apiToken || "";
    this.username = username || "";
    this.password = password || "";
  }

  /**
   * Obtains an OAuth 2.0 access token using Client ID and Secret
   */
  private async getAccessToken(): Promise<string | null> {
    // If we have a direct API token, use it
    if (this.apiToken) {
      return this.apiToken;
    }

    // If we have a valid cached token, use it
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // If we have Client ID/Secret, get a new token
    if (this.clientId && this.clientSecret) {
      try {
        const params = new URLSearchParams();
        params.append("grant_type", "client_credentials");

        const response = await axios.post(
          "https://api.neo4j.io/oauth/token",
          params.toString(),
          {
            auth: {
              username: this.clientId,
              password: this.clientSecret,
            },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        this.accessToken = response.data.access_token;
        // Set expiry to 5 minutes before actual expiry for safety
        const expiresIn = (response.data.expires_in || 3600) - 300;
        this.tokenExpiry = Date.now() + expiresIn * 1000;

        return this.accessToken;
      } catch (error: any) {
        console.error("Failed to obtain access token:", error.message);
        return null;
      }
    }

    return null;
  }

  /**
   * Gets the appropriate authorization header for API requests
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Try to get access token (OAuth 2.0 or direct token)
    const token = await this.getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      return headers;
    }

    return headers;
  }

  /**
   * Gets axios auth config for Basic Auth (if needed)
   */
  private getAuthConfig(): { auth?: { username: string; password: string } } {
    // Only use Basic Auth if we don't have OAuth credentials
    if (!this.clientId && !this.apiToken && this.username && this.password) {
      return {
        auth: {
          username: this.username,
          password: this.password,
        },
      };
    }
    return {};
  }

  /**
   * Checks if the error indicates a paused instance
   */
  isPausedError(error: any): boolean {
    const errorMessage = error?.message || "";
    const errorCode = error?.code || "";

    // Common indicators of a paused instance
    const pausedIndicators = [
      "ServiceUnavailable",
      "Connection refused",
      "ECONNREFUSED",
      "ETIMEDOUT",
      "ENOTFOUND",
      "Failed to connect",
      "Database is unavailable",
    ];

    return pausedIndicators.some(
      (indicator) =>
        errorMessage.includes(indicator) || errorCode.includes(indicator)
    );
  }

  /**
   * Resumes a paused Neo4j Aura instance
   * @returns Promise<boolean> - true if resume was initiated successfully
   */
  async resumeInstance(): Promise<boolean> {
    // Prevent multiple simultaneous resume attempts
    if (this.isResuming) {
      console.log("Resume already in progress, skipping...");
      return false;
    }

    // Enforce cooldown period
    const now = Date.now();
    if (now - this.lastResumeAttempt < this.RESUME_COOLDOWN) {
      const remaining = Math.ceil(
        (this.RESUME_COOLDOWN - (now - this.lastResumeAttempt)) / 1000
      );
      console.log(`Resume cooldown active. Please wait ${remaining} seconds.`);
      return false;
    }

    if (!this.instanceId) {
      console.error("NEO4J_AURA_INSTANCE_ID not configured");
      return false;
    }

    this.isResuming = true;
    this.lastResumeAttempt = now;

    try {
      console.log(
        `Attempting to resume Neo4j Aura instance: ${this.instanceId}`
      );

      // Get authentication headers and config
      const headers = await this.getAuthHeaders();
      const authConfig = this.getAuthConfig();

      const response = await this.apiClient.post(
        `/instances/${this.instanceId}/actions/resume`,
        {},
        { headers, ...authConfig }
      );

      if (response.status === 202 || response.status === 200) {
        console.log("✅ Resume request accepted. Instance is resuming...");
        return true;
      } else {
        console.warn(`Unexpected response status: ${response.status}`);
        return false;
      }
    } catch (error: any) {
      console.error("Failed to resume Neo4j instance:", error.message);

      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }

      return false;
    } finally {
      // Reset flag after a delay to allow for resume processing
      setTimeout(() => {
        this.isResuming = false;
      }, 5000);
    }
  }

  /**
   * Checks the status of the instance
   */
  async getInstanceStatus(): Promise<"running" | "paused" | "unknown"> {
    if (!this.instanceId) {
      return "unknown";
    }

    try {
      // Get authentication headers and config
      const headers = await this.getAuthHeaders();
      const authConfig = this.getAuthConfig();

      const response = await this.apiClient.get(
        `/instances/${this.instanceId}`,
        { headers, ...authConfig }
      );
      const status = response.data?.status?.toLowerCase();

      if (status === "running" || status === "available") {
        return "running";
      } else if (status === "paused" || status === "sleeping") {
        return "paused";
      }

      return "unknown";
    } catch (error) {
      console.error("Failed to get instance status:", error);
      return "unknown";
    }
  }
}

export const auraManager = new AuraManager();
```

### 3. Enhanced Neo4j Client

**File**: `backend/src/server/db/index.ts` (modifications)

Add the following enhancements:

```typescript
import { auraManager } from "./aura-manager";

export class Neo4jClient {
  // ... existing code ...

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 2000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // Check if this is a pause-related error
        if (auraManager.isPausedError(error) && attempt === 0) {
          console.log(
            "Detected paused Neo4j instance. Attempting to resume..."
          );

          const resumed = await auraManager.resumeInstance();

          if (resumed) {
            // Wait longer on first retry to allow instance to start
            const delay =
              attempt === 0 ? 15000 : initialDelay * Math.pow(2, attempt);
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        // For non-pause errors or if resume failed, use normal retry logic
        if (attempt < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, attempt);
          console.log(
            `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  public async executeQuery<T>(
    cypher: string,
    params: Record<string, any> = {},
    database?: string,
    isWrite: boolean = false
  ): Promise<T[]> {
    return this.executeWithRetry(async () => {
      const session = this.driver.session({
        database,
        defaultAccessMode: isWrite ? "WRITE" : "READ",
      });
      try {
        const execute = isWrite
          ? session.executeWrite.bind(session)
          : session.executeRead.bind(session);
        const result = await execute(async (tx: ManagedTransaction) => {
          const queryResult = await tx.run(cypher, params);
          return queryResult.records.map((record: Neo4jRecord) => {
            const item: Record<string, any> = {};
            record.keys.forEach((key: PropertyKey) => {
              item[key.toString()] = record.get(key.toString());
            });
            return item as T;
          });
        });
        return result;
      } finally {
        await session.close();
      }
    });
  }

  public async executeWrite(
    cypher: string,
    params: Record<string, any> = {},
    database?: string
  ): Promise<void> {
    return this.executeWithRetry(async () => {
      const session = this.driver.session({ database });
      try {
        await session.executeWrite(async (tx) => {
          await tx.run(cypher, params);
        });
      } finally {
        await session.close();
      }
    });
  }

  public async verifyConnection(): Promise<boolean> {
    try {
      return await this.executeWithRetry(async () => {
        const session = this.driver.session();
        try {
          await session.executeRead(async (tx) => {
            await tx.run("RETURN 1");
          });
          return true;
        } finally {
          await session.close();
        }
      });
    } catch (error) {
      console.error("Database connection failed:", error);
      return false;
    }
  }
}
```

### 4. Dependencies

Add `axios` to `package.json`:

```bash
npm install axios
npm install --save-dev @types/axios
```

Or add to `package.json`:

```json
{
  "dependencies": {
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.19.21"
  }
}
```

## Error Handling Strategy

### Pause Detection

The system detects paused instances by checking for:

- `ServiceUnavailable` errors
- Connection refused/timeout errors
- Specific error codes from the Neo4j driver

### Resume Flow

1. **Detection**: First database operation fails with pause-related error
2. **Resume**: Aura Manager sends resume request to Management API
3. **Wait**: System waits 15 seconds for instance to start (first retry)
4. **Retry**: Operation retries with exponential backoff (2s, 4s, 8s)
5. **Success/Failure**: Operation succeeds or fails after max retries

### Safety Mechanisms

- **Cooldown Period**: 60 seconds between resume attempts to prevent API abuse
- **Resume Flag**: Prevents multiple simultaneous resume requests
- **Max Retries**: Limits retry attempts to prevent infinite loops
- **Graceful Degradation**: If resume fails, normal error handling takes over

## Testing Strategy

### Manual Testing

1. **Simulate Paused Instance**:

   - Manually pause instance via Aura Console
   - Make an API request that queries the database
   - Verify that resume is triggered automatically
   - Confirm operation succeeds after resume

2. **Test Error Handling**:
   - Test with invalid credentials (should not trigger resume)
   - Test with network errors (should not trigger resume)
   - Test resume cooldown (should prevent rapid resume attempts)

### Unit Testing

Create tests for:

- `AuraManager.isPausedError()` - error detection logic
- `AuraManager.resumeInstance()` - resume API calls
- `Neo4jClient.executeWithRetry()` - retry logic

### Integration Testing

- Test full flow: pause → detect → resume → retry → success
- Test failure scenarios: resume fails, instance takes too long, etc.

## Monitoring and Logging

### Logging Points

- Resume attempt initiation
- Resume success/failure
- Retry attempts with delays
- Connection errors (with pause detection status)

### Metrics to Track

- Number of resume attempts
- Resume success rate
- Average time to resume
- Database operation failures

## Configuration Options

Consider adding these optional environment variables:

```env
# Optional: Customize retry behavior
NEO4J_AUTO_RESUME_ENABLED=true
NEO4J_RESUME_RETRY_MAX=3
NEO4J_RESUME_INITIAL_DELAY=15000
NEO4J_RESUME_COOLDOWN=60000
```

## Limitations and Considerations

1. **API Rate Limits**: Neo4j Aura Management API may have rate limits
2. **Resume Time**: Instance resume can take 30-60 seconds
3. **First Request**: The first request after pause will be slow (resume + retry)
4. **Credentials**: Requires Aura account credentials (not just DB credentials)
5. **Free Tier**: This solution works for Free tier, but may not be necessary for paid tiers

## Alternative Approaches

### Option 1: Scheduled Health Checks

Instead of reactive resume, implement a scheduled health check that:

- Runs every 24 hours
- Checks instance status
- Resumes if paused

**Pros**: Prevents pauses from affecting users
**Cons**: Requires background job scheduler

### Option 2: Aura CLI Integration

Use the Aura CLI instead of REST API:

- Install `aura-cli` as a dependency
- Execute CLI commands via child process
- The Aura CLI handles Google OAuth authentication automatically

**Pros**:

- Official tool, may have more features
- Handles Google OAuth login seamlessly
- May be easier to authenticate with Google accounts

**Cons**:

- Requires CLI installation on server
- Less flexible than REST API
- Requires shell access to execute commands

**Implementation Note**: If using Aura CLI, you would:

1. Install the Aura CLI: `npm install -g @neo4j/aura-cli` or use it as a local dependency
2. Authenticate once: `aura-cli login` (handles Google OAuth flow)
3. Execute resume command: `aura-cli instance resume <INSTANCE_ID>`

### Option 3: Session-Based Authentication

If the Management API doesn't support direct API tokens:

- Use a headless browser or session management library
- Authenticate via Google OAuth flow
- Extract and use session cookies/tokens for API requests

**Pros**: Works with any authentication method
**Cons**: More complex, requires maintaining sessions, may violate ToS

## Implementation Checklist

- [ ] Add environment variables to `.env.example`
- [ ] Install `axios` dependency
- [ ] Create `aura-manager.ts` service
- [ ] Enhance `Neo4jClient` with retry logic
- [ ] Update error handling in database operations
- [ ] Add logging for resume operations
- [ ] Test with manually paused instance
- [ ] Document environment variable setup
- [ ] Add unit tests for AuraManager
- [ ] Add integration tests for resume flow

## References

- [Neo4j Aura Management API Documentation](https://neo4j.com/docs/aura/api/overview/)
- [Neo4j Aura CLI Documentation](https://neo4j.com/docs/aura/aura-cli/auradb-instances/)
- [Neo4j Driver Error Handling](https://neo4j.com/docs/javascript-manual/current/error-handling/)
