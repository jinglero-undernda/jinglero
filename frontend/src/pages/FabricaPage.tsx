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
        titulo: `Fabrica ${fabricaId}`,
        youtubeId: 'dQw4w9WgXcQ',
        jingles: [],
      });
    }
  }, [fabricaId]);

  return (
    <main>
      <h1>Fabrica: {fabrica?.titulo ?? fabricaId}</h1>
      {jingleIndex ? (
        <p>Saltando al jingle #{jingleIndex}</p>
      ) : (
        <p>Lista de jingles disponible aquí.</p>
      )}
      <Link to="/">Volver al inicio</Link>
    </main>
  );
}
