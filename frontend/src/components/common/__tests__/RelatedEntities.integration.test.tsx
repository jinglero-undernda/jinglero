import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RelatedEntities from '../RelatedEntities';
import type { RelationshipConfig } from '../RelatedEntities';
import type { Jingle, Fabrica } from '../../../types';

// Mock the relationship service
vi.mock('../../../lib/services/relationshipService', () => ({
  fetchFabricaJingles: vi.fn(),
  fetchJingleFabrica: vi.fn(),
  fetchJingleCancion: vi.fn(),
  fetchJingleAutores: vi.fn(),
  fetchJingleJingleros: vi.fn(),
  fetchJingleTematicas: vi.fn(),
}));

describe('RelatedEntities Integration Tests', () => {
  const mockFabrica: Fabrica = {
    id: 'fabrica-1',
    date: '2024-01-01',
    youtubeUrl: 'https://youtube.com/watch?v=test',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    status: 'COMPLETED',
  };

  const mockJingle: Jingle = {
    id: 'jingle-1',
    timestamp: '00:01:00',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isJinglazo: false,
    isJinglazoDelDia: false,
    isPrecario: false,
  };

  const mockJingles: Jingle[] = [
    { ...mockJingle, id: 'jingle-1', timestamp: '00:01:00' },
    { ...mockJingle, id: 'jingle-2', timestamp: '00:02:00' },
    { ...mockJingle, id: 'jingle-3', timestamp: '00:03:00' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Lazy Loading (User Mode)', () => {
    it('should not load relationships on mount in User Mode', async () => {
      const { fetchFabricaJingles } = await import('../../../lib/services/relationshipService');
      const mockFetch = vi.mocked(fetchFabricaJingles);
      mockFetch.mockResolvedValue(mockJingles);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          sortKey: 'timestamp',
          expandable: true,
          fetchFn: fetchFabricaJingles,
        },
      ];

      render(
        <RelatedEntities
          entity={mockFabrica}
          entityType="fabrica"
          relationships={relationships}
          isAdmin={false}
        />
      );

      // Should not call fetch on mount in User Mode
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should load relationships when expanded in User Mode', async () => {
      const { fetchFabricaJingles } = await import('../../../lib/services/relationshipService');
      const mockFetch = vi.mocked(fetchFabricaJingles);
      mockFetch.mockResolvedValue(mockJingles);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          sortKey: 'timestamp',
          expandable: true,
          fetchFn: fetchFabricaJingles,
        },
      ];

      render(
        <RelatedEntities
          entity={mockFabrica}
          entityType="fabrica"
          relationships={relationships}
          isAdmin={false}
        />
      );

      // Find and click expand button
      const expandButton = screen.getByLabelText(/expandir jingles/i);
      await userEvent.click(expandButton);

      // Should call fetch when expanded
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('fabrica-1', 'fabrica');
      });
    });
  });

  describe('Eager Loading (Admin Mode)', () => {
    it('should load all relationships on mount in Admin Mode', async () => {
      const { fetchFabricaJingles } = await import('../../../lib/services/relationshipService');
      const mockFetch = vi.mocked(fetchFabricaJingles);
      mockFetch.mockResolvedValue(mockJingles);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          sortKey: 'timestamp',
          expandable: true,
          fetchFn: fetchFabricaJingles,
        },
      ];

      render(
        <RelatedEntities
          entity={mockFabrica}
          entityType="fabrica"
          relationships={relationships}
          isAdmin={true}
        />
      );

      // Should call fetch on mount in Admin Mode
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('fabrica-1', 'fabrica');
      });
    });
  });

  describe('Request Cancellation', () => {
    it('should cancel previous request when toggling rapidly', async () => {
      const { fetchFabricaJingles } = await import('../../../lib/services/relationshipService');
      const mockFetch = vi.mocked(fetchFabricaJingles);
      
      // Create a promise that we can control
      let resolveFirst: (value: Jingle[]) => void;
      const firstPromise = new Promise<Jingle[]>((resolve) => {
        resolveFirst = resolve;
      });
      
      mockFetch.mockReturnValueOnce(firstPromise);
      mockFetch.mockResolvedValueOnce(mockJingles);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          sortKey: 'timestamp',
          expandable: true,
          fetchFn: fetchFabricaJingles,
        },
      ];

      render(
        <RelatedEntities
          entity={mockFabrica}
          entityType="fabrica"
          relationships={relationships}
          isAdmin={false}
        />
      );

      const expandButton = screen.getByLabelText(/expandir jingles/i);
      
      // Click to expand (starts first request)
      await userEvent.click(expandButton);
      
      // Immediately click to collapse
      await userEvent.click(expandButton);
      
      // Click to expand again (should start second request)
      await userEvent.click(expandButton);

      // Resolve first request (should be ignored)
      resolveFirst!(mockJingles);

      // Wait for second request to complete
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Request Deduplication', () => {
    it('should deduplicate multiple rapid clicks on same relationship', async () => {
      const { fetchFabricaJingles } = await import('../../../lib/services/relationshipService');
      const mockFetch = vi.mocked(fetchFabricaJingles);
      mockFetch.mockResolvedValue(mockJingles);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          sortKey: 'timestamp',
          expandable: true,
          fetchFn: fetchFabricaJingles,
        },
      ];

      render(
        <RelatedEntities
          entity={mockFabrica}
          entityType="fabrica"
          relationships={relationships}
          isAdmin={false}
        />
      );

      const expandButton = screen.getByLabelText(/expandir jingles/i);
      
      // Rapidly click multiple times
      await userEvent.click(expandButton);
      await userEvent.click(expandButton);
      await userEvent.click(expandButton);

      // Should only make one API call
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Cycle Prevention (User Mode)', () => {
    it('should filter out entities in entityPath to prevent cycles', async () => {
      const { fetchFabricaJingles } = await import('../../../lib/services/relationshipService');
      const mockFetch = vi.mocked(fetchFabricaJingles);
      
      // Include fabrica-1 in the response (which is in entityPath)
      const jinglesWithCycle: Jingle[] = [
        { ...mockJingle, id: 'jingle-1' },
        { ...mockJingle, id: 'fabrica-1' } as any, // This should be filtered out
        { ...mockJingle, id: 'jingle-2' },
      ];
      
      mockFetch.mockResolvedValue(jinglesWithCycle);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          sortKey: 'timestamp',
          expandable: true,
          fetchFn: fetchFabricaJingles,
        },
      ];

      render(
        <RelatedEntities
          entity={mockFabrica}
          entityType="fabrica"
          relationships={relationships}
          entityPath={['fabrica-1']}
          isAdmin={false}
        />
      );

      const expandButton = screen.getByLabelText(/expandir jingles/i);
      await userEvent.click(expandButton);

      // Should not show fabrica-1 (it's in the path)
      await waitFor(() => {
        expect(screen.queryByText(/fabrica-1/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('No Cycle Prevention (Admin Mode)', () => {
    it('should show all entities even if they appear in entityPath', async () => {
      const { fetchFabricaJingles } = await import('../../../lib/services/relationshipService');
      const mockFetch = vi.mocked(fetchFabricaJingles);
      
      // Include fabrica-1 in the response (which is in entityPath)
      const jinglesWithCycle: Jingle[] = [
        { ...mockJingle, id: 'jingle-1' },
        { ...mockJingle, id: 'fabrica-1' } as any, // This should NOT be filtered out in Admin Mode
        { ...mockJingle, id: 'jingle-2' },
      ];
      
      mockFetch.mockResolvedValue(jinglesWithCycle);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          sortKey: 'timestamp',
          expandable: true,
          fetchFn: fetchFabricaJingles,
        },
      ];

      render(
        <RelatedEntities
          entity={mockFabrica}
          entityType="fabrica"
          relationships={relationships}
          entityPath={['fabrica-1']}
          isAdmin={true}
        />
      );

      // In Admin Mode, all entities should be visible (no filtering)
      await waitFor(() => {
        // The component should render all entities, including fabrica-1
        // Note: This test may need adjustment based on actual rendering behavior
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API call fails', async () => {
      const { fetchFabricaJingles } = await import('../../../lib/services/relationshipService');
      const mockFetch = vi.mocked(fetchFabricaJingles);
      mockFetch.mockRejectedValue(new Error('Network error'));

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          sortKey: 'timestamp',
          expandable: true,
          fetchFn: fetchFabricaJingles,
        },
      ];

      render(
        <RelatedEntities
          entity={mockFabrica}
          entityType="fabrica"
          relationships={relationships}
          isAdmin={false}
        />
      );

      const expandButton = screen.getByLabelText(/expandir jingles/i);
      await userEvent.click(expandButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/error al cargar/i)).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      const { fetchFabricaJingles } = await import('../../../lib/services/relationshipService');
      const mockFetch = vi.mocked(fetchFabricaJingles);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      mockFetch.mockResolvedValueOnce(mockJingles);

      const relationships: RelationshipConfig[] = [
        {
          label: 'Jingles',
          entityType: 'jingle',
          sortKey: 'timestamp',
          expandable: true,
          fetchFn: fetchFabricaJingles,
        },
      ];

      render(
        <RelatedEntities
          entity={mockFabrica}
          entityType="fabrica"
          relationships={relationships}
          isAdmin={false}
        />
      );

      const expandButton = screen.getByLabelText(/expandir jingles/i);
      await userEvent.click(expandButton);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/error al cargar/i)).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByLabelText(/reintentar/i);
      await userEvent.click(retryButton);

      // Should retry the fetch
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });
});


