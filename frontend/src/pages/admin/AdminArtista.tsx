import { useParams } from 'react-router-dom';
import EntityEdit from '../../components/admin/EntityEdit';

export default function AdminArtista() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>ID requerido</div>;
  }

  return <EntityEdit type="artistas" id={id} />;
}

