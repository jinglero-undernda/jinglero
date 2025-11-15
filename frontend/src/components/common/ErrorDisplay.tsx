/**
 * ErrorDisplay Component
 * 
 * Displays field-level and form-level errors in a consistent, accessible way.
 * - Field-level: Red border on input + error message below
 * - Form-level: Red box above form with error message
 */

import React from 'react';

interface ErrorDisplayProps {
  /**
   * Form-level error message (displayed as a box above the form)
   */
  formError?: string | null;
  
  /**
   * Field-level errors (keyed by field name)
   */
  fieldErrors?: Record<string, string>;
  
  /**
   * Field name for field-level error display
   */
  fieldName?: string;
  
  /**
   * Custom className for styling
   */
  className?: string;
}

/**
 * Form-level error display component
 */
export function FormErrorDisplay({ formError, className }: { formError?: string | null; className?: string }) {
  if (!formError) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={className}
      style={{
        padding: '0.75rem',
        backgroundColor: '#fee',
        borderRadius: '4px',
        color: '#c00',
        fontSize: '0.875rem',
        marginBottom: '1rem',
        border: '1px solid #f44336',
      }}
    >
      <strong>Error:</strong> {formError}
    </div>
  );
}

/**
 * Field-level error display component
 */
export function FieldErrorDisplay({ error, fieldName }: { error?: string | null; fieldName?: string }) {
  if (!error) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        color: '#d32f2f',
        fontSize: '0.875rem',
        marginTop: '0.25rem',
        marginLeft: fieldName ? '0' : '0',
      }}
    >
      {error}
    </div>
  );
}

/**
 * Main ErrorDisplay component
 * Can be used for both form-level and field-level errors
 */
export default function ErrorDisplay({ formError, fieldErrors, fieldName, className }: ErrorDisplayProps) {
  // If fieldName is provided, show field-level error for that specific field
  if (fieldName && fieldErrors?.[fieldName]) {
    return <FieldErrorDisplay error={fieldErrors[fieldName]} fieldName={fieldName} />;
  }

  // If formError is provided, show form-level error
  if (formError) {
    return <FormErrorDisplay formError={formError} className={className} />;
  }

  // If fieldErrors is provided without fieldName, show all field errors
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    return (
      <div className={className}>
        {Object.entries(fieldErrors).map(([key, error]) => (
          <div
            key={key}
            role="alert"
            aria-live="polite"
            style={{
              color: '#d32f2f',
              fontSize: '0.875rem',
              marginTop: '0.25rem',
            }}
          >
            <strong>{key}:</strong> {error}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

/**
 * Helper function to get field error styling
 */
export function getFieldErrorStyle(hasError: boolean): React.CSSProperties {
  return hasError
    ? {
        borderColor: '#d32f2f',
        borderWidth: '2px',
      }
    : {};
}

