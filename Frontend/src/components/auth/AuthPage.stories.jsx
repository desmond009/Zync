/**
 * AuthPage Component Stories & Documentation
 * 
 * This file documents all the features and interactions of the new
 * login & signup authentication screens for Zync.
 * 
 * FEATURES:
 * =========
 * 
 * 1. RESPONSIVE SPLIT-SCREEN LAYOUT
 *    - Desktop: Left panel (brand experience) + Right panel (form)
 *    - Tablet/Mobile: Full-screen form with optimized spacing
 *    - Smooth transitions between breakpoints
 * 
 * 2. ANIMATED GRADIENT BACKGROUND (Left Panel)
 *    - Moving mesh gradient with animated orbs
 *    - Glass-morphic notification card showing real-time activity
 *    - Testimonial section with user avatar
 *    - Zync branding with rotating icon
 * 
 * 3. FORM VALIDATION & FEEDBACK
 *    - Real-time validation as user types (after first blur)
 *    - Error shake animation on failed validation
 *    - Visual indicators: red border + error icon
 *    - Success checkmark icons appear on valid fields
 *    - Field-specific error messages with descriptive text
 * 
 * 4. LOGIN FORM
 *    - Email validation (required + valid email format)
 *    - Password validation (minimum 6 characters)
 *    - Password visibility toggle with Eye/EyeOff icons
 *    - "Forgot password?" link
 *    - Loading state with spinner during submission
 *    - Smooth form transitions (slide in/out)
 * 
 * 5. SIGNUP FORM
 *    - Full name validation (2+ chars, letters only)
 *    - Email availability check (simulated)
 *    - Strong password requirements:
 *      * Minimum 8 characters
 *      * At least one uppercase letter
 *      * At least one lowercase letter
 *      * At least one number
 *    - Password strength meter (visual progress bar)
 *    - Strength indicator: Weak → Fair → Good → Strong
 *    - Confirm password matching validation
 *    - Terms & conditions link
 *    - Loading state with spinner during submission
 * 
 * 6. SOCIAL AUTHENTICATION
 *    - Google OAuth button with official icon (FcGoogle)
 *    - GitHub OAuth button with dark mode support
 *    - Full-width buttons with hover effects
 *    - Loading states for auth flows
 *    - Smooth hover animations (scale + Y offset)
 * 
 * 7. INTERACTIVE TRANSITIONS
 *    - Form switching animation: 
 *      * Login → Signup: slide left (exit) + right (enter)
 *      * Signup → Login: slide right (exit) + left (enter)
 *    - Button animations: hover scale (1.02) + tap scale (0.98)
 *    - Field animations: fade-in + slide-up on mount
 *    - Error animations: shake ([-10, 10, -10, 10, 0])
 *    - Password strength meter: smooth width transition
 * 
 * 8. DARK MODE SUPPORT
 *    - All components support light/dark themes
 *    - Tailwind dark: classes applied throughout
 *    - Colors automatically adjust on theme switch
 *    - Icons adjust color based on theme
 * 
 * 9. ACCESSIBILITY
 *    - Proper label associations
 *    - Form validation for screen readers
 *    - Disabled states on buttons during loading
 *    - Tab navigation support
 *    - Error messages linked to input fields
 * 
 * 10. ICONS & VISUAL DESIGN
 *     - Lucide React icons (Mail, Lock, Eye, EyeOff, User, etc.)
 *     - Icon colors change on focus and error states
 *     - CheckCircle2 icon for successful validation
 *     - AlertCircle icon for validation errors
 *     - Zap icon for Zync branding
 * 
 * STYLING DETAILS:
 * ================
 * 
 * Colors:
 * - Gradient: Indigo-600 → Purple-600 for buttons
 * - Error: Red-500 / Red-400 (dark)
 * - Success: Green-500 / Green-400 (dark)
 * - Background: White / Dark:Zinc-950
 * - Border: Zinc-200 / Dark:Zinc-700
 * 
 * Spacing:
 * - Input height: h-11 (44px, optimal for touch)
 * - Form spacing: space-y-6 between sections
 * - Container width: max-w-md on all screens
 * - Padding: px-4 sm:px-6 for responsive margins
 * 
 * Animations:
 * - Duration: 0.3-0.4s for form transitions
 * - Easing: easeInOut for smooth motion
 * - Repeat: Infinite loops on background orbs (8-10s)
 * 
 * INTERACTION FLOWS:
 * ==================
 * 
 * LOGIN FLOW:
 * 1. User enters email → validation on blur
 * 2. User enters password → validation on blur
 * 3. Click "Log in" → validates all fields
 * 4. If valid: shows spinner, simulates API call
 * 5. Success: can proceed (integrate with auth store)
 * 
 * SIGNUP FLOW:
 * 1. User enters full name → validates format
 * 2. User enters email → validates format
 * 3. User enters password → validates requirements + strength meter
 * 4. As user types password: strength updates (Weak → Strong)
 * 5. User enters confirm password → validates match
 * 6. Click "Sign up" → validates all fields
 * 7. If valid: shows spinner, simulates API call
 * 8. Success: can proceed (integrate with auth store)
 * 
 * FORM SWITCHING:
 * 1. User clicks "Sign up" on login form
 * 2. Login form slides left (exit) + opacity fades
 * 3. Signup form slides right (enter) + opacity fades in
 * 4. Header updates: "Welcome back" → "Create an account"
 * 5. Subtitle updates accordingly
 * 6. Toggle button updates text
 * 
 * USAGE IN APP:
 * =============
 * 
 * Import and use AuthPage:
 * 
 * import AuthPage from '@/pages/AuthPage';
 * 
 * // In your router:
 * <Route path="/auth" element={<AuthPage />} />
 * 
 * Connected Components:
 * - AuthPage (main page)
 * - LoginForm (login-specific form)
 * - SignupForm (signup-specific form)
 * - AuthSocialButton (reusable social auth button)
 * - FormInput (used internally in forms)
 * 
 * CUSTOMIZATION:
 * ==============
 * 
 * To customize colors, edit:
 * - Gradient: "from-indigo-600 to-purple-600" in button styles
 * - Background: "bg-white dark:bg-zinc-950"
 * - Borders: "border-zinc-200 dark:border-zinc-700"
 * 
 * To adjust animations, modify:
 * - Form transition: duration in motion.div key="login"
 * - Button animations: whileHover/whileTap scale values
 * - Field animations: stagger timing in FormInput
 * 
 * To add new fields:
 * 1. Add field to formData state
 * 2. Create validation rule in validateField()
 * 3. Add FormInput component with field prop
 * 4. Add field to touched/errors tracking
 * 
 * NOTES:
 * ======
 * 
 * - API integration: Replace setTimeout in handleSubmit with actual API calls
 * - Error handling: Currently shows simulated errors; wire to backend
 * - Success redirect: Add navigation after successful auth
 * - Social auth: Implement actual OAuth flows
 * - Password recovery: Wire "Forgot password?" to recovery page
 */

export default function AuthPageStories() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold">Authentication Screens</h1>
      <p className="mt-4 text-gray-600">
        See AuthPage.jsx and related components for implementation
      </p>
    </div>
  );
}
