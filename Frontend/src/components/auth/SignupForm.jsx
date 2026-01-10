import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import AuthSocialButton from './AuthSocialButton';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        return '';
      
      case 'email':
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email';
        return '';
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain a number';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      
      default:
        return '';
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      newErrors[field] = validateField(field, formData[field]);
    });

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.values(newErrors).every((err) => !err)) {
      setIsLoading(true);
      setTimeout(() => {
        console.log('Signup:', formData);
        setIsLoading(false);
      }, 1500);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  const FormInput = ({ 
    label, 
    field,
    type, 
    placeholder,
    icon: Icon,
    showPasswordToggle,
    onPasswordToggle
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const value = formData[field];
    const error = errors[field];
    const isTouched = touched[field];
    const inputType = (type === 'password' && passwordVisible) || (type === 'confirmPassword' && confirmPasswordVisible)
      ? 'text'
      : type === 'confirmPassword'
      ? 'password'
      : type;

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
            <Icon 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500 pointer-events-none transition-colors duration-200" 
              style={{
                color: isFocused && !error ? '#818cf8' : error && isTouched ? '#ef4444' : ''
              }}
            />
          )}

          <input
            type={inputType}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => {
              setIsFocused(false);
              handleBlur(field);
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
              {type === 'password' 
                ? (passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />)
                : (confirmPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />)
              }
            </button>
          )}

          {!error && isTouched && value && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
            >
              <CheckCircle2 size={18} />
            </motion.div>
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

        {field === 'password' && value && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getStrengthColor()}`}
                  layoutId="strength"
                  initial={{ width: 0 }}
                  animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 w-12">
                {getStrengthText()}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Must be 8+ characters with uppercase, lowercase, and number
            </p>
          </motion.div>
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

      {/* Full Name Input */}
      <FormInput
        label="Full Name"
        field="fullName"
        type="text"
        placeholder="John Doe"
        icon={User}
      />

      {/* Email Input */}
      <FormInput
        label="Email"
        field="email"
        type="email"
        placeholder="you@example.com"
        icon={Mail}
      />

      {/* Password Input */}
      <FormInput
        label="Password"
        field="password"
        type="password"
        placeholder="Create a strong password"
        icon={Lock}
        showPasswordToggle={true}
        onPasswordToggle={() => setPasswordVisible(!passwordVisible)}
      />

      {/* Confirm Password Input */}
      <FormInput
        label="Confirm Password"
        field="confirmPassword"
        type="confirmPassword"
        placeholder="Confirm your password"
        icon={Lock}
        showPasswordToggle={true}
        onPasswordToggle={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
      />

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
            Creating account...
          </>
        ) : (
          'Sign up'
        )}
      </motion.button>

      {/* Terms */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
        By signing up, you agree to our{' '}
        <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-200 underline">
          Terms of Service
        </a>
      </p>
    </form>
  );
};

export default SignupForm;