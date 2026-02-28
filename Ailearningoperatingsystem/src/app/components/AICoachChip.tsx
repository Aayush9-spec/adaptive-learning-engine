import { Bot, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface AICoachChipProps {
  onClick?: () => void;
}

export function AICoachChip({ onClick }: AICoachChipProps) {
  const [isActive, setIsActive] = useState(true);

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 z-50 group md:bottom-8 md:right-8"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Main chip */}
      <div className="relative flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 border border-white/20 backdrop-blur-md">
        <div className="relative">
          <Bot className="w-5 h-5 text-white/90" />
          {isActive && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-secondary rounded-full animate-pulse border-2 border-primary" />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold tracking-wide">AI Coach</span>
          <Sparkles className="w-3.5 h-3.5 animate-bounce text-amber-300" />
        </div>
      </div>
    </button>
  );
}
