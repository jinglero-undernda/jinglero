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
      <h1>Cancion: {cancion?.titulo ?? cancionId}</h1>
      <p>Información de la cancion aquí.</p>
      <Link to="/">Volver al inicio</Link>
    </main>
  );
}
