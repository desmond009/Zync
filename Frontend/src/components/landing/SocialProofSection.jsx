import { motion } from 'framer-motion';

export const SocialProofSection = () => {
  const companies = [
    { name: 'TechCorp', logo: 'TC' },
    { name: 'Innovate Inc', logo: 'II' },
    { name: 'StartupHub', logo: 'SH' },
    { name: 'CloudBase', logo: 'CB' },
    { name: 'DataFlow', logo: 'DF' },
    { name: 'DevTools', logo: 'DT' },
    { name: 'AgileTeam', logo: 'AT' },
    { name: 'CodeCraft', logo: 'CC' },
  ];

  return (
    <section className="py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-slate-600 font-medium">
            Trusted by <span className="gradient-text font-bold">10,000+ teams</span> worldwide
          </p>
        </motion.div>

        {/* Infinite Scroll Logos */}
        <div className="relative overflow-hidden">
          <div className="flex gap-8 animate-scroll">
            {[...companies, ...companies].map((company, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.1, filter: 'grayscale(0%)' }}
                className="flex-shrink-0 w-32 h-20 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-white transition-all duration-300 filter grayscale hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-400 mb-1">{company.logo}</div>
                  <div className="text-xs text-slate-400">{company.name}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
