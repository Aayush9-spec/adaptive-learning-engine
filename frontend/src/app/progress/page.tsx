'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/contexts/AuthContext'
import { getStudentPerformance, StudentPerformance, MasteryScore } from '@/lib/api'

interface TrendData {
  date: string
  mastery: number
}

export default function ProgressPage() {
  const { user } = useAuth()
  const [performance, setPerformance] = useState<StudentPerformance | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview')

  useEffect(() => {
    if (user?.id) {
      loadPerformanceData()
    }
  }, [user?.id])

  const loadPerformanceData = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const perf = await getStudentPerformance(user.id.toString())
      setPerformance(perf)
    } catch (err) {
      console.error('Failed to load performance data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getMasteryColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getMasteryLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Work'
  }

  const getImprovedTopics = () => {
    if (!performance?.mastery_scores) return []
    // Placeholder: In a real implementation, this would compare with historical data
    // For now, we'll mark topics with >70% mastery as "improved"
    return performance.mastery_scores.filter(s => s.mastery_score > 70)
  }

  const getDeclinedTopics = () => {
    if (!performance?.mastery_scores) return []
    // Placeholder: In a real implementation, this would compare with historical data
    // For now, we'll mark topics with <40% mastery as "declined"
    return performance.mastery_scores.filter(s => s.mastery_score < 40)
  }

  const generateMockTrendData = (masteryScore: number): TrendData[] => {
    // Generate mock 30-day trend data
    const data: TrendData[] = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Simulate gradual improvement towards current mastery
      const progress = (30 - i) / 30
      const startScore = Math.max(0, masteryScore - 30)
      const score = startScore + (masteryScore - startScore) * progress + (Math.random() * 5 - 2.5)
      
      data.push({
        date: date.toISOString().split('T')[0],
        mastery: Math.max(0, Math.min(100, score))
      })
    }
    
    return data
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <MainLayout>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  const selectedConceptData = selectedConcept 
    ? performance?.mastery_scores.find(s => s.concept_id === selectedConcept)
    : null

  const trendData = selectedConceptData 
    ? generateMockTrendData(selectedConceptData.mastery_score)
    : []

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learning Progress</h1>
              <p className="text-gray-600 mt-2">Track your improvement over time</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'detailed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Detailed
              </button>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Attempts</h3>
              <p className="text-3xl font-bold text-gray-900">{performance?.total_attempts || 0}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Overall Accuracy</h3>
              <p className="text-3xl font-bold text-green-600">
                {performance?.accuracy ? `${performance.accuracy.toFixed(1)}%` : '0%'}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Topics Mastered</h3>
              <p className="text-3xl font-bold text-blue-600">
                {performance?.mastery_scores.filter(s => s.mastery_score >= 80).length || 0}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Average Mastery</h3>
              <p className="text-3xl font-bold text-purple-600">
                {performance?.mastery_scores.length
                  ? (performance.mastery_scores.reduce((sum, s) => sum + s.mastery_score, 0) / performance.mastery_scores.length).toFixed(1)
                  : '0'}%
              </p>
            </div>
          </div>

          {viewMode === 'overview' ? (
            <>
              {/* Improved Topics */}
              {getImprovedTopics().length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-green-900 mb-4">📈 Improved Topics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getImprovedTopics().map((topic) => (
                      <div key={topic.concept_id} className="bg-white rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{topic.concept_name}</span>
                          <span className="text-green-600 font-bold">{topic.mastery_score.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.min(topic.mastery_score, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Declined Topics */}
              {getDeclinedTopics().length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-red-900 mb-4">📉 Topics Needing Attention</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getDeclinedTopics().map((topic) => (
                      <div key={topic.concept_id} className="bg-white rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{topic.concept_name}</span>
                          <span className="text-red-600 font-bold">{topic.mastery_score.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${Math.min(topic.mastery_score, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Mastery Scores */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📊 All Topics</h2>
                <div className="space-y-4">
                  {performance?.mastery_scores.map((score) => (
                    <div key={score.concept_id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">{score.concept_name}</span>
                          <span className={`ml-2 text-xs px-2 py-1 rounded ${
                            score.mastery_score >= 80 ? 'bg-green-100 text-green-800' :
                            score.mastery_score >= 60 ? 'bg-blue-100 text-blue-800' :
                            score.mastery_score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getMasteryLabel(score.mastery_score)}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedConcept(score.concept_id)
                            setViewMode('detailed')
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-4"
                        >
                          View Details →
                        </button>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                          {score.mastery_score.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all ${getMasteryColor(score.mastery_score)}`}
                          style={{ width: `${Math.min(score.mastery_score, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{score.correct_attempts}/{score.total_attempts} correct</span>
                        <span>{score.accuracy.toFixed(1)}% accuracy</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Detailed View */}
              {!selectedConcept ? (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                  <p className="text-gray-600 mb-4">Select a topic from the overview to see detailed progress</p>
                  <button
                    onClick={() => setViewMode('overview')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
                  >
                    Go to Overview
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Concept Header */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedConceptData?.concept_name}</h2>
                        <p className="text-gray-600 mt-1">Detailed progress breakdown</p>
                      </div>
                      <button
                        onClick={() => setSelectedConcept(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Mastery Score</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedConceptData?.mastery_score.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Attempts</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedConceptData?.total_attempts}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Correct</p>
                        <p className="text-2xl font-bold text-green-600">
                          {selectedConceptData?.correct_attempts}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Accuracy</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {selectedConceptData?.accuracy.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 30-Day Trend Graph */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">30-Day Mastery Trend</h3>
                    <div className="relative h-64">
                      <svg className="w-full h-full" viewBox="0 0 800 200">
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map((y) => (
                          <g key={y}>
                            <line
                              x1="40"
                              y1={180 - (y * 1.6)}
                              x2="780"
                              y2={180 - (y * 1.6)}
                              stroke="#e5e7eb"
                              strokeWidth="1"
                            />
                            <text
                              x="10"
                              y={185 - (y * 1.6)}
                              fontSize="12"
                              fill="#6b7280"
                            >
                              {y}%
                            </text>
                          </g>
                        ))}
                        
                        {/* Trend line */}
                        <polyline
                          points={trendData.map((d, i) => 
                            `${40 + (i * (740 / 29))},${180 - (d.mastery * 1.6)}`
                          ).join(' ')}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                        />
                        
                        {/* Data points */}
                        {trendData.map((d, i) => (
                          <circle
                            key={i}
                            cx={40 + (i * (740 / 29))}
                            cy={180 - (d.mastery * 1.6)}
                            r="4"
                            fill="#3b82f6"
                          />
                        ))}
                      </svg>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>30 days ago</span>
                      <span>Today</span>
                    </div>
                  </div>

                  {/* Concept Breakdown */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Breakdown</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Success Rate</span>
                        <span className="font-bold text-gray-900">
                          {selectedConceptData?.accuracy.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Questions Attempted</span>
                        <span className="font-bold text-gray-900">
                          {selectedConceptData?.total_attempts}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Correct Answers</span>
                        <span className="font-bold text-green-600">
                          {selectedConceptData?.correct_attempts}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Incorrect Answers</span>
                        <span className="font-bold text-red-600">
                          {(selectedConceptData?.total_attempts || 0) - (selectedConceptData?.correct_attempts || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
