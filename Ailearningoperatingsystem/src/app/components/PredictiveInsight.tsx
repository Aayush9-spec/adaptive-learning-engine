import { Brain, Target, Clock, Star } from 'lucide-react';

interface InsightProps {
  prediction: {
    skillGain: number;
    masteryDate: string;
    impactScore: number;
    careerRelevance: string;
  };
}

export function PredictiveInsight({ prediction }: InsightProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-md rounded-[var(--radius-xl)] p-6 shadow-xl border border-white/50">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-primary rounded-[var(--radius-lg)] flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Predictive Intelligence</p>
          <h3 className="font-semibold text-gray-900">Before You Study</h3>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-white/90 backdrop-blur-xl rounded-[var(--radius-lg)] p-4 flex items-center justify-between shadow-sm border border-white/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-[var(--radius-md)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Expected Skill Gain</p>
              <p className="font-semibold text-gray-900">+{prediction.skillGain}%</p>
            </div>
          </div>
          <div className="text-right">
            <div className="px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">
              <span className="text-xs font-semibold text-secondary">High Impact</span>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-[var(--radius-lg)] p-4 flex items-center justify-between shadow-sm border border-white/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-[var(--radius-md)] flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Predicted Mastery</p>
              <p className="font-semibold text-gray-900">{prediction.masteryDate}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-[var(--radius-lg)] p-4 flex items-center justify-between shadow-sm border border-white/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-[var(--radius-md)] flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Career Relevance</p>
              <p className="font-semibold text-gray-900">{prediction.careerRelevance}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
