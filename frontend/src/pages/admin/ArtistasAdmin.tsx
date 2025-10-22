import EntityForm from '../../components/admin/EntityForm';
import EntityList from '../../components/admin/EntityList';

export default function ArtistasAdmin() {
  return (
    <section>
      <EntityForm type="artistas" fields={[{ name: 'name', label: 'Nombre', required: true }]} />
      <EntityList type="artistas" title="Artistas" />
    </section>
  );
}
