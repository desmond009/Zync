import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';

/**
 * Global error handler middleware
 * Handles all errors and sends appropriate response
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.stack);
  }

  // Prepare response
  const response = {
    success: false,
    message: error.message,
    statusCode: error.statusCode,
    ...(config.isDevelopment && { stack: error.stack }),
    ...(error.errors && { errors: error.errors }),
  };

  // Log error
  console.error('Error:', {
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Send response
  res.status(error.statusCode).json(response);
};

/**
 * Handle 404 errors for undefined routes
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Prisma error handler
 * Converts Prisma errors to ApiError
 */
export const prismaErrorHandler = (error) => {
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'field';
    return new ApiError(409, `${field} already exists`);
  }

  if (error.code === 'P2025') {
    return new ApiError(404, 'Record not found');
  }

  if (error.code === 'P2003') {
    return new ApiError(400, 'Invalid reference to related record');
  }

  if (error.code === 'P2014') {
    return new ApiError(400, 'Invalid ID provided');
  }

  return new ApiError(500, 'Database error occurred');
};
