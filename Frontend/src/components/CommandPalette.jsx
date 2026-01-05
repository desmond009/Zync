import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const commands = [
  {
    id: 'dashboard',
    name: 'Go to Dashboard',
    icon: '🏠',
    action: '/dashboard',
    category: 'Navigation',
  },
  {
    id: 'projects',
    name: 'Go to Projects',
    icon: '📁',
    action: '/projects',
    category: 'Navigation',
  },
  {
    id: 'tasks',
    name: 'Go to Tasks',
    icon: '✓',
    action: '/tasks',
    category: 'Navigation',
  },
  {
    id: 'chat',
    name: 'Go to Chat',
    icon: '💬',
    action: '/chat',
    category: 'Navigation',
  },
  {
    id: 'team',
    name: 'Go to Team',
    icon: '👥',
    action: '/team',
    category: 'Navigation',
  },
  {
    id: 'new-project',
    name: 'Create New Project',
    icon: '➕',
    action: 'create-project',
    category: 'Actions',
  },
  {
    id: 'new-task',
    name: 'Create New Task',
    icon: '✨',
    action: 'create-task',
    category: 'Actions',
  },
  {
    id: 'settings',
    name: 'Open Settings',
    icon: '⚙️',
    action: '/settings',
    category: 'Navigation',
  },
];

export const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (command) => {
    if (command.action.startsWith('/')) {
      navigate(command.action);
    } else {
      // Handle custom actions
      console.log('Action:', command.action);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="glass rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent outline-none text-lg text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <kbd className="px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded">ESC</kbd>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {category}
                </div>
                {items.map((command, idx) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <motion.button
                      key={command.id}
                      whileHover={{ x: 4 }}
                      onClick={() => handleSelect(command)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all',
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      )}
                    >
                      <span className="text-2xl">{command.icon}</span>
                      <span className="flex-1 font-medium">{command.name}</span>
                      {isSelected && (
                        <kbd className="px-2 py-1 text-xs font-semibold bg-white/20 rounded">↵</kbd>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))}

            {filteredCommands.length === 0 && (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No commands found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded">↵</kbd> Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded">ESC</kbd> Close
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
