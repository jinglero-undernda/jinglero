import EntityForm from '../../components/admin/EntityForm';
import EntityList from '../../components/admin/EntityList';

export default function UsuariosAdmin() {
  return (
    <section>
      <EntityForm type="usuarios" fields={[{ name: 'email', label: 'Email', required: true }, { name: 'displayName', label: 'Nombre' }]} />
      <EntityList type="usuarios" title="Usuarios" />
    </section>
  );
}
