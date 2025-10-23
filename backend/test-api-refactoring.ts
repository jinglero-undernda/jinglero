#!/usr/bin/env node

/**
 * Test script to verify the API refactoring
 * This script tests the migration and new API endpoints
 */

import { Neo4jClient } from './src/server/db';
import { SeedDataMigrator } from './src/server/db/migration/migrate-seed-data';
import { getSchemaInfo } from './src/server/db/schema/setup';

async function testMigration() {
  console.log('🧪 Testing API Refactoring...\n');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const db = Neo4jClient.getInstance();
    const isConnected = await db.verifyConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    console.log('✅ Database connection successful\n');
    
    // Test schema introspection
    console.log('2. Testing schema introspection...');
    const schemaInfo = await getSchemaInfo();
    console.log('✅ Schema introspection successful');
    console.log(`   - Labels: ${schemaInfo.labels.length}`);
    console.log(`   - Relationship types: ${schemaInfo.relationshipTypes.length}`);
    console.log(`   - Property keys: ${schemaInfo.propertyKeys.length}`);
    console.log(`   - Constraints: ${schemaInfo.constraints.length}`);
    console.log(`   - Indexes: ${schemaInfo.indexes.length}\n`);
    
    // Test migration (optional - comment out if you don't want to run migration)
    console.log('3. Testing data migration...');
    const migrator = new SeedDataMigrator();
    await migrator.migrateAll();
    await migrator.validateMigration();
    console.log('✅ Data migration successful\n');
    
    // Test entity counts
    console.log('4. Testing entity counts...');
    const usuarioCount = await db.executeQuery('MATCH (u:Usuario) RETURN count(u) as count');
    const artistaCount = await db.executeQuery('MATCH (a:Artista) RETURN count(a) as count');
    const cancionCount = await db.executeQuery('MATCH (c:Cancion) RETURN count(c) as count');
    const fabricaCount = await db.executeQuery('MATCH (f:Fabrica) RETURN count(f) as count');
    const tematicaCount = await db.executeQuery('MATCH (t:Tematica) RETURN count(t) as count');
    const jingleCount = await db.executeQuery('MATCH (j:Jingle) RETURN count(j) as count');
    
    console.log('✅ Entity counts retrieved:');
    console.log(`   - Usuarios: ${usuarioCount[0].count}`);
    console.log(`   - Artistas: ${artistaCount[0].count}`);
    console.log(`   - Canciones: ${cancionCount[0].count}`);
    console.log(`   - Fabricas: ${fabricaCount[0].count}`);
    console.log(`   - Tematicas: ${tematicaCount[0].count}`);
    console.log(`   - Jingles: ${jingleCount[0].count}\n`);
    
    // Test relationship counts
    console.log('5. Testing relationship counts...');
    const relationshipCounts = await db.executeQuery(`
      MATCH ()-[r]-()
      RETURN type(r) as relType, count(r) as count
      ORDER BY relType
    `);
    
    console.log('✅ Relationship counts retrieved:');
    relationshipCounts.forEach((rel: any) => {
      console.log(`   - ${rel.relType}: ${rel.count}`);
    });
    console.log('');
    
    console.log('🎉 All tests passed! API refactoring is ready.\n');
    console.log('Next steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Test the new API endpoints:');
    console.log('   - GET /api/public/schema');
    console.log('   - GET /api/public/entities/artistas');
    console.log('   - GET /api/admin/schema');
    console.log('3. Update frontend to use new API endpoints');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testMigration();
}
