import { CheckCircle2, Circle, Navigation, Zap, Lock } from 'lucide-react';

interface PathNode {
  id: number;
  title: string;
  status: 'completed' | 'current' | 'next' | 'locked';
  skillGain?: number;
  position: { x: number; y: number };
}

interface LearningPathVisualizationProps {
  nodes: PathNode[];
  onNodeClick?: (nodeId: number) => void;
}

export function LearningPathVisualization({ nodes, onNodeClick }: LearningPathVisualizationProps) {
  const getNodeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-600';
      case 'current':
        return 'bg-blue-500 border-blue-600 ring-4 ring-blue-200';
      case 'next':
        return 'bg-white border-blue-400';
      case 'locked':
        return 'bg-gray-200 border-gray-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getNodeIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-white" />;
      case 'current':
        return <Navigation className="w-5 h-5 text-white" />;
      case 'next':
        return <Zap className="w-5 h-5 text-blue-600" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 overflow-hidden">
      {/* Animated route line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {nodes.map((node, index) => {
          if (index < nodes.length - 1) {
            const nextNode = nodes[index + 1];
            const isActive = node.status === 'completed' || node.status === 'current';
            return (
              <line
                key={`line-${node.id}`}
                x1={`${node.position.x}%`}
                y1={`${node.position.y}%`}
                x2={`${nextNode.position.x}%`}
                y2={`${nextNode.position.y}%`}
                stroke={isActive ? 'url(#pathGradient)' : '#e5e7eb'}
                strokeWidth="3"
                strokeDasharray={isActive ? '0' : '5,5'}
                className="transition-all duration-500"
              />
            );
          }
          return null;
        })}
      </svg>

      {/* Navigation nodes */}
      {nodes.map((node) => (
        <button
          key={node.id}
          onClick={() => onNodeClick?.(node.id)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
          style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
          disabled={node.status === 'locked'}
        >
          {/* Glow for current node */}
          {node.status === 'current' && (
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-40 animate-pulse" />
          )}
          
          {/* Node circle */}
          <div className={`relative w-14 h-14 rounded-full ${getNodeColor(node.status)} border-2 flex items-center justify-center shadow-lg transition-all`}>
            {getNodeIcon(node.status)}
          </div>

          {/* Node label */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-32 text-center">
            <p className={`text-xs font-semibold ${node.status === 'locked' ? 'text-gray-400' : 'text-gray-900'}`}>
              {node.title}
            </p>
            {node.skillGain && node.status !== 'locked' && (
              <p className="text-xs text-blue-600 mt-1">+{node.skillGain}% skill</p>
            )}
          </div>

          {/* Recommended tag for next node */}
          {node.status === 'next' && (
            <div className="absolute -top-2 -right-2">
              <div className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-lg animate-bounce">
                Next
              </div>
            </div>
          )}
        </button>
      ))}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-sm rounded-2xl p-3">
        <div className="flex items-center justify-around text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-700">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-700">Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-white border-2 border-blue-400" />
            <span className="text-gray-700">Recommended</span>
          </div>
        </div>
      </div>
    </div>
  );
}
