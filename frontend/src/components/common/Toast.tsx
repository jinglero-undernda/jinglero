/**
 * Toast Component
 * 
 * Auto-dismissing, stackable notification component with variants:
 * - success: Green background for successful operations
 * - error: Red background for errors
 * - warning: Orange/yellow background for warnings
 * - info: Blue background for informational messages
 */

import { useEffect, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export function ToastComponent({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto-dismiss after duration
    const duration = toast.duration ?? (toast.variant === 'error' ? 3000 : 5000);
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleDismiss = () => {
    setIsExiting(true);
    // Wait for exit animation before removing
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };

  const getVariantStyles = (variant: ToastVariant) => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: '#2e7d32',
          borderColor: '#4caf50',
          icon: '✓',
        };
      case 'error':
        return {
          backgroundColor: '#c62828',
          borderColor: '#f44336',
          icon: '✕',
        };
      case 'warning':
        return {
          backgroundColor: '#ed6c02',
          borderColor: '#ff9800',
          icon: '⚠',
        };
      case 'info':
        return {
          backgroundColor: '#1976d2',
          borderColor: '#42a5f5',
          icon: 'ℹ',
        };
      default:
        return {
          backgroundColor: '#424242',
          borderColor: '#616161',
          icon: '•',
        };
    }
  };

  const styles = getVariantStyles(toast.variant);

  return (
    <div
      role="alert"
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
      onClick={handleDismiss}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: styles.backgroundColor,
        border: `1px solid ${styles.borderColor}`,
        borderRadius: '4px',
        color: '#fff',
        fontSize: '14px',
        minWidth: '300px',
        maxWidth: '400px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
        marginBottom: '8px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.9';
      }}
      onMouseLeave={(e) => {
        if (!isExiting) {
          e.currentTarget.style.opacity = '1';
        }
      }}
    >
      <span
        style={{
          fontSize: '18px',
          fontWeight: 'bold',
          flexShrink: 0,
        }}
      >
        {styles.icon}
      </span>
      <span
        style={{
          flex: 1,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        {toast.message}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          padding: 0,
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          opacity: 0.8,
        }}
        aria-label="Cerrar notificación"
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.8';
        }}
      >
        ×
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  // Limit to max 5 visible toasts
  const visibleToasts = toasts.slice(0, 5);

  if (visibleToasts.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {visibleToasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
          }}
        >
          <ToastComponent toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

