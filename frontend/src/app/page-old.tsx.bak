'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Navigation */}
          <motion.nav 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-16"
          >
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Adaptive Learning
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Features
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Login
              </Link>
              <Link 
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          </motion.nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-blue-600 shadow-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Powered by Amazon Bedrock AI
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Learn Smarter
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                with AI
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              AI analyzes your progress and tells you exactly what to study next.
              <br />
              <span className="text-gray-500">No more guessing. Just results.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link
                href="/register"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
              >
                Start Learning Free
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-900 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 border-gray-200"
              >
                Sign In
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-8 text-sm"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">71/71 Tests Passing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">5 Bedrock AI Features</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">AWS Serverless</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              AI-Powered Learning
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Not just another chatbot. A decision intelligence engine that knows what you should learn next.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🧮',
                title: 'Decision Engine',
                description: 'Deterministic algorithm calculates priority scores based on exam weightage, mastery, and dependencies.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '🤖',
                title: 'Amazon Bedrock',
                description: 'Claude 3 Haiku powers 5 AI features: explanations, questions, classification, strategy, and summarization.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: '📊',
                title: 'Performance Analytics',
                description: 'Track mastery scores, identify weak topics, and visualize your learning progress in real-time.',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: '🎯',
                title: 'Smart Recommendations',
                description: 'Get personalized study recommendations based on your performance, exam patterns, and time constraints.',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: '⚡',
                title: 'Production Ready',
                description: '71/71 tests passing, comprehensive error handling, usage limits, and cost optimization built-in.',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: '☁️',
                title: 'AWS Serverless',
                description: 'CloudFront, S3, API Gateway, Lambda, DynamoDB, and Bedrock working together seamlessly.',
                color: 'from-indigo-500 to-purple-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}></div>
                <div className="relative">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Start - Topic Input */}
      <div className="relative py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Start Learning Anything
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Enter any subjects or topics you want to study. AI will recommend the best learning order and create your personalized study plan.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-xl"
          >
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What do you want to learn? (Enter topics separated by commas)
              </label>
              <textarea
                placeholder="e.g., JavaScript, React, Node.js, MongoDB, AWS, Docker..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-center hover:shadow-lg transition-all"
              >
                Get AI Recommendations
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-500 transition-all text-center"
              >
                Try Demo
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              No credit card required • Free forever • AI-powered recommendations
            </p>
          </motion.div>

          {/* Example Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500 mb-3">Popular learning paths:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Web Development', 'Data Science', 'Machine Learning', 'Cloud Computing', 'Mobile Development', 'DevOps'].map((topic) => (
                <span key={topic} className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 border border-gray-200">
                  {topic}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* How It Works */}
      <div className="relative py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How AI Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to smarter learning
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Analyze Performance',
                description: 'AI tracks your accuracy, speed, confidence, and mistake patterns across all topics.'
              },
              {
                step: '02',
                title: 'Calculate Priority',
                description: 'Decision engine computes priority scores using exam weightage, mastery level, and dependencies.'
              },
              {
                step: '03',
                title: 'Recommend Next',
                description: 'Get personalized recommendations with clear reasoning and expected improvement.'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <div className="text-6xl font-bold text-transparent bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Learn Smarter?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of students improving their exam scores with AI
            </p>
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              Create Free Account
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg font-semibold text-white mb-2">AI for Bharat Hackathon Submission</p>
            <p className="text-sm mb-4">Powered by AWS Lambda, DynamoDB, and Amazon Bedrock</p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="https://github.com" className="hover:text-white transition-colors">GitHub</a>
              <a href="/api-demo.html" className="hover:text-white transition-colors">API Demo</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
            </div>
            <p className="mt-6 text-xs">
              API Endpoint: <code className="bg-gray-800 px-2 py-1 rounded">https://b3fw6ipszl.execute-api.us-east-1.amazonaws.com</code>
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
