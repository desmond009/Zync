import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import FormHeader from '../../components/auth/FormHeader';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';
import Divider from '../../components/auth/Divider';
import FormInput from '../../components/auth/FormInput';
import RememberMe from '../../components/auth/RememberMe';
import SubmitButton from '../../components/auth/SubmitButton';
import FormFooter from '../../components/auth/FormFooter';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const isDark = document.documentElement.classList.contains('dark');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSucess] = useState({});

  // Auto-fill remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem('zync-remembered-email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
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

    // Real-time email validation
    if (name === 'email' && touched.email) {
      const error = validateEmail(value);
      setErrors(prev => ({ ...prev, email: error }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate on blur
    let error = '';
    if (name === 'email') {
      error = validateEmail(formData.email);
    } else if (name === 'password') {
      error = validatePassword(formData.password);
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setTouched({ email: true, password: true });

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setIsLoading(true);

    try {
      // Use auth store login method to update global state
      await login(formData.email, formData.password);

      // Remember email if checked
      if (formData.rememberMe) {
        localStorage.setItem('zync-remembered-email', formData.email);
      } else {
        localStorage.removeItem('zync-remembered-email');
      }

      toast.success('Welcome back!', {
        duration: 1500,
        position: 'top-right',
      });

      // Redirect immediately since auth state is updated
      navigate('/app/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      setErrors({ form: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    try {
      // In production, implement OAuth flow
      toast.loading(`Connecting to ${provider}...`);
      // Simulate OAuth delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Logged in with ${provider}`);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      toast.error(`Failed to login with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Back Link */}
      <motion.a
        href="/"
        className={`absolute top-8 left-8 flex items-center gap-2 text-sm font-medium transition-colors ${
          isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'
        }`}
        whileHover={{ x: -4 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ArrowLeft size={16} />
        Back to home
      </motion.a>

      <FormHeader
        title="Welcome back"
        subtitle="Login to continue to your workspace"
      />

      <SocialAuthButtons
        isLoading={isLoading}
        onGoogle={() => handleSocialLogin('Google')}
        onGithub={() => handleSocialLogin('GitHub')}
      />

      <Divider />

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

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Email address"
          type="email"
          name="email"
          placeholder="you@example.com"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email && errors.email}
          success={touched.email && formData.email && !errors.email}
          required
        />

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Password
              <span className="text-red-500 ml-1">*</span>
            </label>
            <a
              href="/forgot-password"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <FormInput
            type="password"
            name="password"
            placeholder="Enter your password"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password && errors.password}
            showPasswordToggle
            required
          />
        </div>

        <RememberMe
          checked={formData.rememberMe}
          onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
        />

        <SubmitButton
          text="Log in"
          loading={isLoading}
          disabled={isLoading}
        />
      </form>

      <FormFooter
        text="Don't have an account?"
        linkText="Sign up"
        linkHref="/signup"
      />
    </AuthLayout>
  );
}
