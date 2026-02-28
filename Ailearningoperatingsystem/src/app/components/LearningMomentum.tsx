import { TrendingUp, Flame, ArrowUp, ArrowDown } from 'lucide-react';

interface MomentumData {
  score: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  message: string;
}

interface LearningMomentumProps {
  momentum: MomentumData;
}

export function LearningMomentum({ momentum }: LearningMomentumProps) {
  const getTrendColor = () => {
    if (momentum.trend === 'up') return 'text-green-600';
    if (momentum.trend === 'down') return 'text-orange-600';
    return 'text-gray-600';
  };

  const getTrendBg = () => {
    if (momentum.trend === 'up') return 'bg-green-50';
    if (momentum.trend === 'down') return 'bg-orange-50';
    return 'bg-gray-50';
  };

  const getProgressColor = () => {
    if (momentum.score >= 80) return 'from-green-500 to-emerald-600';
    if (momentum.score >= 60) return 'from-blue-500 to-indigo-600';
    if (momentum.score >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-orange-500 to-red-600';
  };

  return (
    <div className="bg-card/90 backdrop-blur-md rounded-[var(--radius-xl)] p-6 shadow-xl border border-white/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Learning Momentum</p>
          <div className="flex items-center gap-2">
            <h3 className="text-3xl font-bold">{momentum.score}</h3>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getTrendBg()}`}>
              {momentum.trend === 'up' ? (
                <ArrowUp className={`w-4 h-4 ${getTrendColor()}`} />
              ) : momentum.trend === 'down' ? (
                <ArrowDown className={`w-4 h-4 ${getTrendColor()}`} />
              ) : (
                <TrendingUp className={`w-4 h-4 ${getTrendColor()}`} />
              )}
              <span className={`text-sm font-semibold ${getTrendColor()}`}>
                {momentum.change > 0 ? '+' : ''}{momentum.change}
              </span>
            </div>
          </div>
        </div>

        <div className={`w-16 h-16 rounded-[var(--radius-lg)] bg-gradient-to-br ${getProgressColor()} flex items-center justify-center shadow-lg`}>
          <Flame className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Momentum Bar */}
      <div className="mb-4">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 rounded-full`}
            style={{ width: `${momentum.score}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-gray-700">{momentum.message}</p>
    </div>
  );
}
