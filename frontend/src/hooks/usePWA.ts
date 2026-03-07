'use client'

import { useEffect, useState } from 'react'

interface PWAStatus {
  isInstalled: boolean
  isStandalone: boolean
  canInstall: boolean
  isOnline: boolean
}

export function usePWA(): PWAStatus {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    isOnline: true,
  })

  useEffect(() => {
    // Check if running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    // Check if already installed
    const isInstalled = isStandalone || 
      localStorage.getItem('pwa-installed') === 'true'

    // Check online status
    const isOnline = navigator.onLine

    setStatus({
      isInstalled,
      isStandalone,
      canInstall: !isInstalled,
      isOnline,
    })

    // Listen for install event
    const handleAppInstalled = () => {
      localStorage.setItem('pwa-installed', 'true')
      setStatus(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
      }))
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return status
}
