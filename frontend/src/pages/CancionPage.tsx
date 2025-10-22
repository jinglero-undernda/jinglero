import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Cancion } from '../types';

export default function CancionPage() {
  const { cancionId } = useParams();
  const [cancion, setCancion] = useState<Cancion | null>(null);

  useEffect(() => {
    if (cancionId) {
      setCancion({ id: cancionId, titulo: `Cancion ${cancionId}`, autor: { id: 'ar1', nombre: 'Autor', tipo: 'AUTOR' } });
    }
  }, [cancionId]);

  return (
    <main>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/f/sample-fabrica">Fabrica</Link> | <Link to="/j/sample-jingle">Jingle</Link> | <Link to="/c/sample-cancion">Cancion</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <h1>Cancion: {cancion?.titulo ?? cancionId}</h1>
      <p>Información de la cancion aquí.</p>
    </main>
  );
}
