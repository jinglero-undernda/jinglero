import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../../lib/api/client';
import '../../styles/admin.css';

type EntityType = 'fabrica' | 'jingle' | 'cancion' | 'artista' | 'tematica';

interface EntityOption {
  id: string;
  label: string;
}

const ENTITY_TYPES: Array<{ 
  type: EntityType; 
  label: string; 
  routePrefix: string;
  getEntities: () => Promise<Array<{ id: string; title?: string; name?: string; stageName?: string }>>;
}> = [
  {
    type: 'fabrica',
    label: 'Fábrica',
    routePrefix: 'f',
    getEntities: async () => {
      const entities = await publicApi.getFabricas();
      return entities.map(e => ({ id: e.id, title: e.title }));
    },
  },
  {
    type: 'jingle',
    label: 'Jingle',
    routePrefix: 'j',
    getEntities: async () => {
      const entities = await publicApi.getJingles();
      return entities.map(e => {
        // Build display title with fallbacks
        // Prefer shorter titles for dropdown display to prevent layout issues
        let displayTitle = e.title;
        if (!displayTitle && e.songTitle) {
          // Use just songTitle if available (shorter than combining with artist)
          displayTitle = e.songTitle;
        }
        if (!displayTitle && e.artistName) {
          displayTitle = e.artistName;
        }
        if (!displayTitle) {
          displayTitle = e.id;
        }
        // Truncate very long titles to prevent layout issues
        if (displayTitle.length > 60) {
          displayTitle = displayTitle.substring(0, 57) + '...';
        }
        return { id: e.id, title: displayTitle };
      });
    },
  },
  {
    type: 'cancion',
    label: 'Canción',
    routePrefix: 'c',
    getEntities: async () => {
      const entities = await publicApi.getCanciones();
      return entities.map(e => ({ id: e.id, title: e.title }));
    },
  },
  {
    type: 'artista',
    label: 'Artista',
    routePrefix: 'a',
    getEntities: async () => {
      const entities = await publicApi.getArtistas();
      return entities.map(e => ({ id: e.id, stageName: e.stageName, name: e.name }));
    },
  },
  {
    type: 'tematica',
    label: 'Temática',
    routePrefix: 't',
    getEntities: async () => {
      const entities = await publicApi.getTematicas();
      return entities.map(e => ({ id: e.id, name: e.name }));
    },
  },
];

export default function AdminHome() {
  const navigate = useNavigate();
  const [selectedEntities, setSelectedEntities] = useState<Record<EntityType, string>>({
    fabrica: '',
    jingle: '',
    cancion: '',
    artista: '',
    tematica: '',
  });
  const [entityOptions, setEntityOptions] = useState<Record<EntityType, EntityOption[]>>({
    fabrica: [],
    jingle: [],
    cancion: [],
    artista: [],
    tematica: [],
  });
  const [loading, setLoading] = useState<Record<EntityType, boolean>>({
    fabrica: false,
    jingle: false,
    cancion: false,
    artista: false,
    tematica: false,
  });

  // Load entities for each type
  useEffect(() => {
    const loadEntities = async () => {
      for (const entityConfig of ENTITY_TYPES) {
        try {
          setLoading(prev => ({ ...prev, [entityConfig.type]: true }));
          const entities = await entityConfig.getEntities();
          const options: EntityOption[] = entities.map(entity => ({
            id: entity.id,
            label: entity.title || entity.stageName || entity.name || entity.id,
          }));
          setEntityOptions(prev => ({ ...prev, [entityConfig.type]: options }));
        } catch (error) {
          console.error(`Error loading ${entityConfig.label}:`, error);
          // Set empty array on error so dropdown still renders
          setEntityOptions(prev => ({ ...prev, [entityConfig.type]: [] }));
        } finally {
          setLoading(prev => ({ ...prev, [entityConfig.type]: false }));
        }
      }
    };

    loadEntities();
  }, []);

  const handleSelectChange = (type: EntityType, entityId: string) => {
    // Ensure we're setting a string value (not undefined or null)
    const value = entityId || '';
    setSelectedEntities(prev => ({ ...prev, [type]: value }));
  };

  const handleAnalyze = (type: EntityType) => {
    const entityId = selectedEntities[type];
    if (!entityId) {
      alert(`Por favor selecciona una ${ENTITY_TYPES.find(e => e.type === type)?.label.toLowerCase()}`);
      return;
    }
    const routePrefix = ENTITY_TYPES.find(e => e.type === type)?.routePrefix;
    navigate(`/admin/${routePrefix}/${entityId}`);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Admin - Análisis de Entidades</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Selecciona una entidad de cada tipo para analizar sus relaciones.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {ENTITY_TYPES.map((entityConfig) => {
          const currentValue = selectedEntities[entityConfig.type] || '';
          const options = entityOptions[entityConfig.type];
          const selectedOption = options.find(opt => opt.id === currentValue);
          
          return (
          <div
            key={entityConfig.type}
            className="admin-entity-row"
          >
            <label className="admin-entity-row__label">
              {entityConfig.label}:
            </label>
            <select
              value={currentValue}
              onChange={(e) => handleSelectChange(entityConfig.type, e.target.value)}
              disabled={loading[entityConfig.type]}
              className="admin-entity-row__select"
              size={1}
              title={selectedOption ? `${selectedOption.label} (${selectedOption.id})` : ''}
              style={{
                backgroundColor: loading[entityConfig.type] ? '#f0f0f0' : 'white',
              }}
            >
              <option value="">
                {loading[entityConfig.type] ? 'Cargando...' : '-- Seleccionar --'}
              </option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} ({option.id})
                </option>
              ))}
            </select>
            <button
              onClick={() => handleAnalyze(entityConfig.type)}
              disabled={!currentValue || loading[entityConfig.type]}
              className="admin-entity-row__button"
              style={{
                backgroundColor: currentValue && !loading[entityConfig.type]
                  ? '#1976d2'
                  : '#ccc',
                cursor: currentValue && !loading[entityConfig.type]
                  ? 'pointer'
                  : 'not-allowed',
              }}
              onMouseEnter={(e) => {
                if (currentValue && !loading[entityConfig.type]) {
                  e.currentTarget.style.backgroundColor = '#1565c0';
                }
              }}
              onMouseLeave={(e) => {
                if (currentValue && !loading[entityConfig.type]) {
                  e.currentTarget.style.backgroundColor = '#1976d2';
                }
              }}
            >
              ANALIZA
            </button>
          </div>
          );
        })}
      </div>
    </div>
  );
}

