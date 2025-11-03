import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Artista } from '../../types';

export default function InspectArtista() {
  const { artistaId } = useParams();
  const [artista, setArtista] = useState<Artista | null>(null);

  useEffect(() => {
    if (artistaId) {
      setArtista({
        id: artistaId,
        stageName: `Artista ${artistaId}`,
        name: `Nombre Real ${artistaId}`,
        isArg: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [artistaId]);

  return (
    <main>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/show">Fabrica</Link> | <Link to="/j/sample-jingle">Jingle</Link> | <Link to="/c/sample-cancion">Cancion</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <h1>Artista: {artista?.stageName ?? artista?.name ?? artistaId}</h1>
      <p>Información del Artista aquí.</p>
    </main>
  );
}

