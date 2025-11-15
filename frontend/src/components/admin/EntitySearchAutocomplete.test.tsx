/**
 * EntitySearchAutocomplete Tests
 * 
 * Tests for the unified search/autocomplete component including:
 * - Basic rendering
 * - Debounced search
 * - Keyboard navigation
 * - Result display
 * - Entity creation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EntitySearchAutocomplete from './EntitySearchAutocomplete';
import type { Entity, EntityType } from '../../lib/utils/entityDisplay';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('EntitySearchAutocomplete', () => {
  const mockOnSelect = vi.fn();
  
  const mockJingles = [
    { id: 'j1', title: 'Test Jingle 1', type: 'jingle' },
    { id: 'j2', title: 'Test Jingle 2', type: 'jingle' },
  ];
  
  const mockCanciones = [
    { id: 'c1', title: 'Test Cancion 1', album: 'Album 1', year: 2020, type: 'cancion' },
    { id: 'c2', title: 'Test Cancion 2', album: 'Album 2', year: 2021, type: 'cancion' },
  ];
  
  const mockArtistas = [
    { id: 'a1', name: 'Test Artist 1', stageName: 'Artist 1', nationality: 'Argentina', type: 'artista' },
    { id: 'a2', name: 'Test Artist 2', stageName: 'Artist 2', nationality: 'Uruguay', type: 'artista' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const renderComponent = (props: Partial<Parameters<typeof EntitySearchAutocomplete>[0]> = {}) => {
    return render(
      <BrowserRouter>
        <EntitySearchAutocomplete
          entityTypes={['jingle', 'cancion']}
          placeholder="Search..."
          onSelect={mockOnSelect}
          {...props}
        />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render with placeholder text', () => {
      renderComponent({ placeholder: 'Buscar jingles...' });
      expect(screen.getByPlaceholderText('Buscar jingles...')).toBeInTheDocument();
    });

    it('should not show dropdown initially', () => {
      renderComponent();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should auto focus when autoFocus prop is true', () => {
      renderComponent({ autoFocus: true });
      const input = screen.getByPlaceholderText('Search...');
      expect(input).toHaveFocus();
    });
  });

  describe('Search Behavior', () => {
    it('should not search with less than 2 characters', async () => {
      renderComponent();
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'a' } });
      vi.runAllTimers();
      
      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });

    it('should search with 2 or more characters after debounce delay', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jingles: mockJingles,
          canciones: mockCanciones,
          artistas: [],
          tematicas: [],
          fabricas: [],
        }),
      });

      renderComponent();
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Should not call immediately
      expect(mockFetch).not.toHaveBeenCalled();
      
      // Should call after 300ms debounce
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/search?q=test')
        );
      });
    });

    it('should debounce multiple rapid keystrokes', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          jingles: mockJingles,
          canciones: [],
          artistas: [],
          tematicas: [],
          fabricas: [],
        }),
      });

      renderComponent();
      const input = screen.getByPlaceholderText('Search...');
      
      // Type rapidly
      fireEvent.change(input, { target: { value: 't' } });
      vi.advanceTimersByTime(100);
      fireEvent.change(input, { target: { value: 'te' } });
      vi.advanceTimersByTime(100);
      fireEvent.change(input, { target: { value: 'tes' } });
      vi.advanceTimersByTime(100);
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Only the last search should execute after full debounce
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('q=test')
        );
      });
    });

    it('should filter results by entity types', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jingles: mockJingles,
          canciones: mockCanciones,
          artistas: mockArtistas,
          tematicas: [],
          fabricas: [],
        }),
      });

      renderComponent({ entityTypes: ['jingle'] });
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('types=jingles')
        );
      });
    });

    it('should display loading state during search', async () => {
      mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      renderComponent();
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('Buscando...')).toBeInTheDocument();
      });
    });
  });

  describe('Results Display', () => {
    it('should display search results grouped by entity type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jingles: mockJingles,
          canciones: mockCanciones,
          artistas: [],
          tematicas: [],
          fabricas: [],
        }),
      });

      renderComponent();
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('Jingles')).toBeInTheDocument();
        expect(screen.getByText('Canciones')).toBeInTheDocument();
        expect(screen.getByText('Test Jingle 1')).toBeInTheDocument();
        expect(screen.getByText('Test Cancion 1')).toBeInTheDocument();
      });
    });

    it('should show "No results" message when search returns empty', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jingles: [],
          canciones: [],
          artistas: [],
          tematicas: [],
          fabricas: [],
        }),
      });

      renderComponent();
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'nonexistent' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('No se encontraron resultados')).toBeInTheDocument();
      });
    });

    it('should show create button when no results and creation context provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jingles: [],
          canciones: [],
          artistas: [],
          tematicas: [],
          fabricas: [],
        }),
      });

      renderComponent({
        creationContext: {
          fromType: 'fabrica',
          fromId: 'f1',
          relType: 'appears_in',
        },
      });
      
      const input = screen.getByPlaceholderText('Search...');
      fireEvent.change(input, { target: { value: 'nonexistent' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('Crear nueva entidad')).toBeInTheDocument();
      });
    });

    it('should display entity icons for results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jingles: [mockJingles[0]],
          canciones: [],
          artistas: [],
          tematicas: [],
          fabricas: [],
        }),
      });

      renderComponent();
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        // Jingle icon is 🎤
        expect(screen.getByText('🎤')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          jingles: mockJingles,
          canciones: [],
          artistas: [],
          tematicas: [],
          fabricas: [],
        }),
      });
    });

    it('should navigate down with ArrowDown key', async () => {
      renderComponent();
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('Test Jingle 1')).toBeInTheDocument();
      });
      
      // Press ArrowDown
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      // First result should be selected (aria-selected)
      const firstResult = screen.getByText('Test Jingle 1').closest('[role="option"]');
      expect(firstResult).toHaveAttribute('aria-selected', 'true');
    });

    it('should navigate up with ArrowUp key', async () => {
      renderComponent();
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('Test Jingle 1')).toBeInTheDocument();
      });
      
      // Navigate down twice, then up once
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      
      // First result should be selected again
      const firstResult = screen.getByText('Test Jingle 1').closest('[role="option"]');
      expect(firstResult).toHaveAttribute('aria-selected', 'true');
    });

    it('should select result with Enter key', async () => {
      renderComponent();
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('Test Jingle 1')).toBeInTheDocument();
      });
      
      // Navigate to first result and press Enter
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'j1' }),
        'jingle'
      );
    });

    it('should close dropdown with Escape key', async () => {
      renderComponent();
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      // Press Escape
      fireEvent.keyDown(input, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Mouse Interaction', () => {
    it('should select result on click', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jingles: mockJingles,
          canciones: [],
          artistas: [],
          tematicas: [],
          fabricas: [],
        }),
      });

      renderComponent();
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('Test Jingle 1')).toBeInTheDocument();
      });
      
      // Click on first result
      const firstResult = screen.getByText('Test Jingle 1').closest('[role="option"]');
      if (firstResult) {
        fireEvent.click(firstResult);
      }
      
      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'j1' }),
        'jingle'
      );
    });

    it('should highlight result on mouse hover', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jingles: mockJingles,
          canciones: [],
          artistas: [],
          tematicas: [],
          fabricas: [],
        }),
      });

      renderComponent();
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('Test Jingle 2')).toBeInTheDocument();
      });
      
      // Hover over second result
      const secondResult = screen.getByText('Test Jingle 2').closest('[role="option"]');
      if (secondResult) {
        fireEvent.mouseEnter(secondResult);
        expect(secondResult).toHaveAttribute('aria-selected', 'true');
      }
    });

    it('should close dropdown on click outside', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jingles: mockJingles,
          canciones: [],
          artistas: [],
          tematicas: [],
          fabricas: [],
        }),
      });

      renderComponent();
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      // Click outside
      fireEvent.mouseDown(document.body);
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Entity Creation', () => {
    it('should navigate to creation page with context when create button clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jingles: [],
          canciones: [],
          artistas: [],
          tematicas: [],
          fabricas: [],
        }),
      });

      renderComponent({
        entityTypes: ['jingle'],
        creationContext: {
          fromType: 'fabrica',
          fromId: 'f1',
          relType: 'appears_in',
        },
      });
      
      const input = screen.getByPlaceholderText('Search...');
      fireEvent.change(input, { target: { value: 'new jingle' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('Crear nueva entidad')).toBeInTheDocument();
      });
      
      const createButton = screen.getByText('Crear nueva entidad');
      fireEvent.click(createButton);
      
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/admin/dashboard')
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('create=j')
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('from=fabrica')
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('fromId=f1')
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('relType=appears_in')
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('searchText=new%20jingle')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle search API errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderComponent();
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        // Should show no results (graceful fallback)
        expect(screen.getByText('No se encontraron resultados')).toBeInTheDocument();
      });
      
      expect(consoleError).toHaveBeenCalledWith('Search error:', expect.any(Error));
      consoleError.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should limit results to requested types only', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jingles: mockJingles,
          canciones: mockCanciones,
          artistas: mockArtistas,
          tematicas: [],
          fabricas: [],
        }),
      });

      renderComponent({ entityTypes: ['jingle'] });
      const input = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        // Should only show jingles
        expect(screen.getByText('Test Jingle 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Cancion 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Test Artist 1')).not.toBeInTheDocument();
      });
    });
  });
});

