/**
 * CleanupScriptSection Component
 * 
 * Groups cleanup scripts by entity type.
 * Displays a section header and renders script buttons for that category.
 */

import CleanupScriptButton from './CleanupScriptButton';

interface ScriptMetadata {
  id: string;
  name: string;
  description: string;
  entityType: string;
  category: 'fabricas' | 'jingles' | 'canciones' | 'artistas' | 'general';
  automatable: boolean;
  estimatedDuration: string;
  usesMusicBrainz: boolean;
}

interface CleanupScriptSectionProps {
  entityType: 'fabricas' | 'jingles' | 'canciones' | 'artistas' | 'general';
  scripts: ScriptMetadata[];
  onScriptClick: (scriptId: string) => void;
  runningScripts: Set<string>;
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  fabricas: 'Fábricas',
  jingles: 'Jingles',
  canciones: 'Canciones',
  artistas: 'Artistas',
  general: 'General',
};

export default function CleanupScriptSection({
  entityType,
  scripts,
  onScriptClick,
  runningScripts,
}: CleanupScriptSectionProps) {
  if (scripts.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3
        style={{
          margin: '0 0 1rem 0',
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#333',
          borderBottom: '2px solid #1976d2',
          paddingBottom: '0.5rem',
        }}
      >
        {ENTITY_TYPE_LABELS[entityType] || entityType}
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}
      >
        {scripts.map((script) => (
          <CleanupScriptButton
            key={script.id}
            scriptId={script.id}
            scriptName={script.name}
            description={script.description}
            entityType={script.entityType}
            category={script.category}
            automatable={script.automatable}
            usesMusicBrainz={script.usesMusicBrainz}
            loading={runningScripts.has(script.id)}
            disabled={runningScripts.size > 0 && !runningScripts.has(script.id)}
            onClick={onScriptClick}
          />
        ))}
      </div>
    </div>
  );
}


