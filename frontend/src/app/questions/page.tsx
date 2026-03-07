'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/contexts/AuthContext'
import { getQuestionsByConcept, submitAnswer, Question, AnswerSubmission } from '@/lib/api'

export default function QuestionsPage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [confidence, setConfidence] = useState(3)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [feedback, setFeedback] = useState<AnswerSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [conceptId, setConceptId] = useState<number>(1) // Default concept

  useEffect(() => {
    loadQuestions()
  }, [conceptId])

  useEffect(() => {
    // Reset timer when question changes
    setStartTime(Date.now())
    setAnswer('')
    setConfidence(3)
    setFeedback(null)
  }, [currentQuestionIndex])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const qs = await getQuestionsByConcept(conceptId)
      setQuestions(qs)
      setCurrentQuestionIndex(0)
    } catch (err) {
      console.error('Failed to load questions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!answer.trim() || !user?.id) return
    
    setSubmitting(true)
    const timeTaken = (Date.now() - startTime) / 1000 // Convert to seconds
    
    try {
      const result = await submitAnswer(
        user.id.toString(),
        currentQuestion.id,
        answer,
        timeTaken,
        confidence
      )
      
      setFeedback(result)
    } catch (err) {
      console.error('Failed to submit answer:', err)
      alert('Failed to submit answer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // All questions completed
      alert('You have completed all questions in this concept!')
    }
  }

  const handleRetry = () => {
    setAnswer('')
    setConfidence(3)
    setFeedback(null)
    setStartTime(Date.now())
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

  if (questions.length === 0) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <MainLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Available</h2>
            <p className="text-gray-600 mb-6">There are no questions for this concept yet.</p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <MainLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Practice Questions</h1>
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            {/* Question Info */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentQuestion.difficulty}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  Expected time: {Math.floor(currentQuestion.expected_time_seconds / 60)}:{(currentQuestion.expected_time_seconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-gray-500 capitalize">
                {currentQuestion.question_type.replace('_', ' ')}
              </span>
            </div>

            {/* Question Text */}
            <div className="prose max-w-none">
              <p className="text-lg text-gray-900">{currentQuestion.question_text}</p>
            </div>

            {/* Answer Form */}
            {!feedback && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* MCQ Options */}
                {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
                  <div className="space-y-2">
                    {Object.entries(currentQuestion.options).map(([key, value]) => (
                      <label 
                        key={key}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          answer === key ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={key}
                          checked={answer === key}
                          onChange={(e) => setAnswer(e.target.value)}
                          className="mr-3"
                        />
                        <span className="font-medium mr-2">{key}.</span>
                        <span>{value}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* True/False */}
                {currentQuestion.question_type === 'true_false' && (
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      answer === 'true' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="answer"
                        value="true"
                        checked={answer === 'true'}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="mr-2"
                      />
                      <span className="font-medium">True</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      answer === 'false' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="answer"
                        value="false"
                        checked={answer === 'false'}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="mr-2"
                      />
                      <span className="font-medium">False</span>
                    </label>
                  </div>
                )}

                {/* Numerical Input */}
                {currentQuestion.question_type === 'numerical' && (
                  <input
                    type="number"
                    step="any"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter your answer"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                )}

                {/* Confidence Selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    How confident are you? (1 = Not confident, 5 = Very confident)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setConfidence(level)}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                          confidence === level
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!answer.trim() || submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              </form>
            )}

            {/* Feedback */}
            {feedback && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  feedback.is_correct ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{feedback.is_correct ? '✓' : '✗'}</span>
                    <span className={`text-lg font-bold ${
                      feedback.is_correct ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {feedback.is_correct ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                  
                  {!feedback.is_correct && feedback.correct_answer && (
                    <p className="text-sm text-gray-700">
                      The correct answer is: <span className="font-semibold">{feedback.correct_answer}</span>
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-600 mt-2">
                    Time taken: {feedback.time_taken_seconds.toFixed(1)}s | Confidence: {feedback.confidence}/5
                  </p>
                </div>

                <div className="flex gap-3">
                  {feedback.can_retry && (
                    <button
                      onClick={handleRetry}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Dashboard
            </button>
            {currentQuestionIndex > 0 && !feedback && (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Previous Question
              </button>
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
