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

export const getTasksSchema = {
  query: Joi.object({
    projectId: commonSchemas.uuid.required(),
    status: Joi.string().valid('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'),
    assignedToId: commonSchemas.uuid,
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
  }),
};

export const moveTaskSchema = {
  params: Joi.object({
    taskId: commonSchemas.uuid.required(),
  }),
  body: Joi.object({
    status: Joi.string().valid('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE').required(),
    position: Joi.number().integer().min(0).required(),
    projectId: commonSchemas.uuid.required(),
  }),
};

export const assignTaskSchema = {
  params: Joi.object({
    taskId: commonSchemas.uuid.required(),
  }),
  body: Joi.object({
    assignedToId: commonSchemas.uuid.allow(null).required(),
    projectId: commonSchemas.uuid.required(),
  }),
};
