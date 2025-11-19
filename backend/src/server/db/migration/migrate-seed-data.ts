import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import neo4j from 'neo4j-driver';
import { Neo4jClient } from '../index';

interface SeedData {
  usuarios: any[];
  artistas: any[];
  canciones: any[];
  fabricas: any[];
  tematicas: any[];
  jingles: any[];
  relationships: {
    autor_de: any[];
    jinglero_de: any[];
    appears_in: any[];
    tagged_with: any[];
    versiona: any[];
    reacciona_a: any[];
    soy_yo: any[];
  };
}

export class SeedDataMigrator {
  private db: Neo4jClient;

  constructor() {
    this.db = Neo4jClient.getInstance();
  }

  private loadSeedData(): SeedData {
    const seedPath = path.resolve(__dirname, '../seed.yaml');
    const content = fs.readFileSync(seedPath, 'utf8');
    return yaml.load(content) as SeedData;
  }

  private async createBackup(): Promise<void> {
    const seedPath = path.resolve(__dirname, '../seed.yaml');
    const backupPath = path.resolve(__dirname, '../seed-backup.yaml');
    fs.copyFileSync(seedPath, backupPath);
    console.log('Backup created at:', backupPath);
  }

  async migrateAll(): Promise<void> {
    try {
      console.log('Starting seed data migration...');
      
      // Create backup first
      await this.createBackup();
      
      const seedData = this.loadSeedData();
      
      // Clear existing data (optional - comment out if you want to preserve existing data)
      await this.clearExistingData();
      
      // Migrate entities in order (respecting dependencies)
      await this.migrateUsuarios(seedData.usuarios);
      await this.migrateArtistas(seedData.artistas);
      await this.migrateCanciones(seedData.canciones);
      await this.migrateFabricas(seedData.fabricas);
      await this.migrateTematicas(seedData.tematicas);
      await this.migrateJingles(seedData.jingles);
      
      // Migrate relationships
      await this.migrateRelationships(seedData.relationships);
      
      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  private async clearExistingData(): Promise<void> {
    console.log('Clearing existing data...');
    
    // Delete relationships first
    await this.db.executeWrite('MATCH ()-[r]-() DELETE r');
    
    // Delete nodes
    await this.db.executeWrite('MATCH (n) DELETE n');
    
    console.log('Existing data cleared.');
  }

  private isValidDate(dateString: string): boolean {
    if (!dateString || dateString === 'TBC' || dateString === 'null') {
      return false;
    }
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  private parseDate(dateString: string): string | null {
    if (!this.isValidDate(dateString)) {
      return null;
    }
    return dateString;
  }

  private async migrateUsuarios(usuarios: any[]): Promise<void> {
    console.log(`Migrating ${usuarios.length} usuarios...`);
    
    for (const usuario of usuarios) {
      const query = `
        CREATE (u:Usuario {
          id: $id,
          email: $email,
          role: $role,
          artistId: $artistId,
          displayName: $displayName,
          profilePictureUrl: $profilePictureUrl,
          twitterHandle: $twitterHandle,
          instagramHandle: $instagramHandle,
          facebookProfile: $facebookProfile,
          youtubeHandle: $youtubeHandle,
          contributionsCount: $contributionsCount,
          createdAt: datetime($createdAt),
          lastLogin: $lastLogin,
          updatedAt: datetime($updatedAt)
        })
      `;
      
      await this.db.executeWrite(query, {
        ...usuario,
        artistId: usuario.artistId || null,
        profilePictureUrl: usuario.profilePictureUrl || null,
        twitterHandle: usuario.twitterHandle || null,
        instagramHandle: usuario.instagramHandle || null,
        facebookProfile: usuario.facebookProfile || null,
        youtubeHandle: usuario.youtubeHandle || null,
        createdAt: this.parseDate(usuario.createdAt) || new Date().toISOString(),
        lastLogin: this.parseDate(usuario.lastLogin),
        updatedAt: this.parseDate(usuario.updatedAt) || new Date().toISOString()
      });
    }
    
    console.log('Usuarios migrated successfully.');
  }

  private async migrateArtistas(artistas: any[]): Promise<void> {
    console.log(`Migrating ${artistas.length} artistas...`);
    
    for (const artista of artistas) {
      const query = `
        CREATE (a:Artista {
          id: $id,
          name: $name,
          stageName: $stageName,
          idUsuario: $idUsuario,
          nationality: $nationality,
          isArg: $isArg,
          youtubeHandle: $youtubeHandle,
          instagramHandle: $instagramHandle,
          twitterHandle: $twitterHandle,
          facebookProfile: $facebookProfile,
          website: $website,
          bio: $bio,
          createdAt: datetime($createdAt),
          updatedAt: datetime($updatedAt)
        })
      `;
      
      await this.db.executeWrite(query, {
        ...artista,
        stageName: artista.stageName || null,
        idUsuario: artista.idUsuario || null,
        nationality: artista.nationality || null,
        isArg: artista.isArg !== undefined ? artista.isArg : false,
        youtubeHandle: artista.youtubeHandle || null,
        instagramHandle: artista.instagramHandle || null,
        twitterHandle: artista.twitterHandle || null,
        facebookProfile: artista.facebookProfile || null,
        website: artista.website || null,
        bio: artista.bio || null,
        createdAt: this.parseDate(artista.createdAt) || new Date().toISOString(),
        updatedAt: this.parseDate(artista.updatedAt) || new Date().toISOString()
      });
    }
    
    console.log('Artistas migrated successfully.');
  }

  private async migrateCanciones(canciones: any[]): Promise<void> {
    console.log(`Migrating ${canciones.length} canciones...`);
    
    for (const cancion of canciones) {
      const query = `
        CREATE (c:Cancion {
          id: $id,
          title: $title,
          album: $album,
          year: $year,
          genre: $genre,
          youtubeMusic: $youtubeMusic,
          lyrics: $lyrics,
          createdAt: datetime($createdAt),
          updatedAt: datetime($updatedAt)
        })
      `;
      
      await this.db.executeWrite(query, {
        ...cancion,
        album: cancion.album || null,
        year: cancion.year || null,
        genre: cancion.genre || null,
        youtubeMusic: cancion.youtubeMusic || null,
        lyrics: cancion.lyrics || null,
        createdAt: this.parseDate(cancion.createdAt) || new Date().toISOString(),
        updatedAt: this.parseDate(cancion.updatedAt) || new Date().toISOString()
      });
    }
    
    console.log('Canciones migrated successfully.');
  }

  private async migrateFabricas(fabricas: any[]): Promise<void> {
    console.log(`Migrating ${fabricas.length} fabricas...`);
    
    for (const fabrica of fabricas) {
      const query = `
        CREATE (f:Fabrica {
          id: $id,
          title: $title,
          date: datetime($date),
          youtubeUrl: $youtubeUrl,
          visualizations: $visualizations,
          likes: $likes,
          description: $description,
          contents: $contents,
          status: $status,
          createdAt: datetime($createdAt),
          updatedAt: datetime($updatedAt)
        })
      `;
      
      await this.db.executeWrite(query, {
        ...fabrica,
        title: fabrica.title || null,
        visualizations: fabrica.visualizations || null,
        likes: fabrica.likes || null,
        description: fabrica.description || null,
        contents: fabrica.contents || null,
        status: fabrica.status || 'DRAFT',
        date: this.parseDate(fabrica.date) || new Date().toISOString(),
        createdAt: this.parseDate(fabrica.createdAt) || new Date().toISOString(),
        updatedAt: this.parseDate(fabrica.updatedAt) || new Date().toISOString()
      });
    }
    
    console.log('Fabricas migrated successfully.');
  }

  private async migrateTematicas(tematicas: any[]): Promise<void> {
    console.log(`Migrating ${tematicas.length} tematicas...`);
    
    for (const tematica of tematicas) {
      const query = `
        CREATE (t:Tematica {
          id: $id,
          name: $name,
          category: $category,
          description: $description,
          createdAt: datetime($createdAt),
          updatedAt: datetime($updatedAt)
        })
      `;
      
      await this.db.executeWrite(query, {
        ...tematica,
        category: tematica.category || 'CULTURA',
        description: tematica.description || null,
        createdAt: this.parseDate(tematica.createdAt) || new Date().toISOString(),
        updatedAt: this.parseDate(tematica.updatedAt) || new Date().toISOString()
      });
    }
    
    console.log('Tematicas migrated successfully.');
  }

  private async migrateJingles(jingles: any[]): Promise<void> {
    console.log(`Migrating ${jingles.length} jingles...`);
    
    for (const jingle of jingles) {
      const query = `
        CREATE (j:Jingle {
          id: $id,
          youtubeUrl: $youtubeUrl,
          timestamp: $timestamp,
          youtubeClipUrl: $youtubeClipUrl,
          title: $title,
          comment: $comment,
          lyrics: $lyrics,
          songTitle: $songTitle,
          artistName: $artistName,
          genre: $genre,
          isJinglazo: $isJinglazo,
          isJinglazoDelDia: $isJinglazoDelDia,
          isPrecario: $isPrecario,
          createdAt: datetime($createdAt),
          updatedAt: datetime($updatedAt)
        })
      `;
      
      await this.db.executeWrite(query, {
        ...jingle,
        youtubeUrl: jingle.youtubeUrl || null,
        youtubeClipUrl: jingle.youtubeClipUrl || null,
        title: jingle.title || null,
        comment: jingle.comment || null,
        lyrics: jingle.lyrics || null,
        songTitle: jingle.songTitle || null,
        artistName: jingle.artistName || null,
        genre: jingle.genre || null,
        isJinglazo: jingle.isJinglazo !== undefined ? jingle.isJinglazo : false,
        isJinglazoDelDia: jingle.isJinglazoDelDia !== undefined ? jingle.isJinglazoDelDia : false,
        isPrecario: jingle.isPrecario !== undefined ? jingle.isPrecario : false,
        createdAt: this.parseDate(jingle.createdAt) || new Date().toISOString(),
        updatedAt: this.parseDate(jingle.updatedAt) || new Date().toISOString()
      });
    }
    
    console.log('Jingles migrated successfully.');
  }

  private async migrateRelationships(relationships: any): Promise<void> {
    console.log('Migrating relationships...');
    
    // Migrate autor_de relationships
    if (relationships.autor_de) {
      await this.migrateAutorDeRelationships(relationships.autor_de);
    }
    
    // Migrate jinglero_de relationships
    if (relationships.jinglero_de) {
      await this.migrateJingleroDeRelationships(relationships.jinglero_de);
    }
    
    // Migrate appears_in relationships
    if (relationships.appears_in) {
      await this.migrateAppearsInRelationships(relationships.appears_in);
    }
    
    // Migrate tagged_with relationships
    if (relationships.tagged_with) {
      await this.migrateTaggedWithRelationships(relationships.tagged_with);
    }
    
    // Migrate versiona relationships
    if (relationships.versiona) {
      await this.migrateVersionaRelationships(relationships.versiona);
    }
    
    // Migrate reacciona_a relationships
    if (relationships.reacciona_a) {
      await this.migrateReaccionaARelationships(relationships.reacciona_a);
    }
    
    // Migrate soy_yo relationships
    if (relationships.soy_yo) {
      await this.migrateSoyYoRelationships(relationships.soy_yo);
    }
    
    console.log('Relationships migrated successfully.');
  }

  private async migrateAutorDeRelationships(relationships: any[]): Promise<void> {
    for (const rel of relationships) {
      const query = `
        MATCH (a:Artista { id: $start }), (c:Cancion { id: $end })
        CREATE (a)-[r:AUTOR_DE {
          status: $status,
          createdAt: datetime($createdAt)
        }]->(c)
      `;
      
      await this.db.executeWrite(query, {
        start: rel.start,
        end: rel.end,
        status: rel.status || 'DRAFT',
        createdAt: rel.createdAt || new Date().toISOString()
      });
    }
  }

  private async migrateJingleroDeRelationships(relationships: any[]): Promise<void> {
    for (const rel of relationships) {
      const query = `
        MATCH (a:Artista { id: $start }), (j:Jingle { id: $end })
        CREATE (a)-[r:JINGLERO_DE {
          status: $status,
          createdAt: datetime($createdAt)
        }]->(j)
      `;
      
      await this.db.executeWrite(query, {
        start: rel.start,
        end: rel.end,
        status: rel.status || 'DRAFT',
        createdAt: rel.createdAt || new Date().toISOString()
      });
    }
  }

  private async migrateAppearsInRelationships(relationships: any[]): Promise<void> {
    // Helper function to convert timestamp string to seconds
    const timestampToSeconds = (timestamp: string): number => {
      if (!timestamp) return 0;
      const parts = timestamp.split(':');
      if (parts.length !== 3) return 0;
      const hours = parseInt(parts[0], 10) || 0;
      const minutes = parseInt(parts[1], 10) || 0;
      const seconds = parseInt(parts[2], 10) || 0;
      return hours * 3600 + minutes * 60 + seconds;
    };
    
    for (const rel of relationships) {
      const query = `
        MATCH (j:Jingle { id: $start }), (f:Fabrica { id: $end })
        CREATE (j)-[r:APPEARS_IN {
          order: $order,
          timestamp: $timestamp
        }]->(f)
      `;
      
      // Convert timestamp string to seconds if it's a string, otherwise use as-is
      const timestamp = rel.timestamp 
        ? (typeof rel.timestamp === 'string' ? timestampToSeconds(rel.timestamp) : rel.timestamp)
        : 0;
      
      await this.db.executeWrite(query, {
        start: rel.start,
        end: rel.end,
        order: rel.order || 1,
        timestamp
      });
    }
  }

  private async migrateTaggedWithRelationships(relationships: any[]): Promise<void> {
    for (const rel of relationships) {
      const query = `
        MATCH (j:Jingle { id: $start }), (t:Tematica { id: $end })
        CREATE (j)-[r:TAGGED_WITH {
          isPrimary: $isPrimary,
          createdAt: datetime($createdAt)
        }]->(t)
      `;
      
      await this.db.executeWrite(query, {
        start: rel.start,
        end: rel.end,
        isPrimary: rel.isPrimary || false,
        createdAt: rel.createdAt || new Date().toISOString()
      });
    }
  }

  private async migrateVersionaRelationships(relationships: any[]): Promise<void> {
    for (const rel of relationships) {
      const query = `
        MATCH (j:Jingle { id: $start }), (c:Cancion { id: $end })
        CREATE (j)-[r:VERSIONA {
          status: $status,
          createdAt: datetime($createdAt)
        }]->(c)
      `;
      
      await this.db.executeWrite(query, {
        start: rel.start,
        end: rel.end,
        status: rel.status || 'DRAFT',
        createdAt: rel.createdAt || new Date().toISOString()
      });
    }
  }

  private async migrateReaccionaARelationships(relationships: any[]): Promise<void> {
    for (const rel of relationships) {
      const query = `
        MATCH (u:Usuario { id: $start }), (j:Jingle { id: $end })
        CREATE (u)-[r:REACCIONA_A {
          type: $type,
          createdAt: datetime($createdAt),
          updatedAt: datetime($updatedAt),
          removedAt: $removedAt
        }]->(j)
      `;
      
      await this.db.executeWrite(query, {
        start: rel.start,
        end: rel.end,
        type: rel.type || 'ME_GUSTA',
        createdAt: rel.createdAt || new Date().toISOString(),
        updatedAt: rel.updatedAt || new Date().toISOString(),
        removedAt: this.parseDate(rel.removedAt)
      });
    }
  }

  private async migrateSoyYoRelationships(relationships: any[]): Promise<void> {
    for (const rel of relationships) {
      const query = `
        MATCH (u:Usuario { id: $start }), (a:Artista { id: $end })
        CREATE (u)-[r:SOY_YO {
          status: $status,
          requestedAt: datetime($requestedAt),
          isVerified: $isVerified,
          verifiedAt: $verifiedAt,
          verifiedBy: $verifiedBy
        }]->(a)
      `;
      
      await this.db.executeWrite(query, {
        start: rel.start,
        end: rel.end,
        status: rel.status || 'REQUESTED',
        requestedAt: rel.requestedAt || new Date().toISOString(),
        isVerified: rel.isVerified || false,
        verifiedAt: this.parseDate(rel.verifiedAt),
        verifiedBy: rel.verifiedBy || null
      });
    }
  }

  async validateMigration(): Promise<boolean> {
    try {
      console.log('Validating migration...');
      
      // Check entity counts
      const usuarioCount = await this.db.executeQuery('MATCH (u:Usuario) RETURN count(u) as count');
      const artistaCount = await this.db.executeQuery('MATCH (a:Artista) RETURN count(a) as count');
      const cancionCount = await this.db.executeQuery('MATCH (c:Cancion) RETURN count(c) as count');
      const fabricaCount = await this.db.executeQuery('MATCH (f:Fabrica) RETURN count(f) as count');
      const tematicaCount = await this.db.executeQuery('MATCH (t:Tematica) RETURN count(t) as count');
      const jingleCount = await this.db.executeQuery('MATCH (j:Jingle) RETURN count(j) as count');
      
    console.log('Entity counts:');
    console.log(`- Usuarios: ${(usuarioCount[0] as any).count}`);
    console.log(`- Artistas: ${(artistaCount[0] as any).count}`);
    console.log(`- Canciones: ${(cancionCount[0] as any).count}`);
    console.log(`- Fabricas: ${(fabricaCount[0] as any).count}`);
    console.log(`- Tematicas: ${(tematicaCount[0] as any).count}`);
    console.log(`- Jingles: ${(jingleCount[0] as any).count}`);
      
      // Check relationship counts
      const relationshipCounts = await this.db.executeQuery(`
        MATCH ()-[r]-()
        RETURN type(r) as relType, count(r) as count
        ORDER BY relType
      `);
      
      console.log('Relationship counts:');
      relationshipCounts.forEach((rel: any) => {
        console.log(`- ${rel.relType}: ${rel.count}`);
      });
      
      console.log('Migration validation completed.');
      return true;
    } catch (error) {
      console.error('Migration validation failed:', error);
      return false;
    }
  }
}

// Execute migration if this file is run directly
if (require.main === module) {
  (async () => {
    try {
      const migrator = new SeedDataMigrator();
      await migrator.migrateAll();
      await migrator.validateMigration();
      console.log('Migration process completed successfully!');
    } catch (error) {
      console.error('Migration process failed:', error);
      process.exit(1);
    }
  })();
}
