import { useParams, Navigate } from 'react-router-dom';

export default function AdminJingle() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>ID requerido</div>;
  }

  // Redirect to unified route format
  return <Navigate to={`/admin/j/${id}`} replace />;
}

