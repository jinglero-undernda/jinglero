import EntityForm from '../../components/admin/EntityForm';
import EntityList from '../../components/admin/EntityList';

export default function TematicasAdmin() {
  return (
    <section>
      <EntityForm type="tematicas" fields={[{ name: 'name', label: 'Nombre', required: true }, { name: 'category', label: 'Categoría' }]} />
      <EntityList type="tematicas" title="Temáticas" />
    </section>
  );
}
