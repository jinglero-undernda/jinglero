import EntityForm from '../../components/admin/EntityForm';
import EntityList from '../../components/admin/EntityList';

export default function ArtistasAdmin() {
  return (
    <section>
      <EntityForm 
        type="artistas" 
        fields={[
          { name: 'id', label: 'ID', required: false },
          { name: 'name', label: 'Nombre', required: true },
          { name: 'stageName', label: 'Nombre Artístico', required: false },
          { name: 'nationality', label: 'Nacionalidad', required: false },
          { name: 'isArg', label: 'Es Argentino', required: false },
          { name: 'youtubeHandle', label: 'YouTube Handle', required: false },
          { name: 'instagramHandle', label: 'Instagram Handle', required: false },
          { name: 'twitterHandle', label: 'Twitter Handle', required: false },
          { name: 'facebookProfile', label: 'Facebook Profile', required: false },
          { name: 'website', label: 'Sitio Web', required: false },
          { name: 'bio', label: 'Biografía', required: false },
        ]} 
      />
      <EntityList type="artistas" title="Artistas" />
    </section>
  );
}
