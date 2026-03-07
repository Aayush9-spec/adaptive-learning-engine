'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import SyncStatusIndicator from '@/components/sync/SyncStatusIndicator'

export default function Header() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary-600">
              Learning Engine
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user && <SyncStatusIndicator />}
            {user && (
              <>
                <span className="hidden sm:block text-sm text-gray-700">
                  {user.username} ({user.role})
                </span>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="sm:hidden btn btn-secondary"
                  aria-label="Toggle menu"
                >
                  ☰
                </button>
                <button
                  onClick={logout}
                  className="hidden sm:block btn btn-secondary"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {menuOpen && user && (
        <div className="sm:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <div className="text-sm text-gray-700 pb-2 border-b">
              {user.username} ({user.role})
            </div>
            <button
              onClick={() => {
                logout()
                setMenuOpen(false)
              }}
              className="w-full btn btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
