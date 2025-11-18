/**
 * Relationship Direction Fix Script
 * 
 * Fixes incorrect relationship directions based on audit results.
 * Preserves all relationship properties when fixing direction.
 * 
 * Reference: BUG_0007
 */

import { Neo4jClient } from '../index';
import {
  AuditResult,
  IncorrectRelationship,
  type AuditOptions,
} from './audit-relationships';
import {
  getNeo4jRelationshipType,
  getRelationshipDirection,
  type RelationshipTypeKey,
} from './relationship-schema';

/**
 * Fix options
 */
export interface FixOptions {
  /** Run in dry-run mode (default: true) */
  dryRun?: boolean;
  /** Whether to proceed with fixes */
  proceed?: boolean;
}

/**
 * Fix operation result
 */
export interface FixOperation {
  relType: string;
  startId: string;
  endId: string;
  action: 'created' | 'deleted' | 'skipped';
  reason?: string;
}

/**
 * Fix result
 */
export interface FixResult {
  operations: FixOperation[];
  summary: {
    totalFixed: number;
    totalDeleted: number;
    totalSkipped: number;
    errors: number;
  };
  timestamp: string;
}

/**
 * Fix incorrect relationships based on audit results
 */
export async function fixRelationships(
  db: Neo4jClient,
  auditResult: AuditResult,
  options: FixOptions = {}
): Promise<FixResult> {
  const { dryRun = true, proceed = false } = options;
  
  if (!proceed && !dryRun) {
    throw new Error('Cannot proceed with fixes without explicit proceed flag');
  }
  
  const result: FixResult = {
    operations: [],
    summary: {
      totalFixed: 0,
      totalDeleted: 0,
      totalSkipped: 0,
      errors: 0,
    },
    timestamp: new Date().toISOString(),
  };
  
  console.log('\n🔧 Starting relationship fixes...');
  console.log(`Mode: ${dryRun ? 'DRY-RUN' : 'EXECUTE'}`);
  console.log(`Found ${auditResult.incorrect.length} incorrect relationships to fix\n`);
  
  for (const incorrect of auditResult.incorrect) {
    try {
      if (incorrect.hasDuplicate) {
        // Delete wrong relationship, keep correct one
        await deleteWrongRelationship(
          db,
          incorrect,
          dryRun,
          result
        );
      } else {
        // Delete wrong and create correct
        await fixRelationshipDirection(
          db,
          incorrect,
          dryRun,
          result
        );
      }
    } catch (error: any) {
      console.error(`Error fixing relationship ${incorrect.relType} (${incorrect.startNode.id} -> ${incorrect.endNode.id}):`, error.message);
      result.summary.errors++;
      result.operations.push({
        relType: incorrect.relType,
        startId: incorrect.startNode.id,
        endId: incorrect.endNode.id,
        action: 'skipped',
        reason: `Error: ${error.message}`,
      });
    }
  }
  
  return result;
}

/**
 * Delete wrong-direction relationship (when duplicate exists)
 */
async function deleteWrongRelationship(
  db: Neo4jClient,
  incorrect: IncorrectRelationship,
  dryRun: boolean,
  result: FixResult
): Promise<void> {
  const neo4jRelType = incorrect.relType;
  const startId = incorrect.startNode.id;
  const endId = incorrect.endNode.id;
  
  if (dryRun) {
    console.log(`[DRY-RUN] Would delete wrong ${neo4jRelType}: (${startId}) -> (${endId})`);
    result.operations.push({
      relType: neo4jRelType,
      startId,
      endId,
      action: 'deleted',
    });
    result.summary.totalDeleted++;
  } else {
    // First check if relationship exists
    const checkQuery = `
      MATCH (start {id: $startId})-[r:${neo4jRelType}]->(end {id: $endId})
      RETURN count(r) as count
    `;
    const checkResult = await db.executeQuery<{ count: number }>(checkQuery, {
      startId,
      endId,
    });
    
    if (checkResult[0]?.count === 0) {
      console.warn(`⚠️  No relationship found to delete: ${neo4jRelType} (${startId}) -> (${endId})`);
      result.operations.push({
        relType: neo4jRelType,
        startId,
        endId,
        action: 'skipped',
        reason: 'Relationship not found',
      });
      result.summary.totalSkipped++;
      return;
    }
    
    const query = `
      MATCH (start {id: $startId})-[r:${neo4jRelType}]->(end {id: $endId})
      DELETE r
    `;
    
    await db.executeWrite(query, {
      startId,
      endId,
    });
    
    console.log(`✅ Deleted wrong ${neo4jRelType}: (${startId}) -> (${endId})`);
    result.operations.push({
      relType: neo4jRelType,
      startId,
      endId,
      action: 'deleted',
    });
    result.summary.totalDeleted++;
  }
}

