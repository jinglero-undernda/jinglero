# Neo4j Database Setup and Basic Usage Guide

This guide will walk you through setting up and populating the Neo4j database for the Jinglero project, and provide some basic Cypher queries to explore the data.

## Initial Setup

### 1. Environment Configuration

1. Create a `.env` file in your project root if you haven't already:

   ```
   NEO4J_URI=<your-aura-connection-string>
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=<your-password>
   ```

2. Make sure you have access to AuraDB and have the connection details ready.

### 2. Database Population

1. First, ensure all dependencies are installed:

   ```bash
   npm install
   ```

2. Run the database setup script to create constraints and indexes:

   ```bash
   npx ts-node src/server/db/schema/setup.ts
   ```

3. Run the seed script to populate the database:
   ```bash
   npx ts-node src/server/db/schema/seed.ts
   ```

## Verifying Data Import and API Refactoring

Log into your AuraDB console and use these Cypher queries to verify the data import and API refactoring changes. Copy and paste them into the Neo4j Browser interface.

### API Refactoring Verification Queries

After running the API refactoring migration, use these queries to confirm the changes have been applied successfully:

#### 1. Verify Schema Introspection Capabilities

```cypher
// Get all node labels in the database
CALL db.labels();

// Get all relationship types
CALL db.relationshipTypes();

// Get all property keys used
CALL db.propertyKeys();

// Show all constraints
SHOW CONSTRAINTS;

// Show all indexes
SHOW INDEXES;
```

#### 2. Verify Migration Success

```cypher
// Check that all expected entity types exist
MATCH (n)
RETURN DISTINCT labels(n) as EntityTypes, count(n) as Count
ORDER BY Count DESC;

// Expected results should show:
// - Usuario: 3
// - Artista: 12
// - Cancion: 4
// - Fabrica: 2
// - Tematica: 8
// - Jingle: 5
```

#### 3. Verify Relationship Migration

```cypher
// Check all relationship types and their counts
MATCH ()-[r]->()
RETURN type(r) as RelationshipType, count(r) as Count
ORDER BY Count DESC;

// Expected results should show:
// - TAGGED_WITH: 16
// - JINGLERO_DE: 14
// - APPEARS_IN: 8
// - AUTOR_DE: 8
// - REACCIONA_A: 8
// - VERSIONA: 8
// - SOY_YO: 2
```

#### 4. Verify Data Integrity

```cypher
// Check that all entities have proper timestamps
MATCH (n)
WHERE n.createdAt IS NULL OR n.updatedAt IS NULL
RETURN labels(n) as EntityType, count(n) as MissingTimestamps;

// Should return 0 rows if migration was successful

// Check that boolean fields are properly set
MATCH (j:Jingle)
RETURN j.id, j.isJinglazo, j.isJinglazoDelDia, j.isPrecario
LIMIT 5;

MATCH (a:Artista)
RETURN a.id, a.isArg
LIMIT 5;
```

#### 5. Test New API Endpoints (via Neo4j Browser)

You can test the new API endpoints by running these queries that simulate what the APIs would return:

```cypher
// Simulate Public API - Get all artistas
MATCH (a:Artista)
RETURN a
ORDER BY a.createdAt DESC
LIMIT 50;

// Simulate Public API - Get single artista by ID
MATCH (a:Artista {id: "ART-001"})
RETURN a;

// Simulate Public API - Get artista relationships
MATCH (a:Artista {id: "ART-001"})
OPTIONAL MATCH (a)-[r]->(target)
OPTIONAL MATCH (source)-[r2]->(a)
RETURN
  collect(DISTINCT {
    type: type(r),
    direction: 'outgoing',
    target: target,
    properties: properties(r)
  }) as outgoing,
  collect(DISTINCT {
    type: type(r2),
    direction: 'incoming',
    source: source,
    properties: properties(r2)
  }) as incoming;

// Simulate Admin API - Schema introspection
CALL db.labels() YIELD label
RETURN collect(label) as labels;
```

#### 6. Verify Backup Creation

```cypher
// Check that the migration created proper data structure
// This query should return the same counts as before migration
MATCH (u:Usuario)
RETURN count(u) as UsuarioCount;

MATCH (a:Artista)
RETURN count(a) as ArtistaCount;

MATCH (c:Cancion)
RETURN count(c) as CancionCount;

MATCH (f:Fabrica)
RETURN count(f) as FabricaCount;

MATCH (t:Tematica)
RETURN count(t) as TematicaCount;

MATCH (j:Jingle)
RETURN count(j) as JingleCount;
```

#### 7. Test Relationship Queries

```cypher
// Verify that all relationship types work correctly
MATCH (a:Artista)-[r:JINGLERO_DE]->(j:Jingle)
RETURN a.name, j.title, r.status
LIMIT 5;

MATCH (j:Jingle)-[r:VERSIONA]->(c:Cancion)
RETURN j.title, c.title, r.status
LIMIT 5;

MATCH (j:Jingle)-[r:TAGGED_WITH]->(t:Tematica)
RETURN j.title, t.name, r.isPrimary
LIMIT 5;

MATCH (u:Usuario)-[r:SOY_YO]->(a:Artista)
RETURN u.displayName, a.name, r.status, r.isVerified
LIMIT 5;
```

