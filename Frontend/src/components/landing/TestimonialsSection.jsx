import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Avatar } from '@/components/ui';
import { getInitials } from '@/lib/utils';

export const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      quote: "Zync completely transformed how our team collaborates. The real-time updates are game-changing!",
      author: "Sarah Johnson",
      role: "Engineering Manager",
      company: "TechCorp",
      avatar: null,
    },
    {
      quote: "We tried dozens of project management tools. Zync is the only one that actually improved our workflow.",
      author: "Michael Chen",
      role: "Product Lead",
      company: "Innovate Inc",
      avatar: null,
    },
    {
      quote: "The built-in chat feature is brilliant. No more switching between Slack and our project tool!",
      author: "Emily Rodriguez",
      role: "CEO",
      company: "StartupHub",
      avatar: null,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Loved by Teams Worldwide
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Don't just take our word for it—hear from our customers
          </p>
        </motion.div>

        {/* Desktop View - 3 Cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card className="h-full p-8 relative overflow-hidden">
                {/* Gradient Border */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-2xl" />
                
                <div className="relative">
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <motion.svg
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 + i * 0.05, type: 'spring' }}
                        className="w-5 h-5"
                        fill="url(#gradient)"
                        viewBox="0 0 20 20"
                      >
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4F46E5" />
                            <stop offset="100%" stopColor="#A855F7" />
                          </linearGradient>
                        </defs>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </motion.svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="mb-6">
                    <svg
                      className="w-10 h-10 text-indigo-600/20 mb-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <p className="text-lg text-slate-700 leading-relaxed italic">
                      "{testimonial.quote}"
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={testimonial.avatar}
                      fallback={getInitials(testimonial.author)}
                      size="lg"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-slate-600">
                        {testimonial.role}
                      </div>
                      <div className="text-sm text-slate-500">
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mobile View - Carousel */}
        <div className="md:hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8">
                {/* Stars */}
                <div className="flex gap-1 mb-6 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5"
                      fill="url(#gradient-mobile)"
                      viewBox="0 0 20 20"
                    >
                      <defs>
                        <linearGradient id="gradient-mobile" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4F46E5" />
                          <stop offset="100%" stopColor="#A855F7" />
                        </linearGradient>
                      </defs>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-lg text-slate-700 leading-relaxed text-center mb-6 italic">
                  "{testimonials[activeIndex].quote}"
                </p>

                {/* Author */}
                <div className="flex flex-col items-center gap-3">
                  <Avatar
                    src={testimonials[activeIndex].avatar}
                    fallback={getInitials(testimonials[activeIndex].author)}
                    size="lg"
                  />
                  <div className="text-center">
                    <div className="font-semibold text-slate-900">
                      {testimonials[activeIndex].author}
                    </div>
                    <div className="text-sm text-slate-600">
                      {testimonials[activeIndex].role}
                    </div>
                    <div className="text-sm text-slate-500">
                      {testimonials[activeIndex].company}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 w-8'
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
