'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import {
  getStudentComparison,
  getClassPerformance,
  StudentComparison,
  ClassPerformance,
} from '@/lib/api'

export default function StudentComparisonPage() {
  const [classId, setClassId] = useState<number>(1) // Default class ID
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [comparison, setComparison] = useState<StudentComparison | null>(null)
  const [classPerformance, setClassPerformance] = useState<ClassPerformance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadClassData()
  }, [classId])

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentComparison()
    }
  }, [selectedStudentId, classId])

  const loadClassData = async () => {
    try {
      const perf = await getClassPerformance(classId)
      setClassPerformance(perf)
    } catch (err) {
      console.error('Failed to load class data:', err)
    }
  }

  const loadStudentComparison = async () => {
    if (!selectedStudentId) return

    setLoading(true)
    setError(null)

    try {
      const comp = await getStudentComparison(selectedStudentId, classId)
      setComparison(comp)
    } catch (err) {
      setError('Failed to load student comparison')
      console.error('Comparison error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (difference: number) => {
    if (difference >= 10) return 'text-green-600'
    if (difference >= 0) return 'text-blue-600'
    if (difference >= -10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceIcon = (difference: number) => {
    if (difference >= 10) return '↑↑'
    if (difference >= 0) return '↑'
    if (difference >= -10) return '↓'
    return '↓↓'
  }

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'bg-green-500'
    if (mastery >= 60) return 'bg-blue-500'
    if (mastery >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Comparison</h1>
              <p className="text-gray-600 mt-2">
                Compare individual student performance with class averages
              </p>
            </div>
            <button
              onClick={() => (window.location.href = '/analytics')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Student Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Student</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  type="number"
                  value={selectedStudentId || ''}
                  onChange={(e) => setSelectedStudentId(e.target.value ? Number(e.target.value) : null)}
                  placeholder="Enter student ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class ID
                </label>
                <input
                  type="number"
                  value={classId}
                  onChange={(e) => setClassId(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : comparison ? (
            <>
              {/* Student Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {comparison.student_name} (ID: {comparison.student_id})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Student Average</h3>
                    <p className="text-3xl font-bold text-blue-900">
                      {comparison.avg_mastery.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Class Average</h3>
                    <p className="text-3xl font-bold text-gray-700">
                      {comparison.class_avg_mastery.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Class Rank</h3>
                    <p className="text-3xl font-bold text-purple-900">
                      {comparison.rank} / {comparison.total_students}
                    </p>
                  </div>
                </div>
              </div>

              {/* Overall Performance Comparison */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Overall Performance</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Performance vs Class Average</span>
                    <span
                      className={`text-2xl font-bold ${getPerformanceColor(
                        comparison.avg_mastery - comparison.class_avg_mastery
                      )}`}
                    >
                      {getPerformanceIcon(comparison.avg_mastery - comparison.class_avg_mastery)}{' '}
                      {Math.abs(comparison.avg_mastery - comparison.class_avg_mastery).toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div className="text-xs font-semibold text-blue-600">Student</div>
                      <div className="text-xs font-semibold text-gray-600">Class Avg</div>
                    </div>
                    <div className="flex h-4 mb-4 overflow-hidden rounded bg-gray-200">
                      <div
                        style={{ width: `${comparison.avg_mastery}%` }}
                        className="flex flex-col justify-center bg-blue-500 text-center text-white text-xs"
                      ></div>
                    </div>
                    <div className="flex h-4 overflow-hidden rounded bg-gray-200">
                      <div
                        style={{ width: `${comparison.class_avg_mastery}%` }}
                        className="flex flex-col justify-center bg-gray-500 text-center text-white text-xs"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Topic-wise Comparison */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📚 Topic-wise Breakdown</h2>
                <div className="space-y-6">
                  {comparison.topic_comparison
                    .sort((a, b) => a.difference - b.difference)
                    .map((topic) => (
                      <div key={topic.topic_id} className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{topic.topic_name}</h3>
                            <p className="text-sm text-gray-600">
                              Student: {topic.student_mastery.toFixed(1)}% | Class Avg:{' '}
                              {topic.class_avg_mastery.toFixed(1)}%
                            </p>
                          </div>
                          <span
                            className={`text-lg font-bold ${getPerformanceColor(topic.difference)}`}
                          >
                            {getPerformanceIcon(topic.difference)} {Math.abs(topic.difference).toFixed(1)}%
                          </span>
                        </div>

                        {/* Student Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Student Performance</span>
                            <span>{topic.student_mastery.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full ${getMasteryColor(topic.student_mastery)}`}
                              style={{ width: `${Math.min(topic.student_mastery, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Class Average Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Class Average</span>
                            <span>{topic.class_avg_mastery.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="h-3 rounded-full bg-gray-500"
                              style={{ width: `${Math.min(topic.class_avg_mastery, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Performance Indicator */}
                        {topic.difference < -10 && (
                          <div className="bg-red-50 border border-red-200 rounded px-3 py-2">
                            <p className="text-sm text-red-700">
                              ⚠️ Student is significantly below class average. Consider additional support.
                            </p>
                          </div>
                        )}
                        {topic.difference > 10 && (
                          <div className="bg-green-50 border border-green-200 rounded px-3 py-2">
                            <p className="text-sm text-green-700">
                              ✓ Student is performing well above class average.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Class Comparison Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Performance Distribution</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Topics Above Class Average
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {comparison.topic_comparison.filter((t) => t.difference > 0).length}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Topics Below Class Average
                      </h3>
                      <p className="text-2xl font-bold text-red-600">
                        {comparison.topic_comparison.filter((t) => t.difference < 0).length}
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Topics Needing Attention (≥10% below average)
                    </h3>
                    <div className="space-y-2 mt-3">
                      {comparison.topic_comparison
                        .filter((t) => t.difference <= -10)
                        .map((topic) => (
                          <div
                            key={topic.topic_id}
                            className="flex justify-between items-center bg-white px-3 py-2 rounded"
                          >
                            <span className="text-sm text-gray-700">{topic.topic_name}</span>
                            <span className="text-sm font-semibold text-red-600">
                              {topic.difference.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      {comparison.topic_comparison.filter((t) => t.difference <= -10).length === 0 && (
                        <p className="text-sm text-gray-600">No topics need immediate attention.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-600">Enter a student ID to view comparison data</p>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
