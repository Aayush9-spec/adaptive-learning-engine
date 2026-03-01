import React, { useState } from 'react';
import {
  Zap,
  Check,
  X,
  ArrowRight,
  CreditCard,
  Calendar,
  AlertCircle,
  Star,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PricingTier {
  name: string;
  price: number;
  currency: string;
  billingPeriod: string;
  description: string;
  dailyAICalls: number;
  features: string[];
  cta: string;
  highlight?: boolean;
}

interface FeatureRow {
  feature: string;
  free: boolean | string;
  pro: boolean | string;
  elite: boolean | string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
}

// Mock Data
const mockCurrentPlan = {
  tier: 'Pro',
  renewalDate: 'April 1, 2026',
  aiCallsRemaining: 42,
  dailyLimit: 50,
  percentageUsed: 16,
  startDate: 'March 1, 2026',
};

const mockPricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: 0,
    currency: '₹',
    billingPeriod: 'Forever',
    description: 'Start your learning journey',
    dailyAICalls: 5,
    features: [
      '5 AI-generated questions/day',
      'Basic concept analysis',
      'Community diagrams',
      'Standard learning path',
      'Email support',
    ],
    cta: 'Current Plan',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 299,
    currency: '₹',
    billingPeriod: '/month',
    description: 'For serious learners',
    dailyAICalls: 50,
    features: [
      'Unlimited AI questions',
      'Advanced weakness analysis',
      'Custom diagrams & explanations',
      'Predictive performance insights',
      'Priority AI responses',
      'Personal learning dashboard',
      'Monthly strategy updates',
      'Priority email support',
    ],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    name: 'Elite',
    price: 999,
    currency: '₹',
    billingPeriod: '/month',
    description: 'For exam mastery',
    dailyAICalls: 200,
    features: [
      'Unlimited AI calls',
      'Everything in Pro',
      'Team management & analytics',
      'Custom curriculum mapping',
      'API access',
      '24/7 priority support',
      'Dedicated AI tutor',
      'Weekly strategy sessions',
    ],
    cta: 'Upgrade to Elite',
    highlight: false,
  },
];

const featureMatrix: FeatureRow[] = [
  { feature: 'Daily AI Calls', free: '5', pro: '50', elite: 'Unlimited' },
  { feature: 'Infinite Question Generator', free: false, pro: true, elite: true },
  { feature: 'AI Strategy Planner', free: false, pro: true, elite: true },
  { feature: 'Diagram Intelligence System', free: false, pro: true, elite: true },
  { feature: 'Weakness Pattern Analyzer', free: false, pro: true, elite: true },
  { feature: 'Performance Prediction Engine', free: false, pro: true, elite: true },
  { feature: 'Learning Memory System', free: false, pro: true, elite: true },
  { feature: 'Priority Support', free: 'Email', pro: 'Priority Email', elite: '24/7 Phone & Email' },
  { feature: 'Custom Concepts', free: false, pro: true, elite: true },
  { feature: 'Team Analytics', free: false, pro: false, elite: true },
  { feature: 'API Access', free: false, pro: false, elite: true },
  { feature: 'Dedicated Support Manager', free: false, pro: false, elite: true },
];

const mockInvoices: Invoice[] = [
  {
    id: 'INV-2024-001',
    date: 'March 1, 2026',
    amount: 299,
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
  },
  {
    id: 'INV-2024-002',
    date: 'February 1, 2026',
    amount: 299,
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
  },
  {
    id: 'INV-2024-003',
    date: 'January 1, 2026',
    amount: 299,
    status: 'paid',
    description: 'Pro Plan - Monthly Subscription',
  },
];

