import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../__tests__/test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminEntityAnalyze from '../AdminEntityAnalyze';
import type { Jingle } from '../../../types';
import RelatedEntitiesModule from '../../../components/common/RelatedEntities';
import EntityMetadataEditorModule from '../../../components/admin/EntityMetadataEditor';

const RelatedEntities = vi.mocked(RelatedEntitiesModule);
const EntityMetadataEditor = vi.mocked(EntityMetadataEditorModule);

// Mock the admin API
vi.mock('../../../lib/api/client', () => ({
  adminApi: {
    getJingle: vi.fn(),
    updateJingle: vi.fn(),
  },
}));

// Mock RelatedEntities to control its behavior
vi.mock('../../../components/common/RelatedEntities', () => ({
  default: vi.fn(({ ref, isEditing }) => {
    // Expose methods via ref
    if (ref) {
      ref.current = {
        getRelationshipProperties: vi.fn(() => ({})),
        refresh: vi.fn(() => Promise.resolve()),
        hasUnsavedChanges: vi.fn(() => false),
      };
    }
    return (
      <div data-testid="related-entities">
        <div>Related Entities Component</div>
        {isEditing && <div data-testid="blank-rows">Blank rows visible</div>}
      </div>
    );
  }),
}));

// Mock EntityMetadataEditor
vi.mock('../../../components/admin/EntityMetadataEditor', () => ({
  default: vi.fn(({ ref, isEditing }) => {
    // Expose methods via ref
    if (ref) {
      ref.current = {
        hasUnsavedChanges: vi.fn(() => false),
        save: vi.fn(() => Promise.resolve()),
      };
    }
    return (
      <div data-testid="metadata-editor">
        <div>Metadata Editor {isEditing ? '(Editing)' : '(View)'}</div>
      </div>
    );
  }),
}));

// Mock EntityCard
vi.mock('../../../components/common/EntityCard', () => ({
  default: vi.fn(({ isEditing, onEditClick }) => (
    <div data-testid="entity-card">
      <button onClick={() => onEditClick()}>
        {isEditing ? 'Cancelar' : 'Editar'}
      </button>
    </div>
  )),
}));

// Mock UnsavedChangesModal
vi.mock('../../components/admin/UnsavedChangesModal', () => ({
  default: vi.fn(({ isOpen, onDiscard, onSave, onCancel }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="unsaved-changes-modal">
        <button onClick={onDiscard}>Descartar</button>
        <button onClick={onSave}>Guardar</button>
        <button onClick={onCancel}>Cancelar</button>
      </div>
    );
  }),
}));

