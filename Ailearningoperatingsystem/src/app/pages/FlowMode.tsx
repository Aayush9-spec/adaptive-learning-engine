import { BottomNav } from '../components/BottomNav';
import { AICoachChip } from '../components/AICoachChip';
import { ArrowLeft, Brain, Lightbulb, ChevronRight, CheckCircle, Circle, Timer, Zap } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';

export function FlowMode() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const lesson = {
    topic: 'Python Functions',
    totalSteps: 5,
    difficulty: 'Adaptive',
    estimatedTime: '12 min',
  };

  const steps = [
    {
      type: 'concept',
      title: 'What are Functions?',
      content: 'Functions are reusable blocks of code that perform specific tasks. They help organize code and avoid repetition.',
      example: 'def greet(name):\n    return f"Hello, {name}!"',
    },
    {
      type: 'practice',
      question: 'Which keyword is used to define a function in Python?',
      options: ['function', 'def', 'func', 'define'],
      correct: 1,
      hint: 'Think about the shorthand for "define"',
    },
  ];

  const currentLesson = steps[0];

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (currentStep === lesson.totalSteps - 1) {
      setShowCompletion(true);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, lesson.totalSteps - 1));
      setSelectedAnswer(null);
      setShowHint(false);
    }
  };

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] to-[#ecfdf5] flex items-center justify-center p-4 lg:pl-64">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#08BD80] to-[#05A672] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h2>
            <p className="text-gray-600 mb-6">Outstanding work on Python Functions</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-2xl font-bold text-blue-600 mb-1">+12%</p>
                <p className="text-xs text-gray-600">Skill Gain</p>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4">
                <p className="text-2xl font-bold text-purple-600 mb-1">{formatTime(sessionTime)}</p>
                <p className="text-xs text-gray-600">Time</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4">
                <p className="text-2xl font-bold text-green-600 mb-1">94%</p>
                <p className="text-xs text-gray-600">Accuracy</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-4 mb-6">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">AI Update:</span> Your performance exceeded predictions. Unlocking next topic early.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-4 font-semibold hover:shadow-lg transition-all"
              >
                Back to Command Center
              </button>
              <button
                onClick={() => {
                  setShowCompletion(false);
                  setCurrentStep(0);
                  setSessionTime(0);
                }}
                className="w-full bg-gray-100 text-gray-700 rounded-2xl py-4 font-semibold hover:bg-gray-200 transition-all"
              >
                Start Next Topic
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8 lg:pl-64">
      {/* Minimal Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>

            {/* Session Timer */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
              <Timer className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">{formatTime(sessionTime)}</span>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / lesson.totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <span className="text-sm font-semibold text-gray-600">
              {currentStep + 1}/{lesson.totalSteps}
            </span>
          </div>
        </div>
      </header>

      {/* Flow State Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Topic Badge */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Flow Mode</p>
            <p className="font-semibold text-gray-900">{lesson.topic}</p>
          </div>
        </div>

        {/* Lesson Content Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6">
          {currentLesson.type === 'concept' ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {currentLesson.title}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {currentLesson.content}
              </p>

              {/* Code Example */}
              {currentLesson.example && (
                <div className="bg-gray-900 rounded-2xl p-4 mb-4">
                  <pre className="text-green-400 font-mono text-sm">
                    {currentLesson.example}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {currentLesson.question}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentLesson.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${selectedAnswer === index
                      ? selectedAnswer === currentLesson.correct
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{option}</span>
                      {selectedAnswer === index && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedAnswer === currentLesson.correct
                          ? 'bg-green-500'
                          : 'bg-red-500'
                          }`}>
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Hint Panel */}
        {currentLesson.type === 'practice' && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="w-full mb-6"
          >
            <div className={`bg-amber-50 border border-amber-200 rounded-2xl p-4 transition-all ${showHint ? 'shadow-md' : ''
              }`}>
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-amber-900">
                    {showHint ? 'Hint' : 'Need a hint?'}
                  </p>
                  {showHint && (
                    <p className="text-sm text-amber-700 mt-1">
                      {currentLesson.hint}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Navigation */}
        <button
          onClick={handleNext}
          disabled={currentLesson.type === 'practice' && selectedAnswer === null}
          className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${currentLesson.type === 'practice' && selectedAnswer === null
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg active:scale-98'
            }`}
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Cognitive Load Indicator */}
        <div className="mt-8 bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Cognitive Load</span>
            </div>
            <span className="text-sm font-semibold text-green-600">Optimal</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" style={{ width: '65%' }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            AI is adjusting difficulty in real-time to maintain your flow state
          </p>
        </div>
      </main>

      {/* Persistent AI Coach Chip */}
      <AICoachChip onClick={() => navigate('/')} />

      <BottomNav />
    </div>
  );
}