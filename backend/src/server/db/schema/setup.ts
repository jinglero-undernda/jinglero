import { Neo4jClient } from '..';

const constraints = [
  // Unique ID constraints only - matching successful import
  'CREATE CONSTRAINT id_Artista_uniq IF NOT EXISTS FOR (n:Artista) REQUIRE (n.id) IS UNIQUE',
  'CREATE CONSTRAINT id_Cancion_uniq IF NOT EXISTS FOR (n:Cancion) REQUIRE (n.id) IS UNIQUE',
  'CREATE CONSTRAINT id_Fabrica_uniq IF NOT EXISTS FOR (n:Fabrica) REQUIRE (n.id) IS UNIQUE',
  'CREATE CONSTRAINT id_Jingle_uniq IF NOT EXISTS FOR (n:Jingle) REQUIRE (n.id) IS UNIQUE',
  'CREATE CONSTRAINT id_Tematica_uniq IF NOT EXISTS FOR (n:Tematica) REQUIRE (n.id) IS UNIQUE',
  'CREATE CONSTRAINT id_Usuario_uniq IF NOT EXISTS FOR (n:Usuario) REQUIRE (n.id) IS UNIQUE'
];

const indexes = [
  // Full-text search indexes
  'CREATE FULLTEXT INDEX jingle_search IF NOT EXISTS FOR (j:Jingle) ON EACH [j.title, j.songTitle, j.artistName, j.comment]',
  'CREATE FULLTEXT INDEX tematica_search IF NOT EXISTS FOR (t:Tematica) ON EACH [t.name, t.description]',
  
  // Regular indexes for frequent lookups
  'CREATE INDEX jingle_timestamp IF NOT EXISTS FOR (j:Jingle) ON j.timestamp',
  'CREATE INDEX fabrica_date IF NOT EXISTS FOR (f:Fabrica) ON f.date',
  'CREATE INDEX cancion_year IF NOT EXISTS FOR (c:Cancion) ON c.year'
];

export async function setupSchema() {
  const client = Neo4jClient.getInstance();

  try {
    console.log('Dropping existing constraints and indexes...');
    // Get existing constraints
    const existingConstraints = await client.executeQuery<{ name: string }>(
      'SHOW CONSTRAINTS',
      {},
      undefined,
      true
    );
    
    // Drop existing constraints
    for (const constraint of existingConstraints) {
      await client.executeWrite(`DROP CONSTRAINT ${constraint.name}`);
      console.log('Dropped constraint:', constraint.name);
    }
    
    console.log('Creating new constraints...');
    // Create constraints
    for (const constraint of constraints) {
      try {
        await client.executeWrite(constraint);
        console.log('Created constraint:', constraint.split('CREATE CONSTRAINT')[1].split('FOR')[0].trim());
      } catch (err: any) {
        console.warn('Warning creating constraint:', err.message);
      }
    }

    console.log('\nCreating indexes...');
    // Create indexes
    for (const index of indexes) {
      try {
        await client.executeWrite(index);
        console.log('Created index:', index.split('CREATE')[1].split('IF')[0].trim());
      } catch (err: any) {
        console.warn('Warning creating index:', err.message);
      }
    }

    console.log('\nSchema setup completed successfully');
  } catch (error) {
    console.error('Error setting up schema:', error);
    throw error;
  }
}

export async function validateSchema() {
  const client = Neo4jClient.getInstance();

  try {
    // Check constraints
    const existingConstraints = await client.executeQuery<{ name: string }>(
      'SHOW CONSTRAINTS'
    );
    
    // Check indexes
    const existingIndexes = await client.executeQuery<{ name: string }>(
      'SHOW INDEXES'
    );

    return {
      constraints: existingConstraints,
      indexes: existingIndexes
    };
  } catch (error) {
    console.error('Error validating schema:', error);
    throw error;
  }
}

// Execute setup when this file is run directly
if (require.main === module) {
  (async () => {
    try {
      await setupSchema();
      const validation = await validateSchema();
      console.log('\nValidation Results:');
      console.log('Constraints:', validation.constraints.length);
      console.log('Indexes:', validation.indexes.length);
    } catch (error) {
      console.error('Failed to setup schema:', error);
      process.exit(1);
    }
  })();
}