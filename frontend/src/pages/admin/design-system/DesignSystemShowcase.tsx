import { Routes, Route } from 'react-router-dom';
import ShowcaseLayout from './ShowcaseLayout';
import TokensShowcase from './sections/TokensShowcase';
import ComponentsShowcase from './sections/ComponentsShowcase';
import LayoutsShowcase from './sections/LayoutsShowcase';
import VariationsShowcase from './sections/VariationsShowcase';
import '../../../styles/pages/design-system-showcase.css';

export default function DesignSystemShowcase() {
  return (
    <ShowcaseLayout>
      <Routes>
        <Route path="tokens" element={<TokensShowcase />} />
        <Route path="components" element={<ComponentsShowcase />} />
        <Route path="layouts" element={<LayoutsShowcase />} />
        <Route path="variations" element={<VariationsShowcase />} />
        <Route path="*" element={<TokensShowcase />} />
      </Routes>
    </ShowcaseLayout>
  );
}

