import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Zap, Brain, BarChart3, Lightbulb, Grid3x3, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

const LandingPageAnimated = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const cardHoverVariants = {
    hover: {
      y: -8,
      transition: { duration: 0.3 },
    },
  };

  const features = [
    { icon: Brain, title: 'Decision-First Learning Engine', description: 'Learn by making decisions, not memorizing.' },
    { icon: Grid3x3, title: 'Syllabus Dependency Mapping', description: 'Understand how concepts connect.' },
    { icon: Zap, title: 'Infinite AI Question Generator', description: 'Unlimited practice tailored to you.' },
    { icon: Lightbulb, title: 'Diagram Intelligence System', description: 'Visual learning powered by AI.' },
    { icon: TrendingUp, title: 'Weakness Pattern Analyzer', description: 'Identifies patterns before you know they exist.' },
    { icon: BarChart3, title: 'Performance Prediction Engine', description: 'Predicts your learning trajectory.' },
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
        'Standard learning path',
      ],
      cta: 'Start Free',
      highlighted: false,
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
        'Personal learning dashboard',
      ],
      cta: 'Upgrade to Pro',
      highlighted: true,
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
        'Advanced reporting',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  const steps = [
    { number: '01', title: 'System Analyzes Your Mastery', description: 'Our AI instantly maps your concept knowledge.' },
    { number: '02', title: 'AI Identifies Weak Patterns', description: 'Find the cognitive patterns holding you back.' },
    { number: '03', title: 'Adaptive Strategy Generation', description: 'Personalized learning paths with dynamic questions.' },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10"
          animate={{
            left: `${mousePosition.x - 192}px`,
            top: `${mousePosition.y - 192}px`,
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        />
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        className="relative z-50 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto w-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
        >
          <Brain className="w-8 h-8 text-blue-400" />
          AI Learning Intelligence
        </motion.div>
        <div className="hidden md:flex items-center gap-8">
          <motion.a 
            href="#features"
            className="text-sm text-gray-300 hover:text-white transition"
            whileHover={{ scale: 1.1 }}
          >
            Features
          </motion.a>
          <motion.a 
            href="#pricing"
            className="text-sm text-gray-300 hover:text-white transition"
            whileHover={{ scale: 1.1 }}
          >
            Pricing
          </motion.a>
          <motion.button 
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        className="relative z-10 px-6 md:px-12 py-20 md:py-32 max-w-7xl mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center" variants={itemVariants}>
          <motion.div 
            className="inline-block mb-6 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30"
            whileHover={{ scale: 1.05, borderColor: '#0891b2' }}
          >
            <span className="text-blue-300 text-sm font-semibold">🚀 Adaptive Learning Reimagined</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your AI-Powered Learning
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Intelligence System
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            <motion.span 
              className="text-cyan-300"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Adaptive.
            </motion.span>
            <motion.span 
              className="text-blue-300 ml-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Predictive.
            </motion.span>
            <motion.span 
              className="text-purple-300 ml-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              Personalized.
            </motion.span>
          </p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            variants={itemVariants}
          >
            <motion.button 
              className="group px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={20} />
              </motion.div>
            </motion.button>
            <motion.button 
              className="px-8 py-4 rounded-lg border-2 border-blue-500/50 text-white font-bold text-lg flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              whileTap={{ scale: 0.95 }}
            >
              See How It Works
              <ChevronRight size={20} />
            </motion.button>
          </motion.div>

          {/* Hero Preview */}
          <motion.div 
            className="relative mx-auto max-w-4xl"
            variants={itemVariants}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent rounded-2xl blur-3xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div 
              className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-blue-500/30 p-1 overflow-hidden"
              whileHover={{ borderColor: '#0891b2' }}
            >
              <div className="bg-slate-950 rounded-xl p-8 md:p-12">
                <motion.div 
                  className="grid grid-cols-3 gap-4 mb-6"
                  variants={containerVariants}
                >
                  {[Brain, BarChart3, Zap].map((Icon, idx) => (
                    <motion.div 
                      key={idx}
                      className="h-32 bg-gradient-to-br from-blue-900 to-slate-900 rounded-lg border border-blue-500/30 flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      variants={itemVariants}
                    >
                      <Icon className="w-12 h-12 text-blue-400 opacity-50" />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        className="relative z-10 px-6 md:px-12 py-20 md:py-32 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-4"
            variants={itemVariants}
          >
            How It Works
          </motion.h2>
          <motion.p 
            className="text-center text-gray-400 mb-16 text-lg"
            variants={itemVariants}
          >
            Three intelligent steps to mastery
          </motion.p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover="hover"
              >
                <motion.div 
                  className="relative"
                  variants={cardHoverVariants}
                >
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-blue-500/30 rounded-2xl p-8">
                    <motion.div 
                      className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {step.number}
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Grid Section */}
      <motion.section 
        id="features"
        className="relative z-10 px-6 md:px-12 py-20 md:py-32"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-4"
            variants={itemVariants}
          >
            Core Intelligence Features
          </motion.h2>
          <motion.p 
            className="text-center text-gray-400 mb-16 text-lg"
            variants={itemVariants}
          >
            Everything you need to learn smarter
          </motion.p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  whileHover="hover"
                >
                  <motion.div 
                    className="relative"
                    variants={cardHoverVariants}
                  >
                    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/20 rounded-xl p-8">
                      <motion.div 
                        className="mb-4 inline-block p-3 rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-600/20"
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(59, 130, 246, 0.4)' }}
                      >
                        <Icon className="w-6 h-6 text-cyan-400" />
                      </motion.div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section 
        id="pricing"
        className="relative z-10 px-6 md:px-12 py-20 md:py-32"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-4"
            variants={itemVariants}
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p 
            className="text-center text-gray-400 mb-16 text-lg"
            variants={itemVariants}
          >
            Choose the plan that fits your learning journey
          </motion.p>
          
          <div className="grid md:grid-cols-3 gap-8 items-end">
            {pricingTiers.map((tier, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className={tier.highlighted ? 'md:col-span-1 md:-translate-y-6' : ''}
              >
                <div className={`relative rounded-2xl border p-8 ${
                  tier.highlighted
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500/50 ring-2 ring-blue-500/30'
                    : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-gray-700/50'
                }`}>
                  {tier.highlighted && (
                    <motion.div 
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-sm font-bold whitespace-nowrap"
                      animate={{ y: [-2, 2, -2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Most Popular
                    </motion.div>
                  )}
                  
                  <h3 className="text-3xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-gray-400 text-sm mb-6">{tier.description}</p>
                  
                  <div className="mb-8">
                    <span className="text-5xl font-bold">${tier.price}</span>
                    {tier.price !== '0' && <span className="text-gray-400">/month</span>}
                  </div>
                  
                  <motion.button 
                    className={`w-full py-3 rounded-lg font-bold mb-8 ${
                      tier.highlighted
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                        : 'border border-gray-600 text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tier.cta}
                  </motion.button>
                  
                  <ul className="space-y-4">
                    {tier.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={featureIndex}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: featureIndex * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.highlighted ? 'text-cyan-400' : 'text-gray-600'}`} />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section 
        className="relative z-10 px-6 md:px-12 py-20 md:py-32 bg-gradient-to-b from-transparent via-blue-950/30 to-transparent"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            variants={itemVariants}
          >
            Upgrade your intelligence.
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Not just your notes.
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 mb-12 leading-relaxed"
            variants={itemVariants}
          >
            Join thousands of learners transforming how they study.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={itemVariants}
          >
            <motion.button 
              className="group px-10 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Free Journey
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={20} />
              </motion.div>
            </motion.button>
            <motion.button 
              className="px-10 py-4 rounded-lg border-2 border-blue-500/50 text-white font-bold text-lg"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule a Demo
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

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

export default LandingPageAnimated;
