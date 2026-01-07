import Joi from 'joi';
import { commonSchemas } from '../../middleware/validation.js';

export const registerSchema = {
  body: Joi.object({
    email: commonSchemas.email.required(),
    password: commonSchemas.password
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
      }),
    firstName: Joi.string().trim().min(2).max(50).required(),
    lastName: Joi.string().trim().min(2).max(50).required(),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: commonSchemas.email.required(),
    password: Joi.string().required(),
  }),
};

export const verifyEmailSchema = {
  query: Joi.object({
    token: Joi.string().required(),
  }),
};

export const refreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().optional(),
  }),
};

export const forgotPasswordSchema = {
  body: Joi.object({
    email: commonSchemas.email.required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    token: Joi.string().required(),
    password: commonSchemas.password
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
      }),
  }),
};

export const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonSchemas.password
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
      }),
  }),
};
