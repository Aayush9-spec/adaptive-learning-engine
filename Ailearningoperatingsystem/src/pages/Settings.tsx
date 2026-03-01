import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Zap,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Save,
  LogOut,
  AlertTriangle,
  Shield,
  CheckCircle,
  Smartphone,
  ChevronDown,
  Toggle2,
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  examType: string;
  targetExamDate: string;
}

interface StudyConfig {
  dailyStudyHours: number;
  preferredStudyTime: 'morning' | 'evening' | 'night';
  studyDays: number[];
}

interface NotificationSettings {
  emailReminders: boolean;
  revisionReminders: boolean;
  performanceAlerts: boolean;
}

// Mock Data
const mockUserProfile: UserProfile = {
  name: 'Rahul Kumar',
  email: 'rahul.kumar@example.com',
  examType: 'JEE Advanced',
  targetExamDate: '2026-06-01',
};

const mockStudyConfig: StudyConfig = {
  dailyStudyHours: 4,
  preferredStudyTime: 'morning',
  studyDays: [1, 2, 3, 4, 5, 6],
};

const mockNotifications: NotificationSettings = {
  emailReminders: true,
  revisionReminders: true,
  performanceAlerts: true,
};

const mockSubscriptionInfo = {
  tier: 'Pro',
  dailyLimit: 50,
  remainingCalls: 42,
};

