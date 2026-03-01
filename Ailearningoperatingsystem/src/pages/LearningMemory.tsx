import React, { useState } from 'react';
import {
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Zap,
  BookOpen,
  Download,
  ChevronDown,
  ChevronUp,
  Target,
  Activity,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

interface MistakePattern {
  category: string;
  percentage: number;
  count: number;
  description: string;
}

interface ConceptStrength {
  name: string;
  mastery: number;
  status: 'strong' | 'developing' | 'weak';
  lastPracticed: string;
}

interface BehaviorMetric {
  label: string;
  value: string;
  description: string;
  trend: 'up' | 'down' | 'stable';
}

interface ActionSuggestion {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: string;
}

// Mock Data
const mockLearningMemory = {
  studentName: 'Alex',
  learningIntelligenceScore: 78,
  profileGeneratedDate: 'March 1, 2026',
  mistakePatterns: [
    {
      category: 'Conceptual Misunderstandings',
      percentage: 28,
      count: 42,
      description: 'Difficulty understanding abstract concepts and their applications',
    },
    {
      category: 'Calculation Slips',
      percentage: 22,
      count: 33,
      description: 'Arithmetic errors and algebraic simplification mistakes',
    },
    {
      category: 'Formula Recall Gaps',
      percentage: 20,
      count: 30,
      description: 'Forgetting or misapplying key formulas under pressure',
    },
    {
      category: 'Application Logic Errors',
      percentage: 18,
      count: 27,
      description: 'Struggle connecting concepts to real-world problem solving',
    },
    {
      category: 'Exam Trap Mistakes',
      percentage: 12,
      count: 18,
      description: 'Falling for intentional misleading options and problem setups',
    },
  ],
  conceptStrengths: [
    { name: 'Limits & Continuity', mastery: 92, status: 'strong', lastPracticed: '2 days ago' },
    { name: 'Derivatives Basics', mastery: 85, status: 'strong', lastPracticed: '3 days ago' },
    { name: 'Trigonometry', mastery: 78, status: 'developing', lastPracticed: '1 day ago' },
    { name: 'Integration', mastery: 72, status: 'developing', lastPracticed: 'Today' },
    { name: 'Series & Sequences', mastery: 65, status: 'developing', lastPracticed: '5 days ago' },
    { name: 'Differential Equations', mastery: 45, status: 'weak', lastPracticed: '1 week ago' },
    { name: 'Vector Calculus', mastery: 52, status: 'weak', lastPracticed: '4 days ago' },
    { name: 'Fourier Analysis', mastery: 38, status: 'weak', lastPracticed: '2 weeks ago' },
  ],
  behaviorMetrics: [
    {
      label: 'Response Confidence',
      value: '71%',
      description: 'Your average confidence in your answers before seeing results',
      trend: 'up',
    },
    {
      label: 'Speed vs Accuracy',
      value: '82:78',
      description: 'You solve problems 82% faster on average, with 78% accuracy',
      trend: 'stable',
    },
    {
      label: 'Risk-Taking Pattern',
      value: 'Moderate',
      description: 'You take calculated risks, attempting harder problems when prepared',
      trend: 'up',
    },
    {
      label: 'Focus Span',
      value: '45 min',
      description: 'Average concentrated practice session duration before needing a break',
      trend: 'up',
    },
  ],
  improvementSummary: {
    trajectory: 'Consistent upward trend with 8% improvement over the last 30 days',
    mostImproved: 'Limits & Continuity (+18% in 2 weeks)',
    mostResistant: 'Fourier Analysis (-2% despite 10+ practice sessions)',
    overallInsight:
      'You are a methodical learner who excels with concrete examples but struggles with abstract theoretical concepts. Your strength lies in systematic problem-solving but weaken when conceptual foundations are shaky.',
  },
  actionSuggestions: [
    {
      id: 1,
      title: 'Focus on strengthening Differential Equations fundamentals',
      description:
        'This is your weakest area (45%) and impacts 12% of exam weight. Suggested: 5 hours of focused learning over next week.',
      priority: 'high',
      expectedImpact: '+15-20% mastery in 1 week',
    },
    {
      id: 2,
      title: 'Revise formula retention in Integration',
      description: 'You have 4 forgotten formula instances in the last 5 attempts. Practice formula flashcards for 15 mins daily.',
      priority: 'high',
      expectedImpact: '+8-10% confidence',
    },
    {
      id: 3,
      title: 'Practice trap-style questions twice weekly',
      description: 'Your exam trap mistake rate is 12%. Allocate 2 sessions per week to exam-style practice problems.',
      priority: 'medium',
      expectedImpact: '+400 basis points on exam score',
    },
    {
      id: 4,
      title: 'Use visual learning for abstract concepts',
      description: 'You learn better with diagrams and visual representations than pure algebraic approaches.',
      priority: 'medium',
      expectedImpact: '+5-8% recall accuracy',
    },
    {
      id: 5,
      title: 'Schedule regular interval reviews',
      description: 'Refresh learned concepts every 3 days to prevent knowledge decay, especially in Fourier Analysis.',
      priority: 'low',
      expectedImpact: 'Prevent -5% degradation',
    },
  ],
};

// Cognitive Profile Header
const CognitiveProfileHeader: React.FC = () => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl mb-8">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30">
        <Brain className="w-8 h-8 text-purple-400" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Your Learning Intelligence Profile</h1>
        <p className="text-gray-400">How the system understands your thinking patterns</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="rounded-lg bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/20 p-6">
        <p className="text-gray-400 text-sm mb-2">Learning Intelligence Score</p>
        <p className="text-4xl font-bold text-cyan-300 mb-2">{mockLearningMemory.learningIntelligenceScore}</p>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-blue-600"
            style={{ width: `${mockLearningMemory.learningIntelligenceScore}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Above average learning efficiency</p>
      </div>

      <div className="rounded-lg bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/20 p-6">
        <p className="text-gray-400 text-sm mb-2">Overall Mastery</p>
        <p className="text-4xl font-bold text-green-300 mb-2">68%</p>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div className="h-full rounded-full bg-gradient-to-r from-green-600 to-emerald-600" style={{ width: '68%' }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">Trending up at +2.1% per week</p>
      </div>

      <div className="rounded-lg bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/20 p-6">
        <p className="text-gray-400 text-sm mb-2">Stagnation Risk</p>
        <p className="text-4xl font-bold text-amber-300 mb-2">Low</p>
        <div className="flex gap-2 mt-4">
          <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600" />
          <div className="flex-1 h-2 rounded-full bg-slate-700/50" />
          <div className="flex-1 h-2 rounded-full bg-slate-700/50" />
        </div>
        <p className="text-xs text-gray-400 mt-2">Active progress detected</p>
      </div>
    </div>
  </div>
);

// Mistake Pattern Section
const MistakePatternSection: React.FC<{ patterns: MistakePattern[] }> = ({ patterns }) => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl mb-8">
    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
      <AlertCircle className="w-6 h-6 text-red-400" />
      Your Recurring Mistake Patterns
    </h2>

    <div className="space-y-4">
      {patterns.map((pattern, idx) => (
        <div key={idx} className="group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-1">{pattern.category}</h3>
              <p className="text-xs text-gray-400">{pattern.description}</p>
            </div>
            <div className="text-right ml-4">
              <p className="text-2xl font-bold text-red-400">{pattern.percentage}%</p>
              <p className="text-xs text-gray-400">{pattern.count} instances</p>
            </div>
          </div>

          <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pattern.percentage > 25
                  ? 'bg-gradient-to-r from-red-600 to-rose-600'
                  : pattern.percentage > 15
                  ? 'bg-gradient-to-r from-orange-600 to-red-600'
                  : 'bg-gradient-to-r from-yellow-600 to-orange-600'
              }`}
              style={{ width: `${pattern.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>

    <div className="mt-6 p-4 rounded-lg bg-red-900/20 border border-red-500/20">
      <p className="text-sm text-red-300">
        <span className="font-semibold">Key Insight:</span> Your top 3 mistake categories account for 70% of all errors.
        Focusing on these areas could improve your exam score significantly.
      </p>
    </div>
  </div>
);

// Strength vs Weakness Map
const StrengthWeaknessMap: React.FC<{ concepts: ConceptStrength[] }> = ({ concepts }) => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl mb-8">
    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
      <Target className="w-6 h-6 text-cyan-400" />
      Concept Strength vs Weakness Map
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {concepts.map((concept, idx) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'strong':
              return 'from-green-600 to-emerald-600 bg-green-500/20 border-green-500/30';
            case 'developing':
              return 'from-yellow-600 to-amber-600 bg-yellow-500/20 border-yellow-500/30';
            case 'weak':
              return 'from-red-600 to-rose-600 bg-red-500/20 border-red-500/30';
            default:
              return 'from-gray-600 to-slate-600 bg-gray-500/20 border-gray-500/30';
          }
        };

        const getTextColor = (status: string) => {
          switch (status) {
            case 'strong':
              return 'text-green-300';
            case 'developing':
              return 'text-yellow-300';
            case 'weak':
              return 'text-red-300';
            default:
              return 'text-gray-300';
          }
        };

        return (
          <div key={idx} className="group relative">
            <div
              className={`rounded-lg border p-4 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br ${getStatusColor(
                concept.status
              )}`}
            >
              <div className="relative z-10">
                <p className={`text-xs font-semibold ${getTextColor(concept.status)} mb-2 line-clamp-2`}>
                  {concept.name}
                </p>
                <p className={`text-2xl font-bold ${getTextColor(concept.status)} mb-1`}>{concept.mastery}%</p>
                <p className="text-xs text-gray-400">Last: {concept.lastPracticed}</p>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-slate-900 border border-blue-500/30 text-xs text-gray-300 whitespace-nowrap opacity-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 z-50">
                {concept.status === 'strong' && 'Maintain momentum'}
                {concept.status === 'developing' && 'Continue practice'}
                {concept.status === 'weak' && 'Needs focus'}
              </div>
            </div>
          </div>
        );
      })}
    </div>

    <div className="mt-6 grid grid-cols-3 gap-4">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-900/20 border border-green-500/20">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-xs text-gray-400">
          <span className="font-semibold text-green-300">2</span> Strong Areas
        </span>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/20">
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="text-xs text-gray-400">
          <span className="font-semibold text-yellow-300">3</span> Developing
        </span>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-lg bg-red-900/20 border border-red-500/20">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span className="text-xs text-gray-400">
          <span className="font-semibold text-red-300">3</span> Weak Areas
        </span>
      </div>
    </div>
  </div>
);

// Confidence & Learning Behavior Panel
const ConfidenceBehaviorPanel: React.FC<{ metrics: BehaviorMetric[] }> = ({ metrics }) => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl mb-8">
    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
      <Activity className="w-6 h-6 text-purple-400" />
      Confidence & Learning Behavior
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {metrics.map((metric, idx) => {
        const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingUp : Activity;
        const trendColor =
          metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-gray-400';

        return (
          <div key={idx} className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-blue-500/20 p-6 hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">{metric.label}</p>
                <p className="text-3xl font-bold text-white">{metric.value}</p>
              </div>
              <TrendIcon
                className={`w-5 h-5 ${trendColor} ${metric.trend === 'down' ? 'rotate-180' : ''}`}
              />
            </div>
            <p className="text-sm text-gray-400">{metric.description}</p>
          </div>
        );
      })}
    </div>

    <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20">
      <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
        <Lightbulb className="w-4 h-4" />
        Psychological Insight
      </h3>
      <p className="text-gray-300 leading-relaxed">
        You demonstrate strong analytical thinking with moderate confidence levels. You perform best when problems are
        well-structured, but may hesitate with ambiguous or multi-step problems. Your confidence increases after initial
        success, suggesting strong learning momentum.
      </p>
    </div>
  </div>
);

// Long-Term Improvement Summary
const ImprovementSummary: React.FC = () => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl mb-8">
    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
      <TrendingUp className="w-6 h-6 text-green-400" />
      Long-Term Improvement Summary
    </h2>

    <div className="space-y-6">
      <div className="p-6 rounded-xl bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/20">
        <p className="text-sm text-green-300 font-semibold mb-2">📈 Your Improvement Trajectory</p>
        <p className="text-gray-300">{mockLearningMemory.improvementSummary.trajectory}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/20">
          <p className="text-sm text-cyan-300 font-semibold mb-2">⬆️ Most Improved Concept</p>
          <p className="text-gray-300">{mockLearningMemory.improvementSummary.mostImproved}</p>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/20">
          <p className="text-sm text-orange-300 font-semibold mb-2">⚠️ Most Resistant Concept</p>
          <p className="text-gray-300">{mockLearningMemory.improvementSummary.mostResistant}</p>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/20">
        <p className="text-sm text-indigo-300 font-semibold mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Overall AI Insight
        </p>
        <p className="text-gray-300 leading-relaxed">{mockLearningMemory.improvementSummary.overallInsight}</p>
      </div>
    </div>
  </div>
);

// Action Suggestions
const ActionSuggestions: React.FC<{ suggestions: ActionSuggestion[] }> = ({ suggestions }) => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl mb-8">
    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
      <Lightbulb className="w-6 h-6 text-yellow-400" />
      Personalized Action Suggestions
    </h2>

    <div className="space-y-4">
      {suggestions.map((suggestion) => {
        const priorityColor =
          suggestion.priority === 'high'
            ? 'border-red-500/30 bg-red-500/10'
            : suggestion.priority === 'medium'
            ? 'border-yellow-500/30 bg-yellow-500/10'
            : 'border-green-500/30 bg-green-500/10';

        const priorityTextColor =
          suggestion.priority === 'high'
            ? 'text-red-300'
            : suggestion.priority === 'medium'
            ? 'text-yellow-300'
            : 'text-green-300';

        return (
          <div
            key={suggestion.id}
            className={`rounded-xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer backdrop-blur-sm ${priorityColor}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white flex-1">{suggestion.title}</h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${priorityTextColor} bg-slate-900/50 border border-current`}>
                    {suggestion.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-4">{suggestion.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-white">Expected Impact:</span> {suggestion.expectedImpact}
              </p>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// Action Buttons
const ActionButtons: React.FC = () => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl mb-8">
    <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5" />
            <h3 className="font-semibold">Generate Fresh Strategy</h3>
          </div>
          <p className="text-sm text-white/80">Get a new 5-day learning plan based on latest data</p>
        </div>
      </button>

      <button className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-600 to-rose-600 p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5" />
            <h3 className="font-semibold">Practice Weakest Concept</h3>
          </div>
          <p className="text-sm text-white/80">Start adaptive learning on Differential Equations</p>
        </div>
      </button>

      <button className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Download className="w-5 h-5" />
            <h3 className="font-semibold">Download Report</h3>
          </div>
          <p className="text-sm text-white/80">Export comprehensive PDF learning report</p>
        </div>
      </button>
    </div>

    <button className="mt-6 w-full px-6 py-3 rounded-lg border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-medium transition-all duration-300 flex items-center justify-center gap-2">
      <ChevronUp className="w-4 h-4 rotate-180" />
      Return to Dashboard
    </button>
  </div>
);

// Main Learning Memory Component
export const LearningMemory: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-5" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-blue-500/20 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <button className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
              <ChevronUp className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold mb-1">Learning Memory</h1>
            <p className="text-gray-400">
              AI-powered analysis of your learning patterns and psychological insights • Last updated March 1, 2026
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <CognitiveProfileHeader />
          <MistakePatternSection patterns={mockLearningMemory.mistakePatterns} />
          <StrengthWeaknessMap concepts={mockLearningMemory.conceptStrengths} />
          <ConfidenceBehaviorPanel metrics={mockLearningMemory.behaviorMetrics} />
          <ImprovementSummary />
          <ActionSuggestions suggestions={mockLearningMemory.actionSuggestions} />
          <ActionButtons />

          {/* Footer info */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-900/20 via-slate-900/40 to-slate-900/40 border border-blue-500/20 p-6 text-center backdrop-blur-xl">
            <p className="text-sm text-gray-400">
              This Learning Memory profile is updated daily based on your practice sessions and exam performance.
              <br />
              The AI system continuously refines its understanding of your learning patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningMemory;
