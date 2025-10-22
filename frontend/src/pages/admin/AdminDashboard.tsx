import { Link, Routes, Route, useParams } from 'react-router-dom';
import EntityEdit from '../../components/admin/EntityEdit';
import FabricaList from '../../components/admin/FabricaList';
import EntityForm from '../../components/admin/EntityForm';
import '../../styles/admin.css';
import UsuariosAdmin from './UsuariosAdmin';
import ArtistasAdmin from './ArtistasAdmin';
import CancionesAdmin from './CancionesAdmin';
import TematicasAdmin from './TematicasAdmin';
import JinglesAdmin from './JinglesAdmin';

export default function AdminDashboard() {
  return (
    <main>
      <h1>Panel de Administración</h1>
      <nav>
        <Link to="/admin/dashboard/fabricas">Fábricas</Link> | <Link to="/admin/dashboard/artistas">Artistas</Link> | <Link to="/admin/dashboard/canciones">Canciones</Link> | <Link to="/admin/dashboard/tematicas">Temáticas</Link> | <Link to="/admin/dashboard/jingles">Jingles</Link> | <Link to="/admin/dashboard/usuarios">Usuarios</Link>
      </nav>
      <Routes>
        <Route path=":type/edit/:id" element={<DynamicEntityEdit />} />
        <Route path="fabricas" element={<div><EntityForm type="fabricas" idFirst fields={[{ name: 'title', label: 'Título' }, { name: 'youtubeUrl', label: 'Youtube URL' }]} /><FabricaList /></div>} />
        <Route path="artistas" element={<ArtistasAdmin />} />
        <Route path="canciones" element={<CancionesAdmin />} />
        <Route path="tematicas" element={<TematicasAdmin />} />
        <Route path="jingles" element={<JinglesAdmin />} />
        <Route path="usuarios" element={<UsuariosAdmin />} />
        <Route path="/" element={<div><p>Seleccione una entidad para administrar.</p></div>} />
      </Routes>

      {/* DynamicEntityEdit resolves params and renders EntityEdit */}
      
    </main>
  );
}

function DynamicEntityEdit() {
  const params = useParams();
  const type = params.type || '';
  const id = params.id || '';
  if (!type || !id) return <div>Parámetros faltantes</div>;
  // lazy import to avoid top-level cycles
  return <EntityEdit type={type} id={id} />;
}
