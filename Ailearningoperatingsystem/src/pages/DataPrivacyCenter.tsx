import React, { useState } from 'react';
import {
  Database,
  Lock,
  Download,
  AlertTriangle,
  Shield,
  Eye,
  Zap,
  Server,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileJson,
  Trash2,
  Info,
} from 'lucide-react';

interface UsageRecord {
  id: string;
  date: string;
  feature: string;
  aiCallsUsed: number;
  duration: string;
}

interface DataPoint {
  category: string;
  description: string;
  icon: React.ReactNode;
}

// Mock Data
const usageHistory: UsageRecord[] = [
  {
    id: '1',
    date: 'March 1, 2026',
    feature: 'AI Question Generator',
    aiCallsUsed: 5,
    duration: '8 min',
  },
  {
    id: '2',
    date: 'February 28, 2026',
    feature: 'Concept Learning with Diagrams',
    aiCallsUsed: 3,
    duration: '12 min',
  },
  {
    id: '3',
    date: 'February 28, 2026',
    feature: 'Learning Memory Analysis',
    aiCallsUsed: 2,
    duration: '5 min',
  },
  {
    id: '4',
    date: 'February 27, 2026',
    feature: 'AI Strategy Planner',
    aiCallsUsed: 4,
    duration: '10 min',
  },
  {
    id: '5',
    date: 'February 27, 2026',
    feature: 'Performance Prediction',
    aiCallsUsed: 1,
    duration: '3 min',
  },
];

const dataCollected: DataPoint[] = [
  {
    category: 'Learning Progress',
    description: 'Concepts studied, mastery scores, quiz performance, time spent on topics',
    icon: <Zap className="w-6 h-6" />,
  },
  {
    category: 'Performance Metrics',
    description: 'Accuracy rates, response times, strength/weakness patterns, learning velocity',
    icon: <Database className="w-6 h-6" />,
  },
  {
    category: 'AI Interaction Logs',
    description: 'Questions asked, AI explanations generated, feedback provided, preferences set',
    icon: <Eye className="w-6 h-6" />,
  },
  {
    category: 'Account Information',
    description: 'Profile details, exam type, target date, subscription tier, preferences',
    icon: <Shield className="w-6 h-6" />,
  },
];

