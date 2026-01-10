import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import AuthSocialButton from './AuthSocialButton';

const LoginForm = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const validateEmail = (value) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    if (field === 'email') {
      const error = validateEmail(email);
      setErrors((prev) => ({ ...prev, email: error }));
    } else if (field === 'password') {
      const error = validatePassword(password);
      setErrors((prev) => ({ ...prev, password: error }));
    }
  };

  const handleChange = (field, value) => {
    if (field === 'email') {
      setEmail(value);
      if (touched.email) {
        const error = validateEmail(value);
        setErrors((prev) => ({ ...prev, email: error }));
      }
    } else if (field === 'password') {
      setPassword(value);
      if (touched.password) {
        const error = validatePassword(value);
        setErrors((prev) => ({ ...prev, password: error }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setErrors({
      email: emailError,
      password: passwordError,
    });
    
    setTouched({
      email: true,
      password: true,
    });

    if (!emailError && !passwordError) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        console.log('Login:', { email, password });
        setIsLoading(false);
      }, 1500);
    }
  };

  const FormInput = ({ 
    label, 
    type, 
    value, 
    onChange, 
    onBlur, 
    error, 
    isTouched,
    placeholder,
    icon: Icon,
    showPasswordToggle,
    onPasswordToggle
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputType = type === 'password' && passwordVisible ? 'text' : type;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-5"
      >
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-2">
          {label}
        </label>
        
        <motion.div
          className="relative"
          animate={error && isTouched ? { x: [0, -5, 5, -5, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500 pointer-events-none transition-colors duration-200" 
              style={{
                color: isFocused && !error ? '#818cf8' : error && isTouched ? '#ef4444' : ''
              }}
            />
          )}
          
          <input
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => {
              setIsFocused(false);
              onBlur();
            }}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className={`w-full h-11 px-4 ${Icon ? 'pl-10' : ''} ${showPasswordToggle ? 'pr-10' : ''} 
              border rounded-lg transition-all duration-200 outline-none
              bg-white dark:bg-zinc-900
              border-zinc-200 dark:border-zinc-700
              text-zinc-900 dark:text-white
              placeholder-zinc-400 dark:placeholder-zinc-500
              ${isFocused && !error ? 'ring-2 ring-indigo-500/20 border-indigo-500' : ''}
              ${error && isTouched ? 'ring-2 ring-red-500/20 border-red-500' : ''}
              disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isLoading}
          />
          
          {showPasswordToggle && (
            <button
              type="button"
              onClick={onPasswordToggle}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              tabIndex={-1}
            >
              {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </motion.div>

        {error && isTouched && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-1"
          >
            <span>●</span> {error}
          </motion.p>
        )}
      </motion.div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Social Auth Buttons */}
      <div className="space-y-3">
        <AuthSocialButton provider="Google" disabled={isLoading} />
        <AuthSocialButton provider="GitHub" disabled={isLoading} />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700"></div>
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Or continue with email
        </span>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700"></div>
      </div>

      {/* Email Input */}
      <FormInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(value) => handleChange('email', value)}
        onBlur={() => handleBlur('email')}
        error={errors.email}
        isTouched={touched.email}
        icon={Mail}
      />

      {/* Password Input */}
      <FormInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(value) => handleChange('password', value)}
        onBlur={() => handleBlur('password')}
        error={errors.password}
        isTouched={touched.password}
        icon={Lock}
        showPasswordToggle={true}
        onPasswordToggle={() => setPasswordVisible(!passwordVisible)}
      />

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <motion.a
          href="#"
          whileHover={{ scale: 1.05 }}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          Forgot password?
        </motion.a>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading || Object.values(errors).some(e => e)}
        whileHover={!isLoading ? { scale: 1.02 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
        className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg
          hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
            Signing in...
          </>
        ) : (
          'Log in'
        )}
      </motion.button>
    </form>
  );
};

export default LoginForm;