import { Link, Routes, Route } from 'react-router-dom';
import AdminDashboard from './admin/AdminDashboard';

export default function AdminPage() {
  return (
    <main>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/admin">Admin</Link> | <Link to="/admin/dashboard">Panel</Link>
      </nav>
      <Routes>
        <Route path="dashboard/*" element={<AdminDashboard />} />
        <Route path="*" element={<div><h1>Admin</h1><p>Área restringida para administradores.</p></div>} />
      </Routes>
    </main>
  );
}
