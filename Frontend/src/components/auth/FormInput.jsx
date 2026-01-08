import { motion } from 'framer-motion';
import { Mail, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function FormInput({
  label,
  type = 'text',
  placeholder,
  icon: Icon,
  error,
  success,
  value,
  onChange,
  onBlur,
  passwordStrength,
  showPasswordToggle,
  disabled,
  required,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPassword ? 'text' : type;
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label className={`block text-sm font-medium mb-2 ${
        isDark ? 'text-slate-200' : 'text-slate-700'
      }`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors ${
            isFocused ? 'text-indigo-500' : ''
          }`}>
            <Icon size={18} />
          </div>
        )}

        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          disabled={disabled}
          className={`w-full px-4 py-3 ${Icon ? 'pl-11' : ''} ${
            showPasswordToggle && type === 'password' ? 'pr-11' : ''
          } rounded-lg border-2 transition-all duration-200 outline-none ${
            isDark
              ? `bg-slate-700 border-slate-600 text-white placeholder-slate-500 ${
                  isFocused ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''
                } ${error ? 'border-red-500 ring-2 ring-red-500/20' : ''} ${
                  success && !error ? 'border-green-500' : ''
                }`
              : `bg-white border-slate-300 text-slate-900 placeholder-slate-400 ${
                  isFocused ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''
                } ${error ? 'border-red-500 ring-2 ring-red-500/20' : ''} ${
                  success && !error ? 'border-green-500' : ''
                }`
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          {...props}
        />

        {/* Right Icons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Success Icon */}
          {success && !error && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-green-500"
            >
              <CheckCircle2 size={18} />
            </motion.div>
          )}

          {/* Error Icon */}
          {error && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-red-500"
            >
              <AlertCircle size={18} />
            </motion.div>
          )}

          {/* Password Toggle */}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-1 text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-500'}`}
        >
          {error}
        </motion.p>
      )}

      {/* Success Message */}
      {success && !error && type === 'email' && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-1 text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-500'}`}
        >
          ✓ Email is available
        </motion.p>
      )}

      {/* Password Strength Meter */}
      {type === 'password' && passwordStrength !== undefined && value && (
        <motion.div className="mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className={`h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden`}>
            <motion.div
              className={`h-full rounded-full transition-all ${
                passwordStrength === 'weak'
                  ? 'bg-red-500 w-1/3'
                  : passwordStrength === 'medium'
                  ? 'bg-yellow-500 w-2/3'
                  : 'bg-green-500 w-full'
              }`}
              layoutId="strength-meter"
            />
          </div>
          <p className={`text-xs mt-1 font-medium ${
            passwordStrength === 'weak'
              ? isDark ? 'text-red-400' : 'text-red-500'
              : passwordStrength === 'medium'
              ? isDark ? 'text-yellow-400' : 'text-yellow-500'
              : isDark ? 'text-green-400' : 'text-green-500'
          }`}>
            {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
