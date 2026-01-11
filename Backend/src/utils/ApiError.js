/**
 * Custom API Error class
 * Used for consistent error handling across the application
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = null, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
