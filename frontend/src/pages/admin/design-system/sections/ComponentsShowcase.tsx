import ComponentDemo from '../components/ComponentDemo';
import EntityCard from '../../../../components/common/EntityCard';

export default function ComponentsShowcase() {
  // Mock entity data for demos
  const mockJingle = {
    id: 'demo-jingle-1',
    title: 'Demo Jingle',
    timestamp: '00:01:30',
    isJinglazo: false,
    isPrecario: false,
  };

  return (
    <div className="components-showcase">
      <h2>Components</h2>
      <p>Component library showcasing all UI components in the design system.</p>

      <ComponentDemo
        title="EntityCard"
        description="Displays a compact, navigable card for any entity type. Used in lists, search results, and related-entities displays."
        component={
          <EntityCard
            entity={mockJingle as any}
            entityType="jingle"
            variant="contents"
          />
        }
        codeReference="frontend/src/components/common/EntityCard.tsx"
        variants={[
          {
            name: 'Heading Variant',
            component: (
              <EntityCard
                entity={mockJingle as any}
                entityType="jingle"
                variant="heading"
              />
            ),
          },
          {
            name: 'Contents Variant',
            component: (
              <EntityCard
                entity={mockJingle as any}
                entityType="jingle"
                variant="contents"
              />
            ),
          },
          {
            name: 'Placeholder Variant',
            component: (
              <EntityCard
                entity={mockJingle as any}
                entityType="jingle"
                variant="placeholder"
                placeholderMessage="No entities found"
              />
            ),
          },
        ]}
        states={[
          {
            name: 'Default',
            component: (
              <EntityCard
                entity={mockJingle as any}
                entityType="jingle"
                variant="heading"
              />
            ),
          },
          {
            name: 'Editing',
            component: (
              <EntityCard
                entity={mockJingle as any}
                entityType="jingle"
                variant="heading"
                isEditing={true}
                showAdminEditButton={true}
              />
            ),
          },
          {
            name: 'Expanded',
            component: (
              <EntityCard
                entity={mockJingle as any}
                entityType="jingle"
                variant="heading"
                isExpanded={true}
                hasNestedEntities={true}
                nestedCount={5}
              />
            ),
          },
        ]}
      />

      <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <p>
          <strong>Note:</strong> More components will be added as they are documented. This showcase
          demonstrates the EntityCard component as an example of the documentation and showcase pattern.
        </p>
      </div>
    </div>
  );
}

