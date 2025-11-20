import type { ReactNode } from 'react';

interface TokenDisplayProps {
  name: string;
  value: string;
  cssVariable: string;
  description?: string;
  visualExample?: ReactNode;
}

export default function TokenDisplay({
  name,
  value,
  cssVariable,
  description,
  visualExample,
}: TokenDisplayProps) {
  return (
    <div className="token-display">
      <div className="token-display__header">
        <h4 className="token-display__name">{name}</h4>
        <code className="token-display__variable">{cssVariable}</code>
      </div>
      <div className="token-display__value">
        <strong>Value:</strong> <code>{value}</code>
      </div>
      {description && (
        <p className="token-display__description">{description}</p>
      )}
      {visualExample && (
        <div className="token-display__example">{visualExample}</div>
      )}
    </div>
  );
}

