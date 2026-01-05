import { motion } from 'framer-motion';
import { Card } from '@/components/ui';

export const ProductShowcaseSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            See Zync in Action
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Experience the power of real-time collaboration
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid md:grid-cols-4 gap-4">
          {/* Main Dashboard - Spans 2 columns and 2 rows */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="md:col-span-2 md:row-span-2"
          >
            <Card className="h-full p-6 relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
              
              <div className="relative">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Dashboard Overview</h3>
                
                {/* Mockup Content */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        12
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Active Tasks</div>
                        <div className="text-sm text-slate-500">3 due today</div>
                      </div>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 bg-emerald-500 rounded-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">24</div>
                      <div className="text-sm text-slate-500">Projects</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">156</div>
                      <div className="text-sm text-slate-500">Tasks Done</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200"
                      >
                        <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                        <div className="flex-1 h-2 bg-slate-200 rounded" style={{ width: `${80 - i * 15}%` }} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="md:col-span-2"
          >
            <Card className="h-full p-6 relative overflow-hidden group cursor-pointer">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
              
              <div className="relative">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Team Chat</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex-shrink-0" />
                    <div className="flex-1 bg-slate-50 rounded-lg p-2">
                      <div className="text-sm text-slate-900">Hey team, let's sync up!</div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-2 text-right">
                      <div className="text-sm text-white">Sounds good! 👍</div>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex-shrink-0" />
                  </div>
                  <div className="flex gap-2 items-center text-sm text-slate-500">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 bg-emerald-500 rounded-full ring-2 ring-white" />
                      <div className="w-6 h-6 bg-amber-500 rounded-full ring-2 ring-white" />
                    </div>
                    <span>Sarah is typing</span>
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Notifications Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="md:col-span-1"
          >
            <Card className="h-full p-6 relative overflow-hidden group cursor-pointer">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
              
              <div className="relative">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Notifications</h3>
                <div className="space-y-2">
                  {[
                    { icon: '✅', text: 'Task completed', color: 'emerald' },
                    { icon: '💬', text: 'New message', color: 'blue' },
                    { icon: '🎯', text: 'Deadline soon', color: 'amber' },
                  ].map((notif, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: 20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-2 p-2 bg-${notif.color}-50 rounded-lg text-sm`}
                    >
                      <span>{notif.icon}</span>
                      <span className="text-slate-700">{notif.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Kanban Board */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="md:col-span-1"
          >
            <Card className="h-full p-6 relative overflow-hidden group cursor-pointer">
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-pink-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
              
              <div className="relative">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Kanban</h3>
                <div className="space-y-2">
                  {['To Do', 'In Progress', 'Done'].map((status, i) => (
                    <div key={i} className="space-y-1">
                      <div className="text-xs font-semibold text-slate-500">{status}</div>
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="h-12 bg-slate-50 rounded-lg border border-slate-200 p-2 cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                          <div className="flex-1 h-2 bg-slate-200 rounded" />
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
