// NOTE: The following script syntax is valid for database version 5.0 and above.

:param {
  // Define the file path root and the individual file names required for loading.
  // https://neo4j.com/docs/operations-manual/current/configuration/file-locations/
  file_path_root: 'file:///', // Change this to the folder your script can access the files at.
  file_0: 'node-Artista-2025-10-19.csv',
  file_1: 'node-Cancion-2025-10-19.csv',
  file_2: 'node-Fabrica-2025-10-19.csv',
  file_3: 'node-Jingle-2025-10-19.csv',
  file_4: 'node-Tematica-2025-10-19.csv',
  file_5: 'node-Usuario-2025-10-19.csv',
  file_6: 'rel-Jingle-APPEARS_IN-Fabrica-2025-10-19.csv',
  file_7: 'rel-Jingle-VERSIONA-Cancion-2025-10-19.csv',
  file_8: 'rel-Jingle-TAGGED_WITH-Tematica-2025-10-19.csv',
  file_9: 'rel-Artista-AUTOR_DE-Cancion-2025-10-19.csv',
  file_10: 'rel-Artista-JINGLERO_DE-Jingle-2025-10-19.csv',
  file_11: 'rel-Usuario-SOY_YO-Artista-2025-10-19.csv',
  file_12: 'rel-Usuario-REACCIONA_A-Jingle-2025-10-19.csv'
};

// CONSTRAINT creation
// -------------------
//
// Create node uniqueness constraints, ensuring no duplicates for the given node label and ID property exist in the database. This also ensures no duplicates are introduced in future.
//
CREATE CONSTRAINT `id_Artista_uniq` IF NOT EXISTS
FOR (n: `Artista`)
REQUIRE (n.`id`) IS UNIQUE;
CREATE CONSTRAINT `id_Cancion_uniq` IF NOT EXISTS
FOR (n: `Cancion`)
REQUIRE (n.`id`) IS UNIQUE;
CREATE CONSTRAINT `id_Fabrica_uniq` IF NOT EXISTS
FOR (n: `Fabrica`)
REQUIRE (n.`id`) IS UNIQUE;
CREATE CONSTRAINT `id_Jingle_uniq` IF NOT EXISTS
FOR (n: `Jingle`)
REQUIRE (n.`id`) IS UNIQUE;
CREATE CONSTRAINT `id_Tematica_uniq` IF NOT EXISTS
FOR (n: `Tematica`)
REQUIRE (n.`id`) IS UNIQUE;
CREATE CONSTRAINT `id_Usuario_uniq` IF NOT EXISTS
FOR (n: `Usuario`)
REQUIRE (n.`id`) IS UNIQUE;

:param {
  idsToSkip: []
};

