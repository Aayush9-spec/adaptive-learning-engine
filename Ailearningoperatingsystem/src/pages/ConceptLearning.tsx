import React, { useState } from 'react';
import {
  AlertCircle,
  Lightbulb,
  BookOpen,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Send,
  TrendingUp,
  Shield,
  Target,
} from 'lucide-react';

interface Question {
  id: number;
  type: 'conceptual' | 'application' | 'trap' | 'diagram';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  solution?: string;
  explanation?: string;
  diagram?: string;
}

interface DiagramPoint {
  x: number;
  y: number;
  label?: string;
}

interface DiagramData {
  type: 'coordinate_plane' | 'function_curve' | 'geometric';
  points?: DiagramPoint[];
  curves?: Array<{ equation: string; color: string }>;
  shapes?: any[];
}

interface ConceptData {
  name: string;
  masteryScore: number;
  examWeight: {
    percentage: number;
    importance: 'high' | 'medium' | 'low';
  };
  prerequisites: Array<{
    name: string;
    masteryScore: number;
    status: 'complete' | 'in-progress' | 'weak';
  }>;
  aiExplanation: {
    summary: string;
    weakPrerequisiteWarning?: string;
    examTrapWarning?: string;
  };
  diagramData?: DiagramData;
}

// Mock Data
const mockConceptData: ConceptData = {
  name: 'Differentiation',
  masteryScore: 72,
  examWeight: {
    percentage: 18,
    importance: 'high',
  },
  prerequisites: [
    { name: 'Limits & Continuity', masteryScore: 85, status: 'complete' },
    { name: 'Function Behavior', masteryScore: 72, status: 'complete' },
    { name: 'Algebraic Manipulation', masteryScore: 48, status: 'weak' },
  ],
  aiExplanation: {
    summary:
      'Differentiation is the process of finding the rate of change of a function at any given point. The derivative f\'(x) represents the slope of the tangent line to the curve y = f(x) at point x. Geometrically, it measures how steeply the function is increasing or decreasing. Algebraically, it\'s defined as the limit of the difference quotient: f\'(x) = lim(h→0) [f(x+h) - f(x)]/h.',
    weakPrerequisiteWarning:
      'Your Algebraic Manipulation mastery is at 48%. You may struggle with chain rule and quotient rule problems. Review algebraic expansion and simplification before proceeding.',
    examTrapWarning:
      'Common exam mistake: Forgetting the chain rule when differentiating composite functions. Always check if you need to multiply by the derivative of the inner function.',
  },
  diagramData: {
    type: 'function_curve',
    curves: [
      { equation: 'f(x) = x², f\'(x) = 2x', color: '#3B82F6' },
    ],
  },
};

const mockQuestions: Question[] = [
  {
    id: 1,
    type: 'conceptual',
    difficulty: 'easy',
    question: 'What does the derivative of a function represent geometrically?',
    options: [
      'The area under the curve',
      'The slope of the tangent line at a point',
      'The x-intercept of the function',
      'The vertical distance from the x-axis',
    ],
    solution: 'B',
    explanation:
      'The derivative f\'(x) at a point represents the slope of the tangent line to the curve at that point. This is the instantaneous rate of change.',
  },
  {
    id: 2,
    type: 'application',
    difficulty: 'medium',
    question: 'A particle\'s position is given by s(t) = 3t² + 2t. Find its velocity at t = 2 seconds.',
    solution: '14',
    explanation:
      'Velocity is the derivative of position: v(t) = ds/dt = 6t + 2. At t = 2: v(2) = 6(2) + 2 = 12 + 2 = 14 m/s.',
  },
  {
    id: 3,
    type: 'trap',
    difficulty: 'hard',
    question: 'What is the derivative of f(x) = (2x + 3)³?',
    options: ['3(2x + 3)²', '6(2x + 3)²', '9(2x + 3)²', '6(2x + 3)³'],
    solution: 'B',
    explanation:
      'Using the chain rule: d/dx[(2x + 3)³] = 3(2x + 3)² · d/dx[2x + 3] = 3(2x + 3)² · 2 = 6(2x + 3)². The trap is forgetting to multiply by the derivative of the inner function (2).',
  },
  {
    id: 4,
    type: 'conceptual',
    difficulty: 'medium',
    question: 'Which of the following functions is NOT differentiable at x = 0?',
    options: ['f(x) = x²', 'f(x) = sin(x)', 'f(x) = |x|', 'f(x) = x³'],
    solution: 'C',
    explanation:
      'f(x) = |x| has a sharp corner at x = 0. The left and right derivatives don\'t match, so it\'s not differentiable there.',
  },
  {
    id: 5,
    type: 'application',
    difficulty: 'hard',
    question: 'Find the derivative of f(x) = e^(sin(x)) at x = π/2.',
    solution: '0',
    explanation:
      'Using chain rule: f\'(x) = e^(sin(x)) · cos(x). At x = π/2: f\'(π/2) = e^(sin(π/2)) · cos(π/2) = e¹ · 0 = 0.',
  },
  {
    id: 6,
    type: 'diagram',
    difficulty: 'medium',
    question: 'The diagram shows a curve f(x). Which point has the steepest positive slope?',
    diagram: 'coordinate-diagram-1',
    solution: 'Point B',
    explanation:
      'The derivative (slope of tangent) is largest where the curve rises most steeply. Visually, point B shows the steepest positive tangent slope.',
  },
];

