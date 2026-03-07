'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function ResponsiveNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const toggleMenu = () => setIsOpen(!isOpen)

  if (!user) return null

  const studentLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/recommendations', label: 'Recommendations' },
    { href: '/study-plans', label: 'Study Plans' },
    { href: '/progress', label: 'Progress' },
  ]

  const teacherLinks = [
    { href: '/analytics', label: 'Analytics' },
    { href: '/students', label: 'Students' },
    { href: '/class-performance', label: 'Class Performance' },
  ]

  const links = user.role === 'teacher' || user.role === 'admin' ? teacherLinks : studentLinks

  return (
    <nav className="bg-white shadow-md safe-top">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary-600">Learning Engine</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-item hover:bg-gray-100 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="btn btn-secondary"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden min-h-tap-target min-w-tap-target p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-item hover:bg-gray-100 rounded-lg block"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="btn btn-secondary w-full"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
