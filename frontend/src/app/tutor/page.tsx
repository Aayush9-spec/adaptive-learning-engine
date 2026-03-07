'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function TutorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if there's a query parameter from dashboard
    const query = searchParams.get('q')
    if (query) {
      setInput(query)
      handleSubmit(null, query)
    }
  }, [searchParams])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent | null, queryOverride?: string) => {
    if (e) e.preventDefault()
    
    const query = queryOverride || input
    if (!query.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Use the /ask endpoint for general Q&A (production-ready)
      let response = await fetch('https://b3fw6ipszl.execute-api.us-east-1.amazonaws.com/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'demo_average',
          question: query
        }),
      })

      let aiResponse: string

      if (!response.ok) {
        // If /ask fails, try /ai-help as fallback
        response = await fetch('https://b3fw6ipszl.execute-api.us-east-1.amazonaws.com/ai-help', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: 'demo_average',
            concept_id: query
          }),
        })

        if (!response.ok) {
          throw new Error('Both API endpoints failed')
        }

        const data = await response.json()
        aiResponse = data.ai_response || data.ai_explanation || 'Unable to generate response. Please try again.'
      } else {
        const data = await response.json()
        aiResponse = data.answer || data.ai_response || 'Unable to generate response. Please try again.'
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      // Show error message instead of fallback
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. This may be due to:\n\n1. AWS Bedrock model access needs to be enabled\n2. Network connectivity issues\n3. API rate limits\n\nPlease try again in a moment, or contact support if the issue persists.\n\n**To enable full AI capabilities:**\nVisit AWS Console → Bedrock → Model Access and enable Claude 3 Haiku.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setLoading(false)
    }
  }

  const exampleQuestions = [
    'Explain closures in JavaScript',
    'How does DNS work?',
    'What is a B-tree?',
    'Explain the CAP theorem'
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-xl">🎓</span>
          </div>
          <h1 className="text-xl font-semibold">AI Learning Assistant</h1>
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="text-6xl text-yellow-500 font-mono mb-8">
                {'{ ? }'}
              </div>
              <h2 className="text-3xl font-semibold mb-4 text-center">
                What do you want to learn?
              </h2>
              <p className="text-gray-400 text-center mb-8 max-w-2xl">
                Ask about programming, algorithms, cloud architecture, system design, 
                or any technical concept. Get clear, concise explanations with examples.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {exampleQuestions.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(example)
                      handleSubmit(null, example)
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors border border-gray-700"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl px-6 py-4 ${
                      message.role === 'user'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-900 text-white border border-gray-800'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-3 text-yellow-500">
                        <span className="text-lg">🤖</span>
                        <span className="text-sm font-semibold">AI Tutor</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-black/60' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-3xl rounded-2xl px-6 py-4 bg-gray-900 border border-gray-800">
                    <div className="flex items-center gap-2 mb-3 text-yellow-500">
                      <span className="text-lg">🤖</span>
                      <span className="text-sm font-semibold">AI Tutor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Bottom Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-gray-800 px-6 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={loading}
              className="w-full bg-gray-900 text-white px-6 py-4 rounded-xl border border-gray-700 focus:border-yellow-500 focus:outline-none pr-14 placeholder-gray-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
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
            {loading ? 'AI is thinking...' : 'Enter to send'}
          </p>
        </form>
      </div>
    </div>
  )
}

export default function TutorPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      }>
        <TutorContent />
      </Suspense>
    </ProtectedRoute>
  )
}
