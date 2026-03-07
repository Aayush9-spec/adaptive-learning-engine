'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'

export default function StudentsPage() {
  return (
    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">View and manage student performance</p>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