// Current Plan Overview Card
const CurrentPlanCard: React.FC = () => (
  <div className="rounded-2xl bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-500/30 p-8 backdrop-blur-xl mb-8">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{mockCurrentPlan.tier} Plan</h2>
            <p className="text-gray-400">Your current subscription</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Renewal Date</p>
            <p className="text-lg font-semibold text-cyan-300">{mockCurrentPlan.renewalDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Subscription Active</p>
            <p className="text-lg font-semibold text-green-300">Since {mockCurrentPlan.startDate}</p>
          </div>
        </div>
      </div>

      <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2">
        <Zap className="w-5 h-5" />
        Upgrade Plan
      </button>
    </div>
  </div>
);

// AI Usage Tracker
const AIUsageTracker: React.FC = () => {
  const getUsageColor = (percentage: number) => {
    if (percentage <= 50) return 'from-green-600 to-emerald-600';
    if (percentage <= 80) return 'from-yellow-600 to-amber-600';
    return 'from-red-600 to-rose-600';
  };

  const getStatusColor = (percentage: number) => {
    if (percentage <= 50) return 'text-green-300';
    if (percentage <= 80) return 'text-yellow-300';
    return 'text-red-300';
  };

  const getAlertMessage = (percentage: number) => {
    if (percentage <= 50) return '✓ Safe zone. Continue learning!';
    if (percentage <= 80) return '⚠️ Approaching limit. Consider upgrading for more calls.';
    return '🔴 Limit reached. Upgrade to continue.';
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl mb-8">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
        <Zap className="w-6 h-6 text-yellow-400" />
        AI Usage Tracker
      </h2>
      <p className="text-gray-400 mb-6">Your daily AI calls for intelligent feedback and explanations</p>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-lg font-semibold text-white">
                {mockCurrentPlan.aiCallsRemaining} / {mockCurrentPlan.dailyLimit} Calls Remaining
              </p>
              <p className="text-sm text-gray-400">Resets daily at 12:00 AM IST</p>
            </div>
            <div className={`text-right p-3 rounded-lg bg-slate-800/50 border border-blue-500/20`}>
              <p className={`text-2xl font-bold ${getStatusColor(mockCurrentPlan.percentageUsed)}`}>
                {mockCurrentPlan.percentageUsed}%
              </p>
              <p className="text-xs text-gray-400">Used</p>
            </div>
          </div>

          <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${getUsageColor(mockCurrentPlan.percentageUsed)}`}
              style={{ width: `${mockCurrentPlan.percentageUsed}%` }}
            />
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          mockCurrentPlan.percentageUsed <= 50
            ? 'bg-green-900/20 border-green-500/20'
            : mockCurrentPlan.percentageUsed <= 80
            ? 'bg-yellow-900/20 border-yellow-500/20'
            : 'bg-red-900/20 border-red-500/20'
        }`}>
          <p className={`text-sm font-semibold ${getStatusColor(mockCurrentPlan.percentageUsed)}`}>
            {getAlertMessage(mockCurrentPlan.percentageUsed)}
          </p>
        </div>
      </div>

      {mockCurrentPlan.percentageUsed > 80 && (
        <div className="mt-4 p-4 rounded-lg bg-blue-900/20 border border-blue-500/20">
          <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all duration-300">
            Upgrade Now for Unlimited Calls
          </button>
        </div>
      )}
    </div>
  );
};

