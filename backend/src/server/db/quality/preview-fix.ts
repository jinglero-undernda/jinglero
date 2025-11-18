#!/usr/bin/env node

/**
 * Preview Fix Script
 * Shows what would be fixed without actually making changes
 */

import { Neo4jClient } from '../index';
import { auditRelationships, printAuditReport } from './audit-relationships';
import { fixRelationships, printFixReport } from './fix-relationships';

async function main() {
  try {
    const db = Neo4jClient.getInstance();
    
    console.log('🔍 Running audit...\n');
    const auditResult = await auditRelationships(db, { dryRun: true });
    printAuditReport(auditResult);
    
    if (auditResult.summary.incorrectRelationships > 0) {
      console.log('\n🔧 Previewing fixes (DRY-RUN)...\n');
      const fixResult = await fixRelationships(db, auditResult, { dryRun: true, proceed: true });
      printFixReport(fixResult, true);
    }
    
    await db.close();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

