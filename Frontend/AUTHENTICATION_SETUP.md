# Zync Authentication Setup Guide

## Quick Start

### 1. Access the New Auth Pages

**Login Page**: `http://localhost:5173/login`
**Signup Page**: `http://localhost:5173/signup`

### 2. Features You Can Test Immediately

#### Login Page
- ✅ Email validation (real-time on blur)
- ✅ Password field with visibility toggle
- ✅ Remember me checkbox (saves email for 30 days)
- ✅ Forgot password link
- ✅ Social login buttons (visual only - needs backend)
- ✅ Dark mode toggle
- ✅ Responsive on all devices
- ✅ Error handling with toast notifications

#### Signup Page
- ✅ Multi-step form (3 steps)
- ✅ Step indicator with progress
- ✅ Full name validation
- ✅ Email validation with availability check UI
- ✅ Strong password requirements checklist
- ✅ Password strength meter (weak/medium/strong)
- ✅ Password confirmation matching
- ✅ Workspace name input
- ✅ Terms acceptance checkbox
- ✅ Dark mode support
- ✅ Back/next navigation between steps

### 3. Testing the Forms

#### Valid Test Data
```
Email: test@example.com
Password: TestPass123!

Full Name: John Doe
Workspace: Acme Inc.
```

#### Password Requirements
Must contain:
- ✓ At least 8 characters
- ✓ One uppercase letter (A-Z)
- ✓ One number (0-9)
- ✓ One special character (!@#$%^&*()_+-=[]{}...etc)

Example valid password: `MyPassword123!`

### 4. Dark Mode

Click the sun/moon icon in the top-right corner to toggle between light and dark modes. Your preference is saved automatically.

### 5. API Integration

When your backend is ready, the pages will automatically work. Just ensure:

**Backend API Endpoint**: `http://localhost:5000/api/auth/login`
**Backend API Endpoint**: `http://localhost:5000/api/auth/register`

The frontend proxy is configured in `vite.config.js` to route `/api/*` to `http://localhost:5000`.

### 6. Error Handling

The form will show:
- ✅ Inline error messages below fields
- ✅ Toast notifications for API errors
- ✅ Field shake animation on error
- ✅ Error icons (red X)

### 7. Success Flow

After successful login/signup:
- ✅ Success toast notification appears
- ✅ Form auto-redirects to `/dashboard` after 1.5 seconds
- ✅ Tokens saved to localStorage

### 8. Customization

#### Change Colors
Edit the gradient colors in:
- `src/components/auth/AuthLayout.jsx` - Left panel colors
- `src/components/auth/FormInput.jsx` - Focus ring colors
- `src/components/auth/SubmitButton.jsx` - Button gradient

#### Change Form Timeout
In `src/pages/auth/LoginPage.jsx` and `src/pages/auth/SignupPage.jsx`:
```javascript
setTimeout(() => {
  navigate('/dashboard');
}, 1500); // Change this value (milliseconds)
```

#### Change Remember Me Duration
In `LoginPage.jsx`:
```javascript
<RememberMe label="Remember me for X days" />
```

### 9. Component Reusability

All components are reusable:

```jsx
import FormInput from '@/components/auth/FormInput';

<FormInput
  label="Your Label"
  type="email"
  placeholder="Enter email"
  error={errors.email}
  success={isValid}
  required
/>
```

### 10. Keyboard Shortcuts

- `Tab` - Navigate to next field
- `Shift + Tab` - Navigate to previous field
- `Enter` - Submit form
- `Escape` - Clear errors (when implemented)

### 11. Browser Console Tips

Test the API calls in browser console:
```javascript
// Check saved email
localStorage.getItem('zync-remembered-email')

// Check auth token
localStorage.getItem('accessToken')

// Clear all auth data
localStorage.clear()
```

### 12. Mobile Testing

The pages are fully responsive:
- **Mobile** (< 768px): Stacked layout, large touch targets
- **Tablet** (768px - 1024px): Adjusted spacing
- **Desktop** (> 1024px): Split-screen layout

Test by:
1. Resizing browser window
2. Using Chrome DevTools device emulation
3. Testing on actual mobile device

### 13. Accessibility

All pages include:
- ✅ WCAG AAA color contrast
- ✅ Keyboard navigation
- ✅ Screen reader support (ARIA labels)
- ✅ Focus visible indicators
- ✅ Required field indicators
- ✅ Error announcements

Test with:
- Keyboard only (Tab, Shift+Tab, Enter)
- Screen reader (NVDA, JAWS, VoiceOver)
- Color blindness tools

### 14. Performance Optimizations

- ✅ Form validation debounced (300ms)
- ✅ API calls optimized
- ✅ Animations use GPU (transform, opacity)
- ✅ Components lazy-loaded in routes
- ✅ Images optimized

### 15. Browser Support

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Troubleshooting

### Issue: Form not submitting
**Solution**: Check browser console for errors. Ensure all required fields are filled and valid.

### Issue: Dark mode not working
**Solution**: Clear browser localStorage and refresh. Check that Tailwind dark mode is enabled.

### Issue: API calls failing
**Solution**: 
1. Check backend is running on port 5000
2. Check CORS is configured correctly
3. Check network tab in DevTools for actual error

### Issue: Animations not smooth
**Solution**: 
1. Check GPU acceleration is enabled
2. Close other browser tabs
3. Check hardware acceleration in browser settings

### Issue: Mobile layout broken
**Solution**: 
1. Clear browser cache
2. Check viewport meta tag in index.html
3. Test in private/incognito mode

## Support

For detailed documentation, see `README.md` in this directory.

---

**Happy Coding! 🚀**

