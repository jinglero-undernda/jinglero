import EntityForm from '../../components/admin/EntityForm';
import EntityList from '../../components/admin/EntityList';
import RelationshipForm from '../../components/admin/RelationshipForm';

export default function JinglesAdmin() {
  return (
    <section>
      <EntityForm type="jingles" fields={[{ name: 'title', label: 'Título' }, { name: 'timestamp', label: 'Timestamp' }]} />
      <EntityList type="jingles" title="Jingles" />
      <RelationshipForm relType="appears_in" startType="jingles" endType="fabricas" fields={[{ name: 'order', label: 'Orden' }, { name: 'timestamp', label: 'Timestamp' }]} />
    </section>
  );
}
