'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import { getNextRecommendation, getTopRecommendations, Recommendation } from '@/lib/api'

export default function RecommendationsPage() {
  const [nextRecommendation, setNextRecommendation] = useState<Recommendation | null>(null)
  const [topRecommendations, setTopRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use demo user ID
      const studentId = 'demo_average'
      
      // Fetch next recommendation and top 5 alternatives
      const [next, top] = await Promise.all([
        getNextRecommendation(studentId),
        getTopRecommendations(studentId, 5)
      ])
      
      setNextRecommendation(next)
      setTopRecommendations(top)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading recommendations...</p>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <MainLayout>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Recommendations</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadRecommendations}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Study Recommendations</h1>
            <p className="text-gray-600 mt-2">AI-powered suggestions for what to study next</p>
          </div>

          {/* Next Recommendation Card */}
          {nextRecommendation && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full mb-2">
                    Recommended Next
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900">{nextRecommendation.topic_name}</h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {nextRecommendation.priority_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Priority Score</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Expected Marks Gain</div>
                  <div className="text-2xl font-bold text-green-600">
                    +{nextRecommendation.expected_marks_gain.toFixed(1)} marks
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Estimated Study Time</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {nextRecommendation.estimated_study_hours.toFixed(1)} hours
                  </div>
                </div>
              </div>

              {/* Detailed Explanation */}
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Why This Topic?
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-32 text-sm text-gray-600">Exam Weightage:</div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${nextRecommendation.explanation.exam_weightage}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {nextRecommendation.explanation.exam_weightage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-32 text-sm text-gray-600">Current Accuracy:</div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${nextRecommendation.explanation.current_accuracy}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {nextRecommendation.explanation.current_accuracy.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-32 text-sm text-gray-600">Mastery Score:</div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${nextRecommendation.explanation.mastery_score}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {nextRecommendation.explanation.mastery_score.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-32 text-sm text-gray-600">Unlocks Topics:</div>
                    <div className="flex-1">
                      <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold">
                        {nextRecommendation.explanation.dependencies_unlocked} chapters
                      </span>
                    </div>
                  </div>

                  {nextRecommendation.explanation.reasoning_text && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-gray-700 leading-relaxed">
                        {nextRecommendation.explanation.reasoning_text}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Alternative Recommendations */}
          {topRecommendations.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Alternative Recommendations</h2>
              <div className="space-y-3">
                {topRecommendations.map((rec, index) => (
                  <div 
                    key={rec.topic_id} 
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 font-semibold rounded-full text-sm">
                            {index + 1}
                          </span>
                          <h3 className="font-semibold text-gray-900 text-lg">{rec.topic_name}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            Score: {rec.priority_score.toFixed(1)}
                          </span>
                        </div>
                        <div className="ml-11 flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            +{rec.expected_marks_gain.toFixed(1)} marks
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {rec.estimated_study_hours.toFixed(1)} hours
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {rec.explanation.exam_weightage.toFixed(0)}% weightage
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!nextRecommendation && topRecommendations.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Available</h3>
              <p className="text-gray-600">Complete some questions to get personalized study recommendations.</p>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
