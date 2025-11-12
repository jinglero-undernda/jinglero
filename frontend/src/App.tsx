import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import FabricaPage from './pages/FabricaPage';
import InspectJingle from './pages/inspect/InspectJingle';
import InspectCancion from './pages/inspect/InspectCancion';
import InspectFabrica from './pages/inspect/InspectFabrica';
import InspectArtista from './pages/inspect/InspectArtista';
import InspectTematica from './pages/inspect/InspectTematica';
import AdminPage from './pages/AdminPage';
import SearchResultsPage from './pages/SearchResultsPage';

export default function App() {
  return (
    <BrowserRouter>
      <header>
        <nav>
          <Link to="/">Inicio</Link> | <Link to="/search">Búsqueda</Link> | <Link to="/admin">Admin</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/show/:fabricaId" element={<FabricaPage />} />
        <Route path="/show" element={<FabricaPage />} />
        <Route path="/j/:jingleId" element={<InspectJingle />} />
        <Route path="/c/:cancionId" element={<InspectCancion />} />
        <Route path="/f/:fabricaId" element={<InspectFabrica />} />
        <Route path="/a/:artistaId" element={<InspectArtista />} />
        <Route path="/t/:tematicaId" element={<InspectTematica />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
