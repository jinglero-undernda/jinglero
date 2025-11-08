import { Neo4jClient } from './src/server/db';
import { auraManager } from './src/server/db/aura-manager';
import * as dotenv from 'dotenv';

// Force reload environment variables
dotenv.config();

async function testAuraResume() {
  console.log('🧪 Testing Neo4j Aura Auto-Resume Functionality\n');
  
  // Test 1: Check instance status
  console.log('1. Checking instance status...');
  const status = await auraManager.getInstanceStatus();
  console.log(`   Status: ${status}\n`);

  // Test 2: Test connection
  console.log('2. Testing database connection...');
  const client = Neo4jClient.getInstance();
  
  try {
    const isConnected = await client.verifyConnection();
    
    if (isConnected) {
      console.log('   ✅ Connection successful!');
      
      // Try to get database version
      const result = await client.executeQuery<{version: string}>(
        'CALL dbms.components() YIELD name, versions RETURN versions[0] as version'
      );
      console.log(`   Neo4j version: ${result[0]?.version}\n`);
    } else {
      console.log('   ❌ Connection failed\n');
    }
  } catch (error: any) {
    console.error('   ❌ Connection error:', error.message);
    console.error('   Error code:', error.code);
    
    // Check if it's a pause error
    if (auraManager.isPausedError(error)) {
      console.log('\n   ⚠️  Paused instance detected!');
      console.log('   Attempting to resume...\n');
      
      const resumed = await auraManager.resumeInstance();
      if (resumed) {
        console.log('   ✅ Resume request sent successfully');
        console.log('   Waiting for instance to start...\n');
        
        // Wait a bit and retry
        await new Promise(resolve => setTimeout(resolve, 20000));
        
        const retryConnected = await client.verifyConnection();
        if (retryConnected) {
          console.log('   ✅ Connection successful after resume!');
        } else {
          console.log('   ⚠️  Instance may still be starting. Please wait and retry.');
        }
      } else {
        console.log('   ❌ Failed to resume instance');
      }
    }
  } finally {
    await client.close();
  }
}

testAuraResume().catch(console.error);