// Data Overview Section
const DataOverviewSection: React.FC = () => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
      <Database className="w-6 h-6 text-blue-400" />
      What Data We Store
    </h2>
    <p className="text-gray-400 mb-6">
      We collect minimal, essential data to provide personalized learning experiences. Here's what we store:
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {dataCollected.map((item, idx) => (
        <div
          key={idx}
          className="p-6 rounded-xl bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
              {item.icon}
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{item.category}</h3>
              <p className="text-sm text-gray-400">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
      <p className="text-sm text-blue-300">
        <span className="font-semibold">📋 Note:</span> All personal data is protected with encryption. We never sell
        your data to third parties.
      </p>
    </div>
  </div>
);

// AI Transparency Section
const AITransparencySection: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const aiMethods = [
    {
      title: '🤖 How AI Generates Explanations',
      description:
        'Our AI model analyzes concepts and learning patterns to create contextual, step-by-step explanations tailored to your learning level.',
      details: [
        'Uses transformer-based language models trained on educational content',
        'Adapts explanations based on your historical performance and learning pace',
        'Integrates with our knowledge graphs for accuracy verification',
        'Provides citations and references for transparency',
      ],
    },
    {
      title: '❓ How Question Generation Works',
      description:
        'Questions are dynamically generated based on concepts, difficulty levels, and your proven weak areas.',
      details: [
        'Analyzes concept relationships and prerequisite knowledge',
        'Generates questions at appropriate difficulty levels',
        'Ensures variety: conceptual, application, trap questions, and diagram-based',
        'Validates questions against learning objectives and exam patterns',
      ],
    },
    {
      title: '📊 How Performance Prediction is Calculated',
      description:
        'Our engine uses machine learning to predict exam performance based on learning patterns and progress.',
      details: [
        'Analyzes historical performance across all studied concepts',
        'Considers time spent, revision patterns, and improvement velocity',
        'Factors in exam-specific difficulty indicators',
        'Provides confidence intervals for transparency',
      ],
    },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
        <Eye className="w-6 h-6 text-purple-400" />
        AI Transparency & How It Works
      </h2>
      <p className="text-gray-400 mb-6">
        We believe in transparent AI. Here's exactly how our AI systems work:
      </p>

      <div className="space-y-3 mb-6">
        {aiMethods.map((method, idx) => (
          <div key={idx} className="border border-blue-500/20 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              className="w-full p-4 bg-slate-700/30 hover:bg-slate-700/50 flex items-center justify-between transition-all duration-300"
            >
              <h3 className="font-semibold text-white text-left">{method.title}</h3>
              {expandedIndex === idx ? (
                <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </button>

            {expandedIndex === idx && (
              <div className="bg-slate-800/20 p-4 border-t border-blue-500/20">
                <p className="text-gray-400 text-sm mb-4">{method.description}</p>
                <ul className="space-y-2">
                  {method.details.map((detail, detailIdx) => (
                    <li key={detailIdx} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                      <span className="text-sm text-gray-300">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
        <p className="text-sm text-yellow-300 mb-2">
          <span className="font-semibold">⚠️ Generative AI Disclaimer:</span>
        </p>
        <p className="text-sm text-gray-400">
          Our AI system generates educational content based on learned patterns. While we validate outputs for accuracy,
          rare errors may occur. Always verify critical information and consult official exam materials. AI-generated
          content is supplementary to, not a replacement for, authoritative educational resources.
        </p>
      </div>
    </div>
  );
};

// Download Data Section
const DownloadDataSection: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = (format: 'json' | 'csv') => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      // Trigger download
    }, 1000);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
        <Download className="w-6 h-6 text-green-400" />
        Download Your Data
      </h2>
      <p className="text-gray-400 mb-6">
        You have the right to download all your personal data in a portable format. Export includes learning progress,
        performance metrics, and profile information.
      </p>

      <div className="bg-slate-700/30 border border-blue-500/20 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white mb-2">Export Includes:</p>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>✓ Complete learning journey and progress history</li>
              <li>✓ Concept mastery scores and performance analytics</li>
              <li>✓ All AI interactions and generated content</li>
              <li>✓ Account preferences and settings</li>
              <li>✓ Subscription and billing information</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleDownload('json')}
          disabled={isDownloading}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-green-700 disabled:to-emerald-700 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
        >
          <FileJson className="w-5 h-5" />
          {isDownloading ? 'Exporting...' : 'Export as JSON'}
        </button>

        <button
          onClick={() => handleDownload('csv')}
          disabled={isDownloading}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-blue-700 disabled:to-cyan-700 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          {isDownloading ? 'Exporting...' : 'Export as CSV'}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Export typically completes within 5-10 minutes. A download link will be sent to your email.
      </p>
    </div>
  );
};

// Delete Data Section
const DeleteDataSection: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-red-900/20 to-slate-900/40 border border-red-500/30 p-8 backdrop-blur-xl">
      <h2 className="text-2xl font-bold text-red-400 mb-2 flex items-center gap-3">
        <AlertTriangle className="w-6 h-6" />
        Delete Account & All Data
      </h2>
      <p className="text-gray-400 mb-6">
        This action is permanent and cannot be undone. All your learning data, preferences, and account information will
        be permanently deleted from our servers.
      </p>

      <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-6 mb-6">
        <p className="font-semibold text-red-300 mb-3">⚠️ Before you delete:</p>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>✗ All learning progress will be lost</li>
          <li>✗ Your subscription will be canceled</li>
          <li>✗ Access to all features will be revoked immediately</li>
          <li>✗ This cannot be reversed</li>
        </ul>
      </div>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full px-6 py-3 rounded-lg border border-red-500/50 hover:border-red-500/80 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          Delete My Account
        </button>
      ) : (
        <div className="space-y-4 bg-slate-800/40 border border-red-500/30 rounded-lg p-6">
          <p className="text-red-300 font-semibold mb-4">
            To confirm deletion, type "DELETE" and check the box below:
          </p>

          <input
            type="text"
            placeholder="Type DELETE to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-red-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all duration-300"
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-5 h-5 rounded border-gray-400 cursor-pointer"
            />
            <span className="text-sm text-gray-300">
              I understand this is permanent and cannot be undone. I want to delete my account.
            </span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText('');
                setAgreeTerms(false);
              }}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-500/30 text-gray-400 hover:text-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              disabled={confirmText !== 'DELETE' || !agreeTerms}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              Permanently Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// AI Usage History
const AIUsageHistory: React.FC = () => {
  const totalAICalls = usageHistory.reduce((sum, record) => sum + record.aiCallsUsed, 0);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl overflow-x-auto">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
        <Zap className="w-6 h-6 text-yellow-400" />
        AI Usage History
      </h2>
      <p className="text-gray-400 mb-6">
        Complete history of your AI interactions. Last 30 days showing {totalAICalls} total AI calls used.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead>
            <tr className="border-b border-blue-500/20">
              <th className="text-left py-4 px-6 text-gray-300 font-semibold">Date</th>
              <th className="text-left py-4 px-6 text-gray-300 font-semibold">Feature Used</th>
              <th className="text-center py-4 px-6 text-gray-300 font-semibold">AI Calls</th>
              <th className="text-right py-4 px-6 text-gray-300 font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody>
            {usageHistory.map((record, idx) => (
              <tr key={idx} className="border-b border-blue-500/10 hover:bg-blue-500/5 transition-colors">
                <td className="py-4 px-6 text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {record.date}
                </td>
                <td className="py-4 px-6 text-gray-300 font-medium">{record.feature}</td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-sm font-semibold">
                    {record.aiCallsUsed}
                  </span>
                </td>
                <td className="py-4 px-6 text-right text-gray-400">{record.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-slate-700/30 border border-blue-500/20">
        <p className="text-sm text-gray-400">
          <span className="font-semibold text-white">Total AI Calls (Last 30 Days):</span> {totalAICalls} /{' '}
          <span className="text-cyan-300 font-semibold">1,500</span>
        </p>
      </div>
    </div>
  );
};

// Security & Compliance Section
const SecurityComplianceSection: React.FC = () => {
  const securityFeatures = [
    {
      title: 'End-to-End Encryption',
      description: 'All data transmitted via HTTPS/TLS 1.3 encryption. Passwords hashed with bcrypt.',
      icon: '🔐',
    },
    {
      title: 'Serverless Architecture',
      description: 'Hosted on AWS with auto-scaling. Data stored in encrypted S3 buckets with versioning.',
      icon: '☁️',
    },
    {
      title: 'GDPR & Privacy Compliant',
      description: 'We comply with GDPR, CCPA, and DGFT regulations. Regular privacy audits conducted.',
      icon: '✅',
    },
    {
      title: 'No Data Selling',
      description:
        'We never sell, share, or monetize your personal data. Period. Check our Privacy Policy for details.',
      icon: '🚫',
    },
    {
      title: 'Regular Security Audits',
      description: 'Third-party penetration testing quarterly. SOC 2 Type II compliance maintained.',
      icon: '🛡️',
    },
    {
      title: 'Automatic Backups',
      description: 'Daily encrypted backups stored in geographically distributed data centers.',
      icon: '💾',
    },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
        <Shield className="w-6 h-6 text-green-400" />
        Security & Compliance
      </h2>
      <p className="text-gray-400 mb-6">
        Your privacy and security are our top priority. Here's how we protect your data:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {securityFeatures.map((feature, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-slate-700/30 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{feature.icon}</span>
              <div>
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
          <p className="text-xs text-blue-300 mb-2">Last Security Audit</p>
          <p className="text-lg font-bold text-blue-300">February 2026</p>
          <p className="text-xs text-gray-400">By third-party auditor</p>
        </div>
        <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/30">
          <p className="text-xs text-green-300 mb-2">Privacy Policy</p>
          <a href="#" className="text-lg font-bold text-green-400 hover:text-green-300">
            View Policy →
          </a>
        </div>
        <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
          <p className="text-xs text-purple-300 mb-2">Compliance</p>
          <p className="text-sm font-bold text-purple-300">GDPR • CCPA • SOC 2</p>
        </div>
      </div>
    </div>
  );
};

// Main Data & Privacy Center Component
export const DataPrivacyCenter: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-green-600 rounded-full blur-3xl opacity-5" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-blue-500/20 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold mb-1">Data & Privacy Center</h1>
            <p className="text-gray-400">Transparency about your data, AI, and how we protect your privacy</p>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          <DataOverviewSection />
          <AITransparencySection />
          <DownloadDataSection />
          <AIUsageHistory />
          <SecurityComplianceSection />
          <DeleteDataSection />

          {/* Footer */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-900/20 via-slate-900/40 to-slate-900/40 border border-blue-500/20 p-6 text-center backdrop-blur-xl">
            <p className="text-sm text-gray-400 mb-3">
              Have questions about your privacy?{' '}
              <a href="#" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Contact our Privacy Team
              </a>{' '}
              at privacy@ailearning.com
            </p>
            <p className="text-xs text-gray-500">
              Last updated: March 1, 2026 • Privacy Policy • Terms of Service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPrivacyCenter;
