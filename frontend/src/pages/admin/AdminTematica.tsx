import { useParams } from 'react-router-dom';
import EntityEdit from '../../components/admin/EntityEdit';

export default function AdminTematica() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>ID requerido</div>;
  }

  return <EntityEdit type="tematicas" id={id} />;
}

