import { Neo4jClient } from './src/server/db';
import dotenv from 'dotenv';

// Force reload environment variables
dotenv.config();

// Override with AuraDB settings
process.env.NEO4J_USER = 'neo4j';

async function testConnection() {
  console.log('Testing Neo4j Connection...');
  console.log('Connection details:');
  console.log('URI:', process.env.NEO4J_URI || 'Not set');
  console.log('User:', process.env.NEO4J_USER || 'Not set');
  console.log('Password:', process.env.NEO4J_PASSWORD ? `Set (length: ${process.env.NEO4J_PASSWORD.length})` : 'Not set');

  const client = Neo4jClient.getInstance();
  
  try {
    console.log('\nAttempting to connect...');
    const isConnected = await client.verifyConnection();
    
    if (isConnected) {
      console.log('\n✅ Connection successful!');
      
      // Try to get database version
      const result = await client.executeQuery<{version: string}>(
        'CALL dbms.components() YIELD name, versions RETURN versions[0] as version'
      );
      console.log('Neo4j version:', result[0]?.version);
    } else {
      console.log('\n❌ Connection failed');
    }
  } catch (error: any) {
    console.error('\n❌ Connection error:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide helpful suggestions based on error type
    if (error.code === 'Neo.ClientError.Security.Unauthorized') {
      console.log('\nTroubleshooting suggestions:');
      console.log('1. Verify your password in .env is correct');
      console.log('2. Check if the Neo4j user exists');
      console.log('3. Try connecting via Neo4j Browser to verify credentials');
    } else if (error.code?.includes('ServiceUnavailable')) {
      console.log('\nTroubleshooting suggestions:');
      console.log('1. Check if Neo4j is running');
      console.log('2. Verify the connection URL in .env is correct');
      console.log('3. Ensure no firewall is blocking the connection');
    }
  } finally {
    await client.close();
  }
}

testConnection();
