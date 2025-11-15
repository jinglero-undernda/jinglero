interface DeleteRelationshipModalProps {
  isOpen: boolean;
  entityName: string;
  currentEntityName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Phase 6: Modal for confirming relationship deletion
 */
export default function DeleteRelationshipModal({
  isOpen,
  entityName,
  currentEntityName,
  onConfirm,
  onCancel,
}: DeleteRelationshipModalProps) {
  if (!isOpen) return null;

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
        zIndex: 9999,
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
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '1.5rem' }}>
          ¿Eliminar relación con {entityName}?
        </h2>
        <p style={{ margin: '0 0 1.5rem 0', color: '#ccc', lineHeight: '1.6' }}>
          <strong>NOTA:</strong> {entityName} no se elimina, pero no estará vinculado a {currentEntityName}.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#555';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#666';
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#d32f2f',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#b71c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#d32f2f';
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