### Original Data Import Verification

Use these queries to verify the original data import:

### 1. Count Nodes by Type

```cypher
MATCH (n)
RETURN labels(n) as Type, count(*) as Count
ORDER BY Count DESC;
```

### 2. View Sample Data for Each Node Type

```cypher
// View 5 Users
MATCH (u:Usuario)
RETURN u.id, u.email, u.displayName, u.role
LIMIT 5;

// View 5 Jingles
MATCH (j:Jingle)
RETURN j.id, j.title, j.youtubeUrl, j.isJinglazo
LIMIT 5;

// View 5 Artists
MATCH (a:Artista)
RETURN a.id, a.name, a.nationality, a.isArg
LIMIT 5;

// View 5 Songs
MATCH (c:Cancion)
RETURN c.id, c.title, c.album, c.year
LIMIT 5;

// View 5 Factories (Fabricas)
MATCH (f:Fabrica)
RETURN f.id, f.title, f.date, f.youtubeUrl
LIMIT 5;

// View 5 Themes (Tematicas)
MATCH (t:Tematica)
RETURN t.id, t.name, t.category, t.description
LIMIT 5;
```

### 3. Check Relationships

```cypher
// Count relationships by type
MATCH ()-[r]->()
RETURN type(r) as RelationType, count(*) as Count
ORDER BY Count DESC;

// View Users who are Artists (SOY_YO relationship)
MATCH (u:Usuario)-[r:SOY_YO]->(a:Artista)
RETURN u.displayName, a.name, r.status, r.isVerified
LIMIT 5;

// View Jingles and their Songs (VERSIONA relationship)
MATCH (j:Jingle)-[r:VERSIONA]->(c:Cancion)
RETURN j.title, c.title, r.status, r.createdAt
LIMIT 5;

// View Jingles in Factories with timestamps
MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica)
RETURN j.title, f.title, r.timestamp, r.order
ORDER BY f.date, r.order
LIMIT 10;
```

### 4. Complex Queries

Here are some useful queries to explore relationships between entities:

```cypher
// Find all Jingles by an Artist
MATCH (a:Artista {name: "Artist Name"})-[:JINGLERO_DE]->(j:Jingle)
RETURN j.title, j.youtubeUrl;

// Find most active Jingleros (Artists with most Jingles)
MATCH (a:Artista)-[:JINGLERO_DE]->(j:Jingle)
RETURN a.name, count(j) as JingleCount
ORDER BY JingleCount DESC
LIMIT 10;

// Find Jingles with their Artists and original Songs
MATCH (a:Artista)-[:JINGLERO_DE]->(j:Jingle)-[:VERSIONA]->(c:Cancion)<-[:AUTOR_DE]-(originalArtist:Artista)
RETURN j.title as Jingle,
       a.name as JingleroName,
       c.title as OriginalSong,
       originalArtist.name as OriginalArtist
LIMIT 10;

// Find top themes (Tematicas) used in Jingles
MATCH (j:Jingle)-[r:TAGGED_WITH]->(t:Tematica)
WHERE r.isPrimary = true
RETURN t.name, count(*) as UsageCount
ORDER BY UsageCount DESC
LIMIT 10;
```

### 5. Visualizing Data

To visualize relationships in the Neo4j Browser:

1. Start with a specific node and expand its relationships:

```cypher
// Start with a specific Jingle and show all its relationships
MATCH (j:Jingle {title: "Some Jingle Title"})
CALL apoc.path.subgraphAll(j, {
  maxLevel: 2
})
YIELD nodes, relationships
RETURN nodes, relationships;
```

2. View a small sample of the graph structure:

```cypher
// Show a sample of interconnected nodes
MATCH (j:Jingle)-[r]-(n)
WITH j, r, n
LIMIT 25
RETURN j, r, n;
```

## Common Issues and Solutions

1. If you see no data after running the seed script:

   - Check your database connection string in `.env`
   - Verify that the CSV files are in the correct location
   - Look for error messages in the console output

2. If you see partial data:

   - The seed script can be run multiple times safely
   - Check the console output for any error messages
   - Verify that all CSV files are properly formatted

3. If queries return no results:
   - Verify that the node labels and relationship types match exactly (they are case-sensitive)
   - Check property names for exact matches
   - Use `OPTIONAL MATCH` to see partial results when some relationships might be missing

## Next Steps

1. Learn more about Cypher: https://neo4j.com/docs/cypher-manual/current/
2. Explore the Neo4j Browser Guide: https://neo4j.com/docs/browser-manual/current/
3. Practice writing queries using the examples above
4. Use the Neo4j Browser's `:schema` command to see all node labels, relationship types, and constraints

Remember to always use the Neo4j Browser's visualization capabilities to understand the structure of your queries and their results. The visual representation can be very helpful in understanding the graph structure.
