import { readFileSync } from 'fs';
import { join } from 'path';
import { Neo4jClient } from '..';
import { parse } from 'csv-parse/sync';

const IMPORT_FOLDER = join(__dirname, '..', 'import');

// Node import config - order matters for relationships
const NODE_IMPORTS = [
  { 
    label: 'Usuario',
    file: 'node-Usuario-2025-10-19.csv',
    properties: ['id', 'email', 'role', 'displayName', 'profilePictureUrl', 'twitterHandle', 
                'instagramHandle', 'facebookProfile', 'youtubeHandle', 'contributionsCount', 
                'createdAt', 'lastLogin', 'updatedAt']
  },
  {
    label: 'Artista',
    file: 'node-Artista-2025-10-19.csv',
    properties: ['id', 'name', 'stageName', 'nationality', 'isArg', 'youtubeHandle',
                'instagramHandle', 'twitterHandle', 'facebookProfile', 'website', 'bio',
                'createdAt', 'updatedAt']
  },
  {
    label: 'Cancion',
    file: 'node-Cancion-2025-10-19.csv',
    properties: ['id', 'title', 'album', 'year', 'genre', 'youtubeMusic', 'lyrics',
                'createdAt', 'updatedAt']
  },
  {
    label: 'Jingle',
    file: 'node-Jingle-2025-10-19.csv',
    properties: ['id', 'youtubeUrl', 'youtubeClipUrl', 'title', 'comment', 'lyrics',
                'isJinglazo', 'isJinglazoDelDia', 'isPrecario', 'createdAt', 'updatedAt']
  },
  {
    label: 'Fabrica',
    file: 'node-Fabrica-2025-10-19.csv',
    properties: ['id', 'title', 'date', 'youtubeUrl', 'visualizations', 'likes',
                'description', 'contents', 'status', 'createdAt', 'updatedAt']
  },
  {
    label: 'Tematica',
    file: 'node-Tematica-2025-10-19.csv',
    properties: ['id', 'name', 'category', 'description', 'createdAt', 'updatedAt']
  }
];

// Relationship import config
const RELATIONSHIP_IMPORTS = [
  {
    type: 'SOY_YO',
    file: 'rel-Usuario-SOY_YO-Artista-2025-10-19.csv',
    startLabel: 'Usuario',
    endLabel: 'Artista',
    properties: ['status', 'requestedAt', 'isVerified', 'verifiedAt', 'verifiedBy']
  },
  {
    type: 'AUTOR_DE',
    file: 'rel-Artista-AUTOR_DE-Cancion-2025-10-19.csv',
    startLabel: 'Artista',
    endLabel: 'Cancion',
    properties: ['status', 'createdAt']
  },
  {
    type: 'JINGLERO_DE',
    file: 'rel-Artista-JINGLERO_DE-Jingle-2025-10-19.csv',
    startLabel: 'Artista',
    endLabel: 'Jingle',
    properties: ['status', 'createdAt']
  },
  {
    type: 'VERSIONA',
    file: 'rel-Jingle-VERSIONA-Cancion-2025-10-19.csv',
    startLabel: 'Jingle',
    endLabel: 'Cancion',
    properties: ['status', 'createdAt']
  },
  {
    type: 'APPEARS_IN',
    file: 'rel-Jingle-APPEARS_IN-Fabrica-2025-10-19.csv',
    startLabel: 'Jingle',
    endLabel: 'Fabrica',
    properties: ['order', 'timestamp']
  },
  {
    type: 'TAGGED_WITH',
    file: 'rel-Jingle-TAGGED_WITH-Tematica-2025-10-19.csv',
    startLabel: 'Jingle',
    endLabel: 'Tematica',
    properties: ['isPrimary', 'status', 'createdAt']
  },
  {
    type: 'REACCIONA_A',
    file: 'rel-Usuario-REACCIONA_A-Jingle-2025-10-19.csv',
    startLabel: 'Usuario',
    endLabel: 'Jingle',
    properties: ['type', 'createdAt', 'updatedAt', 'removedAt']
  }
];

async function importNodesFromCSV(client: Neo4jClient, config: any) {
  const { label, file, properties } = config;
  const filePath = join(IMPORT_FOLDER, file);
  console.log(`Importing ${label} nodes from ${file}...`);

  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, { 
      columns: true,
      skip_empty_lines: true
    });

    // Create nodes in batches for better performance
    const BATCH_SIZE = 1000;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      
      const query = `
        UNWIND $rows as row
        MERGE (n:${label} {id: row.id})
        SET n += row.properties
      `;

      const rows = batch.map(record => ({
        id: record.id,
        properties: Object.fromEntries(
          properties
            .filter(prop => record[prop] !== undefined && record[prop] !== '')
            .map(prop => [prop, record[prop]])
        )
      }));

      await client.executeQuery(query, { rows });
    }

    console.log(`✓ Imported ${records.length} ${label} nodes`);
  } catch (error) {
    console.error(`Error importing ${label} nodes:`, error);
    throw error;
  }
}

async function importRelationshipsFromCSV(client: Neo4jClient, config: any) {
  const { type, file, startLabel, endLabel, properties } = config;
  const filePath = join(IMPORT_FOLDER, file);
  console.log(`Importing ${type} relationships from ${file}...`);

  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, { 
      columns: true,
      skip_empty_lines: true
    });

    // Create relationships in batches
    const BATCH_SIZE = 1000;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);

      const query = `
        UNWIND $rows as row
        MATCH (start:${startLabel} {id: row.startId})
        MATCH (end:${endLabel} {id: row.endId})
        MERGE (start)-[r:${type}]->(end)
        SET r += row.properties
      `;

      const rows = batch.map(record => ({
        startId: record.startId,
        endId: record.endId,
        properties: Object.fromEntries(
          properties
            .filter(prop => record[prop] !== undefined && record[prop] !== '')
            .map(prop => [prop, record[prop]])
        )
      }));

      await client.executeQuery(query, { rows });
    }

    console.log(`✓ Imported ${records.length} ${type} relationships`);
  } catch (error) {
    console.error(`Error importing ${type} relationships:`, error);
    throw error;
  }
}

export async function seedDatabase() {
  const client = Neo4jClient.getInstance();

  try {
    console.log('Starting database seeding...');

    // First import all nodes
    for (const nodeConfig of NODE_IMPORTS) {
      await importNodesFromCSV(client, nodeConfig);
    }

    // Then import all relationships
    for (const relConfig of RELATIONSHIP_IMPORTS) {
      await importRelationshipsFromCSV(client, relConfig);
    }

    console.log('✓ Database seeding completed successfully');
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}