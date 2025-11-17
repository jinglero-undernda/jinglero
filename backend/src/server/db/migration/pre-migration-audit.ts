import { Neo4jClient } from '../index';

/**
 * Pre-Migration Audit Script
 * Captures current database state before migration to serve as a validation baseline
 */

interface AuditReport {
  timestamp: string;
  entityCounts: {
    Jingle: number;
    Cancion: number;
    Artista: number;
    Tematica: number;
    Usuario: number;
    Fabrica: number;
  };
  idFormats: {
    entityType: string;
    sampleIds: string[];
    currentFormat: string;
  }[];
  relationshipCounts: {
    type: string;
    count: number;
  }[];
  redundantPropertyStatus: {
    entityType: string;
    entityId: string;
    property: string;
    value: any;
  }[];
  appearsInOrders: {
    fabricaId: string;
    jingleCount: number;
    hasConsistentOrdering: boolean;
    orderValues: number[];
  }[];
}

async function auditDatabase(): Promise<AuditReport> {
  const db = Neo4jClient.getInstance();
  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    entityCounts: {
      Jingle: 0,
      Cancion: 0,
      Artista: 0,
      Tematica: 0,
      Usuario: 0,
      Fabrica: 0,
    },
    idFormats: [],
    relationshipCounts: [],
    redundantPropertyStatus: [],
    appearsInOrders: [],
  };

  console.log('🔍 Starting pre-migration audit...\n');

  // 1. Count entities by type
  console.log('📊 Counting entities...');
  for (const entityType of Object.keys(report.entityCounts)) {
    const result = await db.executeQuery<{ count: number }>(
      `MATCH (n:${entityType}) RETURN count(n) as count`,
      {}
    );
    const count = result[0]?.count || 0;
    report.entityCounts[entityType as keyof typeof report.entityCounts] = count;
    console.log(`  ${entityType}: ${count}`);
  }

  // 2. Sample ID formats
  console.log('\n🔖 Sampling ID formats...');
  for (const entityType of Object.keys(report.entityCounts)) {
    const result = await db.executeQuery<{ id: string }>(
      `MATCH (n:${entityType}) RETURN n.id as id LIMIT 5`,
      {}
    );
    const sampleIds = result.map((r) => r.id);
    const currentFormat = sampleIds[0]?.includes('-') ? 'PREFIX-UUID' : 'PREFIX{8-char-base36}';
    
    report.idFormats.push({
      entityType,
      sampleIds,
      currentFormat,
    });
    
    console.log(`  ${entityType}: ${currentFormat}`);
    console.log(`    Samples: ${sampleIds.slice(0, 3).join(', ')}`);
  }

  // 3. Count relationships by type
  console.log('\n🔗 Counting relationships...');
  const relTypes = ['APPEARS_IN', 'VERSIONA', 'AUTOR_DE', 'TAGS', 'UPLOADED_BY'];
  for (const relType of relTypes) {
    const result = await db.executeQuery<{ count: number }>(
      `MATCH ()-[r:${relType}]->() RETURN count(r) as count`,
      {}
    );
    const count = result[0]?.count || 0;
    report.relationshipCounts.push({ type: relType, count });
    console.log(`  ${relType}: ${count}`);
  }

  // 4. Audit redundant properties
  console.log('\n📝 Auditing redundant properties...');
  
  // Check Jingle.fabricaId and Jingle.cancionId
  const jingles = await db.executeQuery<{ id: string; fabricaId: string | null; cancionId: string | null }>(
    `MATCH (j:Jingle) 
     RETURN j.id as id, j.fabricaId as fabricaId, j.cancionId as cancionId 
     LIMIT 10`,
    {}
  );
  
  for (const jingle of jingles) {
    if (jingle.fabricaId) {
      report.redundantPropertyStatus.push({
        entityType: 'Jingle',
        entityId: jingle.id,
        property: 'fabricaId',
        value: jingle.fabricaId,
      });
    }
    if (jingle.cancionId) {
      report.redundantPropertyStatus.push({
        entityType: 'Jingle',
        entityId: jingle.id,
        property: 'cancionId',
        value: jingle.cancionId,
      });
    }
  }
  
  // Check Cancion.autorIds
  const canciones = await db.executeQuery<{ id: string; autorIds: string[] | null }>(
    `MATCH (c:Cancion) 
     RETURN c.id as id, c.autorIds as autorIds 
     LIMIT 10`,
    {}
  );
  
  for (const cancion of canciones) {
    if (cancion.autorIds) {
      report.redundantPropertyStatus.push({
        entityType: 'Cancion',
        entityId: cancion.id,
        property: 'autorIds',
        value: cancion.autorIds,
      });
    }
  }
  
  console.log(`  Found ${report.redundantPropertyStatus.length} entities with redundant properties`);

  // 5. Audit APPEARS_IN order consistency
  console.log('\n📋 Auditing APPEARS_IN order values...');
  const fabricas = await db.executeQuery<{ fabricaId: string; orders: number[] }>(
    `MATCH (f:Fabrica)<-[r:APPEARS_IN]-(j:Jingle)
     RETURN f.id as fabricaId, collect(r.order) as orders
     ORDER BY size(collect(r.order)) DESC
     LIMIT 10`,
    {}
  );
  
  for (const fabrica of fabricas) {
    const orders = fabrica.orders;
    const hasConsistentOrdering = orders.every((o: number, i: number) => o === i + 1);
    
    report.appearsInOrders.push({
      fabricaId: fabrica.fabricaId,
      jingleCount: orders.length,
      hasConsistentOrdering,
      orderValues: orders,
    });
    
    const status = hasConsistentOrdering ? '✅' : '⚠️';
    console.log(`  ${status} Fabrica ${fabrica.fabricaId}: ${orders.length} jingles, orders: [${orders.slice(0, 5).join(', ')}${orders.length > 5 ? '...' : ''}]`);
  }

  return report;
}

