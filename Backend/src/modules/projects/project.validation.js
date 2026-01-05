import Joi from 'joi';
import { commonSchemas } from '../../middleware/validation.js';

export const createProjectSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().max(500).allow('', null),
    teamId: commonSchemas.uuid.required(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#3B82F6'),
  }),
};

export const updateProjectSchema = {
  params: Joi.object({
    projectId: commonSchemas.uuid.required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    description: Joi.string().trim().max(500).allow('', null),
    status: Joi.string().valid('ACTIVE', 'ARCHIVED', 'COMPLETED'),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i),
  }),
};

export const getProjectSchema = {
  params: Joi.object({
    projectId: commonSchemas.uuid.required(),
  }),
};

export const addProjectMemberSchema = {
  params: Joi.object({
    projectId: commonSchemas.uuid.required(),
  }),
  body: Joi.object({
    userId: commonSchemas.uuid.required(),
    role: Joi.string().valid('MANAGER', 'CONTRIBUTOR', 'VIEWER').default('CONTRIBUTOR'),
  }),
};

export const updateProjectMemberSchema = {
  params: Joi.object({
    projectId: commonSchemas.uuid.required(),
    memberId: commonSchemas.uuid.required(),
  }),
  body: Joi.object({
    role: Joi.string().valid('MANAGER', 'CONTRIBUTOR', 'VIEWER').required(),
  }),
};
