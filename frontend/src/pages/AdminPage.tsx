import { Link } from 'react-router-dom';

export default function AdminPage() {
  return (
    <main>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/f/sample-fabrica">Fabrica</Link> | <Link to="/j/sample-jingle">Jingle</Link> | <Link to="/c/sample-cancion">Cancion</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <h1>Admin Dashboard</h1>
      <p>Área restringida para administradores.</p>
    </main>
  );
}
