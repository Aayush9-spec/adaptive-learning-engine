'use client'

import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import MobileNav from './MobileNav'
import { useAuth } from '@/contexts/AuthContext'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          {children}
        </main>
      </div>
      <Footer />
      <MobileNav />
    </div>
  )
}
