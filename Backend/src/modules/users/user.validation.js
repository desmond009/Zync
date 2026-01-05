import Joi from 'joi';
import { commonSchemas } from '../../middleware/validation.js';

export const updateProfileSchema = {
  body: Joi.object({
    firstName: Joi.string().trim().min(2).max(50),
    lastName: Joi.string().trim().min(2).max(50),
    avatar: Joi.string().uri().allow(null),
  }),
};

export const getUserSchema = {
  params: Joi.object({
    userId: commonSchemas.uuid.required(),
  }),
};

export const searchUsersSchema = {
  query: Joi.object({
    query: Joi.string().min(1).max(100).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
  }),
};