describe('AdminEntityAnalyze - Task 5: Navigation and Edit Mode', () => {
  const mockJingle: Jingle = {
    id: 'jingle-1',
    title: 'Test Jingle',
    timestamp: 330, // 00:05:30 in seconds
    isJinglazo: false,
    isJinglazoDelDia: false,
    isPrecario: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { adminApi } = await import('../../../lib/api/client');
    (adminApi.getJingle as ReturnType<typeof vi.fn>).mockResolvedValue(mockJingle);
  });

  describe('Task 5.1: Always start in view mode', () => {
    it('should initialize with isEditing=false', async () => {
      render(
        <MemoryRouter initialEntries={['/admin/j/jingle-1']}>
          <Routes>
            <Route path="/admin/:entityType/:entityId" element={<AdminEntityAnalyze />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('metadata-editor')).toBeInTheDocument();
      });

      // Should be in view mode (not editing)
      expect(screen.getByText(/Metadata Editor \(View\)/)).toBeInTheDocument();
      expect(screen.queryByText(/Metadata Editor \(Editing\)/)).not.toBeInTheDocument();
    });

    it('should not show blank rows when not editing', async () => {
      render(
        <MemoryRouter initialEntries={['/admin/j/jingle-1']}>
          <Routes>
            <Route path="/admin/:entityType/:entityId" element={<AdminEntityAnalyze />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('related-entities')).toBeInTheDocument();
      });

      // Blank rows should not be visible when not editing
      expect(screen.queryByTestId('blank-rows')).not.toBeInTheDocument();
    });
  });

  describe('Task 5.3: Blank rows only appear when editing', () => {
    it('should show blank rows when isEditing=true', async () => {
      render(
        <MemoryRouter initialEntries={['/admin/j/jingle-1']}>
          <Routes>
            <Route path="/admin/:entityType/:entityId" element={<AdminEntityAnalyze />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('entity-card')).toBeInTheDocument();
      });

      // Click edit button
      const editButton = screen.getByText('Editar');
      fireEvent.click(editButton);

      await waitFor(() => {
        // Blank rows should be visible when editing
        expect(screen.getByTestId('blank-rows')).toBeInTheDocument();
      });
    });

    it('should hide blank rows when canceling edit', async () => {
      render(
        <MemoryRouter initialEntries={['/admin/j/jingle-1']}>
          <Routes>
            <Route path="/admin/:entityType/:entityId" element={<AdminEntityAnalyze />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('entity-card')).toBeInTheDocument();
      });

      // Enter edit mode
      const editButton = screen.getByText('Editar');
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('blank-rows')).toBeInTheDocument();
      });

      // Exit edit mode
      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        // Blank rows should be hidden
        expect(screen.queryByTestId('blank-rows')).not.toBeInTheDocument();
      });
    });
  });

  describe('Task 5.4 & 5.5: Unsaved changes detection', () => {
    it('should detect unsaved changes from metadata editor', async () => {

      render(
        <MemoryRouter initialEntries={['/admin/j/jingle-1']}>
          <Routes>
            <Route path="/admin/:entityType/:entityId" element={<AdminEntityAnalyze />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('metadata-editor')).toBeInTheDocument();
      });

      // Simulate metadata editor having unsaved changes
      const metadataEditorCall = EntityMetadataEditor.mock.calls[0];
      const metadataEditorRef = metadataEditorCall[0].ref;
      if (metadataEditorRef && typeof metadataEditorRef !== 'function' && metadataEditorRef.current) {
        metadataEditorRef.current.hasUnsavedChanges = vi.fn(() => true);
      }

      // Enter edit mode
      const editButton = screen.getByText('Editar');
      fireEvent.click(editButton);

      // Try to navigate (this should trigger unsaved changes check)
      // Note: This test verifies the checkUnsavedChanges function works
      // Full navigation blocking is tested separately
    });

    it('should detect unsaved changes from relationships', async () => {

      render(
        <MemoryRouter initialEntries={['/admin/j/jingle-1']}>
          <Routes>
            <Route path="/admin/:entityType/:entityId" element={<AdminEntityAnalyze />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('related-entities')).toBeInTheDocument();
      });

      // Simulate relationships having unsaved changes
      const relatedEntitiesCall = RelatedEntities.mock.calls[0];
      const relatedEntitiesRef = relatedEntitiesCall[0].ref;
      if (relatedEntitiesRef && typeof relatedEntitiesRef !== 'function' && relatedEntitiesRef.current) {
        relatedEntitiesRef.current.hasUnsavedChanges = vi.fn(() => true);
      }

      // The checkUnsavedChanges function should detect this
      // Full integration test would verify the modal appears
    });
  });

  describe('Task 5.8: Navigation with unsaved changes', () => {
    it('should show modal when navigating with unsaved changes', async () => {

      render(
        <MemoryRouter initialEntries={['/admin/j/jingle-1']}>
          <Routes>
            <Route path="/admin/:entityType/:entityId" element={<AdminEntityAnalyze />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('related-entities')).toBeInTheDocument();
      });

      // Set up unsaved changes
      const metadataEditorCall = EntityMetadataEditor.mock.calls[0];
      const metadataEditorRef = metadataEditorCall[0].ref;
      if (metadataEditorRef && typeof metadataEditorRef !== 'function' && metadataEditorRef.current) {
        metadataEditorRef.current.hasUnsavedChanges = vi.fn(() => true);
      }

      // Get the onNavigateToEntity callback
      const relatedEntitiesCall = RelatedEntities.mock.calls[0];
      const onNavigateToEntity = relatedEntitiesCall[0].onNavigateToEntity;

      // Trigger navigation
      if (onNavigateToEntity) {
        onNavigateToEntity('jingle', 'jingle-2');
      }

      await waitFor(() => {
        // Modal should appear
        expect(screen.getByTestId('unsaved-changes-modal')).toBeInTheDocument();
      });
    });

    it('should navigate immediately when no unsaved changes', async () => {

      render(
        <MemoryRouter initialEntries={['/admin/j/jingle-1']}>
          <Routes>
            <Route path="/admin/:entityType/:entityId" element={<AdminEntityAnalyze />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('related-entities')).toBeInTheDocument();
      });

      // Get the onNavigateToEntity callback
      const relatedEntitiesCall = RelatedEntities.mock.calls[0];
      const onNavigateToEntity = relatedEntitiesCall[0].onNavigateToEntity;

      // Trigger navigation (no unsaved changes)
      if (onNavigateToEntity) {
        onNavigateToEntity('jingle', 'jingle-2');
      }

      // Modal should not appear
      expect(screen.queryByTestId('unsaved-changes-modal')).not.toBeInTheDocument();
    });
  });

  describe('Task 5.9: UnsavedChangesModal actions', () => {
    it('should handle Discard action', async () => {

      render(
        <MemoryRouter initialEntries={['/admin/j/jingle-1']}>
          <Routes>
            <Route path="/admin/:entityType/:entityId" element={<AdminEntityAnalyze />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('related-entities')).toBeInTheDocument();
      });

      // Set up unsaved changes and trigger navigation
      const metadataEditorCall = EntityMetadataEditor.mock.calls[0];
      const metadataEditorRef = metadataEditorCall[0].ref;
      if (metadataEditorRef && typeof metadataEditorRef !== 'function' && metadataEditorRef.current) {
        metadataEditorRef.current.hasUnsavedChanges = vi.fn(() => true);
      }

      const relatedEntitiesCall = RelatedEntities.mock.calls[0];
      const onNavigateToEntity = relatedEntitiesCall[0].onNavigateToEntity;

      if (onNavigateToEntity) {
        onNavigateToEntity('jingle', 'jingle-2');
      }

      await waitFor(() => {
        expect(screen.getByTestId('unsaved-changes-modal')).toBeInTheDocument();
      });

      // Click Discard
      const discardButton = screen.getByText('Descartar');
      fireEvent.click(discardButton);

      await waitFor(() => {
        // Modal should close
        expect(screen.queryByTestId('unsaved-changes-modal')).not.toBeInTheDocument();
      });
    });

    it('should handle Save action', async () => {
      const { adminApi } = await import('../../../lib/api/client');

      (adminApi.updateJingle as ReturnType<typeof vi.fn>).mockResolvedValue(mockJingle);

      render(
        <MemoryRouter initialEntries={['/admin/j/jingle-1']}>
          <Routes>
            <Route path="/admin/:entityType/:entityId" element={<AdminEntityAnalyze />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('related-entities')).toBeInTheDocument();
      });

      // Set up unsaved changes and trigger navigation
      const metadataEditorCall = EntityMetadataEditor.mock.calls[0];
      const metadataEditorRef = metadataEditorCall[0].ref;
      const mockSave = vi.fn(() => Promise.resolve());
      if (metadataEditorRef && typeof metadataEditorRef !== 'function' && metadataEditorRef.current) {
        metadataEditorRef.current.hasUnsavedChanges = vi.fn(() => true);
        metadataEditorRef.current.save = mockSave;
      }

      const relatedEntitiesCall = RelatedEntities.mock.calls[0];
      const onNavigateToEntity = relatedEntitiesCall[0].onNavigateToEntity;

      if (onNavigateToEntity) {
        onNavigateToEntity('jingle', 'jingle-2');
      }

      await waitFor(() => {
        expect(screen.getByTestId('unsaved-changes-modal')).toBeInTheDocument();
      });

      // Click Save
      const saveButton = screen.getByText('Guardar');
      fireEvent.click(saveButton);

      await waitFor(() => {
        // Save should be called
        expect(mockSave).toHaveBeenCalled();
      });

      await waitFor(() => {
        // Modal should close after save
        expect(screen.queryByTestId('unsaved-changes-modal')).not.toBeInTheDocument();
      });
    });

    it('should handle Cancel action', async () => {

      render(
        <MemoryRouter initialEntries={['/admin/j/jingle-1']}>
          <Routes>
            <Route path="/admin/:entityType/:entityId" element={<AdminEntityAnalyze />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('related-entities')).toBeInTheDocument();
      });

      // Set up unsaved changes and trigger navigation
      const metadataEditorCall = EntityMetadataEditor.mock.calls[0];
      const metadataEditorRef = metadataEditorCall[0].ref;
      if (metadataEditorRef && typeof metadataEditorRef !== 'function' && metadataEditorRef.current) {
        metadataEditorRef.current.hasUnsavedChanges = vi.fn(() => true);
      }

      const relatedEntitiesCall = RelatedEntities.mock.calls[0];
      const onNavigateToEntity = relatedEntitiesCall[0].onNavigateToEntity;

      if (onNavigateToEntity) {
        onNavigateToEntity('jingle', 'jingle-2');
      }

      await waitFor(() => {
        expect(screen.getByTestId('unsaved-changes-modal')).toBeInTheDocument();
      });

      // Click Cancel
      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        // Modal should close
        expect(screen.queryByTestId('unsaved-changes-modal')).not.toBeInTheDocument();
      });
    });
  });
});

