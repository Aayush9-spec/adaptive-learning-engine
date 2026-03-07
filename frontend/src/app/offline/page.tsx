'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          You're Offline
        </h1>
        
        <p className="text-gray-600 mb-8 text-sm sm:text-base">
          No internet connection detected. Don't worry - you can still use the app with cached data.
          Your progress will sync automatically when you're back online.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary w-full"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary w-full"
          >
            Go Back
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> You can continue solving questions and viewing your progress.
            All your work will be saved locally and synced when you reconnect.
          </p>
        </div>
      </div>
    </div>
  )
}
