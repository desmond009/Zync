/**
 * Authentication Setup & Configuration Helper
 * 
 * This file provides utilities and examples for configuring and customizing
 * the authentication screens in your Zync application.
 */

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

/**
 * Customize the auth screens' appearance by editing the theme values:
 */

export const authTheme = {
  colors: {
    primary: {
      light: 'from-indigo-600 to-purple-600',
      dark: 'from-indigo-600 to-purple-600', // Same across themes
      hover: 'from-indigo-700 to-purple-700',
    },
    background: {
      light: 'bg-white',
      dark: 'dark:bg-zinc-950',
    },
    text: {
      primary: 'text-zinc-900 dark:text-white',
      secondary: 'text-zinc-500 dark:text-zinc-400',
      tertiary: 'text-zinc-600 dark:text-zinc-300',
    },
    border: {
      light: 'border-zinc-200',
      dark: 'dark:border-zinc-700',
    },
    error: {
      light: 'text-red-500',
      dark: 'dark:text-red-400',
    },
    success: {
      light: 'text-green-500',
      dark: 'dark:text-green-400',
    },
  },
  spacing: {
    inputHeight: 'h-11', // 44px
    borderRadius: 'rounded-lg', // 8px
    formGap: 'space-y-6', // 24px between sections
  },
  animation: {
    formTransitionDuration: 0.4, // seconds
    fieldAnimationDuration: 0.3, // seconds
    errorShakeDuration: 0.4, // seconds
  },
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * Customize validation rules for form fields
 */

export const validationRules = {
  email: {
    required: 'Email is required',
    invalid: 'Please enter a valid email',
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    login: {
      required: 'Password is required',
      min: { length: 6, message: 'Password must be at least 6 characters' },
    },
    signup: {
      required: 'Password is required',
      min: { length: 8, message: 'Password must be at least 8 characters' },
      uppercase: 'Password must contain an uppercase letter',
      lowercase: 'Password must contain a lowercase letter',
      number: 'Password must contain a number',
    },
  },
  fullName: {
    required: 'Full name is required',
    min: { length: 2, message: 'Name must be at least 2 characters' },
    invalid: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    regex: /^[a-zA-Z\s'-]+$/,
  },
  confirmPassword: {
    required: 'Please confirm your password',
    mismatch: 'Passwords do not match',
  },
};

// ============================================================================
// ROUTER CONFIGURATION
// ============================================================================

/**
 * Example router setup for auth pages
 */

export const routerConfig = `
// src/routes.jsx or src/main.jsx

import { createBrowserRouter } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  // ... other routes
]);

// In your main app:
// <RouterProvider router={router} />
`;

// ============================================================================
// AUTH SERVICE INTEGRATION
// ============================================================================

/**
 * Example auth service for API integration
 */

export const authServiceExample = `
// src/services/auth.service.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authService = {
  // Login with email and password
  login: async (email, password) => {
    try {
      const response = await axios.post(\`\${API_URL}/auth/login\`, {
        email,
        password,
      });
      
      // Store token
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return {
        success: true,
        data: response.data,
        token: response.data.token,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  },

  // Sign up with email and password
  signup: async (fullName, email, password) => {
    try {
      const response = await axios.post(\`\${API_URL}/auth/signup\`, {
        fullName,
        email,
        password,
      });
      
      // Store token
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return {
        success: true,
        data: response.data,
        token: response.data.token,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Signup failed',
      };
    }
  },

  // Google OAuth callback
  googleLogin: async (idToken) => {
    try {
      const response = await axios.post(\`\${API_URL}/auth/google\`, {
        idToken,
      });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return {
        success: true,
        data: response.data,
        token: response.data.token,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Google auth failed',
      };
    }
  },

  // GitHub OAuth callback
  githubLogin: async (code) => {
    try {
      const response = await axios.post(\`\${API_URL}/auth/github\`, {
        code,
      });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return {
        success: true,
        data: response.data,
        token: response.data.token,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'GitHub auth failed',
      };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
  },

  // Get current user
  getCurrentUser: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      const response = await axios.get(\`\${API_URL}/auth/me\`, {
        headers: {
          Authorization: \`Bearer \${token}\`,
        },
      });
      return response.data;
    } catch (error) {
      return null;
    }
  },
};

export default authService;
`;

// ============================================================================
// AUTH STORE INTEGRATION (Zustand)
// ============================================================================

/**
 * Example Zustand auth store
 */

export const authStoreExample = `
// src/store/authStore.js

import { create } from 'zustand';
import authService from '../services/auth.service';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('authToken') || null,
  isLoading: false,
  error: null,

  // Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    const result = await authService.login(email, password);
    
    if (result.success) {
      set({
        user: result.data.user,
        token: result.token,
        isLoading: false,
      });
      return { success: true };
    } else {
      set({
        error: result.error,
        isLoading: false,
      });
      return { success: false, error: result.error };
    }
  },

  // Signup
  signup: async (fullName, email, password) => {
    set({ isLoading: true, error: null });
    const result = await authService.signup(fullName, email, password);
    
    if (result.success) {
      set({
        user: result.data.user,
        token: result.token,
        isLoading: false,
      });
      return { success: true };
    } else {
      set({
        error: result.error,
        isLoading: false,
      });
      return { success: false, error: result.error };
    }
  },

  // Logout
  logout: () => {
    authService.logout();
    set({ user: null, token: null, error: null });
  },

  // Restore session
  restoreSession: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    set({ isLoading: true });
    const user = await authService.getCurrentUser();
    
    if (user) {
      set({ user, isLoading: false });
    } else {
      set({ token: null, isLoading: false });
    }
  },

  // Setters
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
`;

// ============================================================================
// PROTECTED ROUTE COMPONENT
// ============================================================================

/**
 * Protected route wrapper for authenticated pages
 */

export const protectedRouteExample = `
// src/components/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const { token, isLoading } = useAuthStore();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

// Usage in router:
// <Route
//   path="/dashboard"
//   element={
//     <ProtectedRoute>
//       <Dashboard />
//     </ProtectedRoute>
//   }
// />
`;

// ============================================================================
// INTEGRATING FORMS WITH AUTH STORE
// ============================================================================

/**
 * Example: Updating LoginForm to use auth store
 */

export const integrateLoginFormExample = `
// Updated LoginForm.jsx with auth integration

import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  // ... existing state ...
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    if (!emailError && !passwordError) {
      setIsLoading(true);
      
      // Use auth store to login
      const result = await login(email, password);
      
      if (result.success) {
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        // Show error
        setErrors({ form: result.error });
      }
      
      setIsLoading(false);
    }
  };

  // ... rest of component ...
};
`;

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

/**
 * Required environment variables for auth
 */

export const envExample = `
# .env (Frontend)

# API Configuration
VITE_API_URL=http://localhost:5000/api

# OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GITHUB_CLIENT_ID=your_github_client_id_here

# App URLs
VITE_APP_URL=http://localhost:5173
VITE_REDIRECT_URL=http://localhost:5173/auth/callback
`;

// ============================================================================
// MIGRATION FROM OLD AUTH
// ============================================================================

/**
 * Steps to migrate from existing auth system
 */

export const migrationSteps = [
  {
    step: 1,
    title: 'Backup existing auth',
    description: 'Save your current auth components and pages',
  },
  {
    step: 2,
    title: 'Install dependencies',
    description: 'Ensure all required packages are installed',
    command: 'npm install framer-motion lucide-react react-icons',
  },
  {
    step: 3,
    title: 'Replace auth pages',
    description: 'Replace old AuthPage with new implementation',
  },
  {
    step: 4,
    title: 'Update router',
    description: 'Point /auth route to new AuthPage component',
  },
  {
    step: 5,
    title: 'Integrate auth service',
    description: 'Wire forms to your authentication API',
  },
  {
    step: 6,
    title: 'Test all flows',
    description: 'Test login, signup, social auth, validations',
  },
  {
    step: 7,
    title: 'Deploy',
    description: 'Roll out to staging, then production',
  },
];

// ============================================================================
// CUSTOMIZATION HOOKS
// ============================================================================

/**
 * Custom hooks for extending auth functionality
 */

export const customHooksExample = `
// src/hooks/useLoginForm.js

import { useState } from 'react';

export function useLoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    // ... validation logic ...
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Validate on change if already touched
    if (touched[field]) {
      validateForm();
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleSubmit = async (onSubmit) => {
    validateForm();
    
    if (Object.values(errors).every(e => !e)) {
      setIsLoading(true);
      try {
        await onSubmit(formData);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    formData,
    errors,
    touched,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
`;

// ============================================================================
// TESTING WITH VITEST
// ============================================================================

/**
 * Example tests for auth forms
 */

export const testExample = `
// src/components/auth/__tests__/LoginForm.test.jsx

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoginForm from '../LoginForm';

describe('LoginForm', () => {
  it('should show email error on blur with empty value', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    
    fireEvent.blur(emailInput);
    
    expect(await screen.findByText(/Email is required/)).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    
    fireEvent.change(emailInput, { target: { value: 'notanemail' } });
    fireEvent.blur(emailInput);
    
    expect(await screen.findByText(/Please enter a valid email/)).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm />);
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByRole('button', { name: /Log in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Assert form submission
  });
});
`;

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

export const troubleshooting = {
  'Animations not working': {
    cause: 'framer-motion not installed',
    solution: 'npm install framer-motion@latest',
  },
  'Icons missing': {
    cause: 'lucide-react not installed',
    solution: 'npm install lucide-react react-icons',
  },
  'Dark mode not applying': {
    cause: 'tailwind.config.js missing darkMode config',
    solution: 'Add "darkMode: \'class\'" to tailwind config',
  },
  'Validation not triggering': {
    cause: 'Fields not in touched state',
    solution: 'Call handleBlur on input blur event',
  },
  'Form keeps resetting': {
    cause: 'Component re-renders causing state reset',
    solution: 'Check for unnecessary re-renders or key props',
  },
};

export default {
  authTheme,
  validationRules,
  routerConfig,
  authServiceExample,
  authStoreExample,
  protectedRouteExample,
  integrateLoginFormExample,
  envExample,
  migrationSteps,
  customHooksExample,
  testExample,
  troubleshooting,
};
