import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Building2, Check, Shield } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import FormHeader from '../../components/auth/FormHeader';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';
import Divider from '../../components/auth/Divider';
import FormInput from '../../components/auth/FormInput';
import PasswordRequirements from '../../components/auth/PasswordRequirements';
import SubmitButton from '../../components/auth/SubmitButton';
import FormFooter from '../../components/auth/FormFooter';
import api from '../../services/api';

export default function SignupPage() {
  const navigate = useNavigate();
  const isDark = document.documentElement.classList.contains('dark');

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    workspaceName: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showPasswordReqs, setShowPasswordReqs] = useState(false);

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength('');
      return;
    }

    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);
    const hasSpecial = /[!@#$%^&*()_+-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
    const isLongEnough = formData.password.length >= 8;

    const strength = [hasUppercase, hasNumber, hasSpecial, isLongEnough].filter(Boolean).length;

    if (strength <= 1) setPasswordStrength('weak');
    else if (strength <= 2) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [formData.password]);

  const validateFullName = (name) => {
    if (!name) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/\d/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*()_+-=\[\]{};':"\\|,.<>\/?]/.test(password)) 
      return 'Password must contain at least one special character';
    return '';
  };

  const validateConfirmPassword = (confirm) => {
    if (!confirm) return 'Please confirm your password';
    if (confirm !== formData.password) return 'Passwords do not match';
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear errors as user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    let error = '';
    if (name === 'fullName') {
      error = validateFullName(formData.fullName);
    } else if (name === 'email') {
      error = validateEmail(formData.email);
    } else if (name === 'password') {
      error = validatePassword(formData.password);
    } else if (name === 'confirmPassword') {
      error = validateConfirmPassword(formData.confirmPassword);
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateStep = (currentStep) => {
    let stepErrors = {};

    if (currentStep === 1) {
      const nameError = validateFullName(formData.fullName);
      const emailError = validateEmail(formData.email);

      if (nameError) stepErrors.fullName = nameError;
      if (emailError) stepErrors.email = emailError;

      setTouched({ fullName: true, email: true });
    } else if (currentStep === 2) {
      const passwordError = validatePassword(formData.password);
      const confirmError = validateConfirmPassword(formData.confirmPassword);

      if (passwordError) stepErrors.password = passwordError;
      if (confirmError) stepErrors.confirmPassword = confirmError;

      setTouched({ password: true, confirmPassword: true });
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(step)) return;

    if (!formData.agreeToTerms) {
      setErrors({ terms: 'You must agree to the terms and privacy policy' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        workspaceName: formData.workspaceName,
      });

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken || '');
      }

      toast.success('Account created! Welcome to Zync!', {
        duration: 2,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(message);
      setErrors({ form: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider) => {
    setIsLoading(true);
    try {
      toast.loading(`Signing up with ${provider}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Account created with ${provider}`);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      toast.error(`Failed to signup with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                s === step
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white ring-2 ring-indigo-600/30'
                  : s < step
                  ? 'bg-green-500 text-white'
                  : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600'
              }`}
              animate={{ scale: s === step ? 1.05 : 1 }}
            >
              {s < step ? <Check size={18} /> : s}
            </motion.div>
            {s < 3 && (
              <div
                className={`flex-1 h-1 mx-2 transition-colors ${
                  s < step
                    ? 'bg-green-500'
                    : isDark ? 'bg-slate-700' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Personal Info</span>
        <span>Secure Account</span>
        <span>Workspace</span>
      </div>
    </div>
  );

  return (
    <AuthLayout>
      <FormHeader
        title="Create your account"
        subtitle="Start collaborating with your team today"
        badge={
          <div className="flex items-center gap-1">
            <Check size={14} className="text-green-500" />
            <span>Free 14-day trial • No credit card required</span>
          </div>
        }
      />

      {step === 1 && (
        <>
          <SocialAuthButtons
            isLoading={isLoading}
            onGoogle={() => handleSocialSignup('Google')}
            onGithub={() => handleSocialSignup('GitHub')}
          />
          <Divider />
        </>
      )}

      <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
        <StepIndicator />

        {/* Form Errors */}
        {errors.form && (
          <motion.div
            className={`mb-4 p-3 rounded-lg border-l-4 ${
              isDark
                ? 'bg-red-500/10 border-red-500 text-red-400'
                : 'bg-red-50 border-red-500 text-red-600'
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.form}
          </motion.div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <FormInput
              label="Full name"
              type="text"
              name="fullName"
              placeholder="John Doe"
              icon={User}
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.fullName && errors.fullName}
              success={touched.fullName && formData.fullName && !errors.fullName}
              required
            />

            <FormInput
              label="Work email"
              type="email"
              name="email"
              placeholder="you@company.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
              success={touched.email && formData.email && !errors.email}
              required
            />

            <motion.button
              type="button"
              onClick={handleNextStep}
              className="w-full mt-6 py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg active:scale-95 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue to Security
            </motion.button>
          </motion.div>
        )}

        {/* Step 2: Secure Account */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <FormInput
              label="Password"
              type="password"
              name="password"
              placeholder="Create a strong password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              onBlur={(e) => {
                handleBlur(e);
                setShowPasswordReqs(false);
              }}
              onFocus={() => setShowPasswordReqs(true)}
              error={touched.password && errors.password}
              passwordStrength={passwordStrength}
              showPasswordToggle
              required
            />

            {showPasswordReqs && formData.password && (
              <PasswordRequirements password={formData.password} />
            )}

            <FormInput
              label="Confirm password"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword && errors.confirmPassword}
              success={touched.confirmPassword && formData.confirmPassword && !errors.confirmPassword}
              showPasswordToggle
              required
            />

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handlePrevStep}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                  isDark
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border-slate-300 text-slate-900 hover:bg-slate-50'
                }`}
              >
                Back
              </button>
              <motion.button
                type="button"
                onClick={handleNextStep}
                className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg active:scale-95 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue to Workspace
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Workspace Setup */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <FormInput
              label="Workspace name"
              type="text"
              name="workspaceName"
              placeholder="Acme Inc."
              icon={Building2}
              value={formData.workspaceName}
              onChange={handleChange}
            />

            <motion.label
              className="flex items-start gap-3 mb-6 cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className={`relative w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  isDark
                    ? `border-slate-500 ${formData.agreeToTerms ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-700'}`
                    : `border-slate-300 ${formData.agreeToTerms ? 'bg-indigo-600 border-indigo-600' : 'bg-white'}`
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {formData.agreeToTerms && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <Check size={14} className="text-white" />
                  </motion.div>
                )}
              </motion.div>
              <span className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                I agree to the{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  Privacy Policy
                </a>
              </span>
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                className="hidden"
              />
            </motion.label>

            {errors.terms && (
              <motion.p
                className="text-red-500 text-xs mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.terms}
              </motion.p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePrevStep}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                  isDark
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border-slate-300 text-slate-900 hover:bg-slate-50'
                }`}
              >
                Back
              </button>
              <SubmitButton
                text="Create account"
                loading={isLoading}
                disabled={isLoading || !formData.agreeToTerms}
                icon={Shield}
              />
            </div>
          </motion.div>
        )}
      </form>

      <FormFooter
        text="Already have an account?"
        linkText="Log in"
        linkHref="/login"
      />
    </AuthLayout>
  );
}
