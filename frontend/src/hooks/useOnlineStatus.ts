/**
 * useOnlineStatus Hook
 * 
 * Tracks online/offline status using the Navigator API.
 * Listens to online/offline events and returns current status.
 */

import { useState, useEffect } from 'react';

export interface OnlineStatus {
  isOnline: boolean;
}

/**
 * Hook to track online/offline status
 * 
 * @returns Object with isOnline boolean indicating current network status
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOnline } = useOnlineStatus();
 *   
 *   if (!isOnline) {
 *     return <div>You are offline</div>;
 *   }
 *   
 *   return <div>You are online</div>;
 * }
 * ```
 */
export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    // Initialize with current status
    if (typeof window !== 'undefined' && 'navigator' in window) {
      return navigator.onLine;
    }
    return true; // Default to online if navigator not available
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('navigator' in window)) {
      return;
    }

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}

