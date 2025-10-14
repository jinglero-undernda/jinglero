import { Neo4jClient } from '../../src/server/db';

describe('Neo4jClient', () => {
  let client: Neo4jClient;

  beforeAll(async () => {
    client = Neo4jClient.getInstance();
  });

  afterAll(async () => {
    await client.close();
  });

  it('should verify connection to database', async () => {
    const isConnected = await client.verifyConnection();
    expect(isConnected).toBe(true);
  });

  it('should execute a read query', async () => {
    const result = await client.executeQuery<{ value: number }>(
      'RETURN $value as value',
      { value: 1 }
    );
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(1);
  });

  it('should execute a write query', async () => {
    // Create a test node
    await client.executeWrite(
      'CREATE (n:TestNode { value: $value })',
      { value: 'test' }
    );

    // Verify the node was created
    const result = await client.executeQuery<{ value: string }>(
      'MATCH (n:TestNode) RETURN n.value as value'
    );
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('test');

    // Clean up
    await client.executeWrite('MATCH (n:TestNode) DELETE n');
  });
});