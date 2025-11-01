import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import FabricaPage from './pages/FabricaPage';
import JinglePage from './pages/JinglePage';
import CancionPage from './pages/CancionPage';
import AdminPage from './pages/AdminPage';
import InspectEntityPage from './pages/inspect/InspectEntityPage';
import InspectRelatedEntitiesPage from './pages/inspect/InspectRelatedEntitiesPage';

export default function App() {
  return (
    <BrowserRouter>
      <header>
        <nav>
          <Link to="/">Inicio</Link> | <Link to="/admin">Admin</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/f/:fabricaId" element={<FabricaPage />} />
        <Route path="/j/:jingleId" element={<JinglePage />} />
        <Route path="/c/:cancionId" element={<CancionPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/inspect/:entityType/:entityId" element={<InspectEntityPage />} />
        <Route path="/inspect-related/:entityType/:entityId" element={<InspectRelatedEntitiesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
