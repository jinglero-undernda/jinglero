import axios, { AxiosInstance } from "axios";
import * as dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

export class AuraManager {
  private apiClient: AxiosInstance;
  private instanceId: string;
  private isResuming: boolean = false;
  private lastResumeAttempt: number = 0;
  private readonly RESUME_COOLDOWN: number;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private clientId: string;
  private clientSecret: string;
  private apiToken: string;
  private username: string;
  private password: string;
  private enabled: boolean;

  constructor() {
    // Support OAuth 2.0 Client Credentials, direct API token, or username/password
    const clientId = process.env.NEO4J_AURA_CLIENT_ID;
    const clientSecret = process.env.NEO4J_AURA_CLIENT_SECRET;
    const apiToken = process.env.NEO4J_AURA_API_TOKEN;
    const username = process.env.NEO4J_AURA_API_USERNAME;
    const password = process.env.NEO4J_AURA_API_PASSWORD;
    this.instanceId = process.env.NEO4J_AURA_INSTANCE_ID || "";

    // Check if auto-resume is enabled (default: true)
    this.enabled = process.env.NEO4J_AUTO_RESUME_ENABLED !== "false";

    // Get cooldown from env or use default
    this.RESUME_COOLDOWN = parseInt(
      process.env.NEO4J_RESUME_COOLDOWN || "60000",
      10
    );

    if (
      ((!clientId || !clientSecret) && !apiToken && (!username || !password)) ||
      !this.instanceId
    ) {
      console.warn(
        "Aura Management API credentials not configured. Auto-resume will be disabled."
      );
      this.enabled = false;
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
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);
        }
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
    if (!this.enabled) {
      return false;
    }

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
      "No routing servers available",
      "Could not perform discovery",
      "routing servers available",
      "getaddrinfo ENOTFOUND",
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
    if (!this.enabled) {
      return false;
    }

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
        `/instances/${this.instanceId}/resume`,
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
    if (!this.instanceId || !this.enabled) {
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
