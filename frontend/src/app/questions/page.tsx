'use client'

import { useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import { askAI } from '@/lib/api'

interface Question {
  id: number
  question: string
  type: 'mcq' | 'true_false' | 'short_answer'
  options?: string[]
  correctAnswer: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export default function QuestionsPage() {
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [numQuestions, setNumQuestions] = useState(5)
  const [questionType, setQuestionType] = useState<'mixed' | 'mcq' | 'true_false' | 'short_answer'>('mixed')
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())
  
  const [generating, setGenerating] = useState(false)
  const [showTopicInput, setShowTopicInput] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const generateQuestions = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    try {
      setGenerating(true)
      setError(null)
      
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

      const typeInstruction = questionType === 'mixed' 
        ? 'Mix of multiple choice, true/false, and short answer questions'
        : questionType === 'mcq'
        ? 'Multiple choice questions with 4 options each'
        : questionType === 'true_false'
        ? 'True or False questions'
        : 'Short answer questions'

      const prompt = `Generate ${numQuestions} practice questions about: ${topic}

Difficulty level: ${difficulty}
Question type: ${typeInstruction}

For each question, provide:
1. The question text
2. Question type (mcq, true_false, or short_answer)
3. For MCQ: 4 options labeled A, B, C, D
4. The correct answer
5. A brief explanation of why the answer is correct

Format each question clearly with numbers (1, 2, 3, etc.) and make sure the questions test understanding, not just memorization.`

      const response = await askAI(userId, prompt)
      const parsedQuestions = parseAIQuestions(response.answer, numQuestions)
      
      if (parsedQuestions.length === 0) {
        setError('Failed to generate questions. Please try again.')
        return
      }
      
      setQuestions(parsedQuestions)
      setShowTopicInput(false)
      setCurrentQuestionIndex(0)
      setScore(0)
      setAnsweredQuestions(new Set())
      
    } catch (err) {
      console.error('Error generating questions:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate questions')
    } finally {
      setGenerating(false)
    }
  }

  const parseAIQuestions = (aiResponse: string, count: number): Question[] => {
    const questions: Question[] = []
    const lines = aiResponse.split('\n').filter(line => line.trim())
    
    // Simple parsing - create questions based on the response
    for (let i = 0; i < count; i++) {
      const questionNum = i + 1
      
      // Find question text (look for numbered patterns)
      const questionPattern = new RegExp(`${questionNum}[.:\\)]\\s*(.+?)(?=\\n|$)`, 'i')
      const questionMatch = aiResponse.match(questionPattern)
      
      if (questionMatch) {
        const questionText = questionMatch[1].trim()
        
        // Determine question type
        let type: 'mcq' | 'true_false' | 'short_answer' = 'short_answer'
        let options: string[] | undefined
        let correctAnswer = 'Answer not found'
        
        // Check if it's MCQ (has A, B, C, D options)
        const optionPattern = /[A-D][.:\\)]\s*(.+?)(?=\n[A-D][.:\\)]|\n\n|$)/gi
        const optionMatches = [...aiResponse.matchAll(optionPattern)]
        
        if (optionMatches.length >= 4) {
          type = 'mcq'
          options = optionMatches.slice(0, 4).map(m => m[1].trim())
          
          // Find correct answer
          const answerPattern = /(?:correct answer|answer)[:\s]+([A-D])/i
          const answerMatch = aiResponse.match(answerPattern)
          if (answerMatch) {
            correctAnswer = answerMatch[1].toUpperCase()
          }
        } else if (questionText.toLowerCase().includes('true or false') || 
                   questionText.toLowerCase().includes('t/f')) {
          type = 'true_false'
          const tfPattern = /(?:correct answer|answer)[:\s]+(true|false)/i
          const tfMatch = aiResponse.match(tfPattern)
          if (tfMatch) {
            correctAnswer = tfMatch[1].toLowerCase()
          }
        }
        
        // Extract explanation
        const explanationPattern = /(?:explanation|because|reason)[:\s]+(.+?)(?=\n\n|\d+[.:\\)]|$)/is
        const explanationMatch = aiResponse.match(explanationPattern)
        const explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation provided'
        
        questions.push({
          id: i + 1,
          question: questionText,
          type,
          options,
          correctAnswer,
          explanation,
          difficulty
        })
      } else {
        // Fallback: create a generic question
        questions.push({
          id: i + 1,
          question: `Question ${i + 1} about ${topic}`,
          type: 'short_answer',
          correctAnswer: 'Sample answer',
          explanation: 'This is a practice question',
          difficulty
        })
      }
    }
    
    return questions.slice(0, count)
  }

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      setError('Please provide an answer')
      return
    }

    const currentQuestion = questions[currentQuestionIndex]
    const correct = checkAnswer(userAnswer, currentQuestion.correctAnswer, currentQuestion.type)
    
    setIsCorrect(correct)
    setShowFeedback(true)
    
    if (correct && !answeredQuestions.has(currentQuestionIndex)) {
      setScore(score + 1)
      setAnsweredQuestions(new Set([...answeredQuestions, currentQuestionIndex]))
    }
  }

  const checkAnswer = (userAns: string, correctAns: string, type: string): boolean => {
    const userClean = userAns.trim().toLowerCase()
    const correctClean = correctAns.trim().toLowerCase()
    
    if (type === 'mcq') {
      return userClean === correctClean || userClean === correctClean.charAt(0)
    } else if (type === 'true_false') {
      return userClean === correctClean || 
             (userClean === 't' && correctClean === 'true') ||
             (userClean === 'f' && correctClean === 'false')
    } else {
      // For short answer, check if key words match
      return userClean.includes(correctClean) || correctClean.includes(userClean)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setUserAnswer('')
      setShowFeedback(false)
      setError(null)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setUserAnswer('')
      setShowFeedback(false)
      setError(null)
    }
  }

  const resetQuiz = () => {
    setShowTopicInput(true)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setUserAnswer('')
    setShowFeedback(false)
    setScore(0)
    setAnsweredQuestions(new Set())
    setTopic('')
    setError(null)
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Practice Questions</h1>
            <p className="text-gray-600 mt-2">Test your knowledge with AI-generated questions</p>
          </div>

          {/* Topic Input Section */}
          {showTopicInput && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8 shadow-lg">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    What do you want to practice?
                  </h2>
                  <p className="text-gray-600">
                    Enter any topic and get personalized practice questions
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., JavaScript Arrays, Photosynthesis, World War II"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={generating}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={generating}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Questions
                      </label>
                      <select
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={generating}
                      >
                        <option value="3">3 Questions</option>
                        <option value="5">5 Questions</option>
                        <option value="10">10 Questions</option>
                        <option value="15">15 Questions</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type
                      </label>
                      <select
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value as any)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={generating}
                      >
                        <option value="mixed">Mixed</option>
                        <option value="mcq">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={generateQuestions}
                    disabled={generating || !topic.trim()}
                    className="w-full px-6 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Generate Practice Questions
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-purple-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Quick topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'JavaScript Basics',
                      'Python Functions',
                      'Algebra',
                      'Biology Cells',
                      'World History'
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => setTopic(example)}
                        className="px-3 py-1 bg-white border border-purple-300 text-purple-700 text-sm rounded-full hover:bg-purple-50 transition-colors"
                        disabled={generating}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Section */}
          {!showTopicInput && questions.length > 0 && (
            <div className="space-y-6">
              {/* Header with Score */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{topic}</h2>
                  <p className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">{score}/{questions.length}</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>

              {/* Question Card */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg">
                <div className="space-y-6">
                  {/* Question Header */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {currentQuestion.difficulty.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {currentQuestion.type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Question Text */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {currentQuestion.question}
                    </h3>
                  </div>

                  {/* Answer Input */}
                  {!showFeedback && (
                    <div className="space-y-4">
                      {/* MCQ Options */}
                      {currentQuestion.type === 'mcq' && currentQuestion.options && (
                        <div className="space-y-3">
                          {currentQuestion.options.map((option, index) => {
                            const letter = String.fromCharCode(65 + index) // A, B, C, D
                            return (
                              <label
                                key={index}
                                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  userAnswer === letter ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="answer"
                                  value={letter}
                                  checked={userAnswer === letter}
                                  onChange={(e) => setUserAnswer(e.target.value)}
                                  className="mt-1 mr-3"
                                />
                                <div>
                                  <span className="font-bold text-gray-700 mr-2">{letter}.</span>
                                  <span className="text-gray-900">{option}</span>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      )}

                      {/* True/False */}
                      {currentQuestion.type === 'true_false' && (
                        <div className="grid grid-cols-2 gap-4">
                          <label className={`flex items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all ${
                            userAnswer === 'true' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <input
                              type="radio"
                              name="answer"
                              value="true"
                              checked={userAnswer === 'true'}
                              onChange={(e) => setUserAnswer(e.target.value)}
                              className="mr-3"
                            />
                            <span className="text-lg font-bold">True</span>
                          </label>
                          <label className={`flex items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all ${
                            userAnswer === 'false' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <input
                              type="radio"
                              name="answer"
                              value="false"
                              checked={userAnswer === 'false'}
                              onChange={(e) => setUserAnswer(e.target.value)}
                              className="mr-3"
                            />
                            <span className="text-lg font-bold">False</span>
                          </label>
                        </div>
                      )}

                      {/* Short Answer */}
                      {currentQuestion.type === 'short_answer' && (
                        <textarea
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="Type your answer here..."
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none resize-none"
                        />
                      )}

                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!userAnswer.trim()}
                        className="w-full px-6 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Submit Answer
                      </button>
                    </div>
                  )}

                  {/* Feedback */}
                  {showFeedback && (
                    <div className="space-y-4">
                      <div className={`p-6 rounded-lg border-2 ${
                        isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">{isCorrect ? '✓' : '✗'}</span>
                          <span className={`text-xl font-bold ${
                            isCorrect ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {isCorrect ? 'Correct!' : 'Incorrect'}
                          </span>
                        </div>
                        
                        {!isCorrect && (
                          <p className="text-gray-700 mb-2">
                            <span className="font-semibold">Correct answer:</span> {currentQuestion.correctAnswer}
                          </p>
                        )}
                        
                        <p className="text-gray-700">
                          <span className="font-semibold">Explanation:</span> {currentQuestion.explanation}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        {currentQuestionIndex < questions.length - 1 ? (
                          <button
                            onClick={handleNextQuestion}
                            className="flex-1 px-6 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Next Question →
                          </button>
                        ) : (
                          <button
                            onClick={resetQuiz}
                            className="flex-1 px-6 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Finish Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  ← Previous
                </button>
                <button
                  onClick={resetQuiz}
                  className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  New Topic
                </button>
                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1 || !showFeedback}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
