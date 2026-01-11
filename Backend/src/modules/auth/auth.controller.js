import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { setAuthCookies, clearAuthCookies } from '../../utils/jwt.utils.js';
import authService from './auth.service.js';

class AuthController {
  /**
   * @route   POST /api/v1/auth/register
   * @desc    Register a new user
   * @access  Public
   */
  register = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.register(req.body);

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    sendSuccess(res, 201, { user, accessToken, refreshToken }, 'Registration successful. Please verify your email.');
  });

  /**
   * @route   POST /api/v1/auth/login
   * @desc    Login user
   * @access  Public
   */
  login = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    sendSuccess(res, 200, { user, accessToken, refreshToken }, 'Login successful');
  });

  /**
   * @route   POST /api/v1/auth/logout
   * @desc    Logout user
   * @access  Private
   */
  logout = asyncHandler(async (req, res) => {
    await authService.logout(req.user.id);

    // Clear cookies
    clearAuthCookies(res);

    sendSuccess(res, 200, null, 'Logout successful');
  });

  /**
   * @route   POST /api/v1/auth/refresh
   * @desc    Refresh access token
   * @access  Public
   */
  refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshToken(refreshToken);

    // Set new cookies
    setAuthCookies(res, accessToken, newRefreshToken);

    sendSuccess(res, 200, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed successfully');
  });

  /**
   * @route   GET /api/v1/auth/verify-email
   * @desc    Verify user email
   * @access  Public
   */
  verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    const user = await authService.verifyEmail(token);

    sendSuccess(res, 200, { user }, 'Email verified successfully');
  });

  /**
   * @route   POST /api/v1/auth/resend-verification
   * @desc    Resend verification email
   * @access  Private
   */
  resendVerification = asyncHandler(async (req, res) => {
    await authService.resendVerificationEmail(req.user.id);

    sendSuccess(res, 200, null, 'Verification email sent successfully');
  });

  /**
   * @route   POST /api/v1/auth/forgot-password
   * @desc    Send password reset email
   * @access  Public
   */
  forgotPassword = asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);

    sendSuccess(res, 200, null, 'If the email exists, a password reset link has been sent');
  });

  /**
   * @route   POST /api/v1/auth/reset-password
   * @desc    Reset password with token
   * @access  Public
   */
  resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    await authService.resetPassword(token, password);

    sendSuccess(res, 200, null, 'Password reset successfully');
  });

  /**
   * @route   POST /api/v1/auth/change-password
   * @desc    Change password (authenticated)
   * @access  Private
   */
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.user.id, currentPassword, newPassword);

    sendSuccess(res, 200, null, 'Password changed successfully');
  });

  /**
   * @route   GET /api/v1/auth/me
   * @desc    Get current user
   * @access  Private
   */
  getCurrentUser = asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);

    sendSuccess(res, 200, { user }, 'User retrieved successfully');
  });
}

export default new AuthController();
