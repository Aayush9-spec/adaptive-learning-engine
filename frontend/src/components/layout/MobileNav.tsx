'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
  href: string
  label: string
  icon: string
  roles: string[]
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: '📊', roles: ['student', 'teacher', 'admin'] },
  { href: '/questions', label: 'Practice', icon: '📝', roles: ['student'] },
  { href: '/recommendations', label: 'Tips', icon: '🎯', roles: ['student'] },
  { href: '/progress', label: 'Progress', icon: '📈', roles: ['student'] },
  { href: '/analytics', label: 'Analytics', icon: '📉', roles: ['teacher', 'admin'] },
]

export default function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  const filteredItems = navItems.filter(item => 
    item.roles.includes(user.role)
  ).slice(0, 4) // Show max 4 items on mobile

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-tap-target min-h-tap-target px-2 ${
                isActive ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
