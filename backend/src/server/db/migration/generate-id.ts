/**
 * Quick ID Generator Utility
 * 
 * Generates IDs in the new format: {prefix}{8-char-base36}
 * 
 * Usage:
 *   npx ts-node src/server/db/migration/generate-id.ts [type] [count]
 * 
 * Examples:
 *   npx ts-node src/server/db/migration/generate-id.ts jingle 5
 *   npx ts-node src/server/db/migration/generate-id.ts cancion
 *   npx ts-node src/server/db/migration/generate-id.ts artista 10
 */

const ENTITY_PREFIX_MAP: Record<string, string> = {
  jingle: 'j',
  cancion: 'c',
  artista: 'a',
  tematica: 't',
  usuario: 'u',
};

function generateId(prefix: string): string {
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${prefix}${randomPart}`;
}

function main() {
  const args = process.argv.slice(2);
  const entityType = args[0]?.toLowerCase() || 'jingle';
  const count = parseInt(args[1] || '1', 10);

  const prefix = ENTITY_PREFIX_MAP[entityType];
  
  if (!prefix) {
    console.error(`❌ Unknown entity type: ${entityType}`);
    console.error(`Available types: ${Object.keys(ENTITY_PREFIX_MAP).join(', ')}`);
    process.exit(1);
  }

  if (count < 1 || count > 100) {
    console.error(`❌ Count must be between 1 and 100`);
    process.exit(1);
  }

  console.log(`\n🔖 Generating ${count} ID(s) for ${entityType}:\n`);
  
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    const id = generateId(prefix);
    ids.push(id);
    console.log(`  ${i + 1}. ${id}`);
  }

  console.log(`\n✅ Generated ${ids.length} ID(s)`);
  console.log(`\nCopy-paste ready:\n${ids.join('\n')}\n`);
}

main();

