import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema { body, params, query }
 * @returns {Function} Express middleware
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors
      allowUnknown: true, // Allow unknown keys
      stripUnknown: true, // Remove unknown keys
    };

    const toValidate = {};

    if (schema.body && req.body) {
      toValidate.body = req.body;
    }

    if (schema.params && req.params) {
      toValidate.params = req.params;
    }

    if (schema.query && req.query) {
      toValidate.query = req.query;
    }

    // Combine schemas
    const combinedSchema = Joi.object(schema);

    // Validate
    const { error, value } = combinedSchema.validate(toValidate, validationOptions);

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));

      throw new ApiError(400, 'Validation error', errors);
    }

    // Replace req values with validated values
    if (value.body) req.body = value.body;
    if (value.params) req.params = value.params;
    if (value.query) req.query = value.query;

    next();
  };
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  uuid: Joi.string().uuid(),
  email: Joi.string().email().lowercase().trim(),
  password: Joi.string().min(8).max(128),
  date: Joi.date().iso(),
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  },
};
