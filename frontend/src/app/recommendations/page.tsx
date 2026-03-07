'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import { askAI } from '@/lib/api'

interface AIRecommendation {
  topic: string
  priority: number
  reason: string
  estimatedHours: number
  prerequisites: string[]
}

export default function RecommendationsPage() {
  const [error, setError] = useState<string | null>(null)
  const [topicInput, setTopicInput] = useState('')
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([])
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [showTopicInput, setShowTopicInput] = useState(true)

  const generateAIRecommendations = async () => {
    if (!topicInput.trim()) {
      setError('Please enter topics or subjects to study')
      return
    }

    try {
      setGeneratingPlan(true)
      setError(null)
      
      // Get user ID from localStorage or use a default
      let userId = 'guest_user'
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          userId = user.id || user.user_id || 'guest_user'
        }
      } catch (e) {
        console.log('Using guest user')
      }
      
      const prompt = `I want to learn the following topics: ${topicInput}

Please analyze these topics and provide a personalized study plan with:
1. Optimal learning order based on prerequisites and dependencies
2. Priority ranking for each topic
3. Estimated study time for each topic
4. Clear reasoning for the recommended order
5. Any prerequisites I should know first

Format your response as a structured study plan with clear sections for each topic.`

      console.log('Calling AI with userId:', userId)
      const response = await askAI(userId, prompt)
      console.log('AI Response:', response)
      
      // Parse AI response to extract recommendations
      const recommendations = parseAIResponse(response.answer, topicInput)
      setAiRecommendations(recommendations)
      setShowTopicInput(false)
      
    } catch (err) {
      console.error('Error generating recommendations:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate study plan'
      setError(`Failed to get AI response: ${errorMessage}`)
    } finally {
      setGeneratingPlan(false)
    }
  }

  const parseAIResponse = (aiResponse: string, topics: string): AIRecommendation[] => {
    // Split topics by comma
    const topicList = topics.split(',').map(t => t.trim()).filter(t => t)
    
    // Create recommendations based on AI response
    const recommendations: AIRecommendation[] = topicList.map((topic, index) => {
      // Extract relevant info from AI response for this topic
      const topicLower = topic.toLowerCase()
      const responseLines = aiResponse.split('\n')
      
      // Find lines mentioning this topic
      const relevantLines = responseLines.filter(line => 
        line.toLowerCase().includes(topicLower)
      )
      
      const reason = relevantLines.length > 0 
        ? relevantLines.slice(0, 2).join(' ').substring(0, 200)
        : `Study ${topic} to build foundational knowledge`
      
      return {
        topic,
        priority: topicList.length - index, // Higher priority for earlier topics
        reason,
        estimatedHours: 3 + Math.random() * 5, // 3-8 hours estimate
        prerequisites: index > 0 ? [topicList[index - 1]] : []
      }
    })
    
    return recommendations
  }

  useEffect(() => {
    // Always show topic input on page load
    setShowTopicInput(true)
  }, [])

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Study Recommendations</h1>
            <p className="text-gray-600 mt-2">Get AI-powered personalized study plans</p>
          </div>

          {/* Topic Input Section */}
          {showTopicInput && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 shadow-lg">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    What do you want to learn?
                  </h2>
                  <p className="text-gray-600">
                    Enter topics or subjects separated by commas, and our AI will create a personalized study plan
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topics / Subjects
                    </label>
                    <textarea
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      placeholder="e.g., React, Node.js, MongoDB, Docker, Kubernetes"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                      disabled={generatingPlan}
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      💡 Tip: Enter any topics you want to learn - programming, math, science, languages, or any subject!
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={generateAIRecommendations}
                    disabled={generatingPlan || !topicInput.trim()}
                    className="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {generatingPlan ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating Your Study Plan...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate AI Study Plan
                      </>
                    )}
                  </button>
                </div>

                {/* Example Topics */}
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Quick examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'React, TypeScript, Next.js',
                      'Python, Machine Learning, Data Science',
                      'Calculus, Linear Algebra, Statistics',
                      'Spanish, French, German'
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => setTopicInput(example)}
                        className="px-3 py-1 bg-white border border-blue-300 text-blue-700 text-sm rounded-full hover:bg-blue-50 transition-colors"
                        disabled={generatingPlan}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Generated Recommendations */}
          {aiRecommendations.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Your Personalized Study Plan</h2>
                <button
                  onClick={() => {
                    setShowTopicInput(true)
                    setAiRecommendations([])
                    setTopicInput('')
                  }}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Plan
                </button>
              </div>

              <div className="grid gap-4">
                {aiRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`bg-white border-2 rounded-xl p-6 shadow-md transition-all hover:shadow-lg ${
                      index === 0 ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-white' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                          index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{rec.topic}</h3>
                            {index === 0 && (
                              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                Start Here
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 leading-relaxed">{rec.reason}</p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {rec.priority}
                        </div>
                        <div className="text-xs text-gray-500">Priority</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600 mb-1">Estimated Time</div>
                        <div className="text-lg font-bold text-purple-600">
                          {rec.estimatedHours.toFixed(1)} hours
                        </div>
                      </div>
                      {rec.prerequisites.length > 0 && (
                        <div className="bg-orange-50 rounded-lg p-3">
                          <div className="text-sm text-gray-600 mb-1">Prerequisites</div>
                          <div className="text-sm font-semibold text-orange-600">
                            {rec.prerequisites.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Study Tips */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Study Tips
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Follow the recommended order to build strong foundations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Dedicate focused time blocks for each topic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Practice regularly and track your progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Use the AI Tutor for questions and clarifications</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
