import { motion } from 'framer-motion';
import { MessageCircle, CheckCircle2, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

const FloatingElement = ({ delay, children, className }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -20, 0],
        x: [mousePosition.x * 0.3, mousePosition.x * 0.3 - 10, mousePosition.x * 0.3],
      }}
      transition={{
        y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        x: { duration: 2, ease: 'easeInOut' },
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{ willChange: 'transform' }}
    >
      {children}
    </motion.div>
  );
};

export default function IllustrationPanel({ isDark }) {
  return (
    <div
      className={`relative w-full h-full overflow-hidden ${
        isDark
          ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-cyan-900'
          : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500'
      }`}
    >
      {/* Animated Background Circles */}
      <motion.div
        className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ y: [0, -20, 0], x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Content Container */}
      <div className="relative h-full flex flex-col items-center justify-between px-8 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30">
            <span className="text-white font-bold">Z</span>
          </div>
          <span className="text-white text-xl font-bold">Zync</span>
        </motion.div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 max-w-sm text-white shadow-2xl"
        >
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <span className="text-lg">⭐</span>
              </motion.div>
            ))}
          </div>
          <p className="text-sm mb-4 leading-relaxed">
            "Zync transformed how our team collaborates. Real-time updates, seamless communication, and it just works."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full" />
            <div>
              <p className="font-semibold text-sm">Sarah Chen</p>
              <p className="text-xs text-white/70">Design Lead, Acme Inc</p>
            </div>
          </div>
        </motion.div>

        {/* Floating UI Elements */}
        <div className="absolute bottom-20 right-10 space-y-4">
          {/* Task Card */}
          <FloatingElement delay={0.3} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 w-48 text-white shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold">Design Sprint</p>
                <p className="text-xs text-white/70 mt-1">Due in 2 days</p>
              </div>
            </div>
          </FloatingElement>

          {/* Message Bubble */}
          <FloatingElement delay={0.4} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3 w-48 text-white shadow-xl">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold">Alex</p>
                <p className="text-xs text-white/70 mt-1">Just reviewed the designs!</p>
              </div>
            </div>
          </FloatingElement>
        </div>

        {/* Floating Elements Left */}
        <div className="absolute top-40 left-10 space-y-4">
          {/* Time Badge */}
          <FloatingElement delay={0.2} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3 text-white shadow-xl">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span className="text-xs font-semibold">Team sync in 1h</span>
            </div>
          </FloatingElement>
        </div>
      </div>
    </div>
  );
}
