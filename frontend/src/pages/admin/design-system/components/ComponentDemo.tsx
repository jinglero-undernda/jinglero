import type { ReactNode } from 'react';
import CodeViewer from './CodeViewer';
import StateToggle from './StateToggle';

interface Variant {
  name: string;
  component: ReactNode;
}

interface State {
  name: string;
  component: ReactNode;
}

interface ComponentDemoProps {
  title: string;
  description: string;
  component: ReactNode;
  code?: string;
  codeReference?: string;
  variants?: Variant[];
  states?: State[];
}

export default function ComponentDemo({
  title,
  description,
  component,
  code,
  codeReference,
  variants,
  states,
}: ComponentDemoProps) {
  return (
    <div className="component-demo">
      <div className="component-demo__header">
        <h2 className="component-demo__title">{title}</h2>
        {codeReference && (
          <a
            href={codeReference}
            target="_blank"
            rel="noopener noreferrer"
            className="component-demo__link"
          >
            View Code
          </a>
        )}
      </div>
      <p className="component-demo__description">{description}</p>

      {variants && variants.length > 0 && (
        <section className="component-demo__section">
          <h3 className="component-demo__section-title">Variants</h3>
          {variants.map((variant, index) => (
            <div key={index} className="component-demo__variant">
              <h4 className="component-demo__variant-name">{variant.name}</h4>
              <div className="component-demo__variant-display">{variant.component}</div>
            </div>
          ))}
        </section>
      )}

      {states && states.length > 0 && (
        <section className="component-demo__section">
          <h3 className="component-demo__section-title">States</h3>
          <StateToggle states={states} />
        </section>
      )}

      {!variants && !states && (
        <section className="component-demo__section">
          <h3 className="component-demo__section-title">Default</h3>
          <div className="component-demo__display">{component}</div>
        </section>
      )}

      {code && (
        <section className="component-demo__section">
          <h3 className="component-demo__section-title">Code</h3>
          <CodeViewer code={code} />
        </section>
      )}
    </div>
  );
}

