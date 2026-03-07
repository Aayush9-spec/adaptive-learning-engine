'use client'

import { useEffect, useState } from 'react'

export default function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        setRegistration(reg)

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setShowUpdate(true)
              }
            })
          }
        })
      }
    })
  }, [])

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  const handleDismiss = () => {
    setShowUpdate(false)
  }

  if (!showUpdate) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 safe-bottom z-50 p-4 sm:p-6">
      <div className="card max-w-md mx-auto shadow-xl border-2 border-blue-500 bg-blue-50">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
              Update Available
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              A new version of the app is available. Update now to get the latest features and improvements.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleUpdate}
                className="btn btn-primary flex-1"
              >
                Update Now
              </button>
              <button
                onClick={handleDismiss}
                className="btn btn-secondary flex-1"
              >
                Later
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 min-h-tap-target min-w-tap-target p-2 -mr-2 -mt-2 rounded-lg hover:bg-blue-100"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5 text-blue-600"
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
  )
}
