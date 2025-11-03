import { useParams } from 'react-router-dom';
import EntityEdit from '../../components/admin/EntityEdit';

export default function AdminFabrica() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>ID requerido</div>;
  }

  return <EntityEdit type="fabricas" id={id} />;
}

