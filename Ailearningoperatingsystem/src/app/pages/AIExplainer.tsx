import { BottomNav } from '../components/BottomNav';
import { ArrowLeft, Brain, TrendingDown, GitBranch, Target, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';

export function AIExplainer() {
  const navigate = useNavigate();

  const explanations = [
    {
      decision: 'Why Python Functions Next?',
      insights: [
        {
          type: 'Performance Gap',
          icon: TrendingDown,
          color: 'red',
          title: 'Skill Gap Detected',
          description: 'You scored 65% on loop exercises. Functions will help consolidate this knowledge.',
        },
        {
          type: 'Dependency Logic',
          icon: GitBranch,
          color: 'blue',
          title: 'Learning Dependencies',
          description: 'Functions build directly on loops and variables. You\'ve mastered prerequisites with 87% confidence.',
        },
        {
          type: 'Outcome Prediction',
          icon: Target,
          color: 'green',
          title: 'Expected Impact',
          description: 'Learning functions now will unlock 5 advanced topics and increase your backend readiness by 18%.',
        },
      ],
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Explainer</h1>
              <p className="text-sm opacity-90">Understand every decision</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Transparency Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">100% Transparent AI</h3>
              <p className="text-sm text-blue-700">
                Every recommendation is backed by data and logic. No black boxes. You deserve to know why the AI suggests what it does.
              </p>
            </div>
          </div>
        </div>

        {/* Current Decision Explanation */}
        {explanations.map((explanation, index) => (
          <div key={index} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{explanation.decision}</h3>

            <div className="space-y-4">
              {explanation.insights.map((insight, idx) => {
                const Icon = insight.icon;
                return (
                  <div key={idx} className="bg-gray-50 rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-${insight.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 text-${insight.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full bg-${insight.color}-100 text-${insight.color}-700`}>
                            {insight.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Career Alignment */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Career Alignment Analysis</h3>

          <div className="space-y-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Backend Development</span>
                <span className="text-sm font-semibold text-gray-900">92% Match</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Data Science</span>
                <span className="text-sm font-semibold text-gray-900">67% Match</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: '67%' }} />
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Web Development</span>
                <span className="text-sm font-semibold text-gray-900">78% Match</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Decision History */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Recent AI Decisions</h3>

          <div className="space-y-3">
            {[
              {
                decision: 'Skipped "File Handling"',
                reason: 'Low relevance to backend goal',
                impact: 'Saved 2.1 days',
                date: 'Feb 25',
              },
              {
                decision: 'Increased difficulty',
                reason: 'Consistent 90%+ scores',
                impact: '+15% learning speed',
                date: 'Feb 23',
              },
              {
                decision: 'Added practice exercises',
                reason: 'Loop concept retention at 68%',
                impact: 'Improved to 87%',
                date: 'Feb 20',
              },
            ].map((item, index) => (
              <div key={index} className="border-l-4 border-blue-500 bg-gray-50 rounded-r-xl pl-4 pr-4 py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 mb-1">{item.decision}</p>
                    <p className="text-sm text-gray-600">{item.reason}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{item.date}</span>
                </div>
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                    {item.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