// Feature Access Matrix
const FeatureMatrix: React.FC = () => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl mb-8 overflow-x-auto">
    <h2 className="text-2xl font-bold text-white mb-6">Feature Access Matrix</h2>

    <table className="w-full min-w-full">
      <thead>
        <tr className="border-b border-blue-500/20">
          <th className="text-left py-4 px-6 text-gray-300 font-semibold">Feature</th>
          <th className="text-center py-4 px-6 text-gray-300 font-semibold">
            <div className="flex flex-col items-center gap-2">
              <span>Free</span>
              <span className="text-xs text-gray-400 font-normal">₹0</span>
            </div>
          </th>
          <th className="text-center py-4 px-6 text-cyan-300 font-semibold">
            <div className="flex flex-col items-center gap-2">
              <span>Pro</span>
              <span className="text-xs text-cyan-400 font-normal">₹299/mo</span>
            </div>
          </th>
          <th className="text-center py-4 px-6 text-yellow-300 font-semibold">
            <div className="flex flex-col items-center gap-2">
              <span>Elite</span>
              <span className="text-xs text-yellow-400 font-normal">₹999/mo</span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {featureMatrix.map((row, idx) => (
          <tr key={idx} className="border-b border-blue-500/10 hover:bg-blue-500/5 transition-colors">
            <td className="py-4 px-6 text-gray-300 font-medium">{row.feature}</td>
            <td className="py-4 px-6 text-center">
              {typeof row.free === 'boolean' ? (
                row.free ? (
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                ) : (
                  <X className="w-5 h-5 text-gray-600 mx-auto" />
                )
              ) : (
                <span className="text-gray-400 text-sm font-medium">{row.free}</span>
              )}
            </td>
            <td className="py-4 px-6 text-center text-cyan-300 font-medium">
              {typeof row.pro === 'boolean' ? (
                row.pro ? (
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                ) : (
                  <X className="w-5 h-5 text-gray-600 mx-auto" />
                )
              ) : (
                <span>{row.pro}</span>
              )}
            </td>
            <td className="py-4 px-6 text-center text-yellow-300 font-medium">
              {typeof row.elite === 'boolean' ? (
                row.elite ? (
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                ) : (
                  <X className="w-5 h-5 text-gray-600 mx-auto" />
                )
              ) : (
                <span>{row.elite}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Pricing Cards
const PricingCards: React.FC = () => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-white mb-6">Pricing Plans</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {mockPricingTiers.map((tier, idx) => (
        <div
          key={idx}
          className={`relative group rounded-2xl border p-8 backdrop-blur-xl transition-all duration-300 ${
            tier.highlight
              ? 'bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-500/30 ring-2 ring-cyan-500/20 md:scale-105 md:z-10'
              : 'bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-blue-500/20 hover:border-blue-500/50'
          }`}
        >
          {tier.highlight && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold whitespace-nowrap">
              MOST POPULAR
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{tier.description}</p>

            <div className="mb-4">
              <span className="text-4xl font-bold text-white">{tier.price === 0 ? 'Free' : tier.currency + tier.price}</span>
              {tier.price > 0 && <span className="text-gray-400 ml-2">{tier.billingPeriod}</span>}
            </div>

            <p className="text-sm text-gray-400">{tier.dailyAICalls} AI calls/day</p>
          </div>

          <div className="space-y-3 mb-6">
            {tier.features.map((feature, featureIdx) => (
              <div key={featureIdx} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <button
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              tier.highlight
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                : 'bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 border border-blue-500/20'
            }`}
          >
            {tier.cta}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  </div>
);

// Upgrade Funnel Section
const UpgradeFunnel: React.FC = () => (
  <div className="rounded-2xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-pink-900/40 border border-blue-500/30 p-8 backdrop-blur-xl mb-8">
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-white mb-4">Unlock Full Cognitive Optimization</h2>
      <p className="text-gray-300 text-lg mb-6 leading-relaxed">
        The Pro and Elite plans give you unlimited access to our advanced AI-powered learning features. Get more
        personalized insights, unlimited practice questions, and access to our complete learning intelligence suite.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: '🚀', text: 'Unlimited AI Questions' },
          { icon: '📊', text: 'Complete Analytics' },
          { icon: '⭐', text: 'Priority Support' },
        ].map((item, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-slate-800/30 border border-blue-500/20">
            <p className="text-3xl mb-2">{item.icon}</p>
            <p className="text-gray-300 font-medium">{item.text}</p>
          </div>
        ))}
      </div>

      <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold transition-all duration-300 flex items-center justify-center gap-2 mx-auto">
        <Zap className="w-5 h-5" />
        Choose Your Plan Now
      </button>
    </div>
  </div>
);

// Billing & Payment Section
const BillingPaymentSection: React.FC = () => {
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'failed':
        return 'bg-red-500/20 border-red-500/30 text-red-300';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Payment Method */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-blue-400" />
          Payment Method
        </h2>

        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-xs">
                VISA
              </div>
              <div>
                <p className="font-semibold text-white">Visa Card ending in 4242</p>
                <p className="text-sm text-gray-400">Expires 12/2027</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <button className="w-full px-4 py-3 rounded-lg border border-blue-500/30 hover:border-blue-500/60 text-white hover:bg-blue-500/10 transition-all duration-300">
            Update Payment Method
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Calendar className="w-6 h-6 text-purple-400" />
          Billing History
        </h2>

        <div className="space-y-3">
          {mockInvoices.map((invoice) => (
            <div key={invoice.id}>
              <button
                onClick={() => setExpandedInvoice(expandedInvoice === invoice.id ? null : invoice.id)}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-white">{invoice.description}</p>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full border ${getStatusColor(invoice.status)}`}>
                      {invoice.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{invoice.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold text-white">₹{invoice.amount}</p>
                  {expandedInvoice === invoice.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedInvoice === invoice.id && (
                <div className="mt-2 p-4 rounded-lg bg-slate-900/30 border border-blue-500/20">
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Invoice ID</span>
                      <span className="text-white font-mono">{invoice.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Amount</span>
                      <span className="text-white font-semibold">₹{invoice.amount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Status</span>
                      <span className={getStatusColor(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Invoice
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Management */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 p-8 backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-white mb-6">Subscription Management</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-300 mb-1">Auto-renewal enabled</p>
              <p className="text-sm text-gray-400">Your subscription will automatically renew on April 1, 2026</p>
            </div>
          </div>

          <button className="w-full px-4 py-3 rounded-lg border border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-semibold transition-all duration-300 flex items-center justify-center gap-2">
            <Trash2 className="w-5 h-5" />
            Cancel Subscription
          </button>

          <p className="text-xs text-gray-500 text-center">
            You can reactivate your subscription anytime within 30 days of cancellation.
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Subscription & Usage Component
export const SubscriptionUsage: React.FC = () => {
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
            <button className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
              <ChevronUp className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold mb-1">Subscription & AI Usage</h1>
            <p className="text-gray-400">Manage your plan, usage, and billing</p>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <CurrentPlanCard />
          <AIUsageTracker />

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Explore Plans & Features</h2>
            <FeatureMatrix />
            <PricingCards />
          </div>

          <UpgradeFunnel />

          <BillingPaymentSection />

          {/* Footer info */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-900/20 via-slate-900/40 to-slate-900/40 border border-blue-500/20 p-6 text-center backdrop-blur-xl">
            <p className="text-sm text-gray-400">
              Have questions about your subscription?{' '}
              <a href="#" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionUsage;
