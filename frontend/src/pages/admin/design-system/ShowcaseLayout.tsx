import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface ShowcaseLayoutProps {
  children: React.ReactNode;
}

export default function ShowcaseLayout({ children }: ShowcaseLayoutProps) {
  const location = useLocation();
  const basePath = '/admin/design-system';

  const navItems = [
    { path: `${basePath}/tokens`, label: 'Tokens' },
    { path: `${basePath}/components`, label: 'Components' },
    { path: `${basePath}/layouts`, label: 'Layouts' },
    { path: `${basePath}/variations`, label: 'Variations' },
  ];

  return (
    <div className="showcase-layout">
      <nav className="showcase-nav">
        <div className="showcase-nav__header">
          <h1>Design System Showcase</h1>
          <Link to="/admin" className="showcase-nav__back">← Back to Admin</Link>
        </div>
        <div className="showcase-nav__links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`showcase-nav__link ${
                location.pathname.startsWith(item.path) ? 'showcase-nav__link--active' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="showcase-content">{children}</main>
    </div>
  );
}

