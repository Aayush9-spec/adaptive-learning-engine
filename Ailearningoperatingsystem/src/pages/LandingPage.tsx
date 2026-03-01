import React, { useState, useEffect } from 'react';
import { ChevronRight, Zap, Brain, BarChart3, Lightbulb, Grid3x3, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'Decision-First Learning Engine',
      description: 'Learn by making decisions, not memorizing. Our engine prioritizes active recall.'
    },
    {
      icon: Grid3x3,
      title: 'Syllabus Dependency Mapping',
      description: 'Understand how concepts connect. Never hit knowledge gaps unexpectedly.'
    },
    {
      icon: Zap,
      title: 'Infinite AI Question Generator',
      description: 'Unlimited practice questions tailored to your learning velocity.'
    },
    {
      icon: Lightbulb,
      title: 'Diagram Intelligence System',
      description: 'Visual learning powered by AI. Complex concepts, crystal clear.'
    },
    {
      icon: TrendingUp,
      title: 'Weakness Pattern Analyzer',
      description: 'Identifies cognitive patterns before you even know they exist.'
    },
    {
      icon: BarChart3,
      title: 'Performance Prediction Engine',
      description: 'Predicts your learning trajectory. No surprises on exam day.'
    }
  ];

  const pricingTiers = [
    {
      name: 'Free',
      price: '0',
      description: 'Perfect for exploring',
      features: [
        '5 AI-generated questions per day',
        'Basic concept analysis',
        'Community diagrams',
        'Standard learning path'
      ],
      cta: 'Start Free',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '29',
      description: 'For serious learners',
      features: [
        'Unlimited AI questions',
        'Advanced weakness analysis',
        'Custom diagrams & explanations',
        'Predictive performance insights',
        'Priority AI responses',
        'Personal learning dashboard'
      ],
      cta: 'Upgrade to Pro',
      highlighted: true
    },
    {
      name: 'Elite',
      price: '99',
      description: 'For institutions',
      features: [
        'Everything in Pro',
        'Team management & analytics',
        'Custom curriculum mapping',
        'API access',
        'Dedicated support',
        'White-label options',
        'Advanced reporting'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'System Analyzes Your Mastery',
      description: 'Upload your curriculum or start learning. Our AI instantly maps your concept knowledge.'
    },
    {
      number: '02',
      title: 'AI Identifies Weak Patterns',
      description: 'Beyond surface-level mistakes. We find the cognitive patterns holding you back.'
    },
    {
      number: '03',
      title: 'Adaptive Strategy Generation',
      description: 'Get personalized learning paths with dynamically generated questions that challenge the right way.'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10"
          style={{
            left: `${mousePosition.x - 192}px`,
            top: `${mousePosition.y - 192}px`,
            transition: 'all 0.3s ease-out'
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-5" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          <Brain className="w-8 h-8 text-blue-400" />
          AI Learning Intelligence
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-gray-300 hover:text-white transition">Features</a>
          <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition">Pricing</a>
          <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium transition transform hover:scale-105">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 md:px-12 py-20 md:py-32 max-w-7xl mx-auto w-full">
        <div className={`text-center transform transition duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30">
            <span className="text-blue-300 text-sm font-semibold">🚀 Adaptive Learning Reimagined</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your AI-Powered Learning
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Intelligence System
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            <span className="text-cyan-300">Adaptive.</span>
            <span className="text-blue-300"> Predictive.</span>
            <span className="text-purple-300"> Personalized.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="group px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg transition transform hover:scale-105 flex items-center justify-center gap-2">
              Start Free
              <ArrowRight className="group-hover:translate-x-1 transition" size={20} />
            </button>
            <button className="px-8 py-4 rounded-lg border-2 border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/10 text-white font-bold text-lg transition transform hover:scale-105 flex items-center justify-center gap-2">
              See How It Works
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Hero Image/Preview */}
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent rounded-2xl blur-3xl" />
            <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-blue-500/30 p-1 overflow-hidden">
              <div className="bg-slate-950 rounded-xl p-8 md:p-12">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="h-32 bg-gradient-to-br from-blue-900 to-slate-900 rounded-lg border border-blue-500/30 flex items-center justify-center">
                    <Brain className="w-12 h-12 text-blue-400 opacity-50" />
                  </div>
                  <div className="h-32 bg-gradient-to-br from-cyan-900 to-slate-900 rounded-lg border border-cyan-500/30 flex items-center justify-center">
                    <BarChart3 className="w-12 h-12 text-cyan-400 opacity-50" />
                  </div>
                  <div className="h-32 bg-gradient-to-br from-purple-900 to-slate-900 rounded-lg border border-purple-500/30 flex items-center justify-center">
                    <Zap className="w-12 h-12 text-purple-400 opacity-50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-blue-500/30 rounded-full w-3/4" />
                  <div className="h-3 bg-blue-500/20 rounded-full w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 px-6 md:px-12 py-20 md:py-32 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-400 mb-16 text-lg">Three intelligent steps to mastery</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur" />
                  <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-blue-500/30 group-hover:border-blue-500/60 rounded-2xl p-8 transition duration-300">
                    <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:flex justify-end mt-8 mb-8">
                    <ArrowRight className="w-6 h-6 text-blue-500/50 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="relative z-10 px-6 md:px-12 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Core Intelligence Features</h2>
          <p className="text-center text-gray-400 mb-16 text-lg">Everything you need to learn smarter</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur" />
                    <div className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 group-hover:border-blue-500/50 rounded-xl p-8 transition duration-300 transform group-hover:translate-y-[-4px]">
                      <div className="mb-4 inline-block p-3 rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-600/20 group-hover:from-blue-600/40 group-hover:to-cyan-600/40 transition">
                        <Icon className="w-6 h-6 text-cyan-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Preview Section */}
      <section className="relative z-10 px-6 md:px-12 py-20 md:py-32 bg-gradient-to-b from-blue-950/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Experience the Intelligence</h2>
          <p className="text-center text-gray-400 mb-16 text-lg">See adaptive learning and AI explanations in action</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Dashboard Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl opacity-100 blur-2xl" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-blue-500/30 p-1 overflow-hidden">
                <div className="bg-slate-950 rounded-xl p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Learning Dashboard</h3>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div className="text-xs text-gray-500">Active</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg p-4 border border-blue-500/20">
                      <div className="text-sm text-gray-400 mb-2">Mastery: Quantum Computing</div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-3/4" />
                      </div>
                      <div className="text-xs text-gray-500 mt-2">72% Complete</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/20">
                      <div className="text-sm text-gray-400 mb-2">Weakness: Superposition</div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full w-1/3" />
                      </div>
                      <div className="text-xs text-gray-500 mt-2">Needs Focus</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Explanation Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl opacity-100 blur-2xl" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-purple-500/30 p-1 overflow-hidden">
                <div className="bg-slate-950 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4">AI Explanation</h3>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/20">
                      <div className="text-sm font-semibold mb-2 text-purple-300">Question:</div>
                      <div className="text-sm text-gray-300">Explain quantum entanglement and why Einstein called it "spooky action at a distance"</div>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg p-4 border border-cyan-500/20">
                      <div className="text-sm font-semibold mb-2 text-cyan-300">AI Response:</div>
                      <div className="text-sm text-gray-300 leading-relaxed">
                        Quantum entanglement occurs when two particles become correlated such that the state of one instantly influences the other, regardless of distance...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 px-6 md:px-12 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-400 mb-16 text-lg">Choose the plan that fits your learning journey</p>
          
          <div className="grid md:grid-cols-3 gap-8 items-end">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`relative group transition-all duration-300 ${tier.highlighted ? 'md:col-span-1 md:-translate-y-6' : ''}`}>
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur ${
                  tier.highlighted 
                    ? 'bg-gradient-to-br from-blue-600/40 to-cyan-600/40' 
                    : 'bg-gradient-to-br from-gray-600/20 to-gray-600/20'
                }`} />
                <div className={`relative rounded-2xl border p-8 transition duration-300 ${
                  tier.highlighted
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500/50 ring-2 ring-blue-500/30'
                    : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-gray-700/50'
                }`}>
                  {tier.highlighted && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-sm font-bold whitespace-nowrap">
                      Most Popular
                    </div>
                  )}
                  
                  <h3 className="text-3xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-gray-400 text-sm mb-6">{tier.description}</p>
                  
                  <div className="mb-8">
                    <span className="text-5xl font-bold">${tier.price}</span>
                    {tier.price !== '0' && <span className="text-gray-400">/month</span>}
                  </div>
                  
                  <button className={`w-full py-3 rounded-lg font-bold transition transform hover:scale-105 mb-8 ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white'
                      : 'border border-gray-600 hover:border-blue-500/50 hover:bg-blue-500/10 text-white'
                  }`}>
                    {tier.cta}
                  </button>
                  
                  <ul className="space-y-4">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.highlighted ? 'text-cyan-400' : 'text-gray-600'}`} />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 px-6 md:px-12 py-20 md:py-32 bg-gradient-to-b from-transparent via-blue-950/30 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Upgrade your intelligence.
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Not just your notes.
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Join thousands of learners transforming how they study. Experience the future of adaptive learning today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group px-10 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg transition transform hover:scale-105 flex items-center justify-center gap-2">
              Start Your Free Journey
              <ArrowRight className="group-hover:translate-x-1 transition" size={20} />
            </button>
            <button className="px-10 py-4 rounded-lg border-2 border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/10 text-white font-bold text-lg transition transform hover:scale-105">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-12 py-12 border-t border-blue-500/20 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 text-lg font-bold mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
                AI Learning Intelligence
              </div>
              <p className="text-gray-400 text-sm">Adaptive learning powered by AI.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">How it works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-500/20 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <p>&copy; 2024 AI Learning Intelligence Engine. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">LinkedIn</a>
              <a href="#" className="hover:text-white transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
