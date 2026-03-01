import React, { useState } from 'react';
import {
  AlertTriangle,
  Brain,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  TrendingUp,
  Clock,
  MessageSquare,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface SummaryCard {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: number;
  status?: 'positive' | 'neutral' | 'negative';
}

interface MasteryItem {
  concept: string;
  score: number;
  trend?: number;
}

interface RecommendedTopic {
  id: number;
  name: string;
  priority: number;
  reason: string;
  estimatedTime: number;
}

interface AIStrategy {
  title: string;
  description: string;
  steps: string[];
}

// Mock Data
const mockData = {
  summary: [
    {
      label: 'Average Mastery',
      value: 72,
      unit: '%',
      icon: <Brain className="w-6 h-6 text-blue-400" />,
      trend: 5,
      status: 'positive',
    },
    {
      label: 'Exam Readiness',
      value: 68,
      unit: '%',
      icon: <Target className="w-6 h-6 text-purple-400" />,
      trend: 8,
      status: 'positive',
    },
    {
      label: 'Weakness Risk',
      value: 'Low',
      icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
      status: 'neutral',
    },
    {
      label: 'AI Calls Remaining',
      value: 12,
      unit: '/day',
      icon: <Zap className="w-6 h-6 text-green-400" />,
      status: 'positive',
    },
  ],
  masteryHeatmap: [
    { concept: 'Limits & Continuity', score: 85, trend: 3 },
    { concept: 'Derivatives', score: 92, trend: 2 },
    { concept: 'Applications', score: 48, trend: -2 },
    { concept: 'Integration', score: 72, trend: 5 },
    { concept: 'Series & Sequences', score: 65, trend: -1 },
    { concept: 'Vector Calculus', score: 55, trend: 0 },
    { concept: 'Differential Equations', score: 38, trend: -3 },
    { concept: 'Multivariable Calculus', score: 62, trend: 4 },
    { concept: 'Laplace Transform', score: 45, trend: 2 },
    { concept: 'Fourier Series', score: 51, trend: 1 },
    { concept: 'Complex Analysis', score: 70, trend: 3 },
    { concept: 'Probability & Statistics', score: 78, trend: 2 },
  ],
  recommendedTopics: [
    {
      id: 1,
      name: 'Applications of Calculus',
      priority: 95,
      reason: 'You have 48% mastery. Stagnation risk detected.',
      estimatedTime: 45,
    },
    {
      id: 2,
      name: 'Differential Equations',
      priority: 87,
      reason: 'Your weakest concept. Focus needed.',
      estimatedTime: 60,
    },
    {
      id: 3,
      name: 'Vector Calculus Optimization',
      priority: 72,
      reason: 'Skills decay detected. Quick revision recommended.',
      estimatedTime: 30,
    },
  ],
  examReadiness: {
    subject: 'JEE Calculus',
    percentage: 68,
    status: 'On Track',
  },
  weaknessAlert: {
    isActive: true,
    concept: 'Differential Equations',
    riskLevel: 'High',
    recommendation: 'Your current score is 38%. AI suggests 15 focused questions on fundamental concepts before attempting advanced problems.',
  },
  aiStrategy: {
    title: 'Your Personalized Learning Strategy',
    description: 'Based on your learning patterns and exam timeline.',
    steps: [
      'Master Applications of Calculus through decision-based questions (Target: 75%)',
      'Strengthen Differential Equations with 2 hours of focused practice',
      'Optimize Vector Calculus with visualization-based learning',
      'Take a full mock exam to assess overall readiness',
    ],
  },
};

// Color utility for mastery scores
const getMasteryColor = (score: number) => {
  if (score >= 70) return 'from-green-600 to-emerald-600';
  if (score >= 40) return 'from-yellow-600 to-amber-600';
  return 'from-red-600 to-rose-600';
};

const getMasteryBgColor = (score: number) => {
  if (score >= 70) return 'bg-green-500/10 border-green-500/30';
  if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/30';
  return 'bg-red-500/10 border-red-500/30';
};

const getTrendColor = (trend?: number) => {
  if (!trend) return 'text-gray-400';
  if (trend > 0) return 'text-green-400';
  if (trend < 0) return 'text-red-400';
  return 'text-gray-400';
};

// Summary Card Component
const SummaryCard: React.FC<{ card: SummaryCard }> = ({ card }) => (
  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-6 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-400">{card.label}</span>
        {card.icon}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">
          {card.value}
        </span>
        {card.unit && <span className="text-sm text-gray-400">{card.unit}</span>}
      </div>

      {card.trend !== undefined && (
        <div className={`flex items-center gap-1 mt-3 ${getTrendColor(card.trend)}`}>
          {card.trend > 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : card.trend < 0 ? (
            <TrendingUp className="w-4 h-4 rotate-180" />
          ) : null}
          <span className="text-xs font-medium">
            {card.trend > 0 ? '+' : ''}{card.trend}% this week
          </span>
        </div>
      )}
    </div>
  </div>
);

// Mastery Heatmap Component
const MasteryHeatmap: React.FC<{ items: MasteryItem[] }> = ({ items }) => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
    <h2 className="text-2xl font-bold mb-2 text-white flex items-center gap-3">
      <BookOpen className="w-6 h-6 text-blue-400" />
      Concept Mastery Heatmap
    </h2>
    <p className="text-sm text-gray-400 mb-6">Track your mastery across all key concepts</p>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`relative group rounded-xl border p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg ${getMasteryBgColor(item.score)}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative z-10">
            <p className="text-xs font-semibold text-gray-300 mb-3 line-clamp-2">
              {item.concept}
            </p>

            <div className="w-full bg-slate-700/50 rounded-full h-2 mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${getMasteryColor(item.score)}`}
                style={{ width: `${item.score}%` }}
              />
            </div>

            <div className="flex items-baseline justify-between">
              <span className="font-bold text-white">{item.score}%</span>
              {item.trend !== undefined && (
                <span className={`text-xs font-medium ${getTrendColor(item.trend)}`}>
                  {item.trend > 0 ? '+' : ''}{item.trend}%
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Recommended Topics Component
const RecommendedTopics: React.FC<{ topics: RecommendedTopic[] }> = ({ topics }) => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
    <h2 className="text-2xl font-bold mb-2 text-white flex items-center gap-3">
      <Zap className="w-6 h-6 text-cyan-400" />
      AI Recommended Topics
    </h2>
    <p className="text-sm text-gray-400 mb-6">Personalized learning path based on your performance</p>

    <div className="space-y-4">
      {topics.map((topic) => (
        <div
          key={topic.id}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-cyan-500/20 p-6 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/5 to-blue-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">{topic.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{topic.reason}</p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 ml-4 flex-shrink-0">
                <span className="text-sm font-bold text-cyan-300">{topic.priority}</span>
                <span className="text-xs text-cyan-300">Priority</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                ~{topic.estimatedTime} mins
              </div>

              <button className="group/btn px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm transition-all duration-300 flex items-center gap-2">
                Practice Now
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Exam Readiness Gauge Component
const ExamReadinessGauge: React.FC<{ data: typeof mockData.examReadiness }> = ({ data }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (data.percentage / 100) * circumference;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
      <h2 className="text-2xl font-bold mb-2 text-white flex items-center gap-3">
        <Target className="w-6 h-6 text-purple-400" />
        Exam Readiness
      </h2>
      <p className="text-sm text-gray-400 mb-8">Your preparation progress</p>

      <div className="flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#334155"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-white">{data.percentage}%</div>
            <div className="text-sm text-gray-400 text-center">Ready for {data.subject}</div>
          </div>
        </div>

        <div className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Overall Progress</span>
            <span className="text-sm font-semibold text-green-400">{data.status}</span>
          </div>

          <div className="pt-4 border-t border-blue-500/20">
            <p className="text-center text-sm text-gray-300 leading-relaxed">
              You're {data.percentage}% ready for <span className="font-semibold text-cyan-300">{data.subject}</span>. Keep practicing to reach 80%+ readiness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Weakness Alert Component
const WeaknessAlert: React.FC<{ data: typeof mockData.weaknessAlert }> = ({ data }) => {
  if (!data.isActive) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-red-900/20 via-slate-900/40 to-slate-900/40 border border-red-500/30 p-6 backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 pt-1">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-red-300">Stagnation Risk Detected</h3>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 border border-red-500/30 text-red-300">
              {data.riskLevel}
            </span>
          </div>

          <p className="text-sm text-gray-300 mb-3">
            <span className="font-semibold text-white">{data.concept}</span> is your weakest concept.
          </p>

          <p className="text-sm text-gray-400 mb-4">{data.recommendation}</p>

          <button className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-colors duration-300">
            Start Focused Practice
          </button>
        </div>
      </div>
    </div>
  );
};

// AI Strategy Panel Component
const AIStrategyPanel: React.FC<{ data: typeof mockData.aiStrategy }> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left group"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-6 h-6 text-indigo-400" />
            {data.title}
          </h2>
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-gray-400 transition-transform duration-300" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-400 transition-transform duration-300 group-hover:text-gray-300" />
          )}
        </div>
        <p className="text-sm text-gray-400">{data.description}</p>
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-4 border-t border-blue-500/20 pt-6">
          {data.steps.map((step, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600">
                <span className="text-sm font-bold text-white">{idx + 1}</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-gray-300">{step}</p>
              </div>
            </div>
          ))}

          <div className="mt-6 pt-6 border-t border-blue-500/20">
            <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold transition-all duration-300">
              Follow This Strategy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Quick Actions Component
const QuickActions: React.FC = () => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
    <h2 className="text-2xl font-bold mb-6 text-white">Quick Actions</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        {
          icon: <Zap className="w-5 h-5" />,
          title: 'Generate Questions',
          description: 'AI-powered practice questions',
          color: 'from-yellow-600 to-orange-600',
        },
        {
          icon: <MessageSquare className="w-5 h-5" />,
          title: 'Ask AI Tutor',
          description: 'Get instant explanations',
          color: 'from-cyan-600 to-blue-600',
        },
        {
          icon: <CheckCircle2 className="w-5 h-5" />,
          title: 'Learning Memory',
          description: 'Review your progress',
          color: 'from-green-600 to-emerald-600',
        },
      ].map((action, idx) => (
        <button
          key={idx}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-blue-500/20 p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 text-left"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 transition-opacity duration-300 group-hover:opacity-20`} />

          <div className="relative z-10">
            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${action.color} text-white mb-3 transition-transform duration-300 group-hover:scale-110`}>
              {action.icon}
            </div>

            <h3 className="font-bold text-white mb-1">{action.title}</h3>
            <p className="text-xs text-gray-400">{action.description}</p>

            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-400 transition-all duration-300 group-hover:gap-3">
              <span>Start</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

// Main Dashboard Component
export const StudentDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-5" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-blue-500/20 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, Student!</h1>
                <p className="text-gray-400">Your personalized learning dashboard</p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Last session</p>
                  <p className="text-lg font-semibold">15 min ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {mockData.summary.map((card, idx) => (
              <SummaryCard key={idx} card={card} />
            ))}
          </div>

          {/* Main grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left column - Heatmap and Alert */}
            <div className="lg:col-span-2 space-y-8">
              <MasteryHeatmap items={mockData.masteryHeatmap} />
              <RecommendedTopics topics={mockData.recommendedTopics} />
              <WeaknessAlert data={mockData.weaknessAlert} />
            </div>

            {/* Right column - Gauge and Info */}
            <div className="space-y-8">
              <ExamReadinessGauge data={mockData.examReadiness} />
            </div>
          </div>

          {/* AI Strategy and Quick Actions */}
          <div className="space-y-8 mb-8">
            <AIStrategyPanel data={mockData.aiStrategy} />
            <QuickActions />
          </div>

          {/* Footer info */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-900/20 via-slate-900/40 to-slate-900/40 border border-blue-500/20 p-6 text-center">
            <p className="text-sm text-gray-400">
              Your AI tutor is analyzing your learning patterns. Check back tomorrow for new insights and recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
