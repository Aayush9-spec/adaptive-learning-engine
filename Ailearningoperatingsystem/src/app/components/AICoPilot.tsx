import { Bot, X } from 'lucide-react';
import { useState } from 'react';

interface CoPilotMessage {
  type: 'suggestion' | 'warning' | 'encouragement';
  message: string;
  action?: string;
}

interface AICoPilotProps {
  message: CoPilotMessage;
  onDismiss?: () => void;
  onAction?: () => void;
}

export function AICoPilot({ message, onDismiss, onAction }: AICoPilotProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const getColorScheme = () => {
    switch (message.type) {
      case 'suggestion':
        return {
          bg: 'bg-primary/10 backdrop-blur-md',
          border: 'border-primary/20',
          text: 'text-primary',
          icon: 'bg-primary text-white',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 backdrop-blur-md',
          border: 'border-amber-500/20',
          text: 'text-amber-700',
          icon: 'bg-amber-500 text-white',
        };
      case 'encouragement':
        return {
          bg: 'bg-secondary/10 backdrop-blur-md',
          border: 'border-secondary/20',
          text: 'text-secondary',
          icon: 'bg-secondary text-white',
        };
    }
  };

  const colors = getColorScheme();

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-[var(--radius-xl)] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]`}>
      <div className="flex items-start gap-4">
        <div className={`${colors.icon} w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
              AI Co-Pilot
            </p>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className={`text-sm ${colors.text} mb-3`}>{message.message}</p>
          {message.action && onAction && (
            <button
              onClick={onAction}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {message.action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