// NODE load
// ---------
//
// Load nodes in batches, one node label at a time. Nodes will be created using a MERGE statement to ensure a node with the same label and ID property remains unique. Pre-existing nodes found by a MERGE statement will have their other properties set to the latest values encountered in a load file.
//
// NOTE: Any nodes with IDs in the 'idsToSkip' list parameter will not be loaded.
LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row
WHERE NOT row.`id` IN $idsToSkip AND NOT row.`id` IS NULL
CALL (row) {
  MERGE (n: `Artista` { `id`: row.`id` })
  SET n.`id` = row.`id`
  SET n.`name` = row.`name`
  SET n.`stageName` = row.`stageName`
  SET n.`idUsuario` = row.`idUsuario`
  SET n.`nationality` = row.`nationality`
  SET n.`isArg` = toLower(trim(row.`isArg`)) IN ['1','true','yes']
  SET n.`youtubeHandle` = row.`youtubeHandle`
  SET n.`instagramHandle` = row.`instagramHandle`
  SET n.`twitterHandle` = row.`twitterHandle`
  SET n.`facebookProfile` = row.`facebookProfile`
  SET n.`website` = row.`website`
  SET n.`bio` = row.`bio`
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  SET n.`createdAt` = datetime(row.`createdAt`)
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  SET n.`updatedAt` = datetime(row.`updatedAt`)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_1) AS row
WITH row
WHERE NOT row.`id` IN $idsToSkip AND NOT row.`id` IS NULL
CALL (row) {
  MERGE (n: `Cancion` { `id`: row.`id` })
  SET n.`id` = row.`id`
  SET n.`title` = row.`title`
  SET n.`album` = row.`album`
  SET n.`year` = toInteger(trim(row.`year`))
  SET n.`genre` = row.`genre`
  SET n.`youtubeMusic` = row.`youtubeMusic`
  SET n.`lyrics` = row.`lyrics`
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  SET n.`createdAt` = datetime(row.`createdAt`)
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  SET n.`updatedAt` = datetime(row.`updatedAt`)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_2) AS row
WITH row
WHERE NOT row.`id` IN $idsToSkip AND NOT row.`id` IS NULL
CALL (row) {
  MERGE (n: `Fabrica` { `id`: row.`id` })
  SET n.`id` = row.`id`
  SET n.`title` = row.`title`
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  SET n.`date` = datetime(row.`date`)
  SET n.`youtubeUrl` = row.`youtubeUrl`
  SET n.`visualizations` = toInteger(trim(row.`visualizations`))
  SET n.`likes` = toInteger(trim(row.`likes`))
  SET n.`description` = row.`description`
  SET n.`contents` = row.`contents`
  SET n.`status` = row.`status`
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  SET n.`createdAt` = datetime(row.`createdAt`)
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  SET n.`updatedAt` = datetime(row.`updatedAt`)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_3) AS row
WITH row
WHERE NOT row.`id` IN $idsToSkip AND NOT row.`id` IS NULL
CALL (row) {
  MERGE (n: `Jingle` { `id`: row.`id` })
  SET n.`id` = row.`id`
  SET n.`youtubeUrl` = row.`youtubeUrl`
  SET n.`timestamp` = row.`timestamp`
  SET n.`youtubeClipUrl` = row.`youtubeClipUrl`
  SET n.`title` = row.`title`
  SET n.`comment` = row.`comment`
  SET n.`lyrics` = row.`lyrics`
  SET n.`songTitle` = row.`songTitle`
  SET n.`artistName` = row.`artistName`
  SET n.`genre` = row.`genre`
  SET n.`isJinglazo` = toLower(trim(row.`isJinglazo`)) IN ['1','true','yes']
  SET n.`isJinglazoDelDia` = toLower(trim(row.`isJinglazoDelDia`)) IN ['1','true','yes']
  SET n.`isPrecario` = toLower(trim(row.`isPrecario`)) IN ['1','true','yes']
  SET n.`isLive` = toLower(trim(row.`isLive`)) IN ['1','true','yes']
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  SET n.`createdAt` = datetime(row.`createdAt`)
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  SET n.`updatedAt` = datetime(row.`updatedAt`)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_4) AS row
WITH row
WHERE NOT row.`id` IN $idsToSkip AND NOT row.`id` IS NULL
CALL (row) {
  MERGE (n: `Tematica` { `id`: row.`id` })
  SET n.`id` = row.`id`
  SET n.`name` = row.`name`
  SET n.`category` = row.`category`
  SET n.`description` = row.`description`
  SET n.`createdAt` = row.`createdAt`
  SET n.`updatedAt` = row.`updatedAt`
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_5) AS row
WITH row
WHERE NOT row.`id` IN $idsToSkip AND NOT row.`id` IS NULL
CALL (row) {
  MERGE (n: `Usuario` { `id`: row.`id` })
  SET n.`id` = row.`id`
  SET n.`email` = row.`email`
  SET n.`role` = row.`role`
  SET n.`artistId` = row.`artistId`
  SET n.`displayName` = row.`displayName`
  SET n.`profilePictureUrl` = row.`profilePictureUrl`
  SET n.`twitterHandle` = row.`twitterHandle`
  SET n.`instagramHandle` = row.`instagramHandle`
  SET n.`facebookProfile` = row.`facebookProfile`
  SET n.`youtubeHandle` = row.`youtubeHandle`
  SET n.`contributionsCount` = row.`contributionsCount`
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  SET n.`createdAt` = datetime(row.`createdAt`)
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  SET n.`lastLogin` = datetime(row.`lastLogin`)
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  SET n.`updatedAt` = datetime(row.`updatedAt`)
} IN TRANSACTIONS OF 10000 ROWS;


