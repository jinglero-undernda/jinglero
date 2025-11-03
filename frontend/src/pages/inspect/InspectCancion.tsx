import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Cancion } from '../../types';

export default function InspectCancion() {
  const { cancionId } = useParams();
  const [cancion, setCancion] = useState<Cancion | null>(null);

  useEffect(() => {
    if (cancionId) {
      setCancion({ 
        id: cancionId, 
        title: `Cancion ${cancionId}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [cancionId]);

  return (
    <main>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/show">Fabrica</Link> | <Link to="/j/sample-jingle">Jingle</Link> | <Link to="/c/sample-cancion">Cancion</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <h1>Cancion: {cancion?.title ?? cancionId}</h1>
      <p>Información de la cancion aquí.</p>
    </main>
  );
}

