import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Jingle } from '../../types';

export default function InspectJingle() {
  const { jingleId } = useParams();
  const [jingle, setJingle] = useState<Jingle | null>(null);

  useEffect(() => {
    if (jingleId) {
      setJingle({
        id: jingleId,
        title: `Jingle ${jingleId}`,
        timestamp: '00:00:00',
        youtubeUrl: 'dQw4w9WgXcQ',
        isJinglazo: false,
        isJinglazoDelDia: false,
        isPrecario: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [jingleId]);

  return (
    <main>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/show">Fabrica</Link> | <Link to="/j/sample-jingle">Jingle</Link> | <Link to="/c/sample-cancion">Cancion</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <h1>Jingle: {jingle?.title ?? jingleId}</h1>
      <p>Información del Jingle aquí.</p>
    </main>
  );
}

