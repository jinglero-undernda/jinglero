import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Jingle } from '../types';

export default function JinglePage() {
  const { jingleId } = useParams();
  const [jingle, setJingle] = useState<Jingle | null>(null);

  useEffect(() => {
    if (jingleId) {
      setJingle({
        id: jingleId,
        titulo: `Jingle ${jingleId}`,
        jinglero: { id: 'a1', nombre: 'Jinglero', tipo: 'JINGLERO' },
        cancionOriginal: { id: 'c1', titulo: 'Cancion', autor: { id: 'ar1', nombre: 'Autor', tipo: 'AUTOR' } },
        tematicas: [],
        timestamp: 0,
      });
    }
  }, [jingleId]);

  return (
    <main>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/f/sample-fabrica">Fabrica</Link> | <Link to="/j/sample-jingle">Jingle</Link> | <Link to="/c/sample-cancion">Cancion</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <h1>Jingle: {jingle?.titulo ?? jingleId}</h1>
      <p>Información del Jingle aquí.</p>
    </main>
  );
}
