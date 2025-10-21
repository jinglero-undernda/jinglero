import neo4j, { Driver, Session, ManagedTransaction, Record as Neo4jRecord } from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

export class Neo4jClient {
  private driver: Driver;
  private static instance: Neo4jClient;

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

  public async executeQuery<T>(
    cypher: string,
    params: Record<string, any> = {},
    database?: string,
    isWrite: boolean = false
  ): Promise<T[]> {
    const session = this.driver.session({
      database,
      defaultAccessMode: isWrite ? 'WRITE' : 'READ'
    });
    try {
      const execute = isWrite ? session.executeWrite.bind(session) : session.executeRead.bind(session);
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
  }

  public async executeWrite(
    cypher: string,
    params: Record<string, any> = {},
    database?: string
  ): Promise<void> {
    const session = this.driver.session({ database });
    try {
      await session.executeWrite(async (tx) => {
        await tx.run(cypher, params);
      });
    } finally {
      await session.close();
    }
  }

  public async verifyConnection(): Promise<boolean> {
    const session = this.driver.session();
    try {
      await session.executeRead(async tx => {
        await tx.run('RETURN 1');
      });
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    } finally {
      await session.close();
    }
  }

  public async close(): Promise<void> {
    await this.driver.close();
  }
}

// Export a singleton instance
export const db = Neo4jClient.getInstance();