// Concept Header Component
const ConceptHeader: React.FC<{ data: ConceptData }> = ({ data }) => {
  const getPrerequisiteColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500/10 border-green-500/30';
      case 'in-progress':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'weak':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const getPrerequisiteTextColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-green-300';
      case 'in-progress':
        return 'text-yellow-300';
      case 'weak':
        return 'text-red-300';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl mb-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-2">{data.name}</h1>
          <p className="text-gray-400">Master this concept to improve your exam performance</p>
        </div>

        <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
          <p className="text-xs text-blue-300">Exam Weight</p>
          <p className="text-2xl font-bold text-blue-300">{data.examWeight.percentage}%</p>
        </div>
      </div>

      {/* Mastery Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-300">Current Mastery</span>
          <span className="text-2xl font-bold text-cyan-300">{data.masteryScore}%</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-1000"
            style={{ width: `${data.masteryScore}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {data.masteryScore >= 80
            ? 'Excellent! Focus on edge cases and applications.'
            : data.masteryScore >= 60
            ? 'Good progress. Keep practicing to reach 80%.'
            : 'Keep practicing. You\'re building strong foundations.'}
        </p>
      </div>

      {/* Prerequisites */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Prerequisites</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.prerequisites.map((prereq, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-4 transition-all duration-300 ${getPrerequisiteColor(prereq.status)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-sm font-semibold ${getPrerequisiteTextColor(prereq.status)}`}>
                  {prereq.name}
                </span>
                {prereq.status === 'complete' && (
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                )}
                {prereq.status === 'weak' && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    prereq.status === 'complete'
                      ? 'bg-green-500'
                      : prereq.status === 'weak'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }`}
                  style={{ width: `${prereq.masteryScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">{prereq.masteryScore}% mastery</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// AI Tutor Section
const AITutorSection: React.FC<{ data: ConceptData }> = ({ data }) => {
  const [isRegenerated, setIsRegenerated] = useState(false);

  const handleRegenerate = () => {
    setIsRegenerated(!isRegenerated);
    setTimeout(() => setIsRegenerated(false), 1000);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          AI Concept Explanation
        </h2>
        <button
          onClick={handleRegenerate}
          className={`p-2 rounded-lg border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 ${
            isRegenerated ? 'bg-blue-500/30' : 'hover:bg-blue-500/10'
          }`}
        >
          <RefreshCw className={`w-5 h-5 text-blue-400 ${isRegenerated ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Summary */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/20">
          <h3 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Summary
          </h3>
          <p className="text-gray-300 leading-relaxed">{data.aiExplanation.summary}</p>
        </div>

        {/* Weak Prerequisite Warning */}
        {data.aiExplanation.weakPrerequisiteWarning && (
          <div className="p-6 rounded-xl bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/20">
            <h3 className="text-sm font-semibold text-orange-300 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Weak Prerequisite Alert
            </h3>
            <p className="text-gray-300 leading-relaxed">{data.aiExplanation.weakPrerequisiteWarning}</p>
          </div>
        )}

        {/* Exam Trap Warning */}
        {data.aiExplanation.examTrapWarning && (
          <div className="p-6 rounded-xl bg-gradient-to-r from-red-900/30 to-rose-900/30 border border-red-500/20">
            <h3 className="text-sm font-semibold text-red-300 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Exam Trap Warning
            </h3>
            <p className="text-gray-300 leading-relaxed">{data.aiExplanation.examTrapWarning}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Question Card Component
const QuestionCard: React.FC<{
  question: Question;
  onAnswer: (id: number, answer: string) => void;
}> = ({ question, onAnswer }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'hard':
        return 'bg-red-500/20 border-red-500/30 text-red-300';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'conceptual':
        return '📚 Conceptual';
      case 'application':
        return '💡 Application';
      case 'trap':
        return '⚠️ Trap Question';
      case 'diagram':
        return '📊 Diagram-Based';
      default:
        return 'Question';
    }
  };

  return (
    <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-6 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-blue-500/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getDifficultyColor(question.difficulty)}`}>
              {getTypeLabel(question.type)}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white">{question.question}</h3>
        </div>
      </div>

      {/* Options for multiple choice */}
      {question.options && (
        <div className="space-y-3 mb-6">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedAnswer(String.fromCharCode(65 + idx)))}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
                selectedAnswer === String.fromCharCode(65 + idx)
                  ? 'bg-blue-600/20 border-blue-500/50'
                  : 'bg-slate-800/20 border-slate-600/30 hover:border-blue-500/30'
              }`}
            >
              <span className="font-semibold text-blue-300 mr-3">{String.fromCharCode(65 + idx)}.</span>
              <span className="text-gray-300">{option}</span>
            </button>
          ))}
        </div>
      )}

      {/* Free response input */}
      {!question.options && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Type your answer..."
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-blue-500/20 text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none transition-all duration-300"
          />
        </div>
      )}

      {/* Solution Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 rounded-lg bg-slate-800/30 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 flex items-center justify-between group"
      >
        <span className="text-sm font-semibold text-blue-300">
          {isExpanded ? 'Hide' : 'Show'} Solution & Explanation
        </span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
        ) : (
          <ChevronDown className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-blue-500/20 pt-4">
          <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/20">
            <p className="text-sm text-green-300 font-semibold mb-2">Correct Answer</p>
            <p className="text-lg font-bold text-green-300">{question.solution}</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/20">
            <p className="text-sm text-blue-300 font-semibold mb-2">Explanation</p>
            <p className="text-gray-300 leading-relaxed">{question.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Question Generator Section
const QuestionGeneratorSection: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<Record<number, { correct: boolean; classification: string }>>(
    {}
  );

  const handleAnswer = (id: number, answer: string) => {
    setAnswers({ ...answers, [id]: answer });
  };

  const handleSubmit = () => {
    // Mock submission
    const newFeedback: Record<number, { correct: boolean; classification: string }> = {};

    mockQuestions.forEach((q) => {
      const isCorrect = answers[q.id] === q.solution;
      newFeedback[q.id] = {
        correct: isCorrect,
        classification: isCorrect
          ? 'Correct! Well done.'
          : q.type === 'trap'
          ? 'Incorrect. You fell into the trap! Review the chain rule carefully.'
          : q.type === 'application'
          ? 'Incorrect. Check your calculation steps.'
          : 'Incorrect. Revisit the concept definition.',
      };
    });

    setFeedback(newFeedback);
    setSubmitted(true);
  };

  const correctCount = Object.values(feedback).filter((f) => f.correct).length;
  const totalCount = mockQuestions.length;

  return (
    <div className="space-y-8 mb-8">
      <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Target className="w-6 h-6 text-cyan-400" />
            Adaptive Practice
          </h2>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium transition-all duration-300 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Generate New Questions
          </button>
        </div>

        <p className="text-gray-400 mb-6">
          Answer these questions to reinforce your understanding. Questions are adapted based on your performance.
        </p>

        <div className="space-y-6">
          {mockQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} onAnswer={handleAnswer} />
          ))}
        </div>

        {!submitted && (
          <button
            onClick={handleSubmit}
            className="mt-8 w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Submit Answers
          </button>
        )}
      </div>

      {submitted && (
        <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
          <h3 className="text-2xl font-bold text-white mb-6">Your Results</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/20 p-6 text-center">
              <p className="text-gray-400 text-sm mb-2">Score</p>
              <p className="text-4xl font-bold text-cyan-300">{Math.round((correctCount / totalCount) * 100)}%</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/20 p-6 text-center">
              <p className="text-gray-400 text-sm mb-2">Correct</p>
              <p className="text-4xl font-bold text-green-300">{correctCount}/{totalCount}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 p-6 text-center">
              <p className="text-gray-400 text-sm mb-2">Next Action</p>
              <p className="text-lg font-bold text-purple-300">
                {correctCount === totalCount ? 'Master Level!' : 'Review Weak Areas'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {mockQuestions.map((q) => (
              <div key={q.id} className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/30 border border-blue-500/20">
                <div>
                  {feedback[q.id]?.correct ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${feedback[q.id]?.correct ? 'text-green-300' : 'text-red-300'}`}>
                    Q{q.id}: {feedback[q.id]?.classification}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">{q.question.substring(0, 60)}...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Diagram Component
const DiagramSection: React.FC<{ data?: ConceptData['diagramData'] }> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl mb-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-purple-400" />
        Visual Representation
      </h2>

      <div className="bg-slate-900/50 rounded-xl p-8 border border-blue-500/10">
        <svg width="100%" height="400" viewBox="0 0 500 400" className="mx-auto">
          {/* Coordinate System */}
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {[...Array(10)].map((_, i) => (
            <React.Fragment key={`grid-${i}`}>
              <line x1={i * 50} y1="0" x2={i * 50} y2="400" stroke="#334155" strokeWidth="0.5" opacity="0.3" />
              <line x1="0" y1={i * 40} x2="500" y2={i * 40} stroke="#334155" strokeWidth="0.5" opacity="0.3" />
            </React.Fragment>
          ))}

          {/* Axes */}
          <line x1="50" y1="200" x2="450" y2="200" stroke="#64748B" strokeWidth="2" />
          <line x1="250" y1="20" x2="250" y2="380" stroke="#64748B" strokeWidth="2" />

          {/* Axis labels */}
          <text x="450" y="195" fill="#9CA3AF" fontSize="12" textAnchor="end">
            x
          </text>
          <text x="255" y="15" fill="#9CA3AF" fontSize="12">
            y
          </text>

          {/* Parabola: y = x² (scaled) */}
          <path
            d="M 50,350 L 60,322 L 70,296 L 80,274 L 90,254 L 100,236 L 110,220 L 120,206 L 130,194 L 140,184 L 150,176 L 160,170 L 170,166 L 180,164 L 190,164 L 200,166 L 210,170 L 220,176 L 230,184 L 240,194 L 250,206 L 260,220 L 270,236 L 280,254 L 290,274 L 300,296 L 310,322 L 320,350 L 330,380 L 340,412"
            stroke="url(#curveGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          {/* Tangent line at x=2.5 */}
          <line x1="125" y1="250" x2="200" y2="150" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" opacity="0.8" />

          {/* Point of tangency */}
          <circle cx="125" cy="194" r="6" fill="#3B82F6" stroke="#06B6D4" strokeWidth="2" />

          {/* Label for tangent */}
          <text x="130" y="180" fill="#10B981" fontSize="12" fontWeight="bold">
            Tangent
          </text>

          {/* Label for curve */}
          <text x="350" y="100" fill="#3B82F6" fontSize="14" fontWeight="bold">
            f(x) = x²
          </text>
        </svg>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/20">
        <p className="text-sm text-gray-300">
          The blue curve shows f(x) = x². The green dashed line represents the tangent at a point, which has the slope f'(x) = 2x.
          The steeper the curve, the larger the derivative value.
        </p>
      </div>
    </div>
  );
};

