/**
 * CleanupScriptButton Component
 * 
 * Displays an individual cleanup script as a clickable button.
 * Shows script name, description, and loading state during execution.
 */

interface CleanupScriptButtonProps {
  scriptId: string;
  scriptName: string;
  description: string;
  entityType: string;
  category: 'fabricas' | 'jingles' | 'canciones' | 'artistas' | 'general';
  automatable: boolean;
  usesMusicBrainz: boolean;
  loading: boolean;
  disabled: boolean;
  onClick: (scriptId: string) => void;
  error?: string | null;
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  fabricas: 'Fábricas',
  jingles: 'Jingles',
  canciones: 'Canciones',
  artistas: 'Artistas',
  general: 'General',
};

export default function CleanupScriptButton({
  scriptId,
  scriptName,
  description,
  entityType,
  category,
  automatable,
  usesMusicBrainz,
  loading,
  disabled,
  onClick,
  error,
}: CleanupScriptButtonProps) {
  const handleClick = () => {
    if (!disabled && !loading) {
      onClick(scriptId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      style={{
        padding: '1rem',
        backgroundColor: loading ? '#f5f5f5' : '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.2s',
        position: 'relative',
        boxShadow: error ? '0 0 0 2px #f44336' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = '#f9f9f9';
          e.currentTarget.style.borderColor = '#1976d2';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = '#fff';
          e.currentTarget.style.borderColor = '#ddd';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {loading && (
          <div
            style={{
              width: '20px',
              height: '20px',
              border: '2px solid #1976d2',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              flexShrink: 0,
              marginTop: '2px',
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{scriptName}</h4>
            <span
              style={{
                padding: '0.125rem 0.5rem',
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {ENTITY_TYPE_LABELS[category] || category}
            </span>
            {automatable && (
              <span
                style={{
                  padding: '0.125rem 0.5rem',
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
                title="Este script puede automatizar correcciones"
              >
                Automatizable
              </span>
            )}
            {usesMusicBrainz && (
              <span
                style={{
                  padding: '0.125rem 0.5rem',
                  backgroundColor: '#fff3e0',
                  color: '#f57c00',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
                title="Este script usa MusicBrainz API"
              >
                MusicBrainz
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#666', lineHeight: '1.4' }}>
            {description}
          </p>
          {error && (
            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#ffebee',
                borderRadius: '4px',
                color: '#c62828',
                fontSize: '0.875rem',
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}


