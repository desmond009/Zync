import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * General rate limiter for all routes
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    throw new ApiError(429, 'Too many requests, please try again later');
  },
});

/**
 * Strict rate limiter for authentication routes
 * DEVELOPMENT: Set to very high limits for testing
 */
export const authLimiter = rateLimit({
  windowMs: config.isDevelopment ? 60 * 1000 : 15 * 60 * 1000, // 1 min in dev, 15 min in prod
  max: config.isDevelopment ? 1000 : 5, // 1000 requests in dev, 5 in prod
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true,
  handler: (req, res, next) => {
    if (config.isDevelopment) {
      // Skip rate limiting in development
      return next();
    }
    throw new ApiError(429, 'Too many authentication attempts, please try again after 15 minutes');
  },
});

/**
 * Rate limiter for password reset requests
 */
export const passwordResetLimiter = rateLimit({
  windowMs: config.isDevelopment ? 60 * 1000 : 60 * 60 * 1000, // 1 min in dev, 1 hour in prod
  max: config.isDevelopment ? 1000 : 3, // 1000 in dev, 3 in prod
  message: 'Too many password reset requests',
  handler: (req, res, next) => {
    if (config.isDevelopment) {
      return next();
    }
    throw new ApiError(429, 'Too many password reset attempts, please try again after 1 hour');
  },
});

/**
 * Rate limiter for email verification requests
 */
export const emailVerificationLimiter = rateLimit({
  windowMs: config.isDevelopment ? 60 * 1000 : 60 * 60 * 1000, // 1 min in dev, 1 hour in prod
  max: config.isDevelopment ? 1000 : 3, // 1000 in dev, 3 in prod
  handler: (req, res, next) => {
    if (config.isDevelopment) {
      return next();
    }
    throw new ApiError(429, 'Too many verification emails sent, please try again after 1 hour');
  },
});

/**
 * Rate limiter for file uploads
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  handler: (req, res, next) => {
    throw new ApiError(429, 'Too many file uploads, please try again later');
  },
});
