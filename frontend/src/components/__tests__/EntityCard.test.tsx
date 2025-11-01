import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/test-utils';
import EntityCard from '../common/EntityCard';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';

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

const createMockArtista = (overrides?: Partial<Artista>): Artista => ({
  id: 'artista-1',
  stageName: 'Test Artist',
  isArg: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

const createMockTematica = (overrides?: Partial<Tematica>): Tematica => ({
  id: 'tematica-1',
  name: 'Test Tematica',
  category: 'CULTURA',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('EntityCard', () => {
  describe('Rendering - Card Variant', () => {
    it('renders Fabrica card with title and date', () => {
      const fabrica = createMockFabrica();
      render(<EntityCard entity={fabrica} entityType="fabrica" />);
      
      expect(screen.getByText('Test Fabrica')).toBeInTheDocument();
      expect(screen.getByText(/2024/)).toBeInTheDocument();
      expect(screen.getByText('🏭')).toBeInTheDocument(); // Fabrica icon
    });

    it('renders Jingle card with title', () => {
      const jingle = createMockJingle();
      render(<EntityCard entity={jingle} entityType="jingle" />);
      
      expect(screen.getByText('Test Jingle')).toBeInTheDocument();
      expect(screen.getByText('🎵')).toBeInTheDocument(); // Jingle icon
    });

    it('renders Cancion card with title', () => {
      const cancion = createMockCancion();
      render(<EntityCard entity={cancion} entityType="cancion" />);
      
      expect(screen.getByText('Test Cancion')).toBeInTheDocument();
      expect(screen.getByText('🎶')).toBeInTheDocument(); // Cancion icon
    });

    it('renders Artista card with stageName', () => {
      const artista = createMockArtista();
      render(<EntityCard entity={artista} entityType="artista" />);
      
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
      expect(screen.getByText('👤')).toBeInTheDocument(); // Artista icon
    });

    it('renders Tematica card with name', () => {
      const tematica = createMockTematica();
      render(<EntityCard entity={tematica} entityType="tematica" />);
      
      expect(screen.getByText('Test Tematica')).toBeInTheDocument();
      expect(screen.getByText('🏷️')).toBeInTheDocument(); // Tematica icon
    });
  });

  describe('Rendering - Row Variant', () => {
    it('renders Fabrica row variant with compact layout', () => {
      const fabrica = createMockFabrica();
      render(<EntityCard entity={fabrica} entityType="fabrica" variant="row" />);
      
      expect(screen.getByText('Test Fabrica')).toBeInTheDocument();
      const card = screen.getByText('Test Fabrica').closest('.entity-card');
      expect(card).toHaveClass('entity-card--row');
    });

    it('renders row variant with inline secondary text', () => {
      const cancion = createMockCancion({ album: 'Test Album', year: 2024 });
      render(<EntityCard entity={cancion} entityType="cancion" variant="row" />);
      
      expect(screen.getByText('Test Cancion')).toBeInTheDocument();
      expect(screen.getByText(/Test Album/)).toBeInTheDocument();
    });
  });

  describe('Fallback Data Handling', () => {
    it('shows "A CONFIRMAR" when Fabrica has no title', () => {
      const fabrica = createMockFabrica({ title: undefined });
      render(<EntityCard entity={fabrica} entityType="fabrica" />);
      
      expect(screen.getByText('A CONFIRMAR')).toBeInTheDocument();
    });

    it('shows "A CONFIRMAR" when Jingle has no title', () => {
      const jingle = createMockJingle({ title: undefined });
      render(<EntityCard entity={jingle} entityType="jingle" />);
      
      expect(screen.getByText('A CONFIRMAR')).toBeInTheDocument();
    });

    it('shows id when entity has no title or stageName', () => {
      const artista = createMockArtista({ stageName: undefined, name: undefined });
      render(<EntityCard entity={artista} entityType="artista" />);
      
      expect(screen.getByText('artista-1')).toBeInTheDocument();
    });

    it('shows secondary text for Artista with name and nationality', () => {
      const artista = createMockArtista({
        name: 'Real Name',
        stageName: 'Stage Name',
        nationality: 'Argentina',
      });
      render(<EntityCard entity={artista} entityType="artista" />);
      
      expect(screen.getByText(/Real Name/)).toBeInTheDocument();
      expect(screen.getByText(/Argentina/)).toBeInTheDocument();
    });

    it('shows secondary text for Cancion with album and year', () => {
      const cancion = createMockCancion({ album: 'Test Album', year: 2024 });
      render(<EntityCard entity={cancion} entityType="cancion" />);
      
      expect(screen.getByText(/Test Album.*2024/)).toBeInTheDocument();
    });
  });

  describe('Badges', () => {
    it('shows JINGLAZO badge when jingle is jinglazo', () => {
      const jingle = createMockJingle({ isJinglazo: true });
      render(<EntityCard entity={jingle} entityType="jingle" />);
      
      expect(screen.getByText('JINGLAZO')).toBeInTheDocument();
    });

    it('shows PRECARIO badge when jingle is precario', () => {
      const jingle = createMockJingle({ isPrecario: true });
      render(<EntityCard entity={jingle} entityType="jingle" />);
      
      expect(screen.getByText('PRECARIO')).toBeInTheDocument();
    });

    it('shows both badges when jingle is jinglazo and precario', () => {
      const jingle = createMockJingle({ isJinglazo: true, isPrecario: true });
      render(<EntityCard entity={jingle} entityType="jingle" />);
      
      expect(screen.getByText('JINGLAZO')).toBeInTheDocument();
      expect(screen.getByText('PRECARIO')).toBeInTheDocument();
    });

    it('renders custom badge', () => {
      const fabrica = createMockFabrica();
      render(
        <EntityCard
          entity={fabrica}
          entityType="fabrica"
          badge={<span data-testid="custom-badge">Custom</span>}
        />
      );
      
      expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('renders as Link when to prop is provided', () => {
      const fabrica = createMockFabrica();
      render(<EntityCard entity={fabrica} entityType="fabrica" to="/f/fabrica-1" />);
      
      const link = screen.getByRole('article').closest('a');
      expect(link).toHaveAttribute('href', '/f/fabrica-1');
    });

    it('renders as clickable div when onClick is provided', () => {
      const mockOnClick = vi.fn();
      const fabrica = createMockFabrica();
      render(
        <EntityCard
          entity={fabrica}
          entityType="fabrica"
          onClick={mockOnClick}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('generates route automatically when neither to nor onClick provided', () => {
      const fabrica = createMockFabrica();
      render(<EntityCard entity={fabrica} entityType="fabrica" />);
      
      const link = screen.getByRole('article').closest('a');
      expect(link).toHaveAttribute('href', '/f/fabrica-1');
    });
  });

  describe('Expand/Collapse', () => {
    it('shows expand icon when hasNestedEntities is true', () => {
      const fabrica = createMockFabrica();
      render(
        <EntityCard
          entity={fabrica}
          entityType="fabrica"
          hasNestedEntities={true}
          isExpanded={false}
          onToggleExpand={() => {}}
        />
      );
      
      const expandButton = screen.getByTitle('Expandir');
      expect(expandButton).toBeInTheDocument();
      expect(expandButton).toHaveTextContent('▼');
    });

    it('shows collapse icon when expanded', () => {
      const fabrica = createMockFabrica();
      render(
        <EntityCard
          entity={fabrica}
          entityType="fabrica"
          hasNestedEntities={true}
          isExpanded={true}
          onToggleExpand={() => {}}
        />
      );
      
      const collapseButton = screen.getByTitle('Colapsar');
      expect(collapseButton).toBeInTheDocument();
      expect(collapseButton).toHaveTextContent('▲');
    });

    it('calls onToggleExpand when expand icon is clicked', () => {
      const mockToggle = vi.fn();
      const fabrica = createMockFabrica();
      render(
        <EntityCard
          entity={fabrica}
          entityType="fabrica"
          hasNestedEntities={true}
          isExpanded={false}
          onToggleExpand={mockToggle}
        />
      );
      
      const expandButton = screen.getByTitle('Expandir');
      fireEvent.click(expandButton);
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('does not show expand icon when hasNestedEntities is false', () => {
      const fabrica = createMockFabrica();
      render(<EntityCard entity={fabrica} entityType="fabrica" />);
      
      expect(screen.queryByTitle('Expandir')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Colapsar')).not.toBeInTheDocument();
    });

    it('shows expand icon in row variant on the right side', () => {
      const fabrica = createMockFabrica();
      render(
        <EntityCard
          entity={fabrica}
          entityType="fabrica"
          variant="row"
          hasNestedEntities={true}
          isExpanded={false}
          onToggleExpand={() => {}}
        />
      );
      
      const expandButton = screen.getByTitle('Expandir');
      expect(expandButton).toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('applies active styling when active prop is true', () => {
      const fabrica = createMockFabrica();
      render(<EntityCard entity={fabrica} entityType="fabrica" active={true} />);
      
      const card = screen.getByRole('article').closest('.entity-card');
      expect(card).toHaveClass('entity-card--active');
    });

    it('does not apply active styling when active prop is false', () => {
      const fabrica = createMockFabrica();
      render(<EntityCard entity={fabrica} entityType="fabrica" active={false} />);
      
      const card = screen.getByRole('article').closest('.entity-card');
      expect(card).not.toHaveClass('entity-card--active');
    });
  });

  describe('Accessibility', () => {
    it('has appropriate ARIA labels', () => {
      const fabrica = createMockFabrica();
      render(<EntityCard entity={fabrica} entityType="fabrica" />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label');
      expect(article.getAttribute('aria-label')).toContain('fabrica');
      expect(article.getAttribute('aria-label')).toContain('Test Fabrica');
    });

    it('has accessible expand button with ARIA label', () => {
      const fabrica = createMockFabrica();
      render(
        <EntityCard
          entity={fabrica}
          entityType="fabrica"
          hasNestedEntities={true}
          isExpanded={false}
          onToggleExpand={() => {}}
        />
      );
      
      const expandButton = screen.getByTitle('Expandir');
      expect(expandButton).toHaveAttribute('aria-label', 'Expandir');
    });

    it('supports keyboard navigation for onClick handler', () => {
      const mockOnClick = vi.fn();
      const fabrica = createMockFabrica();
      render(
        <EntityCard
          entity={fabrica}
          entityType="fabrica"
          onClick={mockOnClick}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      
      fireEvent.keyDown(button, { key: ' ' });
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('handles long text gracefully with word-wrap', () => {
      const longTitle = 'A'.repeat(200);
      const fabrica = createMockFabrica({ title: longTitle });
      render(<EntityCard entity={fabrica} entityType="fabrica" />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles missing date gracefully', () => {
      const fabrica = createMockFabrica({ date: '' });
      render(<EntityCard entity={fabrica} entityType="fabrica" />);
      
      expect(screen.getByText('Test Fabrica')).toBeInTheDocument();
      // Secondary text should not appear if date is empty
    });

    it('handles Tematica without category', () => {
      const tematica = createMockTematica({ category: undefined } as any);
      render(<EntityCard entity={tematica} entityType="tematica" />);
      
      expect(screen.getByText('Test Tematica')).toBeInTheDocument();
    });

    it('handles Artista with only stageName (no real name)', () => {
      const artista = createMockArtista({ name: undefined });
      render(<EntityCard entity={artista} entityType="artista" />);
      
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
    });
  });

  describe('Custom Class Name', () => {
    it('applies custom className', () => {
      const fabrica = createMockFabrica();
      render(
        <EntityCard
          entity={fabrica}
          entityType="fabrica"
          className="custom-class"
        />
      );
      
      const card = screen.getByRole('article').closest('.entity-card');
      expect(card).toHaveClass('custom-class');
    });
  });
});


