'use client';

import { useEffect, useState } from 'react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 safe-top z-50 p-4">
      <div
        className={`max-w-md mx-auto rounded-lg shadow-lg p-4 ${
          isOnline
            ? 'bg-green-50 border-2 border-green-500'
            : 'bg-yellow-50 border-2 border-yellow-500'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {isOnline ? (
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${
                isOnline ? 'text-green-800' : 'text-yellow-800'
              }`}
            >
              {isOnline ? 'Back Online' : 'You are Offline'}
            </p>
            <p
              className={`text-xs ${
                isOnline ? 'text-green-600' : 'text-yellow-600'
              }`}
            >
              {isOnline
                ? 'Your data will sync automatically'
                : 'Working in offline mode - changes will sync when reconnected'}
            </p>
          </div>
          
          <button
            onClick={() => setShowStatus(false)}
            className="flex-shrink-0 min-h-tap-target min-w-tap-target p-2 rounded-lg hover:bg-white/50"
            aria-label="Close"
          >
            <svg
              className={`h-5 w-5 ${
                isOnline ? 'text-green-600' : 'text-yellow-600'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
