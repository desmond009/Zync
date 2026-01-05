import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export const HowItWorksSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const lineProgress = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  const steps = [
    {
      number: '01',
      title: 'Create Your Workspace',
      description: 'Sign up and create your first team workspace',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Invite Your Team',
      description: 'Send invite links to teammates instantly',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Start Collaborating',
      description: 'Create projects, assign tasks, and chat in real-time',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Three simple steps to transform your team's collaboration
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1">
            <div className="max-w-4xl mx-auto relative h-full">
              <div className="absolute inset-0 bg-slate-200 rounded-full" />
              <motion.div
                style={{ scaleX: lineProgress }}
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full origin-left"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="text-center">
                  {/* Number Circle */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative inline-flex items-center justify-center w-20 h-20 mb-6"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full opacity-20 blur-xl" />
                    <div className="relative w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {step.number}
                    </div>
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.2 + 0.3, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl text-indigo-600 mb-6"
                  >
                    {step.icon}
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
