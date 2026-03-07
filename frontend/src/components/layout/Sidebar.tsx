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
  { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['student', 'teacher', 'admin'] },
  { href: '/questions', label: 'Practice', icon: '📝', roles: ['student'] },
  { href: '/recommendations', label: 'Recommendations', icon: '🎯', roles: ['student'] },
  { href: '/study-plan', label: 'Study Plan', icon: '📅', roles: ['student'] },
  { href: '/progress', label: 'Progress', icon: '📈', roles: ['student'] },
  { href: '/analytics', label: 'Analytics', icon: '📉', roles: ['teacher', 'admin'] },
  { href: '/students', label: 'Students', icon: '👥', roles: ['teacher', 'admin'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  const filteredItems = navItems.filter(item => 
    item.roles.includes(user.role)
  )

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-tap-target ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
