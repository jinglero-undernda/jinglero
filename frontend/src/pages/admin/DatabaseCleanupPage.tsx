/**
 * DatabaseCleanupPage Component
 * 
 * Main page component for the database cleanup and validation feature.
 * Displays available cleanup scripts organized by entity type, allows users to execute scripts,
 * and manages the results modal display.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/api/client';
import CleanupScriptSection from '../../components/admin/CleanupScriptSection';
import CleanupResultsModal from '../../components/admin/CleanupResultsModal';
import { useToast } from '../../components/common/ToastContext';

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

interface ScriptExecutionResponse {
  scriptId: string;
  scriptName: string;
  totalFound: number;
  executionTime: number;
  timestamp: string;
  entities: Array<{
    entityType: string;
    entityId: string;
    entityTitle?: string;
    issue: string;
    currentValue: any;
    suggestion?: {
      type: 'update' | 'create' | 'delete' | 'relationship';
      field?: string;
      recommendedValue?: any;
      automatable: boolean;
      requiresManualReview: boolean;
      musicBrainzMatch?: {
        musicBrainzId: string;
        title: string;
        artist?: string;
        confidence: number;
        source: 'musicbrainz_search' | 'musicbrainz_lookup';
        alternatives?: Array<{
          musicBrainzId: string;
          title: string;
          artist?: string;
          confidence: number;
        }>;
      };
    };
  }>;
  suggestions: Array<{
    type: string;
    field?: string;
    count: number;
    automatable: number;
    requiresReview: number;
  }>;
  musicBrainzCalls?: number;
  musicBrainzErrors?: Array<{
    entityId: string;
    error: string;
    retryable: boolean;
  }>;
}

const CATEGORY_ORDER: Array<'general' | 'fabricas' | 'jingles' | 'canciones' | 'artistas'> = [
  'general',
  'fabricas',
  'jingles',
  'canciones',
  'artistas',
];

export default function DatabaseCleanupPage() {
  const { showToast } = useToast();
  const [scripts, setScripts] = useState<ScriptMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningScripts, setRunningScripts] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<ScriptExecutionResponse | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);

  // Load available scripts on mount
  useEffect(() => {
    const loadScripts = async () => {
      try {
        const response = await adminApi.getCleanupScripts();
        setScripts(response.scripts);
      } catch (error: any) {
        showToast(`Error al cargar scripts: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    loadScripts();
  }, [showToast]);

  // Handle script execution
  const handleScriptClick = async (scriptId: string) => {
    setRunningScripts((prev) => new Set(prev).add(scriptId));
    setSelectedScript(scriptId);

    try {
      const executionResults = await adminApi.executeCleanupScript(scriptId);
      setResults(executionResults);
      setShowResultsModal(true);
      showToast(`Script ejecutado: ${executionResults.totalFound} problemas encontrados`, 'success');
    } catch (error: any) {
      showToast(`Error al ejecutar script: ${error.message}`, 'error');
    } finally {
      setRunningScripts((prev) => {
        const next = new Set(prev);
        next.delete(scriptId);
        return next;
      });
    }
  };

  // Handle automation
  const handleAutomate = async (entityIds: string[], applyLowConfidence: boolean) => {
    if (!selectedScript) return;

    try {
      const automationResults = await adminApi.automateCleanupFixes(
        selectedScript,
        entityIds,
        applyLowConfidence
      );

      showToast(
        `Automatización completada: ${automationResults.successful} exitosos, ${automationResults.failed} fallidos`,
        automationResults.failed > 0 ? 'warning' : 'success'
      );

      // Optionally refresh results or close modal
      if (automationResults.successful > 0) {
        setShowResultsModal(false);
        setResults(null);
        setSelectedScript(null);
      }
    } catch (error: any) {
      showToast(`Error al automatizar: ${error.message}`, 'error');
      throw error; // Re-throw so modal can handle it
    }
  };

  // Group scripts by category
  const scriptsByCategory = scripts.reduce(
    (acc, script) => {
      const category = script.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(script);
      return acc;
    },
    {} as Record<string, ScriptMetadata[]>
  );

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Cargando scripts de limpieza...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 600, color: '#333' }}>
            Limpieza en la Base de Datos
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', color: '#666' }}>
            Ejecuta scripts de limpieza para identificar y resolver problemas de calidad de datos
          </p>
        </div>
        <Link
          to="/admin/dashboard"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1976d2',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
          }}
        >
          ← Volver al Dashboard
        </Link>
      </div>

      {/* Scripts organized by category */}
      {CATEGORY_ORDER.map((category) => {
        const categoryScripts = scriptsByCategory[category] || [];
        if (categoryScripts.length === 0) return null;

        return (
          <CleanupScriptSection
            key={category}
            entityType={category}
            scripts={categoryScripts}
            onScriptClick={handleScriptClick}
            runningScripts={runningScripts}
          />
        );
      })}

      {/* Results Modal */}
      <CleanupResultsModal
        isOpen={showResultsModal}
        results={results}
        onClose={() => {
          setShowResultsModal(false);
          setResults(null);
          setSelectedScript(null);
        }}
        onAutomate={handleAutomate}
      />
    </div>
  );
}

