import { Link, Routes, Route } from 'react-router-dom';
import AdminJingle from './admin/AdminJingle';
import AdminFabrica from './admin/AdminFabrica';
import AdminArtista from './admin/AdminArtista';
import AdminTematica from './admin/AdminTematica';
import AdminCancion from './admin/AdminCancion';

export default function AdminPage() {
  return (
    <main>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <Routes>
        <Route path="j/:id" element={<AdminJingle />} />
        <Route path="f/:id" element={<AdminFabrica />} />
        <Route path="a/:id" element={<AdminArtista />} />
        <Route path="t/:id" element={<AdminTematica />} />
        <Route path="c/:id" element={<AdminCancion />} />
        <Route path="*" element={<div><h1>Admin</h1><p>Área restringida para administradores.</p></div>} />
      </Routes>
    </main>
  );
}
