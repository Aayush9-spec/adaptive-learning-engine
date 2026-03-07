/**
 * SyncStatusIndicator Component
 * Displays current sync status and network connectivity
 */

'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { SyncState } from '@/lib/syncManager';

export default function SyncStatusIndicator() {
  const { isOnline, syncStatus, triggerSync } = useNetworkStatus();

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    
    switch (syncStatus.sync_state) {
      case SyncState.SYNCED:
        return 'bg-green-500';
      case SyncState.SYNCING:
        return 'bg-blue-500';
      case SyncState.PENDING:
        return 'bg-yellow-500';
      case SyncState.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    
    switch (syncStatus.sync_state) {
      case SyncState.SYNCED:
        return 'Synced';
      case SyncState.SYNCING:
        return 'Syncing...';
      case SyncState.PENDING:
        return `${syncStatus.pending_operations} pending`;
      case SyncState.ERROR:
        return 'Sync error';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = () => {
    if (!isOnline) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
        </svg>
      );
    }

    switch (syncStatus.sync_state) {
      case SyncState.SYNCED:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case SyncState.SYNCING:
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case SyncState.PENDING:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case SyncState.ERROR:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleClick = () => {
    if (isOnline && syncStatus.sync_state === SyncState.PENDING) {
      triggerSync();
    }
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm ${getStatusColor()} ${
        isOnline && syncStatus.sync_state === SyncState.PENDING ? 'cursor-pointer hover:opacity-80' : ''
      }`}
      onClick={handleClick}
      title={
        isOnline && syncStatus.sync_state === SyncState.PENDING
          ? 'Click to sync now'
          : getStatusText()
      }
    >
      {getStatusIcon()}
      <span className="font-medium">{getStatusText()}</span>
      {syncStatus.last_sync_time && syncStatus.sync_state === SyncState.SYNCED && (
        <span className="text-xs opacity-75">
          {new Date(syncStatus.last_sync_time).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
