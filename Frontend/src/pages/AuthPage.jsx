import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Animated gradient mesh background
  const MeshGradient = () => (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-zinc-900"
        style={{
          backgroundSize: '200% 200%',
        }}
      />
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Animated orbs */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
      />
      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
      />
    </div>
  );

  // Task completion notification card
  const NotificationCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="absolute top-1/3 right-8 w-80"
    >
      <motion.div
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl"
        whileHover={{ scale: 1.05, y: -5 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
          <div>
            <p className="text-white font-semibold">Project Complete</p>
            <p className="text-white/70 text-sm">Design System v2.0</p>
          </div>
        </div>
        <p className="text-white/80 text-sm">
          Just published the new authentication flows to production! 🚀
        </p>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950">
      {/* Left Panel - Brand Experience (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <MeshGradient />
        
        {/* Content */}
        <div className="relative z-10 text-center text-white px-8">
          {/* Logo/Branding */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-12"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
              className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center"
            >
              <Zap className="w-7 h-7 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Zync
            </h2>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-4">Collaborate. Create. Succeed.</h1>
            <p className="text-xl text-white/80 max-w-sm mx-auto">
              Bring your team together and ship projects faster than ever before.
            </p>
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8 max-w-xs mx-auto"
          >
            <blockquote className="text-lg italic text-white/90 mb-4">
              "Zync helped us complete our project 3x faster. Game-changer!"
            </blockquote>
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full" />
              <div className="text-left text-sm">
                <p className="font-semibold text-white">Sarah Chen</p>
                <p className="text-white/70">Product Manager @ TechCo</p>
              </div>
            </div>
          </motion.div>

          {/* Notification Card */}
          <NotificationCard />
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 lg:mb-10"
          >
            {/* Logo for mobile/tablet */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
                className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-zinc-900 dark:text-white">Zync</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
              {isLogin
                ? 'Sign in to your account to continue'
                : 'Join thousands of teams already using Zync'}
            </p>
          </motion.div>

          {/* Form Container */}
          <div className="min-h-96">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <LoginForm />
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <SignupForm />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle Auth Mode */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-sm"
          >
            <span className="text-zinc-600 dark:text-zinc-400">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <motion.button
              onClick={() => setIsLogin(!isLogin)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </motion.button>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400"
          >
            <p>
              By continuing, you agree to Zync's{' '}
              <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-200 underline">
                Terms
              </a>
              {' '}and{' '}
              <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-200 underline">
                Privacy Policy
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;