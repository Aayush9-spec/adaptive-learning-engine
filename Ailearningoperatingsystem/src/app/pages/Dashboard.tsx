import { BottomNav } from '../components/BottomNav';
import { Footer } from '../components/Footer';
import { MasteryHeatmap } from '../components/MasteryHeatmap';
import { AIStrategyPanel } from '../components/AIStrategyPanel';
import { LearningPathVisualization } from '../components/LearningPathVisualization';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import {
  Search,
  Sparkles,
  ChevronRight,
  Target,
  Brain,
  Clock,
  ArrowRight,
  BookOpen,
  Play,
  Users,
  Flame,
  Star,
  Trophy,
  Zap,
  Bot,
  TrendingUp,
  GraduationCap,
  MessageCircle,
} from 'lucide-react';
import { useState } from 'react';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { key: 'home', label: 'Get Started' },
    { key: 'courses', label: 'My Courses' },
    { key: 'live', label: 'Live Classes' },
    { key: 'tests', label: 'Tests & Quizzes' },
    { key: 'ai', label: 'AI Tutor' },
  ];

  // Mock data
  const nextAction = {
    title: 'Learn Python Functions',
    topic: 'Advanced function concepts and lambda expressions',
    expectedGain: 12,
    timeToSkill: '3.2 days',
    confidence: 94,
  };

  const liveClasses = [
    { title: 'Binary Trees — Advanced Concepts', educator: 'Prof. Rajesh Kumar', time: 'Now', viewers: 1240, isLive: true, subject: 'DSA' },
    { title: 'Dynamic Programming Patterns', educator: 'Dr. Priya Sharma', time: '4:00 PM', viewers: 0, isLive: false, subject: 'Algorithms' },
    { title: 'System Design Basics', educator: 'Vikram Mehta', time: '6:30 PM', viewers: 0, isLive: false, subject: 'System Design' },
  ];

  const trendingCourses = [
    { title: 'Complete Python Bootcamp', educator: 'Dr. Priya Sharma', rating: 4.9, students: '12K+', lessons: 156, tag: 'Bestseller' },
    { title: 'Data Structures & Algorithms', educator: 'Prof. Rajesh Kumar', rating: 4.8, students: '8.9K+', lessons: 210, tag: 'Popular' },
    { title: 'Machine Learning Masterclass', educator: 'Dr. Ananya Verma', rating: 4.7, students: '6.3K+', lessons: 124, tag: 'New' },
  ];

  const masteryData = [
    { concept: 'Limits', mastery: 80 },
    { concept: 'Continuity', mastery: 62 },
    { concept: 'Differentiation', mastery: 42 },
    { concept: 'Applications of Derivatives', mastery: 25 },
    { concept: 'Integration', mastery: 20 },
  ];

  const strategyPlan = [
    'Day 1-2: Fix continuity and derivative rule confusion.',
    'Day 3: Solve 20 medium differentiation applications.',
    'Day 4: Start integration with guided examples and traps.',
    'Day 5: Timed mixed test and error review notebook update.',
  ];

  const dependencyNodes = [
    { id: 1, title: 'Limits', status: 'completed' as const, position: { x: 12, y: 20 }, skillGain: 8 },
    { id: 2, title: 'Continuity', status: 'current' as const, position: { x: 32, y: 38 }, skillGain: 9 },
    { id: 3, title: 'Differentiation', status: 'next' as const, position: { x: 52, y: 52 }, skillGain: 12 },
    { id: 4, title: 'Applications', status: 'locked' as const, position: { x: 74, y: 40 }, skillGain: 10 },
    { id: 5, title: 'Integration', status: 'locked' as const, position: { x: 88, y: 62 }, skillGain: 11 },
  ];

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8 lg:pl-64">
      {/* Top Header Bar — Unacademy Style */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row: Logo + Search + Profile */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {user?.goal || 'AI Learning OS'}
                </span>
                <ChevronRight className="w-3 h-3 text-muted-foreground rotate-90" />
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search courses, topics, and educators"
                  className="w-full h-10 pl-10 pr-4 bg-muted/60 rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none border border-border/50 transition-all"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <span className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
                <MessageCircle className="w-3.5 h-3.5 text-primary" />
                Talk to AI Tutor
              </span>
              <button
                onClick={() => navigate('/profile')}
                className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary"
              >
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </button>
            </div>
          </div>

          {/* Tab Navigation — Unacademy Style */}
          <div className="flex gap-0 -mb-px overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key === 'ai') navigate('/tutor');
                }}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.key
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Welcome / Next Action Banner — Like Unacademy's congrats card */}
        <div className="bg-gradient-to-r from-[#f0fdf4] to-[#ecfdf5] border border-primary/15 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-12 translate-x-12" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E6853E] uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" />
                AI RECOMMENDATION
              </span>
              <h2 className="text-xl font-bold text-foreground mb-1">{nextAction.title}</h2>
              <p className="text-sm text-muted-foreground">{nextAction.topic}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{nextAction.expectedGain}% skill gain
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {nextAction.timeToSkill}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {nextAction.confidence}% confidence
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/explainer')}
                className="px-5 py-2.5 bg-white border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Why this?
              </button>
              <button
                onClick={() => navigate('/flow')}
                className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                Start learning
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row — Like Unacademy's metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Flame, label: 'Day Streak', value: '14', color: '#ef4444', bg: '#fef2f2' },
            { icon: Clock, label: 'Hours This Week', value: '12.5', color: '#08BD80', bg: '#f0fdf4' },
            { icon: Trophy, label: 'Achievements', value: '12', color: '#E6853E', bg: '#fff7ed' },
            { icon: Target, label: 'Skill Level', value: '72/100', color: '#7c3aed', bg: '#f5f3ff' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-border/60 rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Intelligence */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Learning Intelligence</h2>
            <button
              onClick={() => navigate('/analytics')}
              className="text-sm text-primary font-medium hover:underline"
            >
              View Full Analytics
            </button>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <MasteryHeatmap data={masteryData} />
            </div>
            <AIStrategyPanel readiness={68} risk="Medium" plan={strategyPlan} />
          </div>
        </section>

        {/* Concept Dependency Graph */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Concept Dependency Graph</h2>
            <p className="text-xs text-muted-foreground">Syllabus-aware progression map</p>
          </div>
          <LearningPathVisualization nodes={dependencyNodes} />
        </section>

        {/* Watch Free Online Classes — Unacademy's Live Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Watch free online classes</h2>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  Chat live with educators
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Attempt interactive polls
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  Get your doubts cleared
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['👨‍🏫', '👩‍🏫', '👨‍💻'].map((emoji, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-muted border-2 border-white flex items-center justify-center text-sm">
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">16.9K learners</p>
                <p className="text-[10px] text-muted-foreground">watched a class today</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {liveClasses.map((cls, i) => (
              <div
                key={i}
                className="bg-white border border-border/60 rounded-xl p-4 hover:shadow-sm transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cls.isLive ? 'bg-red-50' : 'bg-muted/50'}`}>
                    {cls.isLive ? (
                      <div className="relative">
                        <Play className="w-5 h-5 text-destructive fill-destructive" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                      </div>
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-semibold bg-muted px-2 py-0.5 rounded text-muted-foreground">{cls.subject}</span>
                      {cls.isLive && (
                        <span className="text-[10px] font-bold text-destructive bg-red-50 px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{cls.title}</h3>
                    <p className="text-xs text-muted-foreground">{cls.educator} • {cls.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {cls.isLive && cls.viewers > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {cls.viewers.toLocaleString()}
                    </span>
                  )}
                  <button
                    onClick={() => navigate('/flow')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cls.isLive
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-muted text-foreground hover:bg-muted-foreground/10'
                      }`}
                  >
                    {cls.isLive ? 'Join Now' : 'Set Reminder'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Courses */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Trending Courses</h2>
            <button
              onClick={() => navigate('/explore')}
              className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendingCourses.map((course, i) => (
              <div
                key={i}
                className="bg-white border border-border/60 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Color accent bar */}
                <div className="h-1.5 bg-primary" />

                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {course.tag}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-semibold">{course.rating}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground text-sm mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-muted-foreground mb-4">{course.educator}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {course.students}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {course.lessons} lessons
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Target, label: 'Learning GPS', desc: 'Your optimal path', color: '#08BD80', onClick: () => navigate('/gps') },
              { icon: Brain, label: 'Flow Mode', desc: 'Deep focus session', color: '#7c3aed', onClick: () => navigate('/flow') },
              { icon: Bot, label: 'AI Tutor', desc: 'Ask anything', color: '#E6853E', onClick: () => navigate('/tutor') },
              { icon: TrendingUp, label: 'Analytics', desc: 'Track progress', color: '#0ea5e9', onClick: () => navigate('/analytics') },
            ].map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className="bg-white border border-border/60 rounded-xl p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${action.color}12` }}
                >
                  <action.icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{action.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-gradient-to-r from-primary to-[#05A672] rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Continue your learning journey</h2>
              <p className="text-white/70 text-sm">AI personalized paths get you to mastery 3x faster</p>
            </div>
            <button
              onClick={() => navigate('/gps')}
              className="bg-white text-primary font-semibold px-6 py-2.5 rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 text-sm shadow-lg"
            >
              Go to Learning GPS
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Floating AI Doubts Button — Like Unacademy */}
      <button
        onClick={() => navigate('/tutor')}
        className="fixed bottom-24 lg:bottom-8 right-6 z-40 bg-[#1a1a2e] text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">AI Doubts</span>
      </button>

      <Footer />

      <BottomNav />
    </div>
  );
}
