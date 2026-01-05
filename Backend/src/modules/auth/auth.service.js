import bcrypt from 'bcrypt';
import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  generateTokens,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
  verifyRefreshToken,
} from '../../utils/jwt.utils.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '../../utils/email.service.js';

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken({ userId: user.id });

    // Send verification email
    await sendVerificationEmail(email, firstName, verificationToken);

    // Generate auth tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { user, accessToken, refreshToken };
  }

  /**
   * Login user
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Update last seen
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  /**
   * Logout user
   */
  async logout(userId) {
    // Clear refresh token from database
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return true;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token required');
    }

    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Get user and verify refresh token matches
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Generate new tokens
      const tokens = generateTokens(user);

      // Update refresh token in database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return tokens;
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token) {
    try {
      // Verify token
      const decoded = verifyEmailVerificationToken(token);

      // Update user
      const user = await prisma.user.update({
        where: { id: decoded.userId },
        data: { isEmailVerified: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isEmailVerified: true,
        },
      });

      // Send welcome email
      await sendWelcomeEmail(user.email, user.firstName);

      return user;
    } catch (error) {
      throw new ApiError(400, 'Invalid or expired verification token');
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.isEmailVerified) {
      throw new ApiError(400, 'Email already verified');
    }

    // Generate new verification token
    const verificationToken = generateEmailVerificationToken({ userId: user.id });

    // Send verification email
    await sendVerificationEmail(user.email, user.firstName, verificationToken);

    return true;
  }

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists for security
    if (!user) {
      return true;
    }

    // Generate reset token
    const resetToken = generateEmailVerificationToken({ userId: user.id });

    // Send reset email
    await sendPasswordResetEmail(user.email, user.firstName, resetToken);

    return true;
  }

  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    try {
      // Verify token
      const decoded = verifyEmailVerificationToken(token);

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear refresh token
      await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          password: hashedPassword,
          refreshToken: null, // Invalidate all sessions
        },
      });

      return true;
    } catch (error) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }
  }

  /**
   * Change password (for authenticated users)
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return true;
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
        lastSeenAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }
}

export default new AuthService();
