import neo4j, { Driver, Session, ManagedTransaction, Record as Neo4jRecord } from 'neo4j-driver';
import * as dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Import aura-manager after dotenv is configured
import { auraManager } from './aura-manager';

export class Neo4jClient {
  private driver: Driver;
  private static instance: Neo4jClient;
  private readonly maxRetries: number;
  private readonly initialDelay: number;

  private constructor() {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    // For AuraDB, username must be 'neo4j'
    const user = 'neo4j';
    const password = process.env.NEO4J_PASSWORD;

    if (!password) {
      throw new Error('NEO4J_PASSWORD must be set in environment variables');
    }

    // Configure database options for AuraDB
    const config = {
      maxConnectionPoolSize: 100,
      connectionTimeout: 30000,
    };

    // For AuraDB, encryption is handled by the neo4j+s:// protocol
    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password), config);

    // Configure retry behavior
    this.maxRetries = parseInt(process.env.NEO4J_RESUME_RETRY_MAX || '3', 10);
    this.initialDelay = parseInt(process.env.NEO4J_RESUME_INITIAL_DELAY || '15000', 10);
  }

  public static getInstance(): Neo4jClient {
    if (!Neo4jClient.instance) {
      Neo4jClient.instance = new Neo4jClient();
    }
    return Neo4jClient.instance;
  }

  public async getSession(database?: string): Promise<Session> {
    return this.driver.session({ database });
  }

  /**
   * Executes an operation with retry logic and automatic pause detection/resume
   * Only retries on pause-related errors (with resume attempt). Other errors fail fast.
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.maxRetries,
    initialDelay: number = this.initialDelay
  ): Promise<T> {
    let lastError: any;
    let isPauseError = false;
    let resumeAttempted = false;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // Check if this is a pause-related error (only on first attempt)
        if (attempt === 0 && auraManager.isPausedError(error)) {
          isPauseError = true;
          console.log(
            "Detected paused Neo4j instance. Attempting to resume..."
          );

          const resumed = await auraManager.resumeInstance();
          resumeAttempted = true;

          if (resumed) {
            // Wait longer on first retry to allow instance to start
            const delay = initialDelay;
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          } else {
            // Resume failed, but we'll still retry a few times in case instance is starting
            console.log("Resume request failed or instance may already be starting. Will retry...");
          }
        }

        // Only retry if this is a pause-related error (with resume attempt)
        // For all other errors, fail fast to avoid constant retries
        if (isPauseError && resumeAttempted && attempt < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, attempt);
          console.log(
            `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else if (!isPauseError) {
          // Not a pause error - fail fast
          console.error(
            `Database operation failed (non-pause error): ${error?.message || error}`
          );
          throw error;
        }
      }
    }

    // If we exhausted retries for a pause error, log it
    if (isPauseError) {
      console.error(
        `Database operation failed after ${maxRetries} retries. Instance may still be starting or there may be a connection issue.`
      );
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

  public async close(): Promise<void> {
    await this.driver.close();
  }
}

// Export a singleton instance
export const db = Neo4jClient.getInstance();