// RELATIONSHIP load
// -----------------
//
// Load relationships in batches, one relationship type at a time. Relationships are created using a MERGE statement, meaning only one relationship of a given type will ever be created between a pair of nodes.
LOAD CSV WITH HEADERS FROM ($file_path_root + $file_6) AS row
WITH row 
CALL (row) {
  MATCH (source: `Jingle` { `id`: row.`:START_ID` })
  MATCH (target: `Fabrica` { `id`: row.`:END_ID` })
  MERGE (source)-[r: `APPEARS_IN`]->(target)
  SET r.`order` = toInteger(trim(row.`order`))
  SET r.`timestamp` = row.`timestamp`
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_7) AS row
WITH row 
CALL (row) {
  MATCH (source: `Jingle` { `id`: row.`:START_ID` })
  MATCH (target: `Cancion` { `id`: row.`:END_ID` })
  MERGE (source)-[r: `VERSIONA`]->(target)
  SET r.`status` = row.`status`
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  // SET r.`createdAt` = datetime(row.`createdAt`)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_8) AS row
WITH row 
CALL (row) {
  MATCH (source: `Jingle` { `id`: row.`:START_ID` })
  MATCH (target: `Tematica` { `id`: row.`:END_ID` })
  MERGE (source)-[r: `TAGGED_WITH`]->(target)
  SET r.`isPrimary` = toLower(trim(row.`isPrimary`)) IN ['1','true','yes']
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  // SET r.`createdAt` = datetime(row.`createdAt`)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_9) AS row
WITH row 
CALL (row) {
  MATCH (source: `Artista` { `id`: row.`:START_ID` })
  MATCH (target: `Cancion` { `id`: row.`:END_ID` })
  MERGE (source)-[r: `AUTOR_DE`]->(target)
  SET r.`status` = row.`status`
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  // SET r.`createdAt` = datetime(row.`createdAt`)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_10) AS row
WITH row 
CALL (row) {
  MATCH (source: `Artista` { `id`: row.`:START_ID` })
  MATCH (target: `Jingle` { `id`: row.`:END_ID` })
  MERGE (source)-[r: `JINGLERO_DE`]->(target)
  SET r.`status` = row.`status`
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  // SET r.`createdAt` = datetime(row.`createdAt`)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_11) AS row
WITH row 
CALL (row) {
  MATCH (source: `Usuario` { `id`: row.`:START_ID` })
  MATCH (target: `Artista` { `id`: row.`:END_ID` })
  MERGE (source)-[r: `SOY_YO`]->(target)
  SET r.`status` = row.`status`
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  // SET r.`requestedAt` = datetime(row.`requestedAt`)
  SET r.`isVerified` = toLower(trim(row.`isVerified`)) IN ['1','true','yes']
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  // SET r.`verifiedAt` = datetime(row.`verifiedAt`)
  SET r.`verifiedBy` = row.`verifiedBy`
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_12) AS row
WITH row 
CALL (row) {
  MATCH (source: `Usuario` { `id`: row.`:START_ID` })
  MATCH (target: `Jingle` { `id`: row.`:END_ID` })
  MERGE (source)-[r: `REACCION_A`]->(target)
  SET r.`type` = row.`type`
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  // SET r.`createdAt` = datetime(row.`createdAt`)
  // Your script contains the datetime datatype. Our app attempts to convert dates to ISO 8601 date format before passing them to the Cypher function.
  // This conversion cannot be done in a Cypher script load. Please ensure that your CSV file columns are in ISO 8601 date format to ensure equivalent loads.
  // SET r.`updatedAt` = datetime(row.`updatedAt`)
  SET r.`removedAt` = row.`removedAt`
} IN TRANSACTIONS OF 10000 ROWS;
