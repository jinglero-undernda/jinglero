import React from 'react';
import '../../styles/components/warning-label.css';

export interface WarningLabelProps {
  /** Numeric value to display */
  value: number | string;
  /** Label text below the octagon */
  label: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Warning Label Component
 * 
 * Displays statistics in a black octagon style, referencing contemporary
 * Argentine food warning labels. Used for entity counts and stats reporting
 * on landing page and Admin dashboard.
 * 
 * @example
 * ```tsx
 * <WarningLabel
 *   value={42}
 *   label="Fábricas"
 *   size="medium"
 * />
 * ```
 */
export default function WarningLabel({
  value,
  label,
  size = 'medium',
  className = '',
}: WarningLabelProps) {
  const sizeClass = size !== 'medium' ? `warning-label--${size}` : '';
  const classes = ['warning-label', sizeClass, className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="status" aria-label={`${label}: ${value}`}>
      <div className="warning-label__octagon" aria-hidden="true">
        <span className="warning-label__value">{value}</span>
      </div>
      <span className="warning-label__label">{label}</span>
    </div>
  );
}

