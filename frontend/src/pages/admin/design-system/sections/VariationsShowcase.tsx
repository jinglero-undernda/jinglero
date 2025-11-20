import StateToggle from '../components/StateToggle';
import EntityCard from '../../../../components/common/EntityCard';

export default function VariationsShowcase() {
  const mockJingle = {
    id: 'demo-jingle-1',
    title: 'Demo Jingle',
    timestamp: '00:01:30',
    isJinglazo: false,
    isPrecario: false,
  };

  return (
    <div className="variations-showcase">
      <h2>Context Variations</h2>
      <p>How components and design elements vary based on context, entity types, interaction states, and responsive breakpoints.</p>

      <section className="variations-showcase__section">
        <h3>Admin Context</h3>
        <p>Components adapt their appearance and behavior when used in admin context.</p>
        <StateToggle
          states={[
            {
              name: 'Public Context',
              component: (
                <EntityCard
                  entity={mockJingle as any}
                  entityType="jingle"
                  variant="heading"
                />
              ),
            },
            {
              name: 'Admin Context',
              component: (
                <EntityCard
                  entity={mockJingle as any}
                  entityType="jingle"
                  variant="heading"
                  showAdminEditButton={true}
                  showAdminNavButton={true}
                />
              ),
            },
            {
              name: 'Admin Editing',
              component: (
                <EntityCard
                  entity={mockJingle as any}
                  entityType="jingle"
                  variant="heading"
                  isEditing={true}
                  showAdminEditButton={true}
                  hasUnsavedChanges={true}
                />
              ),
            },
          ]}
        />
      </section>

      <section className="variations-showcase__section">
        <h3>Entity Context</h3>
        <p>Different entity types may have entity-specific visual treatments.</p>
        <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <p>
            <strong>Example:</strong> Jingle entities can display JINGLAZO and PRECARIO badges.
            This variation is handled in component logic based on entity type.
          </p>
        </div>
      </section>

      <section className="variations-showcase__section">
        <h3>Interaction States</h3>
        <p>Components adapt their appearance based on user interaction states.</p>
        <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <p>
            <strong>States:</strong> Hover, Active, Focus, Disabled, Selected
          </p>
          <p>
            Interaction states use CSS pseudo-classes and component props. Transitions provide
            smooth state changes.
          </p>
        </div>
      </section>

      <section className="variations-showcase__section">
        <h3>Responsive Variations</h3>
        <p>Design elements adapt at different breakpoints for optimal experience across screen sizes.</p>
        <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <p>
            <strong>Approach:</strong> Mobile-first with CSS media queries
          </p>
          <p>
            Responsive behavior will be documented as breakpoints and patterns are analyzed.
          </p>
        </div>
      </section>
    </div>
  );
}

