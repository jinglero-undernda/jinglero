/**
 * Quick script to check APPEARS_IN relationship timestamps
 */

import { Neo4jClient } from '../index';

async function checkTimestamps() {
  const db = Neo4jClient.getInstance();
  
  // Get a sample of APPEARS_IN relationships with timestamps
  const query = `
    MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica)
    RETURN j.id as jingleId, r.timestamp as timestamp, f.id as fabricaId
    ORDER BY r.timestamp DESC
    LIMIT 20
  `;
  
  const results = await db.executeQuery<{ jingleId: string; timestamp: number; fabricaId: string }>(query, {});
  
  // Helper to format seconds as HH:MM:SS
  const formatSeconds = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  
  console.log('Sample of APPEARS_IN relationship timestamps:');
  console.log('==========================================');
  results.forEach((r) => {
    console.log(`Jingle: ${r.jingleId}, Fabrica: ${r.fabricaId}, Timestamp: ${r.timestamp}s (${formatSeconds(r.timestamp)})`);
  });
  
  // Check how many have 0 seconds
  const countQuery = `
    MATCH ()-[r:APPEARS_IN]->()
    RETURN 
      count(r) as total,
      sum(CASE WHEN r.timestamp = 0 THEN 1 ELSE 0 END) as zeroTimestamps,
      sum(CASE WHEN r.timestamp <> 0 THEN 1 ELSE 0 END) as nonZeroTimestamps
  `;
  
  const counts = await db.executeQuery<{ total: number; zeroTimestamps: number; nonZeroTimestamps: number }>(countQuery, {});
  console.log('\nStatistics:');
  console.log('==========================================');
  console.log(`Total relationships: ${counts[0]?.total || 0}`);
  console.log(`With 0 seconds: ${counts[0]?.zeroTimestamps || 0}`);
  console.log(`With non-zero timestamps: ${counts[0]?.nonZeroTimestamps || 0}`);
  
  // Get some examples of non-zero timestamps
  const nonZeroQuery = `
    MATCH (j:Jingle)-[r:APPEARS_IN]->(f:Fabrica)
    WHERE r.timestamp <> 0
    RETURN j.id as jingleId, r.timestamp as timestamp, f.id as fabricaId
    ORDER BY r.timestamp ASC
    LIMIT 10
  `;
  
  const nonZeroResults = await db.executeQuery<{ jingleId: string; timestamp: number; fabricaId: string }>(nonZeroQuery, {});
  
  console.log('\nExamples of non-zero timestamps:');
  console.log('==========================================');
  nonZeroResults.forEach((r) => {
    const formatSeconds = (seconds: number): string => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };
    console.log(`Jingle: ${r.jingleId}, Fabrica: ${r.fabricaId}, Timestamp: ${r.timestamp}s (${formatSeconds(r.timestamp)})`);
  });
  
  process.exit(0);
}

checkTimestamps().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

