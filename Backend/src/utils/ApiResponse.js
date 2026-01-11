/**
 * Standardized API Response class
 * Ensures consistent response structure across the application
 */
export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

/**
 * Helper function to send success response
 */
export const sendSuccess = (res, statusCode, data, message = 'Success') => {
  return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};

/**
 * Helper function to send paginated response
 */
export const sendPaginatedResponse = (
  res,
  statusCode,
  data,
  pagination,
  message = 'Success'
) => {
  return res.status(statusCode).json({
    statusCode,
    success: true,
    message,
    data,
    pagination,
  });
};
