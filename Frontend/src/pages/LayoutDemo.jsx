import { motion } from 'framer-motion';
import { Card } from '@/components/ui';
import { Sparkles, Palette, Moon, Sun, Smartphone, Monitor } from 'lucide-react';

export const LayoutDemo = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 py-8"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>Enhanced Layout Demo</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold gradient-text">
          Welcome to Zync's New Layout!
        </h1>
        
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Experience the modern, glassmorphic design with smooth animations and responsive navigation.
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feature 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card hoverable className="h-full">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-indigo-500/10">
                <Palette className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Glassmorphism Design
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Beautiful frosted glass effect with backdrop blur throughout the interface.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Feature 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card hoverable className="h-full">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <div className="relative">
                  <Sun className="w-6 h-6 text-purple-600 dark:text-purple-400 absolute" />
                  <Moon className="w-6 h-6 text-purple-600 dark:text-purple-400 opacity-0 dark:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Theme Toggle
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Smooth animated theme switching with rotation effect. Try it now!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Feature 3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card hoverable className="h-full">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Smartphone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Mobile First
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Fully responsive with smooth slide-over drawer for mobile devices.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Feature 4 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card hoverable className="h-full">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-rose-500/10">
                <Monitor className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Fixed Sidebar
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  260px fixed width sidebar with active state indicators and smooth hover effects.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Feature 5 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card hoverable className="h-full">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Smooth Animations
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Powered by Framer Motion for silky smooth transitions and interactions.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Feature 6 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card hoverable className="h-full">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-cyan-500/10">
                <div className="w-6 h-6 bg-dot-pattern text-cyan-600 dark:text-cyan-400 opacity-40" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Pattern Background
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Subtle dot pattern adds depth without being distracting.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
          <h2 className="text-2xl font-bold gradient-text mb-4">
            Try These Features
          </h2>
          
          <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <p>
                <strong>Toggle Theme:</strong> Click the Sun/Moon button in the sidebar footer and watch the smooth rotation animation
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <p>
                <strong>Navigate Tabs:</strong> Click different navigation items to see the active state with left border and background
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                3
              </span>
              <p>
                <strong>Mobile View:</strong> Resize your browser window to see the responsive layout with hamburger menu
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                4
              </span>
              <p>
                <strong>User Menu:</strong> Click your profile card at the bottom to see the dropdown menu
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Sidebar Width', value: '260px' },
          { label: 'Mobile Breakpoint', value: '1024px' },
          { label: 'Animation Duration', value: '0.5s' },
          { label: 'Backdrop Blur', value: 'xl' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 + idx * 0.1 }}
          >
            <Card className="text-center">
              <p className="text-2xl font-bold gradient-text mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {stat.label}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
