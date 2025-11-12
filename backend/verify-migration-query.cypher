// Verification Query for Jingle JIN-0004
// This query verifies that redundant properties match their relationships

// Option 1: Comprehensive view - Shows Jingle with all relationships and redundant properties
MATCH (j:Jingle {id: 'JIN-0004'})
OPTIONAL MATCH (j)-[appearsIn:APPEARS_IN]->(f:Fabrica)
OPTIONAL MATCH (j)-[versiona:VERSIONA]->(c:Cancion)
OPTIONAL MATCH (jinglero:Artista)-[:JINGLERO_DE]->(j)
OPTIONAL MATCH (autor:Artista)-[:AUTOR_DE]->(c)
OPTIONAL MATCH (j)-[:TAGGED_WITH]->(t:Tematica)
RETURN 
  j.id AS jingleId,
  j.title AS jingleTitle,
  // Redundant properties (NEW)
  j.fabricaId AS redundantFabricaId,
  j.cancionId AS redundantCancionId,
  j.isLive AS isLive,
  j.isRepeat AS isRepeat,
  // Relationship verification
  f.id AS actualFabricaId,
  CASE WHEN j.fabricaId = f.id THEN '✅ MATCH' ELSE '❌ MISMATCH' END AS fabricaIdStatus,
  c.id AS actualCancionId,
  CASE WHEN j.cancionId = c.id THEN '✅ MATCH' ELSE '❌ MISMATCH' END AS cancionIdStatus,
  // Relationship properties
  appearsIn.timestamp AS timestamp,
  appearsIn.order AS order,
  // Related entities
  collect(DISTINCT jinglero.stageName) AS jingleros,
  collect(DISTINCT autor.stageName) AS autores,
  collect(DISTINCT t.name) AS tematicas

// Option 2: Simple verification - Just check if redundant properties match relationships
// Uncomment to use:
/*
MATCH (j:Jingle {id: 'JIN-0004'})
OPTIONAL MATCH (j)-[:APPEARS_IN]->(f:Fabrica)
OPTIONAL MATCH (j)-[:VERSIONA]->(c:Cancion)
RETURN 
  j.id,
  j.fabricaId = f.id AS fabricaIdMatches,
  j.cancionId = c.id AS cancionIdMatches,
  j.fabricaId AS storedFabricaId,
  f.id AS relationshipFabricaId,
  j.cancionId AS storedCancionId,
  c.id AS relationshipCancionId
*/

// Option 3: Check all Jingles for any mismatches
// Uncomment to use:
/*
MATCH (j:Jingle)
OPTIONAL MATCH (j)-[:APPEARS_IN]->(f:Fabrica)
OPTIONAL MATCH (j)-[:VERSIONA]->(c:Cancion)
WHERE (j.fabricaId IS NOT NULL AND (f IS NULL OR j.fabricaId <> f.id))
   OR (j.cancionId IS NOT NULL AND (c IS NULL OR j.cancionId <> c.id))
RETURN j.id, j.fabricaId, f.id AS actualFabricaId, j.cancionId, c.id AS actualCancionId
*/

