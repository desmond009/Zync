import Joi from 'joi';
import { commonSchemas } from '../../middleware/validation.js';

export const createTaskSchema = {
  body: Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(5000).allow('', null),
    projectId: commonSchemas.uuid.required(),
    status: Joi.string().valid('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE').default('TODO'),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
    dueDate: commonSchemas.date.allow(null),
    assignedToId: commonSchemas.uuid.allow(null),
    position: Joi.number().integer().default(0),
  }),
};

export const updateTaskSchema = {
  params: Joi.object({
    taskId: commonSchemas.uuid.required(),
  }),
  body: Joi.object({
    title: Joi.string().trim().min(1).max(200),
    description: Joi.string().trim().max(5000).allow('', null),
    status: Joi.string().valid('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    dueDate: commonSchemas.date.allow(null),
    assignedToId: commonSchemas.uuid.allow(null),
    position: Joi.number().integer(),
  }),
};

export const getTaskSchema = {
  params: Joi.object({
    taskId: commonSchemas.uuid.required(),
  }),
};

export const createCommentSchema = {
  params: Joi.object({
    taskId: commonSchemas.uuid.required(),
  }),
  body: Joi.object({
    content: Joi.string().trim().min(1).max(5000).required(),
  }),
};

export const updateCommentSchema = {
  params: Joi.object({
    taskId: commonSchemas.uuid.required(),
    commentId: commonSchemas.uuid.required(),
  }),
  body: Joi.object({
    content: Joi.string().trim().min(1).max(5000).required(),
  }),
};

export const deleteCommentSchema = {
  params: Joi.object({
    taskId: commonSchemas.uuid.required(),
    commentId: commonSchemas.uuid.required(),
  }),
};
