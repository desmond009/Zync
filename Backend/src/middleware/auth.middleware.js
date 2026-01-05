import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { prisma } from '../config/database.js';

/**
 * Verify JWT access token and attach user to request
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      throw new ApiError(401, 'Invalid access token');
    }

    // Check if email is verified (optional, depending on requirements)
    if (!user.isEmailVerified && req.path !== '/auth/verify-email') {
      throw new ApiError(403, 'Please verify your email to continue');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid access token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired');
    }
    throw error;
  }
});

/**
 * Verify user has admin role
 */
export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Admin access required');
  }
  next();
});

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          isEmailVerified: true,
        },
      });

      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  
  next();
});
