// THIS FILE IS NOW SUPERSEDED BY THE CONTENTS IN seed.yaml
// It may be used as a reference when developing the Core API Layer

import { readFileSync } from 'fs';
import { join } from 'path';
import { Neo4jClient } from '..';
import { parse } from 'csv-parse/sync';

const IMPORT_FOLDER = join(__dirname, '..', 'import');
const BATCH_SIZE = 10000;

function toLowerTrimBoolean(value: string): boolean {
  return ['1', 'true', 'yes'].includes(value.toLowerCase().trim());
}

// Node import config - order matters for relationships
const NODE_IMPORTS = [
  {
    label: 'Artista',
    file: 'node-Artista-2025-10-19.csv',
    setters: (row: any) => ({
      id: row.id,
      name: row.name,
      stageName: row.stageName,
      idUsuario: row.idUsuario,
      nationality: row.nationality,
      isArg: row.isArg ? toLowerTrimBoolean(row.isArg) : null,
      youtubeHandle: row.youtubeHandle,
      instagramHandle: row.instagramHandle,
      twitterHandle: row.twitterHandle,
      facebookProfile: row.facebookProfile,
      website: row.website,
      bio: row.bio,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    })
  },
  {
    label: 'Cancion',
    file: 'node-Cancion-2025-10-19.csv',
    setters: (row: any) => ({
      id: row.id,
      title: row.title,
      album: row.album,
      year: row.year ? parseInt(row.year.trim()) : null,
      genre: row.genre,
      youtubeMusic: row.youtubeMusic,
      lyrics: row.lyrics,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    })
  },
  {
    label: 'Fabrica',
    file: 'node-Fabrica-2025-10-19.csv',
    setters: (row: any) => ({
      id: row.id,
      title: row.title,
      date: row.date,
      youtubeUrl: row.youtubeUrl,
      visualizations: row.visualizations ? parseInt(row.visualizations.trim()) : null,
      likes: row.likes ? parseInt(row.likes.trim()) : null,
      description: row.description,
      contents: row.contents,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    })
  },
  {
    label: 'Jingle',
    file: 'node-Jingle-2025-10-19.csv',
    setters: (row: any) => ({
      id: row.id,
      youtubeUrl: row.youtubeUrl,
      timestamp: row.timestamp,
      youtubeClipUrl: row.youtubeClipUrl,
      title: row.title,
      comment: row.comment,
      lyrics: row.lyrics,
      songTitle: row.songTitle,
      artistName: row.artistName,
      genre: row.genre,
      isJinglazo: row.isJinglazo ? toLowerTrimBoolean(row.isJinglazo) : null,
      isJinglazoDelDia: row.isJinglazoDelDia ? toLowerTrimBoolean(row.isJinglazoDelDia) : null,
      isPrecario: row.isPrecario ? toLowerTrimBoolean(row.isPrecario) : null,
      isLive: row.isLive ? toLowerTrimBoolean(row.isLive) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    })
  },
  {
    label: 'Tematica',
    file: 'node-Tematica-2025-10-19.csv',
    setters: (row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    })
  },
  {
    label: 'Usuario',
    file: 'node-Usuario-2025-10-19.csv',
    setters: (row: any) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      artistId: row.artistId,
      displayName: row.displayName,
      profilePictureUrl: row.profilePictureUrl,
      twitterHandle: row.twitterHandle,
      instagramHandle: row.instagramHandle,
      facebookProfile: row.facebookProfile,
      youtubeHandle: row.youtubeHandle,
      contributionsCount: row.contributionsCount,
      createdAt: row.createdAt,
      lastLogin: row.lastLogin,
      updatedAt: row.updatedAt
    })
  }
];

// Relationship import config
const RELATIONSHIP_IMPORTS = [
  {
    type: 'APPEARS_IN',
    file: 'rel-Jingle-APPEARS_IN-Fabrica-2025-10-19.csv',
    startLabel: 'Jingle',
    endLabel: 'Fabrica',
    setters: (row: any) => ({
      order: row.order ? parseInt(row.order.trim()) : null,
      timestamp: row.timestamp
    })
  },
  {
    type: 'VERSIONA',
    file: 'rel-Jingle-VERSIONA-Cancion-2025-10-19.csv',
    startLabel: 'Jingle',
    endLabel: 'Cancion',
    setters: (row: any) => ({
      status: row.status
    })
  },
  {
    type: 'TAGGED_WITH',
    file: 'rel-Jingle-TAGGED_WITH-Tematica-2025-10-19.csv',
    startLabel: 'Jingle',
    endLabel: 'Tematica',
    setters: (row: any) => ({
      isPrimary: row.isPrimary ? toLowerTrimBoolean(row.isPrimary) : null
    })
  },
  {
    type: 'AUTOR_DE',
    file: 'rel-Artista-AUTOR_DE-Cancion-2025-10-19.csv',
    startLabel: 'Artista',
    endLabel: 'Cancion',
    setters: (row: any) => ({
      status: row.status
    })
  },
  {
    type: 'JINGLERO_DE',
    file: 'rel-Artista-JINGLERO_DE-Jingle-2025-10-19.csv',
    startLabel: 'Artista',
    endLabel: 'Jingle',
    setters: (row: any) => ({
      status: row.status
    })
  },
  {
    type: 'SOY_YO',
    file: 'rel-Usuario-SOY_YO-Artista-2025-10-19.csv',
    startLabel: 'Usuario',
    endLabel: 'Artista',
    setters: (row: any) => ({
      status: row.status,
      isVerified: row.isVerified ? toLowerTrimBoolean(row.isVerified) : null,
      verifiedBy: row.verifiedBy
    })
  },
  {
    type: 'REACCION_A',
    file: 'rel-Usuario-REACCIONA_A-Jingle-2025-10-19.csv',
    startLabel: 'Usuario',
    endLabel: 'Jingle',
    setters: (row: any) => ({
      type: row.type,
      removedAt: row.removedAt
    })
  }
];

async function importNodesFromCSV(client: Neo4jClient, config: typeof NODE_IMPORTS[0]) {
  const { label, file, setters } = config;
  const filePath = join(IMPORT_FOLDER, file);
  console.log(`Importing ${label} nodes from ${file}...`);

  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    }) as Record<string, string>[];

    // Create nodes in batches
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);

      const query = `
        UNWIND $rows as row
        MERGE (n:${label} { id: row.id })
        SET n += row.properties
      `;

      const rows = batch.map(record => ({
        id: record.id,
        properties: setters(record)
      }));

      await client.executeQuery(query, { rows }, undefined, true);
    }

    console.log(`✓ Imported ${records.length} ${label} nodes`);
  } catch (error) {
    console.error(`Error importing ${label} nodes:`, error);
    throw error;
  }
}

async function importRelationshipsFromCSV(client: Neo4jClient, config: typeof RELATIONSHIP_IMPORTS[0]) {
  const { type, file, startLabel, endLabel, setters } = config;
  const filePath = join(IMPORT_FOLDER, file);
  console.log(`Importing ${type} relationships from ${file}...`);

  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    }) as Record<string, string>[];

    // Create relationships in batches
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);

      const query = `
        UNWIND $rows as row
        MATCH (source:${startLabel} { id: row.startId })
        MATCH (target:${endLabel} { id: row.endId })
        MERGE (source)-[r:${type}]->(target)
        SET r += row.properties
      `;

      const rows = batch.map(record => ({
        startId: record[':START_ID'],
        endId: record[':END_ID'],
        properties: setters(record)
      }));

      await client.executeQuery(query, { rows }, undefined, true);
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