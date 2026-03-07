import { ReactNode } from 'react'

interface ResponsiveGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export default function ResponsiveGrid({ 
  children, 
  columns = 3,
  className = '' 
}: ResponsiveGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <div className={`grid gap-4 sm:gap-6 ${gridClasses[columns]} ${className}`}>
      {children}
    </div>
  )
}
