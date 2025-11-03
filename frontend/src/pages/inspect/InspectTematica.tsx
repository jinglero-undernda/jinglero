import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Tematica } from '../../types';

export default function InspectTematica() {
  const { tematicaId } = useParams();
  const [tematica, setTematica] = useState<Tematica | null>(null);

  useEffect(() => {
    if (tematicaId) {
      setTematica({
        id: tematicaId,
        name: `Tematica ${tematicaId}`,
        category: 'ACTUALIDAD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [tematicaId]);

  return (
    <main>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/show">Fabrica</Link> | <Link to="/j/sample-jingle">Jingle</Link> | <Link to="/c/sample-cancion">Cancion</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <h1>Tematica: {tematica?.name ?? tematicaId}</h1>
      <p>Información de la Tematica aquí.</p>
    </main>
  );
}

