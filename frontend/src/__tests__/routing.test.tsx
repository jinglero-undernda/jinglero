import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import FabricaPage from '../pages/FabricaPage';
import JinglePage from '../pages/JinglePage';
import CancionPage from '../pages/CancionPage';

describe('Routing', () => {
  it('renders Home on /', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/La Usina/i)).toBeInTheDocument();
  });

  it('navigates to Fabrica with fabricaId and query j', () => {
    render(
      <MemoryRouter initialEntries={["/f/test-fabrica?j=2"]}>
        <Routes>
          <Route path="/f/:fabricaId" element={<FabricaPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Fabrica:/i)).toBeInTheDocument();
    expect(screen.getByText(/Saltando al jingle #2/)).toBeInTheDocument();
  });

  it('renders Jingle and Cancion routes', () => {
    render(
      <MemoryRouter initialEntries={["/j/test-jingle"]}>
        <Routes>
          <Route path="/j/:jingleId" element={<JinglePage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Jingle:/i)).toBeInTheDocument();

    render(
      <MemoryRouter initialEntries={["/c/test-cancion"]}>
        <Routes>
          <Route path="/c/:cancionId" element={<CancionPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Cancion:/i)).toBeInTheDocument();
  });
});
