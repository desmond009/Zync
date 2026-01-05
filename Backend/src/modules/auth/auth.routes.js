import express from 'express';
import authController from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.js';
import {
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
} from '../../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.validation.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), authController.register);

router.post('/login', authLimiter, validate(loginSchema), authController.login);

router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

router.get('/verify-email', emailVerificationLimiter, validate(verifyEmailSchema), authController.verifyEmail);

router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);

router.post('/reset-password', passwordResetLimiter, validate(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);

router.post('/resend-verification', authenticate, emailVerificationLimiter, authController.resendVerification);

router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

router.get('/me', authenticate, authController.getCurrentUser);

export default router;
