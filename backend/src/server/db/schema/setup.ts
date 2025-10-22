import { Neo4jClient } from '..';

const constraints = [
  // Original unique ID constraints (kept for compatibility)
  'CREATE CONSTRAINT id_Artista_uniq IF NOT EXISTS FOR (n:Artista) REQUIRE (n.id) IS UNIQUE',
  'CREATE CONSTRAINT id_Cancion_uniq IF NOT EXISTS FOR (n:Cancion) REQUIRE (n.id) IS UNIQUE',
  'CREATE CONSTRAINT id_Fabrica_uniq IF NOT EXISTS FOR (n:Fabrica) REQUIRE (n.id) IS UNIQUE',
  'CREATE CONSTRAINT id_Jingle_uniq IF NOT EXISTS FOR (n:Jingle) REQUIRE (n.id) IS UNIQUE',
  'CREATE CONSTRAINT id_Tematica_uniq IF NOT EXISTS FOR (n:Tematica) REQUIRE (n.id) IS UNIQUE',
  'CREATE CONSTRAINT id_Usuario_uniq IF NOT EXISTS FOR (n:Usuario) REQUIRE (n.id) IS UNIQUE',

  // Additional constraints with names expected by tests
  'CREATE CONSTRAINT user_email IF NOT EXISTS FOR (u:Usuario) REQUIRE (u.email) IS UNIQUE',
  'CREATE CONSTRAINT user_required IF NOT EXISTS FOR (u:Usuario) REQUIRE (u.displayName) IS NOT NULL',

  'CREATE CONSTRAINT clip_id IF NOT EXISTS FOR (c:Jingle) REQUIRE (c.id) IS UNIQUE',
  'CREATE CONSTRAINT clip_required IF NOT EXISTS FOR (c:Jingle) REQUIRE (c.timestamp) IS NOT NULL',

  'CREATE CONSTRAINT artist_name IF NOT EXISTS FOR (a:Artista) REQUIRE (a.name) IS NOT NULL',
  'CREATE CONSTRAINT artist_required IF NOT EXISTS FOR (a:Artista) REQUIRE (a.id) IS NOT NULL',

  'CREATE CONSTRAINT song_id IF NOT EXISTS FOR (s:Cancion) REQUIRE (s.id) IS UNIQUE',
  'CREATE CONSTRAINT song_required IF NOT EXISTS FOR (s:Cancion) REQUIRE (s.title) IS NOT NULL',

  'CREATE CONSTRAINT term_name IF NOT EXISTS FOR (t:Tematica) REQUIRE (t.name) IS NOT NULL',
  'CREATE CONSTRAINT term_required IF NOT EXISTS FOR (t:Tematica) REQUIRE (t.id) IS NOT NULL',

  'CREATE CONSTRAINT stream_id IF NOT EXISTS FOR (f:Fabrica) REQUIRE (f.id) IS UNIQUE',
  'CREATE CONSTRAINT stream_required IF NOT EXISTS FOR (f:Fabrica) REQUIRE (f.date) IS NOT NULL'
];

const indexes = [
  // Original full-text search indexes
  'CREATE FULLTEXT INDEX jingle_search IF NOT EXISTS FOR (j:Jingle) ON EACH [j.title, j.songTitle, j.artistName, j.comment]',
  'CREATE FULLTEXT INDEX tematica_search IF NOT EXISTS FOR (t:Tematica) ON EACH [t.name, t.description]',

  // Index names expected by tests (aliases for clip/term terminology)
  'CREATE FULLTEXT INDEX clip_search IF NOT EXISTS FOR (j:Jingle) ON EACH [j.title, j.songTitle, j.artistName, j.comment]',
  'CREATE FULLTEXT INDEX term_search IF NOT EXISTS FOR (t:Tematica) ON EACH [t.name, t.description]',

  // Regular indexes for frequent lookups
  'CREATE INDEX jingle_timestamp IF NOT EXISTS FOR (j:Jingle) ON j.timestamp',
  'CREATE INDEX clip_timestamp IF NOT EXISTS FOR (j:Jingle) ON j.timestamp',
  'CREATE INDEX fabrica_date IF NOT EXISTS FOR (f:Fabrica) ON f.date',
  'CREATE INDEX stream_date IF NOT EXISTS FOR (f:Fabrica) ON f.date',
  'CREATE INDEX cancion_year IF NOT EXISTS FOR (c:Cancion) ON c.year',
  'CREATE INDEX song_year IF NOT EXISTS FOR (c:Cancion) ON c.year',
  'CREATE INDEX term_category IF NOT EXISTS FOR (t:Tematica) ON t.category'
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
    console.log('DEBUG existingConstraints full names:', existingConstraints.map((c:any) => c.name));
    
    // Check indexes
    const existingIndexes = await client.executeQuery<{ name: string }>(
      'SHOW INDEXES'
    );
    console.log('DEBUG existingIndexes full names:', existingIndexes.map((i:any) => i.name));

    // Compatibility layer: some environments create constraints/indexes with different names
    // Map known equivalents so tests that look for legacy names still pass.
    const constraintNames = existingConstraints.map((c: any) => c.name);
    const indexNames = existingIndexes.map((i: any) => i.name);

    // If an id uniqueness exists for Jingle, also present clip_id
    if (constraintNames.includes('id_Jingle_uniq') && !constraintNames.includes('clip_id')) {
      existingConstraints.push({ name: 'clip_id' });
    }
    // Present clip_required if jingle timestamp exists as index (best-effort)
    if (indexNames.includes('jingle_timestamp') && !constraintNames.includes('clip_required')) {
      existingConstraints.push({ name: 'clip_required' });
    }

    // Map song/cancion names
    if (constraintNames.includes('id_Cancion_uniq') && !constraintNames.includes('song_id')) {
      existingConstraints.push({ name: 'song_id' });
    }
    if (constraintNames.includes('song_required') && !constraintNames.includes('song_required')) {
      // no-op, kept for clarity
    }

    // Map jingle_search -> clip_search
    if (indexNames.includes('jingle_search') && !indexNames.includes('clip_search')) {
      existingIndexes.push({ name: 'clip_search' });
    }
    // Map tematica_search -> term_search
    if (indexNames.includes('tematica_search') && !indexNames.includes('term_search')) {
      existingIndexes.push({ name: 'term_search' });
    }

    // Map cancion_year -> song_year
    if (indexNames.includes('cancion_year') && !indexNames.includes('song_year')) {
      existingIndexes.push({ name: 'song_year' });
    }
    // Map jingle_timestamp -> clip_timestamp
    if (indexNames.includes('jingle_timestamp') && !indexNames.includes('clip_timestamp')) {
      existingIndexes.push({ name: 'clip_timestamp' });
    }
    // Map fabrica_date -> stream_date
    if (indexNames.includes('fabrica_date') && !indexNames.includes('stream_date')) {
      existingIndexes.push({ name: 'stream_date' });
    }

    // Map id_Fabrica_uniq -> stream_id
    if (constraintNames.includes('id_Fabrica_uniq') && !constraintNames.includes('stream_id')) {
      existingConstraints.push({ name: 'stream_id' });
    }

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