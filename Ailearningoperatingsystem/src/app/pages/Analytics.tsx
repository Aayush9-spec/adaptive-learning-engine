import { BottomNav } from '../components/BottomNav';
import { AICoachChip } from '../components/AICoachChip';
import { ArrowLeft, TrendingUp, Brain, Clock, Target, Calendar, PlayCircle, RotateCcw, Zap } from 'lucide-react';
import { useNavigate } from 'react-router';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Analytics() {
  const navigate = useNavigate();

  // Mock analytics data
  const skillGrowthData = [
    { date: 'Feb 1', skill: 32 },
    { date: 'Feb 5', skill: 38 },
    { date: 'Feb 10', skill: 42 },
    { date: 'Feb 15', skill: 51 },
    { date: 'Feb 20', skill: 58 },
    { date: 'Feb 25', skill: 67 },
    { date: 'Feb 27', skill: 72 },
  ];

  const effortVsProgressData = [
    { week: 'Week 1', effort: 8, progress: 6 },
    { week: 'Week 2', effort: 10, progress: 12 },
    { week: 'Week 3', effort: 9, progress: 14 },
    { week: 'Week 4', effort: 11, progress: 18 },
  ];

  const efficiencyScoreData = [
    { day: 'Mon', efficiency: 75 },
    { day: 'Tue', efficiency: 82 },
    { day: 'Wed', efficiency: 78 },
    { day: 'Thu', efficiency: 88 },
    { day: 'Fri', efficiency: 85 },
    { day: 'Sat', efficiency: 91 },
    { day: 'Sun', efficiency: 87 },
  ];

  const stats = [
    {
      label: 'Skill Level',
      value: '72',
      unit: '/100',
      change: '+12',
      icon: Brain,
      color: 'blue',
    },
    {
      label: 'Learning Efficiency',
      value: '85%',
      unit: '',
      change: '+8%',
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: 'Total Study Time',
      value: '47.2',
      unit: 'hrs',
      change: '+6.3',
      icon: Clock,
      color: 'purple',
    },
    {
      label: 'Goals Achieved',
      value: '12',
      unit: '/15',
      change: '+3',
      icon: Target,
      color: 'amber',
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
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Learning Analytics</h1>
              <p className="text-sm opacity-90">Your progress insights</p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.slice(0, 2).map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-xs opacity-90 mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-sm opacity-90">{stat.unit}</span>
                </div>
                <p className="text-xs text-green-300 font-semibold mt-1">{stat.change}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Skill Growth Curve */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Skill Growth Curve</h3>
              <p className="text-sm text-gray-600">Last 30 days</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">+40%</p>
              <p className="text-xs text-gray-600">Total growth</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={skillGrowthData}>
              <defs>
                <linearGradient id="skillGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#08BD80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#08BD80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="skill"
                stroke="#08BD80"
                strokeWidth={3}
                fill="url(#skillGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => navigate('/flow')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="text-sm">Improve Now</span>
            </button>
            <button
              onClick={() => navigate('/explainer')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Get Insights</span>
            </button>
          </div>
        </div>

        {/* Effort vs Progress */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Effort vs Progress</h3>
            <p className="text-sm text-gray-600">Efficiency analysis</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={effortVsProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Bar dataKey="effort" fill="#e5e7eb" radius={[8, 8, 0, 0]} />
              <Bar dataKey="progress" fill="#08BD80" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded" />
              <span className="text-sm text-gray-600">Hours Studied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded" />
              <span className="text-sm text-gray-600">Skill Progress</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => navigate('/flow')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="text-sm">Start Session</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Review Topic</span>
            </button>
          </div>
        </div>

        {/* Learning Efficiency Score */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Learning Efficiency</h3>
              <p className="text-sm text-gray-600">This week</p>
            </div>
            <div className="px-3 py-1 bg-green-100 rounded-full">
              <span className="text-sm font-semibold text-green-700">Excellent</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={efficiencyScoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Action CTAs */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => navigate('/gps')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3C4852] text-white rounded-xl font-medium hover:bg-[#2d363d] transition-colors"
            >
              <Target className="w-4 h-4" />
              <span className="text-sm">Optimize My Path</span>
            </button>
          </div>
        </div>

        {/* Predicted Mastery */}
        <div className="bg-gradient-to-br from-[#f0fdf4] to-[#ecfdf5] border border-primary/20 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#3C4852] rounded-2xl flex items-center justify-center">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Predicted Mastery</h3>
              <p className="text-sm text-gray-600">Based on current pace</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Python Intermediate</p>
                  <p className="text-lg font-semibold text-gray-900">March 15, 2026</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">16</p>
                  <p className="text-xs text-gray-600">days</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Backend Developer Ready</p>
                  <p className="text-lg font-semibold text-gray-900">June 28, 2026</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">121</p>
                  <p className="text-xs text-gray-600">days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.slice(2).map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <Icon className={`w-8 h-8 text-${stat.color}-600 mb-2`} />
                <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  <span className="text-sm text-gray-600">{stat.unit}</span>
                </div>
                <p className="text-xs text-green-600 font-semibold mt-1">{stat.change}</p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Persistent AI Coach Chip */}
      <AICoachChip onClick={() => navigate('/')} />

      <BottomNav />
    </div>
  );
}