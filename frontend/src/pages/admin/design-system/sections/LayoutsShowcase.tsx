import { Link } from 'react-router-dom';

export default function LayoutsShowcase() {
  return (
    <div className="layouts-showcase">
      <h2>Layout Patterns</h2>
      <p>Page-level layout patterns and route mappings.</p>

      <section className="layouts-showcase__section">
        <h3>Page Templates</h3>
        <div className="layouts-showcase__grid">
          <div className="layout-card">
            <h4>Landing Page</h4>
            <p>Home page layout with search and featured content</p>
            <ul>
              <li><strong>Route:</strong> <code>/</code></li>
              <li><strong>Component:</strong> <code>Home</code></li>
              <li><strong>Template:</strong> Landing Page</li>
            </ul>
            <Link to="/" target="_blank" rel="noopener noreferrer">
              View Page →
            </Link>
          </div>

          <div className="layout-card">
            <h4>Detail Page</h4>
            <p>Entity inspection pages and Fabrica player page</p>
            <ul>
              <li><strong>Routes:</strong> <code>/j/:id</code>, <code>/c/:id</code>, <code>/f/:id</code>, <code>/a/:id</code>, <code>/t/:id</code>, <code>/show/:fabricaId</code></li>
              <li><strong>Components:</strong> <code>InspectJingle</code>, <code>FabricaPage</code>, etc.</li>
              <li><strong>Template:</strong> Detail Page</li>
            </ul>
          </div>

          <div className="layout-card">
            <h4>Admin Page</h4>
            <p>Administrative interface for managing entities</p>
            <ul>
              <li><strong>Routes:</strong> <code>/admin/*</code></li>
              <li><strong>Component:</strong> <code>AdminPage</code></li>
              <li><strong>Template:</strong> Admin Page</li>
            </ul>
            <Link to="/admin" target="_blank" rel="noopener noreferrer">
              View Page →
            </Link>
          </div>

          <div className="layout-card">
            <h4>Search Results Page</h4>
            <p>Search results with grouped entity types</p>
            <ul>
              <li><strong>Route:</strong> <code>/search</code></li>
              <li><strong>Component:</strong> <code>SearchResultsPage</code></li>
              <li><strong>Template:</strong> Search Results Page</li>
            </ul>
            <Link to="/search" target="_blank" rel="noopener noreferrer">
              View Page →
            </Link>
          </div>
        </div>
      </section>

      <section className="layouts-showcase__section">
        <h3>Route Mapping</h3>
        <p>
          For complete route mapping documentation, see{' '}
          <a
            href="https://github.com/your-repo/docs/2_frontend_ui-design-system/02_layout-patterns/routes.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            routes.md
          </a>
        </p>
      </section>
    </div>
  );
}