async function generateDryRunReport(): Promise<void> {
  console.log('\n🧪 Generating dry-run migration report...\n');
  
  const db = Neo4jClient.getInstance();
  
  // Simulate ID generation for a few entities
  console.log('📝 Simulating ID generation:');
  const entityTypes = ['Jingle', 'Cancion', 'Artista', 'Tematica', 'Usuario'];
  
  for (const entityType of entityTypes) {
    const result = await db.executeQuery<{ oldId: string }>(
      `MATCH (n:${entityType}) RETURN n.id as oldId LIMIT 3`,
      {}
    );
    
    console.log(`\n  ${entityType}:`);
    for (const entity of result) {
      const prefix = entityType === 'Jingle' ? 'j' : 
                     entityType === 'Cancion' ? 'c' : 
                     entityType === 'Artista' ? 'a' : 
                     entityType === 'Tematica' ? 't' : 'u';
      const randomPart = Math.random().toString(36).substring(2, 10);
      const newId = `${prefix}${randomPart}`;
      console.log(`    ${entity.oldId} → ${newId}`);
    }
  }
  
  // Check for potential issues
  console.log('\n\n⚠️  Potential migration concerns:');
  
  // Check for external references
  const externalRefs = await db.executeQuery<{ count: number }>(
    `MATCH (j:Jingle)
     WHERE j.fabricaId IS NOT NULL OR j.cancionId IS NOT NULL
     RETURN count(j) as count`,
    {}
  );
  
  console.log(`  - ${externalRefs[0]?.count || 0} Jingles have redundant properties that need updating`);
  
  // Check for relationships
  const relCount = await db.executeQuery<{ count: number }>(
    `MATCH ()-[r]->() RETURN count(r) as count`,
    {}
  );
  
  console.log(`  - ${relCount[0]?.count || 0} relationships need ID updates`);
  
  // Estimate migration time
  const totalEntities = await db.executeQuery<{ count: number }>(
    `MATCH (n) WHERE NOT n:Fabrica RETURN count(n) as count`,
    {}
  );
  
  const entityCount = Number(totalEntities[0]?.count || 0);
  const estimatedTime = Math.ceil(entityCount * 0.01); // Rough estimate: 10ms per entity
  console.log(`  - Estimated migration time: ~${estimatedTime} seconds`);
}

async function main() {
  try {
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║   PRE-MIGRATION AUDIT & DRY-RUN REPORT           ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');
    
    // Perform audit
    const report = await auditDatabase();
    
    // Save report to file
    const fs = await import('fs/promises');
    const path = await import('path');
    const reportDir = path.join(__dirname, 'backups');
    const reportPath = path.join(reportDir, 'pre-migration-audit.json');
    
    // Ensure directory exists
    await fs.mkdir(reportDir, { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Audit report saved to: ${reportPath}`);
    
    // Generate dry-run report
    await generateDryRunReport();
    
    console.log('\n\n✅ Pre-migration audit complete!');
    console.log('\n📋 Summary:');
    console.log(`  - Total entities: ${Object.values(report.entityCounts).reduce((a, b) => Number(a) + Number(b), 0)}`);
    console.log(`  - Entities to migrate: ${Object.entries(report.entityCounts)
      .filter(([type]) => type !== 'Fabrica')
      .reduce((sum, [, count]) => Number(sum) + Number(count), 0)}`);
    console.log(`  - Total relationships: ${report.relationshipCounts.reduce((sum, r) => Number(sum) + Number(r.count), 0)}`);
    console.log(`  - Entities with redundant properties: ${report.redundantPropertyStatus.length}`);
    console.log('\n⚠️  IMPORTANT: Back up your database before proceeding with migration!');
    console.log('   Run: npm run db:backup (if available) or manually export your Neo4j database\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Pre-migration audit failed:', error);
    process.exit(1);
  }
}

main();

