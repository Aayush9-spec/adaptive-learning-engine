import { BottomNav } from '../components/BottomNav';
import { LearningPathVisualization } from '../components/LearningPathVisualization';
import { AICoachChip } from '../components/AICoachChip';
import { ArrowLeft, Navigation, Target, Zap, TrendingUp, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { useNavigate } from 'react-router';

export function LearningGPS() {
  const navigate = useNavigate();

  const currentSkill = {
    level: 'Intermediate',
    completion: 45,
    topic: 'Python Programming',
  };

  const targetGoal = {
    title: 'Backend Developer',
    eta: '4.2 months',
    confidence: 87,
  };

  // Path visualization nodes
  const pathNodes = [
    { id: 1, title: 'Variables', status: 'completed' as const, skillGain: 8, position: { x: 20, y: 80 } },
    { id: 2, title: 'Loops', status: 'completed' as const, skillGain: 12, position: { x: 35, y: 50 } },
    { id: 3, title: 'Functions', status: 'current' as const, skillGain: 15, position: { x: 50, y: 30 } },
    { id: 4, title: 'OOP', status: 'next' as const, skillGain: 18, position: { x: 65, y: 45 } },
    { id: 5, title: 'Data Structures', status: 'locked' as const, skillGain: 20, position: { x: 80, y: 65 } },
  ];

  const shortcuts = [
    {
      title: 'Skip "File Handling"',
      impact: 'Save 2.1 days',
      reason: 'Low career relevance',
    },
    {
      title: 'Parallel Learning',
      impact: 'Save 1.5 days',
      reason: 'Learn OOP while practicing functions',
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8 lg:pl-64">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#08BD80] to-[#05A672] text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/')}
            className="mb-4 p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Navigation className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Learning GPS</h1>
              <p className="text-sm opacity-90">Your optimal path to mastery</p>
            </div>
          </div>

          {/* Current Position */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs opacity-90 mb-1">Current Level</p>
                <p className="text-lg font-semibold">{currentSkill.topic}</p>
                <p className="text-sm">{currentSkill.level} • {currentSkill.completion}% Complete</p>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center">
                  <span className="text-xl font-bold">{currentSkill.completion}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Destination */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Destination</p>
              <h3 className="text-xl font-bold text-gray-900">{targetGoal.title}</h3>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Estimated Arrival</p>
              <p className="text-lg font-semibold text-gray-900">{targetGoal.eta}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-1">Confidence</p>
              <p className="text-lg font-semibold text-green-600">{targetGoal.confidence}%</p>
            </div>
          </div>
        </div>

        {/* Shortcuts & Optimizations */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900">Smart Shortcuts</h3>
          </div>
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{shortcut.title}</h4>
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold">
                    {shortcut.impact}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{shortcut.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Path Roadmap */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Optimal Learning Route</h3>

          {/* Path Visualization - Google Maps Style */}
          <LearningPathVisualization
            nodes={pathNodes}
            onNodeClick={(nodeId) => {
              const node = pathNodes.find(n => n.id === nodeId);
              if (node?.status === 'current' || node?.status === 'next') {
                navigate('/flow');
              }
            }}
          />
        </div>
      </main>

      {/* Persistent AI Coach Chip */}
      <AICoachChip onClick={() => navigate('/')} />

      <BottomNav />
    </div>
  );
}