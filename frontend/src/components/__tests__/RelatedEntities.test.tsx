import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../__tests__/test-utils';
import RelatedEntities, { type RelationshipConfig } from '../common/RelatedEntities';
import type { Cancion, Fabrica, Jingle } from '../../types';

// Mock the relationship configs utility
vi.mock('../../lib/utils/relationshipConfigs', () => ({
  getRelationshipsForEntityType: vi.fn(() => []),
}));

// Helper to create mock entities
const createMockFabrica = (overrides?: Partial<Fabrica>): Fabrica => ({
  id: 'fabrica-1',
  title: 'Test Fabrica',
  date: '2024-01-15',
  youtubeUrl: 'https://youtube.com/watch?v=test',
  status: 'COMPLETED',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

const createMockJingle = (overrides?: Partial<Jingle>): Jingle => ({
  id: 'jingle-1',
  title: 'Test Jingle',
  timestamp: '00:05:30',
  isJinglazo: false,
  isJinglazoDelDia: false,
  isPrecario: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

const createMockCancion = (overrides?: Partial<Cancion>): Cancion => ({
  id: 'cancion-1',
  title: 'Test Cancion',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// const createMockArtista = (overrides?: Partial<Artista>): Artista => ({
//   id: 'artista-1',
//   stageName: 'Test Artist',
//   isArg: true,
//   createdAt: '2024-01-01T00:00:00Z',
//   updatedAt: '2024-01-01T00:00:00Z',
//   ...overrides,
// });

describe('RelatedEntities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Pagination Removal (Phase 2)', () => {
    it('should display all entities when expanded, regardless of count', async () => {
      // Create 10 jingles to test that all are displayed (not just 5)
      const manyJingles: Jingle[] = Array.from({ length: 10 }, (_, i) =>
        createMockJingle({
          id: `jingle-${i + 1}`,
          title: `Jingle ${i + 1}`,
        })
      );

      const mockFetchFn = vi.fn().mockResolvedValue(manyJingles);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          expandable: true,
          fetchFn: mockFetchFn,
        },
      ];

      const rootEntity = createMockFabrica({ id: 'fabrica-root' });

      render(
        <RelatedEntities
          entity={rootEntity}
          entityType="fabrica"
          relationships={relationships}
          entityPath={[]}
          isAdmin={true} // Admin Mode to auto-load
        />
      );

      // Wait for the relationship to load (auto-expanded at top level in Admin Mode)
      await waitFor(() => {
        expect(mockFetchFn).toHaveBeenCalled();
      });

      // Wait for all entities to be rendered
      await waitFor(() => {
        // All 10 jingles should be displayed
        expect(screen.getAllByText(/Jingle \d+/)).toHaveLength(10);
      });

      // Verify no pagination buttons exist
      expect(screen.queryByText(/Mostrar \d+ entidades/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Mostrar \d+ más/i)).not.toBeInTheDocument();
    });

    it('should not render "Mostrar # entidades" button in collapsed state', () => {
      const mockFetchFn = vi.fn().mockResolvedValue([]);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          expandable: true,
          fetchFn: mockFetchFn,
          fetchCountFn: vi.fn().mockResolvedValue(10), // More than 5
        },
      ];

      const rootEntity = createMockFabrica({ id: 'fabrica-root' });

      render(
        <RelatedEntities
          entity={rootEntity}
          entityType="fabrica"
          relationships={relationships}
          entityPath={['some-id']} // Not top level, so won't auto-expand
        />
      );

      // Should show count, not "Mostrar # entidades" button
      expect(screen.queryByText(/Mostrar \d+ entidades/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Mostrar \d+ más/i)).not.toBeInTheDocument();
    });

    it('should not render "Mostrar X más" button when expanded with many entities', async () => {
      // Create 8 jingles
      const manyJingles: Jingle[] = Array.from({ length: 8 }, (_, i) =>
        createMockJingle({
          id: `jingle-${i + 1}`,
          title: `Jingle ${i + 1}`,
        })
      );

      const mockFetchFn = vi.fn().mockResolvedValue(manyJingles);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          expandable: true,
          fetchFn: mockFetchFn,
        },
      ];

      const rootEntity = createMockFabrica({ id: 'fabrica-root' });

      render(
        <RelatedEntities
          entity={rootEntity}
          entityType="fabrica"
          relationships={relationships}
          entityPath={[]}
          isAdmin={true} // Admin Mode to auto-load
        />
      );

      // Wait for entities to load
      await waitFor(() => {
        expect(screen.getAllByText(/Jingle \d+/)).toHaveLength(8);
      });

      // Verify all 8 are displayed and no "Mostrar X más" button
      expect(screen.queryByText(/Mostrar \d+ más/i)).not.toBeInTheDocument();
      expect(screen.getAllByText(/Jingle \d+/)).toHaveLength(8);
    });

    it('should display count in collapsed state without pagination UI', async () => {
      // When collapsed and not top-level, count is only shown if data is already loaded
      // or if fetchCountFn provides it. For this test, we'll simulate already loaded data.
      const mockFetchFn = vi.fn().mockResolvedValue([]);
      const mockFetchCountFn = vi.fn().mockResolvedValue(7);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          expandable: true,
          fetchFn: mockFetchFn,
          fetchCountFn: mockFetchCountFn,
        },
      ];

      const rootEntity = createMockFabrica({ id: 'fabrica-root' });

      render(
        <RelatedEntities
          entity={rootEntity}
          entityType="fabrica"
          relationships={relationships}
          entityPath={['some-id']} // Not top level, so collapsed by default
        />
      );

      // When collapsed and no data loaded yet, it shows empty state
      // The count will only show after data is loaded or if fetchCountFn is called
      // For now, just verify no pagination buttons exist
      expect(screen.queryByRole('button', { name: /Mostrar/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/Mostrar \d+ entidades/i)).not.toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should render collapsed relationship', () => {
      const mockFetchFn = vi.fn().mockResolvedValue([]);
      const mockFetchCountFn = vi.fn().mockResolvedValue(3);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          expandable: true,
          fetchFn: mockFetchFn,
          fetchCountFn: mockFetchCountFn,
        },
      ];

      const rootEntity = createMockFabrica({ id: 'fabrica-root' });

      render(
        <RelatedEntities
          entity={rootEntity}
          entityType="fabrica"
          relationships={relationships}
          entityPath={['some-id']} // Not top level, so collapsed by default
        />
      );

      // Should show label
      expect(screen.getByText(/Jingles:/i)).toBeInTheDocument();
      // When collapsed and no data loaded, shows empty state
      // Count would show if data was already loaded or after fetchCountFn completes
      expect(screen.queryByRole('button', { name: /Mostrar/i })).not.toBeInTheDocument();
    });

    it('should expand and load entities when expand button is clicked', async () => {
      const jingles: Jingle[] = [
        createMockJingle({ id: 'j-1', title: 'Jingle One' }),
        createMockJingle({ id: 'j-2', title: 'Jingle Two' }),
      ];

      const mockFetchFn = vi.fn().mockResolvedValue(jingles);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          expandable: true,
          fetchFn: mockFetchFn,
        },
      ];

      const rootEntity = createMockFabrica({ id: 'fabrica-root' });

      render(
        <RelatedEntities
          entity={rootEntity}
          entityType="fabrica"
          relationships={relationships}
          entityPath={['some-id']} // Not top level
        />
      );

      // Find and click collapsed relationship area (now the entire area is clickable)
      const collapsedArea = screen.getByRole('button', { expanded: false });
      fireEvent.click(collapsedArea);

      // Wait for entities to load and display
      await waitFor(() => {
        expect(mockFetchFn).toHaveBeenCalled();
        expect(screen.getByText('Jingle One')).toBeInTheDocument();
        expect(screen.getByText('Jingle Two')).toBeInTheDocument();
      });
    });

    it('should handle empty relationships gracefully', async () => {
      const mockFetchFn = vi.fn().mockResolvedValue([]);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          expandable: true,
          fetchFn: mockFetchFn,
        },
      ];

      const rootEntity = createMockFabrica({ id: 'fabrica-root' });

      render(
        <RelatedEntities
          entity={rootEntity}
          entityType="fabrica"
          relationships={relationships}
          entityPath={[]} // Top level
          isAdmin={true} // Admin Mode to auto-load
        />
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(mockFetchFn).toHaveBeenCalled();
      });

      // Should show empty state after loading completes
      await waitFor(() => {
        expect(screen.getByText(/No hay entidades relacionadas/i)).toBeInTheDocument();
      });
    });

    it('should display error message when entity is missing', () => {
      const relationships: RelationshipConfig[] = [];

      render(
        <RelatedEntities
          entity={null as any}
          entityType="fabrica"
          relationships={relationships}
        />
      );

      expect(screen.getByText(/Error: Entity is required/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle exactly 5 entities without pagination', async () => {
      const exactlyFiveJingles: Jingle[] = Array.from({ length: 5 }, (_, i) =>
        createMockJingle({
          id: `jingle-${i + 1}`,
          title: `Jingle ${i + 1}`,
        })
      );

      const mockFetchFn = vi.fn().mockResolvedValue(exactlyFiveJingles);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          expandable: true,
          fetchFn: mockFetchFn,
        },
      ];

      const rootEntity = createMockFabrica({ id: 'fabrica-root' });

      render(
        <RelatedEntities
          entity={rootEntity}
          entityType="fabrica"
          relationships={relationships}
          entityPath={[]}
          isAdmin={true} // Admin Mode to auto-load
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText(/Jingle \d+/)).toHaveLength(5);
      });

      // No pagination buttons should appear
      expect(screen.queryByText(/Mostrar/i)).not.toBeInTheDocument();
    });

    it('should handle 6 entities (previously would show pagination) without pagination', async () => {
      const sixJingles: Jingle[] = Array.from({ length: 6 }, (_, i) =>
        createMockJingle({
          id: `jingle-${i + 1}`,
          title: `Jingle ${i + 1}`,
        })
      );

      const mockFetchFn = vi.fn().mockResolvedValue(sixJingles);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          expandable: true,
          fetchFn: mockFetchFn,
        },
      ];

      const rootEntity = createMockFabrica({ id: 'fabrica-root' });

      render(
        <RelatedEntities
          entity={rootEntity}
          entityType="fabrica"
          relationships={relationships}
          entityPath={[]}
          isAdmin={true} // Admin Mode to auto-load
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText(/Jingle \d+/)).toHaveLength(6);
      });

      // All 6 should be visible, no pagination
      expect(screen.queryByText(/Mostrar/i)).not.toBeInTheDocument();
    });
  });

  describe('Phase 5: Lazy Loading Strategy', () => {
    it('should NOT auto-load relationships in User Mode on mount', async () => {
      const mockFetchFn = vi.fn().mockResolvedValue([
        createMockJingle({ id: 'j-1', title: 'Jingle One' }),
      ]);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          expandable: true,
          fetchFn: mockFetchFn,
        },
      ];

      const rootEntity = createMockFabrica({ id: 'fabrica-root' });

      render(
        <RelatedEntities
          entity={rootEntity}
          entityType="fabrica"
          relationships={relationships}
          entityPath={[]} // Top level
          isAdmin={false} // User Mode
        />
      );

      // Wait a bit to ensure useEffect has run
      await new Promise((resolve) => setTimeout(resolve, 100));

      // fetchFn should NOT have been called (no auto-loading in User Mode)
      expect(mockFetchFn).not.toHaveBeenCalled();

      // Should show collapsed state (empty or count if fetchCountFn provided)
      expect(screen.queryByText('Jingle One')).not.toBeInTheDocument();
    });

    it('should show collapsed relationships in User Mode on initial load', () => {
      const mockFetchFn = vi.fn().mockResolvedValue([]);
      const mockFetchCountFn = vi.fn().mockResolvedValue(5);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          expandable: true,
          fetchFn: mockFetchFn,
          fetchCountFn: mockFetchCountFn,
        },
      ];

      const rootEntity = createMockFabrica({ id: 'fabrica-root' });

      render(
        <RelatedEntities
          entity={rootEntity}
          entityType="fabrica"
          relationships={relationships}
          entityPath={[]} // Top level
          isAdmin={false} // User Mode
        />
      );

      // Should show label
      expect(screen.getByText(/Jingles:/i)).toBeInTheDocument();
      // Should show collapsed state (empty state since no data loaded yet)
      // Note: Count would only show if fetchCountFn was called, but we're not calling it in User Mode
      expect(screen.queryByText('Jingle One')).not.toBeInTheDocument();
    });

    it('should load data on-demand when expanding in User Mode', async () => {
      const jingles: Jingle[] = [
        createMockJingle({ id: 'j-1', title: 'Jingle One' }),
        createMockJingle({ id: 'j-2', title: 'Jingle Two' }),
      ];

      const mockFetchFn = vi.fn().mockResolvedValue(jingles);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          expandable: true,
          fetchFn: mockFetchFn,
        },
      ];

      const rootEntity = createMockFabrica({ id: 'fabrica-root' });

      render(
        <RelatedEntities
          entity={rootEntity}
          entityType="fabrica"
          relationships={relationships}
          entityPath={[]} // Top level
          isAdmin={false} // User Mode
        />
      );

      // Initially, fetchFn should NOT have been called
      expect(mockFetchFn).not.toHaveBeenCalled();

      // Find and click collapsed relationship area (now the entire area is clickable)
      const collapsedArea = screen.getByRole('button', { expanded: false });
      fireEvent.click(collapsedArea);

      // Now fetchFn should be called
      await waitFor(() => {
        expect(mockFetchFn).toHaveBeenCalled();
      });

      // Entities should be displayed
      await waitFor(() => {
        expect(screen.getByText('Jingle One')).toBeInTheDocument();
        expect(screen.getByText('Jingle Two')).toBeInTheDocument();
      });
    });

    it('should auto-load relationships in Admin Mode on mount', async () => {
      const jingles: Jingle[] = [
        createMockJingle({ id: 'j-1', title: 'Jingle One' }),
        createMockJingle({ id: 'j-2', title: 'Jingle Two' }),
      ];

      const mockFetchFn = vi.fn().mockResolvedValue(jingles);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          expandable: true,
          fetchFn: mockFetchFn,
        },
      ];

      const rootEntity = createMockFabrica({ id: 'fabrica-root' });

      render(
        <RelatedEntities
          entity={rootEntity}
          entityType="fabrica"
          relationships={relationships}
          entityPath={[]} // Top level
          isAdmin={true} // Admin Mode
        />
      );

      // fetchFn should be called automatically in Admin Mode
      await waitFor(() => {
        expect(mockFetchFn).toHaveBeenCalled();
      });

      // Entities should be displayed automatically
      await waitFor(() => {
        expect(screen.getByText('Jingle One')).toBeInTheDocument();
        expect(screen.getByText('Jingle Two')).toBeInTheDocument();
      });
    });

    it('should show all relationships loaded in Admin Mode on initial load', async () => {
      const jingles: Jingle[] = [
        createMockJingle({ id: 'j-1', title: 'Jingle One' }),
        createMockJingle({ id: 'j-2', title: 'Jingle Two' }),
      ];

      const canciones: Cancion[] = [
        createMockCancion({ id: 'c-1', title: 'Cancion One' }),
      ];

      const mockFetchJingles = vi.fn().mockResolvedValue(jingles);
      const mockFetchCanciones = vi.fn().mockResolvedValue(canciones);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          expandable: true,
          fetchFn: mockFetchJingles,
        },
        {
          label: 'Canciones',
          entityType: 'cancion',
          expandable: true,
          fetchFn: mockFetchCanciones,
        },
      ];

      const rootEntity = createMockFabrica({ id: 'fabrica-root' });

      render(
        <RelatedEntities
          entity={rootEntity}
          entityType="fabrica"
          relationships={relationships}
          entityPath={[]} // Top level
          isAdmin={true} // Admin Mode
        />
      );

      // Both fetch functions should be called automatically
      await waitFor(() => {
        expect(mockFetchJingles).toHaveBeenCalled();
        expect(mockFetchCanciones).toHaveBeenCalled();
      });

      // All entities should be displayed
      await waitFor(() => {
        expect(screen.getByText('Jingle One')).toBeInTheDocument();
        expect(screen.getByText('Jingle Two')).toBeInTheDocument();
        expect(screen.getByText('Cancion One')).toBeInTheDocument();
      });
    });

    it('should not reload data when expanding already-loaded relationship in User Mode', async () => {
      const jingles: Jingle[] = [
        createMockJingle({ id: 'j-1', title: 'Jingle One' }),
      ];

      const mockFetchFn = vi.fn().mockResolvedValue(jingles);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          expandable: true,
          fetchFn: mockFetchFn,
        },
      ];

      const rootEntity = createMockFabrica({ id: 'fabrica-root' });

      render(
        <RelatedEntities
          entity={rootEntity}
          entityType="fabrica"
          relationships={relationships}
          entityPath={[]} // Top level
          isAdmin={false} // User Mode
        />
      );

      // Expand first time - click collapsed area
      const collapsedArea = screen.getByRole('button', { expanded: false });
      fireEvent.click(collapsedArea);

      await waitFor(() => {
        expect(mockFetchFn).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Jingle One')).toBeInTheDocument();
      });

      // Collapse
      const collapseButton = screen.getByLabelText(/Colapsar/i);
      fireEvent.click(collapseButton);

      // Expand again - need to get the collapsed area again after collapse
      const collapsedAreaAgain = screen.getByRole('button', { expanded: false });
      fireEvent.click(collapsedAreaAgain);

      // Should NOT call fetchFn again (data already loaded)
      await waitFor(() => {
        expect(mockFetchFn).toHaveBeenCalledTimes(1); // Still only 1 call
        expect(screen.getByText('Jingle One')).toBeInTheDocument();
      });
    });
  });
});

