#!/usr/bin/env node

/**
 * CLI Entry Point for Relationship Direction Audit and Fix
 * 
 * Usage:
 *   npx ts-node backend/src/server/db/quality/audit-relationships-cli.ts [options]
 * 
 * Options:
 *   --dry-run          Run in dry-run mode (default: true)
 *   --fix              Execute fixes (requires explicit flag)
 *   --relationship-types  Comma-separated list of relationship types to audit
 *   --output           JSON file path to save audit report
 */

import { Neo4jClient } from '../index';
import { auditRelationships, printAuditReport, type AuditOptions } from './audit-relationships';
import { fixRelationships, printFixReport, type FixOptions } from './fix-relationships';
import { getAllRelationshipTypes, type RelationshipTypeKey } from './relationship-schema';
import * as fs from 'fs/promises';
import * as path from 'path';

interface CliOptions {
  dryRun: boolean;
  fix: boolean;
  relationshipTypes?: string[];
  output?: string;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    dryRun: true,
    fix: false,
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--fix') {
      options.fix = true;
      options.dryRun = false;
    } else if (arg === '--relationship-types' && i + 1 < args.length) {
      options.relationshipTypes = args[i + 1].split(',').map(s => s.trim());
      i++;
    } else if (arg === '--output' && i + 1 < args.length) {
      options.output = args[i + 1];
      i++;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }
  
  return options;
}

function printHelp(): void {
  console.log(`
Relationship Direction Audit and Fix Tool

Usage:
  npx ts-node backend/src/server/db/quality/audit-relationships-cli.ts [options]

Options:
  --dry-run                    Run in dry-run mode (default: true)
  --fix                        Execute fixes (requires explicit flag, sets dry-run to false)
  --relationship-types TYPES   Comma-separated list of relationship types to audit
                                (e.g., "versiona,appears_in")
  --output PATH                JSON file path to save audit report
  --help, -h                   Show this help message

Examples:
  # Audit all relationships (dry-run)
  npx ts-node backend/src/server/db/quality/audit-relationships-cli.ts

  # Audit specific relationship types
  npx ts-node backend/src/server/db/quality/audit-relationships-cli.ts --relationship-types versiona,appears_in

  # Fix relationships (executes changes)
  npx ts-node backend/src/server/db/quality/audit-relationships-cli.ts --fix

  # Save audit report to file
  npx ts-node backend/src/server/db/quality/audit-relationships-cli.ts --output audit-report.json
`);
}

function validateRelationshipTypes(types: string[]): RelationshipTypeKey[] {
  const validTypes = getAllRelationshipTypes();
  const invalid: string[] = [];
  const valid: RelationshipTypeKey[] = [];
  
  for (const type of types) {
    if (validTypes.includes(type as RelationshipTypeKey)) {
      valid.push(type as RelationshipTypeKey);
    } else {
      invalid.push(type);
    }
  }
  
  if (invalid.length > 0) {
    console.error(`\n❌ Invalid relationship types: ${invalid.join(', ')}`);
    console.error(`Valid types: ${validTypes.join(', ')}\n`);
    process.exit(1);
  }
  
  return valid;
}

async function main(): Promise<void> {
  try {
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║   RELATIONSHIP DIRECTION AUDIT & FIX TOOL         ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');
    
    const options = parseArgs();
    
    // Validate relationship types if provided
    let relationshipTypes: RelationshipTypeKey[] | undefined;
    if (options.relationshipTypes) {
      relationshipTypes = validateRelationshipTypes(options.relationshipTypes);
    }
    
    // Initialize database connection
    const db = Neo4jClient.getInstance();
    
    // Verify connection
    const isConnected = await db.verifyConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to Neo4j database');
      process.exit(1);
    }
    
    console.log('✅ Connected to Neo4j database\n');
    
    // Run audit
    const auditOptions: AuditOptions = {
      dryRun: options.dryRun,
      relationshipTypes,
      fix: options.fix,
    };
    
    const auditResult = await auditRelationships(db, auditOptions);
    
    // Print audit report
    printAuditReport(auditResult);
    
    // Save audit report to file if requested
    if (options.output) {
      const reportDir = path.dirname(options.output);
      if (reportDir !== '.') {
        await fs.mkdir(reportDir, { recursive: true });
      }
      await fs.writeFile(options.output, JSON.stringify(auditResult, null, 2));
      console.log(`\n💾 Audit report saved to: ${options.output}`);
    }
    
    // Run fixes if requested
    if (options.fix && auditResult.summary.incorrectRelationships > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('⚠️  WARNING: You are about to modify the database!');
      console.log('='.repeat(60));
      console.log(`This will fix ${auditResult.summary.incorrectRelationships} incorrect relationships.`);
      console.log('Make sure you have backed up your database before proceeding.\n');
      
      // In a real CLI, you might want to add a confirmation prompt here
      // For now, we proceed if --fix flag is explicitly set
      
      const fixOptions: FixOptions = {
        dryRun: false,
        proceed: true,
      };
      
      const fixResult = await fixRelationships(db, auditResult, fixOptions);
      printFixReport(fixResult, false);
      
      // Re-run audit to verify fixes
      console.log('\n🔍 Re-running audit to verify fixes...');
      const verifyResult = await auditRelationships(db, auditOptions);
      printAuditReport(verifyResult);
      
      if (verifyResult.summary.incorrectRelationships === 0) {
        console.log('\n✅ All relationships are now correct!');
      } else {
        console.warn(`\n⚠️  ${verifyResult.summary.incorrectRelationships} incorrect relationships remain.`);
      }
    } else if (options.fix && auditResult.summary.incorrectRelationships === 0) {
      console.log('\n✅ No incorrect relationships found. Nothing to fix.');
    }
    
    // Close database connection
    await db.close();
    
    console.log('\n✅ Audit complete!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();

