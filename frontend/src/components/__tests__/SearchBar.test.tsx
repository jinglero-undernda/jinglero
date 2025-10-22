import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from "../../__tests__/test-utils";
import { SearchBar } from "../search/SearchBar";

describe('SearchBar', () => {
  it('renders with default placeholder', () => {
    render(<SearchBar onSearch={() => {}} />);
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<SearchBar onSearch={() => {}} placeholder="Buscar jingles..." />);
    expect(screen.getByPlaceholderText('Buscar jingles...')).toBeInTheDocument();
  });

  it('calls onSearch with input value when form is submitted', async () => {
    const mockOnSearch = vi.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');
    const searchTerm = 'test query';

    fireEvent.change(input, { target: { value: searchTerm } });
    fireEvent.submit(screen.getByRole('search'));

    expect(mockOnSearch).toHaveBeenCalledWith(searchTerm);
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('has accessible labels', () => {
    render(<SearchBar onSearch={() => {}} />);
    expect(screen.getByLabelText('Campo de búsqueda')).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar')).toBeInTheDocument();
  });
});