'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [showTopicInput, setShowTopicInput] = useState(false)
  const [topics, setTopics] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const exampleQuestions = [
    'Explain closures in JS',
    'How does DNS work?',
    'What is a B-tree?',
    'CAP theorem'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      // Navigate to AI tutor with the query
      router.push(`/tutor?q=${encodeURIComponent(query)}`)
    }
  }

  const handleExampleClick = (example: string) => {
    setQuery(example)
  }

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topics.trim()) return

    setIsGenerating(true)
    
    // Parse topics (comma-separated)
    const topicList = topics.split(',').map(t => t.trim()).filter(t => t)
    
    // Navigate to tutor with a special query to generate learning path
    const learningPathQuery = `I want to learn: ${topicList.join(', ')}. Please recommend the best learning order and explain why I should study each topic in that sequence. Consider prerequisites, difficulty progression, and practical applications.`
    
    router.push(`/tutor?q=${encodeURIComponent(learningPathQuery)}`)
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">🎓</span>
            </div>
            <h1 className="text-xl font-semibold">AI Learning Assistant</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">ask anything, learn everything</span>
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-xs">{user?.username?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
          {!showTopicInput ? (
            <>
              {/* Centered Icon */}
              <div className="mb-8">
                <div className="text-6xl text-yellow-500 font-mono">
                  {'{ ? }'}
                </div>
              </div>

              {/* Main Question */}
              <h2 className="text-3xl font-semibold mb-4 text-center">
                What do you want to learn?
              </h2>

              {/* Subtitle */}
              <p className="text-gray-400 text-center mb-8 max-w-2xl">
                Ask about programming, algorithms, cloud architecture, system design, 
                or any technical concept. Get clear, concise explanations with examples.
              </p>

              {/* Example Buttons */}
              <div className="flex flex-wrap gap-3 justify-center mb-8">
                {exampleQuestions.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors border border-gray-700"
                  >
                    {example}
                  </button>
                ))}
              </div>

              {/* Topic Input Button */}
              <button
                onClick={() => setShowTopicInput(true)}
                className="mb-12 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold rounded-xl transition-all hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Learning Path from Topics
              </button>

              {/* Quick Access Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
                <button
                  onClick={() => router.push('/recommendations')}
                  className="p-6 bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-800 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">📚</div>
                  <h3 className="font-semibold mb-1">Study Recommendations</h3>
                  <p className="text-sm text-gray-400">AI-powered learning path</p>
                </button>

                <button
                  onClick={() => router.push('/progress')}
                  className="p-6 bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-800 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold mb-1">Track Progress</h3>
                  <p className="text-sm text-gray-400">View your mastery scores</p>
                </button>

                <button
                  onClick={() => router.push('/study-plan')}
                  className="p-6 bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-800 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">📅</div>
                  <h3 className="font-semibold mb-1">Study Plan</h3>
                  <p className="text-sm text-gray-400">Personalized schedule</p>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Topic Input Form */}
              <div className="w-full max-w-3xl">
                <button
                  onClick={() => setShowTopicInput(false)}
                  className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">🎯</div>
                  <h2 className="text-3xl font-semibold mb-3">
                    Create Your Learning Path
                  </h2>
                  <p className="text-gray-400">
                    Enter any subjects or topics you want to study. AI will analyze them and recommend the best learning order.
                  </p>
                </div>

                <form onSubmit={handleTopicSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Topics to Learn (separate with commas)
                    </label>
                    <textarea
                      value={topics}
                      onChange={(e) => setTopics(e.target.value)}
                      placeholder="e.g., JavaScript, React, Node.js, MongoDB, AWS, Docker, Kubernetes..."
                      className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-yellow-500 focus:outline-none resize-none placeholder-gray-500"
                      rows={4}
                    />
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-2">💡 Examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Web Development: HTML, CSS, JavaScript, React',
                        'Data Science: Python, Pandas, NumPy, Machine Learning',
                        'Cloud: AWS, Docker, Kubernetes, Terraform'
                      ].map((example, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTopics(example.split(': ')[1])}
                          className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
                        >
                          {example.split(': ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!topics.trim() || isGenerating}
                    className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Learning Path...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Get AI Recommendations
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </main>

        {/* Bottom Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-gray-800 px-6 py-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What would you like to understand?"
                className="w-full bg-gray-900 text-white px-6 py-4 rounded-xl border border-gray-700 focus:border-yellow-500 focus:outline-none pr-14 placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
              >
                <svg 
                  className="w-5 h-5 text-black" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14 5l7 7m0 0l-7 7m7-7H3" 
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Enter to send
            </p>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
