import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Button Component with gradient effects and animations
 * Supports multiple variants, sizes, and loading states
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  isLoading = false,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-ring rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-600/50',
    secondary: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300',
    ghost: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-500/50',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

/**
 * Input Component with floating label and focus animations
 */
export const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          className={cn(
            'w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-rose-500 focus:ring-rose-500',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-rose-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

/**
 * Card Component with glassmorphism and hover effects
 */
export const Card = ({
  children,
  className,
  hoverable = true,
  gradient = false,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'glass rounded-2xl p-6 shadow-lg',
        hoverable && 'cursor-pointer hover:shadow-2xl',
        gradient && 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-500/10 before:to-purple-500/10 before:rounded-2xl',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Badge Component for status indicators
 */
export const Badge = ({ children, variant = 'default', pulse = false, className }) => {
  const variants = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    primary: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    success: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      variants[variant],
      className
    )}>
      {pulse && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
};

/**
 * Avatar Component with fallback initials
 */
export const Avatar = ({ src, alt, size = 'md', className, fallback }) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  return (
    <div className={cn(
      'relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold overflow-hidden ring-2 ring-white dark:ring-slate-800',
      sizes[size],
      className
    )}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
};

/**
 * Modal Component with backdrop blur animation
 */
export const Modal = ({ isOpen, onClose, children, title, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn('glass rounded-2xl p-6 w-full shadow-2xl', sizes[size])}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-2xl font-bold mb-4 gradient-text">{title}</h2>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
};

/**
 * Tooltip Component with fade animation
 */
export const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'absolute z-50 px-3 py-1.5 text-sm text-white bg-slate-900 dark:bg-slate-700 rounded-lg shadow-lg whitespace-nowrap pointer-events-none',
            positions[position]
          )}
        >
          {content}
        </motion.div>
      )}
    </div>
  );
};

/**
 * Skeleton Loader Component
 */
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn('skeleton rounded-lg', className)}
      {...props}
    />
  );
};
