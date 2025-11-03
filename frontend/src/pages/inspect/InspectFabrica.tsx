import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Fabrica } from '../../types';

export default function InspectFabrica() {
  const { fabricaId } = useParams();
  const [fabrica, setFabrica] = useState<Fabrica | null>(null);

  useEffect(() => {
    if (fabricaId) {
      setFabrica({
        id: fabricaId,
        title: `Fabrica ${fabricaId}`,
        date: new Date().toISOString(),
        youtubeUrl: 'dQw4w9WgXcQ',
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [fabricaId]);

  return (
    <main>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/show">Fabrica</Link> | <Link to="/j/sample-jingle">Jingle</Link> | <Link to="/c/sample-cancion">Cancion</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <h1>Fabrica: {fabrica?.title ?? fabricaId}</h1>
      <p>Información de la Fabrica aquí.</p>
    </main>
  );
}