// Profile Section
const ProfileSection: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Show success toast
    }, 600);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <User className="w-6 h-6 text-blue-400" />
        Profile Information
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-blue-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all duration-300"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-4 py-3 rounded-lg bg-slate-700/30 border border-blue-500/10 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support to modify.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Exam Type</label>
            <select
              value={profile.examType}
              onChange={(e) => setProfile({ ...profile, examType: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-blue-500/20 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all duration-300 cursor-pointer"
            >
              <option>JEE Advanced</option>
              <option>JEE Main</option>
              <option>NEET UG</option>
              <option>CUET</option>
              <option>KVPY</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Target Exam Date</label>
            <input
              type="date"
              value={profile.targetExamDate}
              onChange={(e) => setProfile({ ...profile, targetExamDate: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-blue-500/20 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all duration-300"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-blue-700 disabled:to-cyan-700 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

// Study Configuration Section
const StudyConfigSection: React.FC = () => {
  const [config, setConfig] = useState<StudyConfig>(mockStudyConfig);

  const daysOfWeek = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 0 },
  ];

  const toggleDay = (day: number) => {
    setConfig({
      ...config,
      studyDays: config.studyDays.includes(day) ? config.studyDays.filter((d) => d !== day) : [...config.studyDays, day],
    });
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Clock className="w-6 h-6 text-purple-400" />
        Study Configuration
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">Daily Study Time</label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              max="12"
              value={config.dailyStudyHours}
              onChange={(e) => setConfig({ ...config, dailyStudyHours: parseInt(e.target.value) })}
              className="w-24 px-4 py-3 rounded-lg bg-slate-700/50 border border-blue-500/20 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all duration-300"
            />
            <span className="text-gray-400">hours per day</span>
            <div className="ml-auto px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium">
              {config.dailyStudyHours * 7} hours/week
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">Preferred Study Time</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'morning', label: '🌅 Morning', time: 'morning' },
              { id: 'evening', label: '🌆 Evening', time: 'evening' },
              { id: 'night', label: '🌙 Night', time: 'night' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setConfig({ ...config, preferredStudyTime: option.time as any })}
                className={`py-3 px-4 rounded-lg font-medium transition-all duration-300 border ${
                  config.preferredStudyTime === option.time
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-500/50 text-white'
                    : 'bg-slate-700/50 border-blue-500/20 text-gray-300 hover:border-blue-500/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">Study Days</label>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {daysOfWeek.map((day) => (
              <button
                key={day.value}
                onClick={() => toggleDay(day.value)}
                className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-300 border ${
                  config.studyDays.includes(day.value)
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-500/50 text-white'
                    : 'bg-slate-700/50 border-blue-500/20 text-gray-400 hover:border-blue-500/50'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">Selected {config.studyDays.length} days per week</p>
        </div>

        <button className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />
          Save Study Schedule
        </button>
      </div>
    </div>
  );
};

// AI Behavior Settings
const AIBehaviorSection: React.FC = () => {
  const [aiLevel, setAiLevel] = useState('balanced');
  const [difficulty, setDifficulty] = useState('medium');
  const [diagramMode, setDiagramMode] = useState(true);
  const [strategyMode, setStrategyMode] = useState(true);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Zap className="w-6 h-6 text-yellow-400" />
        AI Behavior Settings
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">AI Assistance Level</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'low', label: '📿 Low', description: 'Minimal hints, max learning' },
              { id: 'balanced', label: '⚖️ Balanced', description: 'Smart assistance' },
              { id: 'intensive', label: '🚀 Intensive', description: 'Maximum guidance' },
            ].map((level) => (
              <button
                key={level.id}
                onClick={() => setAiLevel(level.id)}
                className={`p-4 rounded-lg border transition-all duration-300 text-left ${
                  aiLevel === level.id
                    ? 'bg-gradient-to-br from-blue-600/40 to-cyan-600/40 border-blue-500/50'
                    : 'bg-slate-700/30 border-blue-500/20 hover:border-blue-500/50'
                }`}
              >
                <p className="font-semibold text-white">{level.label}</p>
                <p className="text-xs text-gray-400 mt-1">{level.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">Question Difficulty Preference</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-blue-500/20 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all duration-300 cursor-pointer"
          >
            <option value="easy">Easy - Build fundamentals</option>
            <option value="medium">Medium - Balance approach</option>
            <option value="hard">Hard - Challenge myself</option>
            <option value="adaptive">Adaptive - AI decides</option>
          </select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <span className="text-white font-bold">📊</span>
              </div>
              <div>
                <p className="font-semibold text-white">Enable Diagram Mode</p>
                <p className="text-xs text-gray-400">Get visual explanations for concepts</p>
              </div>
            </div>
            <button
              onClick={() => setDiagramMode(!diagramMode)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${diagramMode ? 'bg-green-600' : 'bg-gray-600'}`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${diagramMode ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <span className="text-white font-bold">🎯</span>
              </div>
              <div>
                <p className="font-semibold text-white">Enable Strategy Planning</p>
                <p className="text-xs text-gray-400">Get personalized learning strategies</p>
              </div>
            </div>
            <button
              onClick={() => setStrategyMode(!strategyMode)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${strategyMode ? 'bg-green-600' : 'bg-gray-600'}`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${strategyMode ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>
        </div>

        <button className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />
          Save AI Settings
        </button>
      </div>
    </div>
  );
};

// AI Usage Summary
const AIUsageSummary: React.FC = () => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
      <Zap className="w-6 h-6 text-blue-400" />
      AI Usage Summary
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-6 rounded-xl bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30">
        <p className="text-sm text-gray-400 mb-2">Current Plan</p>
        <p className="text-3xl font-bold text-cyan-300">{mockSubscriptionInfo.tier}</p>
        <p className="text-xs text-gray-500 mt-2">Active subscription</p>
      </div>

      <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/30">
        <p className="text-sm text-gray-400 mb-2">Daily Limit</p>
        <p className="text-3xl font-bold text-purple-300">{mockSubscriptionInfo.dailyLimit}</p>
        <p className="text-xs text-gray-500 mt-2">AI calls per day</p>
      </div>

      <div className="p-6 rounded-xl bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30">
        <p className="text-sm text-gray-400 mb-2">Remaining Today</p>
        <p className="text-3xl font-bold text-green-300">{mockSubscriptionInfo.remainingCalls}</p>
        <p className="text-xs text-gray-500 mt-2">calls available</p>
      </div>
    </div>

    <button className="w-full mt-6 px-6 py-3 rounded-lg border border-blue-500/30 hover:border-blue-500/60 text-white hover:bg-blue-500/10 font-semibold transition-all duration-300">
      Upgrade Your Plan
    </button>
  </div>
);

// Notification Settings
const NotificationSection: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationSettings>(mockNotifications);

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Bell className="w-6 h-6 text-orange-400" />
        Notification Settings
      </h2>

      <div className="space-y-4">
        {[
          {
            key: 'emailReminders',
            label: 'Email Reminders',
            description: 'Daily study reminders and tips',
            icon: '📧',
          },
          {
            key: 'revisionReminders',
            label: 'Revision Reminders',
            description: 'Smart reminders for concept revision',
            icon: '🔄',
          },
          {
            key: 'performanceAlerts',
            label: 'Performance Alerts',
            description: 'Get notified about progress drops',
            icon: '📈',
          },
        ].map((setting) => (
          <div key={setting.key} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-lg">
                {setting.icon}
              </div>
              <div>
                <p className="font-semibold text-white">{setting.label}</p>
                <p className="text-xs text-gray-400">{setting.description}</p>
              </div>
            </div>
            <button
              onClick={() => toggleNotification(setting.key as keyof NotificationSettings)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                notifications[setting.key as keyof NotificationSettings] ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                  notifications[setting.key as keyof NotificationSettings] ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2">
        <Save className="w-5 h-5" />
        Save Notification Preferences
      </button>
    </div>
  );
};

// Security Section
const SecuritySection: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Lock className="w-6 h-6 text-blue-400" />
          Change Password
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-blue-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all duration-300"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-blue-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all duration-300"
              />
              <button
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            Update Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Shield className="w-6 h-6 text-green-400" />
          Two-Factor Authentication
        </h2>

        <p className="text-gray-400 mb-6">
          Add an extra layer of security to your account with two-factor authentication using an authenticator app or SMS.
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-blue-500/20">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-semibold text-white">Authentication App (Google Authenticator, Authy)</p>
                <p className="text-xs text-gray-400 mt-1">Most secure 2FA method</p>
              </div>
            </div>
            <button
              onClick={() => setTwoFAEnabled(!twoFAEnabled)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${twoFAEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${twoFAEnabled ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>
        </div>

        {twoFAEnabled && (
          <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-300 mb-2">2FA Enabled</p>
                <p className="text-sm text-gray-400">
                  Your account is now protected with two-factor authentication. Store your backup codes in a safe place.
                </p>
                <button className="mt-3 text-green-400 hover:text-green-300 text-sm font-medium">View Backup Codes</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl bg-gradient-to-br from-red-900/20 to-slate-900/40 border border-red-500/30 p-8 backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6" />
          Danger Zone
        </h2>

        <p className="text-gray-400 mb-6">
          These actions are irreversible. Please proceed with caution.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full px-6 py-3 rounded-lg border border-red-500/50 hover:border-red-500/80 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            Delete Account
          </button>
        ) : (
          <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/40">
            <p className="text-red-300 font-semibold mb-4">
              Are you sure? This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-500/30 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">
                Permanently Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Settings Component
export const Settings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-5" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-blue-500/20 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold mb-1">Settings</h1>
            <p className="text-gray-400">Manage your profile, preferences, and security</p>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          <ProfileSection />
          <StudyConfigSection />
          <AIBehaviorSection />
          <AIUsageSummary />
          <NotificationSection />
          <SecuritySection />

          {/* Footer */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-900/20 via-slate-900/40 to-slate-900/40 border border-blue-500/20 p-6 text-center backdrop-blur-xl">
            <p className="text-sm text-gray-400 mb-4">
              Need help with your settings?{' '}
              <a href="#" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Contact Support
              </a>
            </p>
            <button className="px-4 py-2 rounded-lg border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 font-medium transition-all duration-300 flex items-center justify-center gap-2 mx-auto">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