/**
 * Fix relationship direction (delete wrong, create correct)
 */
async function fixRelationshipDirection(
  db: Neo4jClient,
  incorrect: IncorrectRelationship,
  dryRun: boolean,
  result: FixResult
): Promise<void> {
  const neo4jRelType = incorrect.relType;
  const wrongStartId = incorrect.startNode.id;
  const wrongEndId = incorrect.endNode.id;
  
  // Get correct direction
  const direction = getRelationshipDirection(incorrect.relTypeKey);
  const correctStartId = wrongEndId; // End becomes start
  const correctEndId = wrongStartId; // Start becomes end
  
  if (dryRun) {
    console.log(`[DRY-RUN] Would fix ${neo4jRelType}:`);
    console.log(`  Delete: (${wrongStartId}) -> (${wrongEndId})`);
    console.log(`  Create: (${correctStartId}) -> (${correctEndId})`);
    console.log(`  Properties: ${JSON.stringify(incorrect.properties)}`);
    
    result.operations.push({
      relType: neo4jRelType,
      startId: correctStartId,
      endId: correctEndId,
      action: 'created',
    });
    result.summary.totalFixed++;
  } else {
    // Use a transaction to ensure atomicity
    const query = `
      MATCH (wrongStart {id: $wrongStartId})-[r:${neo4jRelType}]->(wrongEnd {id: $wrongEndId})
      WITH r, properties(r) as props
      DELETE r
      WITH props
      MATCH (correctStart:${direction.startLabel} {id: $correctStartId}), (correctEnd:${direction.endLabel} {id: $correctEndId})
      CREATE (correctStart)-[newR:${neo4jRelType}]->(correctEnd)
      SET newR = props
      RETURN newR
    `;
    
    try {
      await db.executeWrite(query, {
        wrongStartId,
        wrongEndId,
        correctStartId,
        correctEndId,
      });
      
      console.log(`✅ Fixed ${neo4jRelType}:`);
      console.log(`  Deleted: (${wrongStartId}) -> (${wrongEndId})`);
      console.log(`  Created: (${correctStartId}) -> (${correctEndId})`);
      
      result.operations.push({
        relType: neo4jRelType,
        startId: correctStartId,
        endId: correctEndId,
        action: 'created',
      });
      result.summary.totalFixed++;
    } catch (error: any) {
      // If nodes don't exist, skip
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        console.warn(`⚠️  Skipping fix: nodes not found for ${neo4jRelType} (${correctStartId} -> ${correctEndId})`);
        result.operations.push({
          relType: neo4jRelType,
          startId: correctStartId,
          endId: correctEndId,
          action: 'skipped',
          reason: 'Nodes not found',
        });
        result.summary.totalSkipped++;
      } else {
        throw error;
      }
    }
  }
}

/**
 * Print fix report to console
 */
export function printFixReport(result: FixResult, dryRun: boolean): void {
  console.log('\n' + '='.repeat(60));
  console.log(`📋 FIX REPORT (${dryRun ? 'DRY-RUN' : 'EXECUTED'})`);
  console.log('='.repeat(60));
  console.log(`Timestamp: ${result.timestamp}\n`);
  
  console.log('Summary:');
  console.log(`  Fixed (created): ${result.summary.totalFixed}`);
  console.log(`  Deleted: ${result.summary.totalDeleted}`);
  console.log(`  Skipped: ${result.summary.totalSkipped}`);
  console.log(`  Errors: ${result.summary.errors}\n`);
  
  if (result.operations.length > 0) {
    console.log('Operations:');
    for (const op of result.operations) {
      const icon = op.action === 'created' ? '✅' : op.action === 'deleted' ? '🗑️' : '⏭️';
      console.log(`  ${icon} ${op.relType}: ${op.startId} -> ${op.endId} (${op.action})`);
      if (op.reason) {
        console.log(`     Reason: ${op.reason}`);
      }
    }
  }
  
  if (dryRun) {
    console.log('\n⚠️  This was a DRY-RUN. No changes were made to the database.');
    console.log('   Run with --fix flag to execute these changes.');
  }
}

