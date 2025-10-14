import { Neo4jClient } from '..';

const constraints = [
  // Unique ID constraints
  'CREATE CONSTRAINT FOR (u:Usuario) REQUIRE u.id IS UNIQUE',
  'CREATE CONSTRAINT FOR (j:Jingle) REQUIRE j.id IS UNIQUE',
  'CREATE CONSTRAINT FOR (a:Artista) REQUIRE a.id IS UNIQUE',
  'CREATE CONSTRAINT FOR (c:Cancion) REQUIRE c.id IS UNIQUE',
  'CREATE CONSTRAINT FOR (f:Fabrica) REQUIRE f.id IS UNIQUE',
  'CREATE CONSTRAINT FOR (t:Tematica) REQUIRE t.id IS UNIQUE',

  // Other unique constraints
  'CREATE CONSTRAINT FOR (u:Usuario) REQUIRE u.email IS UNIQUE',
  'CREATE CONSTRAINT FOR (u:Usuario) REQUIRE (u.youtubeHandle IS NOT NULL AND u.youtubeHandle IS UNIQUE)',
  'CREATE CONSTRAINT FOR (a:Artista) REQUIRE a.name IS UNIQUE',
  'CREATE CONSTRAINT FOR (t:Tematica) REQUIRE t.name IS UNIQUE',
  'CREATE CONSTRAINT FOR (f:Fabrica) REQUIRE f.youtubeUrl IS UNIQUE',

  // Required property constraints
  'CREATE CONSTRAINT FOR (u:Usuario) REQUIRE (u.email IS NOT NULL AND u.role IS NOT NULL)',
  'CREATE CONSTRAINT FOR (j:Jingle) REQUIRE j.youtubeUrl IS NOT NULL',
  'CREATE CONSTRAINT FOR (a:Artista) REQUIRE a.name IS NOT NULL',
  'CREATE CONSTRAINT FOR (c:Cancion) REQUIRE c.title IS NOT NULL',
  'CREATE CONSTRAINT FOR (f:Fabrica) REQUIRE (f.title IS NOT NULL AND f.date IS NOT NULL AND f.youtubeUrl IS NOT NULL)',
  'CREATE CONSTRAINT FOR (t:Tematica) REQUIRE t.name IS NOT NULL'
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
      'SHOW CONSTRAINTS'
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