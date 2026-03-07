'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import { 
  generateDailyPlan, 
  generateWeeklyPlan, 
  generateExamPlan,
  getStudentPlans,
  DailyPlan,
  WeeklyPlan,
  ExamPlan,
  TopicAllocation
} from '@/lib/api'

type PlanType = 'daily' | 'weekly' | 'exam'

export default function StudyPlanPage() {
  const [activeTab, setActiveTab] = useState<PlanType>('daily')
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null)
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null)
  const [examPlan, setExamPlan] = useState<ExamPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadExistingPlans()
  }, [])

  const loadExistingPlans = async () => {
    try {
      const studentId = 'demo_average'
      const plans = await getStudentPlans(studentId)
      
      if (plans.daily) setDailyPlan(plans.daily)
      if (plans.weekly) setWeeklyPlan(plans.weekly)
      if (plans.exam) setExamPlan(plans.exam)
    } catch (err) {
      // Plans might not exist yet, that's okay
      console.log('No existing plans found')
    }
  }

  const handleGeneratePlan = async () => {
    try {
      setLoading(true)
      setError(null)
      const studentId = 'demo_average'

      if (activeTab === 'daily') {
        const plan = await generateDailyPlan(studentId, selectedDate)
        setDailyPlan(plan)
      } else if (activeTab === 'weekly') {
        const plan = await generateWeeklyPlan(studentId, selectedDate)
        setWeeklyPlan(plan)
      } else if (activeTab === 'exam') {
        const plan = await generateExamPlan(studentId)
        setExamPlan(plan)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan')
    } finally {
      setLoading(false)
    }
  }

  const renderDailyPlan = (plan: DailyPlan) => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Plan for {new Date(plan.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Total study time: {plan.total_hours.toFixed(1)} hours
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{plan.topics.length}</div>
            <div className="text-sm text-gray-600">Topics</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {plan.topics.map((topic, index) => (
          <TopicCard key={topic.topic_id} topic={topic} index={index} />
        ))}
      </div>

      {plan.revision_topics && plan.revision_topics.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Revision Schedule
          </h4>
          <p className="text-sm text-gray-600">
            {plan.revision_topics.length} topic{plan.revision_topics.length !== 1 ? 's' : ''} scheduled for revision
          </p>
        </div>
      )}
    </div>
  )

  const renderWeeklyPlan = (plan: WeeklyPlan) => (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900">
          Weekly Plan: {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {plan.daily_plans.length} days planned
        </p>
      </div>

      <div className="space-y-6">
        {plan.daily_plans.map((dailyPlan, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Day {index + 1}: {new Date(dailyPlan.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h4>
            <div className="space-y-2">
              {dailyPlan.topics.map((topic, topicIndex) => (
                <TopicCard key={topic.topic_id} topic={topic} index={topicIndex} compact />
              ))}
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Total: {dailyPlan.total_hours.toFixed(1)} hours
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderExamPlan = (plan: ExamPlan) => (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Exam Countdown Plan
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Exam Date: {new Date(plan.exam_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-red-600">{plan.days_remaining}</div>
            <div className="text-sm text-gray-600">Days Left</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {plan.daily_plans.map((dailyPlan, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">
                Day {index + 1}: {new Date(dailyPlan.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h4>
              <span className="text-sm text-gray-600">
                {plan.days_remaining - index} days until exam
              </span>
            </div>
            <div className="space-y-2">
              {dailyPlan.topics.map((topic, topicIndex) => (
                <TopicCard key={topic.topic_id} topic={topic} index={topicIndex} compact />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Study Plan</h1>
            <p className="text-gray-600 mt-2">Your personalized daily and weekly study schedule</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('daily')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'daily'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Daily Plan
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'weekly'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Weekly Plan
              </button>
              <button
                onClick={() => setActiveTab('exam')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'exam'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Exam Countdown
              </button>
            </nav>
          </div>

          {/* Plan Generation Controls */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              {activeTab !== 'exam' && (
                <div className="flex-1">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    {activeTab === 'daily' ? 'Select Date' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              <button
                onClick={handleGeneratePlan}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Generating...' : `Generate ${activeTab === 'daily' ? 'Daily' : activeTab === 'weekly' ? 'Weekly' : 'Exam'} Plan`}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Plan Display */}
          {activeTab === 'daily' && dailyPlan && renderDailyPlan(dailyPlan)}
          {activeTab === 'weekly' && weeklyPlan && renderWeeklyPlan(weeklyPlan)}
          {activeTab === 'exam' && examPlan && renderExamPlan(examPlan)}

          {/* Empty State */}
          {!loading && (
            <>
              {activeTab === 'daily' && !dailyPlan && (
                <EmptyState message="No daily plan generated yet. Click 'Generate Daily Plan' to create one." />
              )}
              {activeTab === 'weekly' && !weeklyPlan && (
                <EmptyState message="No weekly plan generated yet. Click 'Generate Weekly Plan' to create one." />
              )}
              {activeTab === 'exam' && !examPlan && (
                <EmptyState message="No exam countdown plan generated yet. Click 'Generate Exam Plan' to create one." />
              )}
            </>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}

function TopicCard({ topic, index, compact = false }: { topic: TopicAllocation; index: number; compact?: boolean }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${compact ? 'p-3' : 'p-4'} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`flex items-center justify-center ${compact ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'} bg-blue-100 text-blue-700 font-semibold rounded-full`}>
              {index + 1}
            </span>
            <h4 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
              {topic.topic_name}
            </h4>
          </div>
          
          {!compact && topic.goals && topic.goals.length > 0 && (
            <ul className="ml-8 space-y-1 mb-3">
              {topic.goals.map((goal, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start">
                  <svg className="w-4 h-4 mr-2 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {goal}
                </li>
              ))}
            </ul>
          )}
          
          <div className={`${compact ? 'ml-8' : 'ml-8'} flex flex-wrap gap-3 ${compact ? 'text-xs' : 'text-sm'} text-gray-600`}>
            <span className="flex items-center">
              <svg className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} mr-1 text-purple-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {topic.allocated_hours.toFixed(1)} hours
            </span>
            <span className="flex items-center">
              <svg className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} mr-1 text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Priority: {topic.priority_score.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-gray-600">{message}</p>
    </div>
  )
}
