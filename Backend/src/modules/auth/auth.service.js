import { User } from '../../models/index.js';
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
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
    });

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken({ userId: user._id.toString() });

    // Send verification email
    await sendVerificationEmail(email, firstName, verificationToken);

    // Generate auth tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    return { user: user.toJSON(), accessToken, refreshToken };
  }

  /**
   * Login user
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find user (include password for verification)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Update last seen
    user.lastSeenAt = new Date();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return { user: user.toJSON(), accessToken, refreshToken };
  }

  /**
   * Logout user
   */
  async logout(userId) {
    // Clear refresh token from database
    await User.findByIdAndUpdate(userId, { refreshToken: null });
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
      const user = await User.findById(decoded.userId);

      if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Generate new tokens
      const tokens = generateTokens({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      // Update refresh token in database
      user.refreshToken = tokens.refreshToken;
      await user.save();

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
      const user = await User.findByIdAndUpdate(
        decoded.userId,
        { isEmailVerified: true },
        { new: true }
      ).select('id email firstName lastName isEmailVerified');

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

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
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.isEmailVerified) {
      throw new ApiError(400, 'Email already verified');
    }

    // Generate new verification token
    const verificationToken = generateEmailVerificationToken({ userId: user._id.toString() });

    // Send verification email
    await sendVerificationEmail(user.email, user.firstName, verificationToken);

    return true;
  }

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if user exists for security
    if (!user) {
      return true;
    }

    // Generate reset token
    const resetToken = generateEmailVerificationToken({ userId: user._id.toString() });

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

      // Find user
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Update password (will be hashed by pre-save hook) and clear refresh token
      user.password = newPassword;
      user.refreshToken = null; // Invalidate all sessions
      await user.save();

      return true;
    } catch (error) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }
  }

  /**
   * Change password (for authenticated users)
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    return true;
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId) {
    const user = await User.findById(userId).select(
      'id email firstName lastName avatar role isEmailVerified lastSeenAt createdAt'
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }
}

export default new AuthService();
