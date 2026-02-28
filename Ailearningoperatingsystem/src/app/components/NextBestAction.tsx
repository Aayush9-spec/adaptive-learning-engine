import { ArrowRight, Clock, TrendingUp, Lightbulb, Zap, BarChart3 } from 'lucide-react';

interface NextBestActionProps {
  action: {
    title: string;
    topic: string;
    expectedGain: number;
    timeToSkill: string;
    confidence: number;
    reasoning: string;
    impact: string;
    currentSkill?: number;
    projectedSkill?: number;
  };
  onStart: () => void;
}

export function NextBestAction({ action, onStart }: NextBestActionProps) {
  const currentSkill = action.currentSkill || 60;
  const projectedSkill = action.projectedSkill || currentSkill + action.expectedGain;

  return (
    <div className="relative">
      {/* Glow effect animation */}
      <div className="absolute inset-0 bg-primary/40 rounded-[var(--radius-xl)] blur-2xl animate-pulse" />

      <div className="relative bg-primary rounded-[var(--radius-xl)] p-6 text-white shadow-xl isolate overflow-hidden">
        {/* Decorative glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        {/* Hero Label */}
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">Today's AI Decision</span>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-90">Confidence</p>
            <p className="text-xl font-bold">{action.confidence}%</p>
          </div>
        </div>

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Next Best Action</p>
              <h3 className="font-semibold text-lg">{action.title}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 mb-4 backdrop-blur-sm">
          <p className="text-sm mb-3 opacity-90">{action.topic}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" />
                <p className="text-xs opacity-90">Expected Gain</p>
              </div>
              <p className="text-lg font-semibold">+{action.expectedGain}%</p>
            </div>

            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4" />
                <p className="text-xs opacity-90">Time to Skill</p>
              </div>
              <p className="text-lg font-semibold">{action.timeToSkill}</p>
            </div>
          </div>
        </div>

        {/* Learning Impact Visualization - Before vs After */}
        <div className="bg-white/10 rounded-2xl p-4 mb-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4" />
            <p className="text-xs font-semibold opacity-90">PREDICTED IMPACT</p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs opacity-75">Before</span>
                <span className="text-sm font-semibold">{currentSkill}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/40 rounded-full transition-all duration-500"
                  style={{ width: `${currentSkill}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs opacity-80 font-medium tracking-wide uppercase">After This Session</span>
                <span className="text-sm font-semibold">{projectedSkill}%</span>
              </div>
              <div className="h-2.5 bg-black/20 rounded-full overflow-hidden p-[1px]">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  style={{ width: `${projectedSkill}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs opacity-90">
              ✨ You'll move from <span className="font-semibold">Intermediate</span> to <span className="font-semibold">Advanced</span> level
            </p>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 mb-4 backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs opacity-90 mb-1">Why This Now?</p>
              <p className="text-sm">{action.reasoning}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-white text-blue-600 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all active:scale-98"
        >
          Start Learning
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}