import { Link, Routes, Route } from 'react-router-dom';
import AdminJingle from './admin/AdminJingle';
import AdminFabrica from './admin/AdminFabrica';
import AdminArtista from './admin/AdminArtista';
import AdminTematica from './admin/AdminTematica';
import AdminCancion from './admin/AdminCancion';
import AdminHome from './admin/AdminHome';
import AdminEntityAnalyze from './admin/AdminEntityAnalyze';

export default function AdminPage() {
  return (
    <main>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <Routes>
        {/* Legacy routes for backward compatibility - must come before catch-all */}
        <Route path="j/:id" element={<AdminJingle />} />
        <Route path="f/:id" element={<AdminFabrica />} />
        <Route path="a/:id" element={<AdminArtista />} />
        <Route path="t/:id" element={<AdminTematica />} />
        <Route path="c/:id" element={<AdminCancion />} />
        {/* New route format: /admin/:entityType/:entityId (e.g., /admin/j/0001) */}
        {/* This will match any two-segment path not matched above */}
        <Route path=":entityType/:entityId" element={<AdminEntityAnalyze />} />
        {/* Default route shows AdminHome with dropdowns */}
        <Route path="*" element={<AdminHome />} />
      </Routes>
    </main>
  );
}
