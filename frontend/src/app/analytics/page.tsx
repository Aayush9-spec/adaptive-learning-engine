'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/contexts/AuthContext'
import {
  getClassPerformance,
  getWeakTopics,
  getAtRiskStudents,
  getExamPredictions,
  ClassPerformance,
  WeakTopic,
  AtRiskStudent,
  ExamPrediction,
} from '@/lib/api'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [classId, setClassId] = useState<number>(1) // Default class ID
  const [performance, setPerformance] = useState<ClassPerformance | null>(null)
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([])
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([])
  const [predictions, setPredictions] = useState<ExamPrediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [selectedStudent, setSelectedStudent] = useState<number | undefined>()
  const [selectedTopic, setSelectedTopic] = useState<number | undefined>()
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  useEffect(() => {
    loadAnalyticsData()
  }, [classId, selectedStudent, selectedTopic, startDate, endDate])

  const loadAnalyticsData = async () => {
    setLoading(true)
    setError(null)

    try {
      const filters = {
        studentId: selectedStudent,
        topicId: selectedTopic,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }

      const [perf, weak, atRisk, pred] = await Promise.all([
        getClassPerformance(classId, filters),
        getWeakTopics(classId, 40),
        getAtRiskStudents(classId),
        getExamPredictions(classId),
      ])

      setPerformance(perf)
      setWeakTopics(weak)
      setAtRiskStudents(atRisk)
      setPredictions(pred)
    } catch (err) {
      setError('Failed to load analytics data')
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'bg-green-500'
    if (mastery >= 60) return 'bg-blue-500'
    if (mastery >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const clearFilters = () => {
    setSelectedStudent(undefined)
    setSelectedTopic(undefined)
    setStartDate('')
    setEndDate('')
  }

  return (
    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Monitor class performance and identify students who need support
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  type="number"
                  value={selectedStudent || ''}
                  onChange={(e) => setSelectedStudent(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="All students"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic ID
                </label>
                <input
                  type="number"
                  value={selectedTopic || ''}
                  onChange={(e) => setSelectedTopic(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="All topics"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={loadAnalyticsData}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Apply Filters
              </button>
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
          ) : (
            <>
              {/* Class Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Students</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {performance?.total_students || 0}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Active Students</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {performance?.active_students || 0}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Attempts</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {performance?.total_attempts || 0}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">At-Risk Students</h3>
                  <p className="text-3xl font-bold text-red-600">
                    {atRiskStudents.filter(s => s.risk_level === 'high').length}
                  </p>
                </div>
              </div>

              {/* Exam Predictions */}
              {predictions && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Exam Predictions</h2>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Predicted Class Average
                        </span>
                        <span className="text-2xl font-bold text-purple-900">
                          {predictions.predicted_avg_score.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          Lower bound: {predictions.confidence_interval.lower.toFixed(1)}%
                        </span>
                        <span>
                          Upper bound: {predictions.confidence_interval.upper.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Weak Topics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">⚠️ Weak Topics (Mastery &lt; 40%)</h2>
                {weakTopics.length === 0 ? (
                  <p className="text-gray-600">No weak topics found. Great job!</p>
                ) : (
                  <div className="space-y-4">
                    {weakTopics.map((topic) => (
                      <div key={topic.topic_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{topic.topic_name}</h3>
                            <p className="text-sm text-gray-600">
                              {topic.struggling_students} of {topic.student_count} students struggling
                            </p>
                          </div>
                          <span className="text-lg font-bold text-red-600">
                            {topic.avg_mastery.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${getMasteryColor(topic.avg_mastery)}`}
                            style={{ width: `${Math.min(topic.avg_mastery, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* At-Risk Students */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🚨 At-Risk Students</h2>
                {atRiskStudents.length === 0 ? (
                  <p className="text-gray-600">No at-risk students identified.</p>
                ) : (
                  <div className="space-y-4">
                    {atRiskStudents.map((student) => (
                      <div key={student.student_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {student.student_name} (ID: {student.student_id})
                            </h3>
                            <p className="text-sm text-gray-600">
                              Average Mastery: {student.avg_mastery.toFixed(1)}%
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(
                              student.risk_level
                            )}`}
                          >
                            {student.risk_level.toUpperCase()} RISK
                          </span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Weak Topics:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {student.weak_topics.map((topic) => (
                              <div
                                key={topic.topic_id}
                                className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded"
                              >
                                <span className="text-sm text-gray-700">{topic.topic_name}</span>
                                <span className="text-sm font-semibold text-red-600">
                                  {topic.mastery_score.toFixed(0)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Class Performance by Topic */}
              {performance && performance.avg_mastery_by_topic.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Class Performance by Topic</h2>
                  <div className="space-y-4">
                    {performance.avg_mastery_by_topic
                      .sort((a, b) => a.avg_mastery - b.avg_mastery)
                      .map((topic) => (
                        <div key={topic.topic_id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                              {topic.topic_name}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {topic.avg_mastery.toFixed(1)}% ({topic.student_count} students)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${getMasteryColor(
                                topic.avg_mastery
                              )}`}
                              style={{ width: `${Math.min(topic.avg_mastery, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => (window.location.href = '/analytics/students')}
                  className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-4 px-6 rounded-lg transition-colors"
                >
                  View Student Comparisons
                </button>
                <button
                  onClick={loadAnalyticsData}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            </>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
