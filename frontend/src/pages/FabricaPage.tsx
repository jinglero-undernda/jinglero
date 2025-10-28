import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import type { Fabrica } from '../types';

export default function FabricaPage() {
  const { fabricaId } = useParams();
  const [searchParams] = useSearchParams();
  const jingleIndex = searchParams.get('j');
  const [fabrica, setFabrica] = useState<Fabrica | null>(null);

  useEffect(() => {
    // Placeholder: fetch fabrica by id from API
    // For now, simulate with dummy data
    if (fabricaId) {
      setFabrica({
        id: fabricaId,
        title: `Fabrica ${fabricaId}`,
        youtubeUrl: 'dQw4w9WgXcQ',
        date: new Date().toISOString(),
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [fabricaId]);

  return (
    <main>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/f/sample-fabrica">Fabrica</Link> | <Link to="/j/sample-jingle">Jingle</Link> | <Link to="/c/sample-cancion">Cancion</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <h1>Fabrica: {fabrica?.title ?? fabricaId}</h1>
      {jingleIndex ? (
        <p>Saltando al jingle #{jingleIndex}</p>
      ) : (
        <p>Lista de jingles disponible aquí.</p>
      )}
    </main>
  );
}
