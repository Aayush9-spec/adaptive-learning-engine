import { useState, useEffect } from 'react';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import {
  User,
  Target,
  Zap,
  Award,
  Settings,
  ChevronRight,
  Trophy,
  Star,
  Flame,
  LogOut,
  Edit3,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Bell,
  HelpCircle,
  Shield,
  X,
  Check,
  Crown,
  TrendingUp,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';

export function Profile() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGoal, setEditGoal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'achievements' | 'settings'>('overview');

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditGoal(user.goal || '');
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('ai_learning_os_token');
      if (token) {
        const apiBase = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';
        await fetch(`${apiBase}/auth/me`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: editName, goal: editGoal }),
        });
      }
      setIsEditing(false);
      // Reload to refresh user data
      window.location.reload();
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const goals = [
    'JEE Main & Advanced', 'NEET UG', 'UPSC Civil Services', 'SSC Exams',
    'Coding & Development', 'Data Science & AI', 'Gate', 'CAT & MBA', 'Other',
  ];

  // Mock stats — in production from backend
  const stats = {
    streak: 14,
    totalHours: 127,
    coursesCompleted: 8,
    skillLevel: 72,
    testsAttempted: 34,
    averageScore: 78,
  };

  const achievements = [
    { icon: Trophy, title: 'Speed Learner', desc: 'Completed 10 topics in record time', earned: true, color: '#f59e0b' },
    { icon: Star, title: 'Perfect Week', desc: '7 days of consistent learning', earned: true, color: '#2d5bff' },
    { icon: Flame, title: 'Momentum Master', desc: 'Maintained 80+ momentum for 14 days', earned: true, color: '#ef4444' },
    { icon: Target, title: 'Goal Crusher', desc: 'Achieved 5 major milestones', earned: false, color: '#10b981' },
    { icon: BookOpen, title: 'Bookworm', desc: 'Read 50 study materials', earned: false, color: '#7c3aed' },
    { icon: Award, title: 'Top 10%', desc: 'Scored in top 10% of test takers', earned: false, color: '#0ea5e9' },
  ];

  const skillAreas = [
    { name: 'Core Concepts', level: 82, color: '#2d5bff' },
    { name: 'Problem Solving', level: 68, color: '#7c3aed' },
    { name: 'Practice Tests', level: 74, color: '#10b981' },
    { name: 'Speed & Accuracy', level: 56, color: '#f59e0b' },
  ];

  if (!user) return null;

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { key: 'achievements' as const, label: 'Achievements', icon: Trophy },
    { key: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8 lg:pl-64">
      {/* Profile Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-[#7c3aed]/15 rounded-full blur-[60px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary to-[#05A672] rounded-3xl flex items-center justify-center shadow-xl shadow-primary/30 text-white text-3xl lg:text-4xl font-bold">
                {getInitials(user.name)}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">{user.name}</h1>
                <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span>+91 {user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 bg-secondary/20 border border-secondary/30 text-secondary px-3 py-1 rounded-full text-xs font-semibold">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {user.goal || 'No goal set'}
                  </span>
                  {user.created_at && (
                    <span className="inline-flex items-center gap-1 text-white/40 text-xs">
                      <Calendar className="w-3 h-3" />
                      Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium transition-all border border-white/10"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mt-8">
            {[
              { icon: Flame, label: 'Day Streak', value: stats.streak, color: '#ef4444' },
              { icon: Clock, label: 'Hours Learned', value: stats.totalHours, color: '#2d5bff' },
              { icon: BookOpen, label: 'Courses Done', value: stats.coursesCompleted, color: '#10b981' },
              { icon: TrendingUp, label: 'Skill Level', value: stats.skillLevel, color: '#7c3aed' },
              { icon: Target, label: 'Tests Taken', value: stats.testsAttempted, color: '#f59e0b' },
              { icon: Award, label: 'Avg Score', value: `${stats.averageScore}%`, color: '#0ea5e9' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.08] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-3 text-center group hover:bg-white/[0.12] transition-all">
                <stat.icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: stat.color }} />
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${activeSection === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Tab */}
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Current Goal Card */}
              <div className="bg-gradient-to-r from-primary to-[#4169ff] rounded-3xl p-6 text-white shadow-xl shadow-primary/15 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      <span className="text-sm font-medium text-white/80">Current Goal</span>
                    </div>
                    <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
                      Change Goal
                    </button>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{user.goal || 'Set a learning goal'}</h3>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/80">Overall Progress</span>
                    <span className="font-semibold">45%</span>
                  </div>
                  <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.5)]" style={{ width: '45%' }} />
                  </div>
                </div>
              </div>

              {/* Skill Areas */}
              <div className="bg-card/90 backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-foreground text-lg">Skill Breakdown</h3>
                  <button className="text-sm text-primary font-medium hover:underline">View Detailed</button>
                </div>
                <div className="space-y-5">
                  {skillAreas.map((skill, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{skill.name}</span>
                        <span className="text-sm font-bold" style={{ color: skill.color }}>{skill.level}/100</span>
                      </div>
                      <div className="h-2.5 bg-muted/60 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${skill.level}%`, backgroundColor: skill.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card/90 backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                <h3 className="font-semibold text-foreground text-lg mb-5">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { action: 'Completed lesson', subject: 'Python Functions & Lambda', time: '2 hours ago', icon: BookOpen, color: '#10b981' },
                    { action: 'Passed test', subject: 'Data Structures Quiz — 85%', time: '5 hours ago', icon: Award, color: '#2d5bff' },
                    { action: 'Started course', subject: 'Advanced Algorithms', time: 'Yesterday', icon: Sparkles, color: '#7c3aed' },
                    { action: 'Earned badge', subject: 'Perfect Week — 7 day streak!', time: '2 days ago', icon: Trophy, color: '#f59e0b' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${activity.color}15` }}>
                        <activity.icon className="w-5 h-5" style={{ color: activity.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.subject}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Subscription Card */}
              <div className="bg-gradient-to-br from-primary to-[#05A672] rounded-3xl p-6 text-white shadow-xl shadow-primary/15 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-y-6 translate-x-6" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Free Plan</span>
                  </div>
                  <p className="text-lg font-bold mb-1">Upgrade to Pro</p>
                  <p className="text-sm text-white/70 mb-4">Get unlimited access to all courses and features</p>
                  <button className="w-full bg-white text-[#059669] font-semibold py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm">
                    Upgrade Now
                  </button>
                </div>
              </div>

              {/* Quick Achievements */}
              <div className="bg-card/90 backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Badges</h3>
                  <button onClick={() => setActiveSection('achievements')} className="text-sm text-primary font-medium hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {achievements.slice(0, 6).map((a, i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-center p-3 rounded-2xl transition-all ${a.earned ? 'bg-muted/50 hover:bg-muted' : 'bg-muted/20 opacity-40'
                        }`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5"
                        style={{ backgroundColor: a.earned ? `${a.color}15` : '#f1f5f9' }}
                      >
                        <a.icon className="w-5 h-5" style={{ color: a.earned ? a.color : '#94a3b8' }} />
                      </div>
                      <span className="text-[10px] font-medium text-center text-muted-foreground leading-tight">{a.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Streak */}
              <div className="bg-card/90 backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-5 h-5 text-destructive" />
                  <h3 className="font-semibold text-foreground">Learning Streak</h3>
                </div>
                <div className="text-center mb-4">
                  <p className="text-5xl font-bold text-foreground">{stats.streak}</p>
                  <p className="text-sm text-muted-foreground">days in a row</p>
                </div>
                <div className="flex justify-center gap-1">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${i < 7 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeSection === 'achievements' && (
          <div className="space-y-6">
            <div className="bg-card/90 backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
              <h3 className="font-semibold text-foreground text-lg mb-2">Your Achievements</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {achievements.filter(a => a.earned).length} of {achievements.length} badges earned
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((a, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl p-5 border transition-all ${a.earned
                      ? 'bg-card border-border/50 hover:shadow-md'
                      : 'bg-muted/30 border-border/20 opacity-60'
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: a.earned ? `${a.color}15` : '#f1f5f9' }}
                      >
                        <a.icon className="w-6 h-6" style={{ color: a.earned ? a.color : '#94a3b8' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{a.title}</h4>
                        <p className="text-xs text-muted-foreground">{a.desc}</p>
                      </div>
                    </div>
                    {a.earned ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-secondary">
                        <Check className="w-3.5 h-3.5" />
                        Earned
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">🔒 Keep learning to unlock</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeSection === 'settings' && (
          <div className="max-w-2xl space-y-4">
            {[
              { icon: Target, label: 'Learning Goals', desc: 'Set and manage your learning goals', color: '#2d5bff' },
              { icon: Zap, label: 'AI Preferences', desc: 'Customize AI coaching behavior', color: '#7c3aed' },
              { icon: Bell, label: 'Notifications', desc: 'Manage reminder and alert preferences', color: '#f59e0b' },
              { icon: Award, label: 'Certificates', desc: 'Download your earned certificates', color: '#10b981' },
              { icon: Shield, label: 'Privacy & Security', desc: 'Manage password and privacy settings', color: '#0ea5e9' },
              { icon: HelpCircle, label: 'Help & Support', desc: 'FAQs, contact support, feedback', color: '#64748b' },
            ].map((item, i) => (
              <button
                key={i}
                className="w-full flex items-center justify-between p-5 bg-card/90 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}12` }}>
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}

            <Separator className="my-6" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 p-5 bg-destructive/5 hover:bg-destructive/10 rounded-2xl border border-destructive/20 transition-all group"
            >
              <div className="w-11 h-11 bg-destructive/10 rounded-xl flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <div className="text-left">
                <span className="font-medium text-destructive">Log Out</span>
                <p className="text-xs text-destructive/60 mt-0.5">Sign out of your account</p>
              </div>
            </button>
          </div>
        )}
      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted hover:bg-muted-foreground/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-bold text-foreground mb-6">Edit Profile</h2>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm">Full Name</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-11 rounded-xl"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Email</Label>
                <Input
                  value={user.email}
                  disabled
                  className="h-11 rounded-xl bg-muted/50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Learning Goal</Label>
                <select
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                  className="w-full h-11 rounded-xl bg-muted/30 border border-border/40 px-3.5 text-sm text-foreground focus:border-primary focus:ring-[3px] focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select your goal</option>
                  {goals.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 h-11 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