// Progress Update Panel
const ProgressPanel: React.FC<{ initialScore: number; currentScore?: number }> = ({
  initialScore,
  currentScore = initialScore,
}) => {
  const improvement = currentScore - initialScore;
  const showImprovement = improvement > 0;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl mb-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-green-400" />
        Your Progress
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-blue-500/20 p-6">
          <p className="text-gray-400 text-sm mb-2">Initial Mastery</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-blue-300">{initialScore}%</span>
            <span className="text-lg text-gray-400">mastery</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-600"
              style={{ width: `${initialScore}%` }}
            />
          </div>
        </div>

        <div className={`rounded-xl border p-6 ${
          showImprovement
            ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/20'
            : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20'
        }`}>
          <p className="text-gray-400 text-sm mb-2">Current Mastery</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className={`text-4xl font-bold ${showImprovement ? 'text-green-300' : 'text-cyan-300'}`}>
              {currentScore}%
            </span>
            {showImprovement && (
              <span className="text-lg font-bold text-green-400">
                +{improvement}%
              </span>
            )}
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3">
            <div
              className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${
                showImprovement ? 'from-green-600 to-emerald-600' : 'from-cyan-600 to-blue-600'
              }`}
              style={{ width: `${currentScore}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/20">
        <p className="text-sm text-gray-300">
          {showImprovement
            ? `Great! You've improved by ${improvement}%. Continue practicing to reach 85%+ mastery.`
            : 'Keep practicing to see improvement in your mastery score.'}
        </p>
      </div>
    </div>
  );
};

// Main Concept Learning Component
export const ConceptLearning: React.FC = () => {
  const [currentMastery, setCurrentMastery] = useState(mockConceptData.masteryScore);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-5" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-blue-500/20 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <button className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
              <ChevronUp className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">{mockConceptData.name}</h1>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <ConceptHeader data={mockConceptData} />
          <AITutorSection data={mockConceptData} />
          <DiagramSection data={mockConceptData.diagramData} />
          <QuestionGeneratorSection />
          <ProgressPanel initialScore={mockConceptData.masteryScore} currentScore={currentMastery} />

          {/* Footer CTA */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-900/20 via-slate-900/40 to-slate-900/40 border border-blue-500/20 p-8 text-center backdrop-blur-xl">
            <h3 className="text-2xl font-bold mb-3">Ready to Master More Concepts?</h3>
            <p className="text-gray-400 mb-6">
              Check out related concepts like Integration, Derivatives, and Advanced Applications.
            </p>
            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold transition-all duration-300">
              Explore Related Topics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptLearning;
