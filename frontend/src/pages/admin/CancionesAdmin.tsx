import EntityForm from '../../components/admin/EntityForm';
import EntityList from '../../components/admin/EntityList';

export default function CancionesAdmin() {
  return (
    <section>
      <EntityForm type="canciones" fields={[{ name: 'title', label: 'Título', required: true }, { name: 'album', label: 'Álbum' }]} />
      <EntityList type="canciones" title="Canciones" />
    </section>
  );
}
