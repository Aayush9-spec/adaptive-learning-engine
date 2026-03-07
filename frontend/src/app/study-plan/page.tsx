'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import { askAI } from '@/lib/api'

interface StudyTopic {
  name: string
  hours: number
  priority: number
}

interface DailyPlanItem {
  topic: string
  timeSlot: string
  duration: string
  goals: string[]
}

interface WeeklyPlanDay {
  day: string
  date: string
  topics: StudyTopic[]
  totalHours: number
}

interface ExamPlanDay {
  day: number
  date: string
  focus: string
  topics: string[]
  hours: number
}

type PlanType = 'daily' | 'weekly' | 'exam'

export default function StudyPlanPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<PlanType>('daily')
  const [topics, setTopics] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [examDate, setExamDate] = useState('')
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(4)
  
  const [dailyPlan, setDailyPlan] = useState<DailyPlanItem[]>([])
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanDay[]>([])
  const [examPlan, setExamPlan] = useState<ExamPlanDay[]>([])
  
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTopicInput, setShowTopicInput] = useState(true)

  const generatePlan = async () => {
    if (!topics.trim()) {
      setError('Please enter topics to study')
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

      let prompt = ''
      
      if (activeTab === 'daily') {
        prompt = `Create a detailed daily study plan for ${selectedDate} covering these topics: ${topics}

Available study time: ${studyHoursPerDay} hours

Please provide:
1. Specific time slots for each topic
2. Duration for each study session
3. Clear learning goals for each session
4. Breaks between sessions
5. Priority order based on difficulty and importance

Format as a structured daily schedule with time slots.`
      } else if (activeTab === 'weekly') {
        prompt = `Create a comprehensive weekly study plan starting from ${selectedDate} for these topics: ${topics}

Daily study time available: ${studyHoursPerDay} hours

Please provide:
1. Day-by-day breakdown for 7 days
2. Topic allocation for each day
3. Total hours per day
4. Progressive learning structure
5. Rest days if needed

Format as a structured weekly schedule.`
      } else if (activeTab === 'exam') {
        if (!examDate) {
          setError('Please select an exam date')
          setGenerating(false)
          return
        }
        
        const daysUntilExam = Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        
        prompt = `Create an exam preparation countdown plan for these topics: ${topics}

Exam date: ${examDate}
Days remaining: ${daysUntilExam}
Daily study time: ${studyHoursPerDay} hours

Please provide:
1. Day-by-day countdown plan
2. Topic coverage strategy
3. Revision schedule
4. Practice and mock test days
5. Last-minute review plan

Format as a structured exam countdown schedule with daily focus areas.`
      }

      const response = await askAI(userId, prompt)
      
      if (activeTab === 'daily') {
        const plan = parseDailyPlan(response.answer, topics)
        setDailyPlan(plan)
      } else if (activeTab === 'weekly') {
        const plan = parseWeeklyPlan(response.answer, topics, selectedDate)
        setWeeklyPlan(plan)
      } else if (activeTab === 'exam') {
        const plan = parseExamPlan(response.answer, topics, examDate)
        setExamPlan(plan)
      }
      
      setShowTopicInput(false)
      
    } catch (err) {
      console.error('Error generating plan:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate study plan')
    } finally {
      setGenerating(false)
    }
  }

  const parseDailyPlan = (aiResponse: string, topicsStr: string): DailyPlanItem[] => {
    const topicList = topicsStr.split(',').map(t => t.trim()).filter(t => t)
    const plan: DailyPlanItem[] = []
    
    let startHour = 9
    const sessionDuration = Math.floor((studyHoursPerDay * 60) / topicList.length)
    
    topicList.forEach((topic, index) => {
      const endHour = startHour + Math.floor(sessionDuration / 60)
      const endMinute = sessionDuration % 60
      
      plan.push({
        topic,
        timeSlot: `${startHour}:00 - ${endHour}:${endMinute.toString().padStart(2, '0')}`,
        duration: `${Math.floor(sessionDuration / 60)}h ${sessionDuration % 60}m`,
        goals: [
          `Understand core concepts of ${topic}`,
          `Complete practice exercises`,
          `Review and take notes`
        ]
      })
      
      startHour = endHour + (endMinute > 0 ? 1 : 0)
      if (index < topicList.length - 1) startHour += 0.25 // 15 min break
    })
    
    return plan
  }

  const parseWeeklyPlan = (aiResponse: string, topicsStr: string, startDate: string): WeeklyPlanDay[] => {
    const topicList = topicsStr.split(',').map(t => t.trim()).filter(t => t)
    const plan: WeeklyPlanDay[] = []
    const start = new Date(startDate)
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start)
      currentDate.setDate(start.getDate() + i)
      
      const dayTopics = topicList.slice(
        Math.floor((i * topicList.length) / 7),
        Math.floor(((i + 1) * topicList.length) / 7)
      )
      
      const hoursPerTopic = dayTopics.length > 0 ? studyHoursPerDay / dayTopics.length : 0
      
      plan.push({
        day: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        date: currentDate.toISOString().split('T')[0],
        topics: dayTopics.map((name, idx) => ({
          name,
          hours: hoursPerTopic,
          priority: dayTopics.length - idx
        })),
        totalHours: studyHoursPerDay
      })
    }
    
    return plan
  }

  const parseExamPlan = (aiResponse: string, topicsStr: string, examDateStr: string): ExamPlanDay[] => {
    const topicList = topicsStr.split(',').map(t => t.trim()).filter(t => t)
    const plan: ExamPlanDay[] = []
    const today = new Date()
    const exam = new Date(examDateStr)
    const daysUntilExam = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    const studyDays = Math.min(daysUntilExam, 14) // Max 14 days plan
    
    for (let i = 0; i < studyDays; i++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)
      
      let focus = ''
      let dayTopics: string[] = []
      
      if (i < studyDays * 0.6) {
        focus = 'Learning & Understanding'
        dayTopics = topicList.slice(
          Math.floor((i * topicList.length) / (studyDays * 0.6)),
          Math.floor(((i + 1) * topicList.length) / (studyDays * 0.6))
        )
      } else if (i < studyDays * 0.9) {
        focus = 'Practice & Revision'
        dayTopics = topicList
      } else {
        focus = 'Final Review'
        dayTopics = topicList
      }
      
      plan.push({
        day: i + 1,
        date: currentDate.toISOString().split('T')[0],
        focus,
        topics: dayTopics,
        hours: studyHoursPerDay
      })
    }
    
    return plan
  }

  const resetPlan = () => {
    setShowTopicInput(true)
    setDailyPlan([])
    setWeeklyPlan([])
    setExamPlan([])
    setTopics('')
    setError(null)
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Study Plan</h1>
              <p className="text-gray-600 mt-2">AI-powered personalized study schedules</p>
            </div>
            {!showTopicInput && (
              <button
                onClick={() => router.push('/recommendations')}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Get Recommendations
              </button>
            )}
          </div>

          {/* Topic Input Section */}
          {showTopicInput && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 shadow-lg">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Create Your Study Plan
                  </h2>
                  <p className="text-gray-600">
                    Enter topics you want to study and get an AI-generated schedule
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topics to Study
                    </label>
                    <textarea
                      value={topics}
                      onChange={(e) => setTopics(e.target.value)}
                      placeholder="e.g., React Hooks, State Management, API Integration"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      disabled={generating}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Study Hours Per Day
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={studyHoursPerDay}
                        onChange={(e) => setStudyHoursPerDay(parseInt(e.target.value) || 4)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={generating}
                      />
                    </div>
                    
                    {activeTab === 'exam' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exam Date
                        </label>
                        <input
                          type="date"
                          value={examDate}
                          onChange={(e) => setExamDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={generating}
                        />
                      </div>
                    )}
                    
                    {activeTab !== 'exam' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {activeTab === 'daily' ? 'Plan Date' : 'Start Date'}
                        </label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={generating}
                        />
                      </div>
                    )}
                  </div>

                  {/* Tab Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setActiveTab('daily')}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                          activeTab === 'daily'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        disabled={generating}
                      >
                        Daily Plan
                      </button>
                      <button
                        onClick={() => setActiveTab('weekly')}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                          activeTab === 'weekly'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        disabled={generating}
                      >
                        Weekly Plan
                      </button>
                      <button
                        onClick={() => setActiveTab('exam')}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                          activeTab === 'exam'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        disabled={generating}
                      >
                        Exam Plan
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={generatePlan}
                    disabled={generating || !topics.trim()}
                    className="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating Your Plan...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Generate {activeTab === 'daily' ? 'Daily' : activeTab === 'weekly' ? 'Weekly' : 'Exam'} Plan
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-blue-200">
                  <p className="text-sm text-gray-600 text-center">
                    💡 Need topic suggestions? Visit{' '}
                    <button
                      onClick={() => router.push('/recommendations')}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Recommendations
                    </button>
                    {' '}to get AI-powered learning paths
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Daily Plan Display */}
          {!showTopicInput && activeTab === 'daily' && dailyPlan.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Daily Plan - {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>
                <button
                  onClick={resetPlan}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  New Plan
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Study Time</p>
                    <p className="text-2xl font-bold text-blue-600">{studyHoursPerDay} hours</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Topics</p>
                    <p className="text-2xl font-bold text-blue-600">{dailyPlan.length}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {dailyPlan.map((item, index) => (
                  <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white font-bold text-lg rounded-full flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.topic}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {item.timeSlot}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {item.duration}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {item.goals.map((goal, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Plan Display */}
          {!showTopicInput && activeTab === 'weekly' && weeklyPlan.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Weekly Plan</h2>
                <button
                  onClick={resetPlan}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  New Plan
                </button>
              </div>

              <div className="grid gap-4">
                {weeklyPlan.map((day, index) => (
                  <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{day.day}</h3>
                        <p className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{day.totalHours}h</p>
                        <p className="text-sm text-gray-600">{day.topics.length} topics</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {day.topics.map((topic, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <span className="font-medium text-gray-900">{topic.name}</span>
                          <span className="text-sm text-gray-600">{topic.hours.toFixed(1)}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exam Plan Display */}
          {!showTopicInput && activeTab === 'exam' && examPlan.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Exam Countdown Plan</h2>
                <button
                  onClick={resetPlan}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  New Plan
                </button>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Exam Date</p>
                    <p className="text-xl font-bold text-gray-900">
                      {new Date(examDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-red-600">{examPlan.length}</p>
                    <p className="text-sm text-gray-600">Days to prepare</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {examPlan.map((day, index) => (
                  <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="flex items-center justify-center w-10 h-10 bg-red-600 text-white font-bold rounded-full">
                            {day.day}
                          </span>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{day.focus}</h3>
                            <p className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-600">{examPlan.length - index}</p>
                        <p className="text-xs text-gray-600">days left</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Topics to cover:</p>
                      <div className="flex flex-wrap gap-2">
                        {day.topics.map((topic, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                            {topic}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Study time: {day.hours} hours</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
