import React from 'react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onDiscard: () => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  entityName?: string;
}

export default function UnsavedChangesModal({
  isOpen,
  onDiscard,
  onSave,
  onCancel,
  entityName = 'esta entidad',
}: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #444',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          color: '#fff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', color: '#fff' }}>
          Cambios sin guardar
        </h2>
        <p style={{ marginBottom: '1.5rem', color: '#ccc', lineHeight: '1.5' }}>
          Tienes cambios sin guardar en {entityName}. ¿Qué deseas hacer?
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onDiscard}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4a1a1a',
              border: '1px solid #6a2a2a',
              borderRadius: '4px',
              color: '#ff6b6b',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Descartar cambios
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1a4a1a',
              border: '1px solid #2a6a2a',
              borderRadius: '4px',
              color: '#6bff6b',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}

