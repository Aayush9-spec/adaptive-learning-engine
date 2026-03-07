/**
 * useNetworkStatus Hook
 * Monitors network connectivity and triggers sync when coming online
 */

import { useState, useEffect } from 'react';
import { syncManager, SyncStatus, SyncState } from '@/lib/syncManager';

export interface NetworkStatus {
  isOnline: boolean;
  syncStatus: SyncStatus;
  triggerSync: () => Promise<void>;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined' && typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pending_operations: 0,
    last_sync_time: null,
    sync_state: SyncState.SYNCED,
  });

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Initialize sync status
    syncManager.getSyncStatus().then(setSyncStatus);

    // Set up network listeners
    const handleOnline = () => {
      console.log('Network: Online - triggering sync');
      setIsOnline(true);
      
      // Trigger sync after coming online
      setTimeout(() => {
        syncManager.triggerSync().then(() => {
          syncManager.getSyncStatus().then(setSyncStatus);
        });
      }, 1000); // Wait 1 second to ensure connection is stable
    };

    const handleOffline = () => {
      console.log('Network: Offline');
      setIsOnline(false);
      syncManager.getSyncStatus().then(setSyncStatus);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Add sync status listener
    const handleSyncStatusChange = (status: SyncStatus) => {
      setSyncStatus(status);
    };
    syncManager.addListener(handleSyncStatusChange);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      syncManager.removeListener(handleSyncStatusChange);
    };
  }, []);

  const triggerSync = async () => {
    if (isOnline) {
      await syncManager.triggerSync();
      const status = await syncManager.getSyncStatus();
      setSyncStatus(status);
    }
  };

  return {
    isOnline,
    syncStatus,
    triggerSync,
  };
}
