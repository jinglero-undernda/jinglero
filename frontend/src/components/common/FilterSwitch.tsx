import React from 'react';
import '../../styles/components/filter-switch.css';

export interface FilterSwitchProps {
  /** Whether the switch is checked (on) */
  checked: boolean;
  /** Change handler function */
  onChange: (checked: boolean) => void;
  /** Label text for the switch */
  label: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Accessibility label (if different from label) */
  ariaLabel?: string;
  /** Unique identifier */
  id?: string;
  /** Optional status indicator (ON/OFF) */
  showStatus?: boolean;
}

/**
 * Industrial console-style boolean filter switch component.
 * 
 * Provides a mechanical, industrial aesthetic toggle switch for boolean filters
 * and control panel interfaces. Uses factory signage typography and industrial
 * accent colors.
 * 
 * @example
 * ```tsx
 * <FilterSwitch
 *   checked={isFilterActive}
 *   onChange={setIsFilterActive}
 *   label="Show Active Only"
 *   size="medium"
 * />
 * ```
 */
export default function FilterSwitch({
  checked,
  onChange,
  label,
  size = 'medium',
  disabled = false,
  ariaLabel,
  id,
  showStatus = false,
}: FilterSwitchProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      onChange(!checked);
    }
  };

  const switchId = id || `filter-switch-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const labelId = `${switchId}-label`;
  const statusId = `${switchId}-status`;

  const sizeClass = size !== 'medium' ? `filter-switch--${size}` : '';
  const classes = [
    'filter-switch',
    sizeClass,
    checked ? 'filter-switch--checked' : '',
    disabled ? 'filter-switch--disabled' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel || label}
      aria-labelledby={ariaLabel ? undefined : labelId}
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
    >
      <input
        type="checkbox"
        className="filter-switch__input"
        checked={checked}
        onChange={() => {}} // Controlled by parent div
        disabled={disabled}
        id={switchId}
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="filter-switch__track" aria-hidden="true">
        <div className="filter-switch__handle" />
      </div>
      <label
        id={labelId}
        className="filter-switch__label"
        htmlFor={switchId}
        onClick={(e) => e.preventDefault()}
      >
        {label}
      </label>
      {showStatus && (
        <span id={statusId} className="filter-switch__status" aria-hidden="true">
          {checked ? 'ON' : 'OFF'}
        </span>
      )}
    </div>
  );
}

