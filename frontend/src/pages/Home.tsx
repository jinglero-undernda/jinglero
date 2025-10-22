import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/f/sample-fabrica">Fabrica</Link> | <Link to="/j/sample-jingle">Jingle</Link> | <Link to="/c/sample-cancion">Cancion</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <h1>La Usina — Home</h1>
      <p>Bienvenido a la plataforma de curación de clips.</p>
    </main>
  );
}
