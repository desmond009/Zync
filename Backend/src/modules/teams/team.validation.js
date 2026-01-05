import Joi from 'joi';
import { commonSchemas } from '../../middleware/validation.js';

export const createTeamSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().max(500).allow('', null),
  }),
};

export const updateTeamSchema = {
  params: Joi.object({
    teamId: commonSchemas.uuid.required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    description: Joi.string().trim().max(500).allow('', null),
  }),
};

export const getTeamSchema = {
  params: Joi.object({
    teamId: commonSchemas.uuid.required(),
  }),
};

export const inviteMemberSchema = {
  params: Joi.object({
    teamId: commonSchemas.uuid.required(),
  }),
  body: Joi.object({
    email: commonSchemas.email.required(),
    role: Joi.string().valid('ADMIN', 'MEMBER', 'VIEWER').default('MEMBER'),
  }),
};

export const updateMemberRoleSchema = {
  params: Joi.object({
    teamId: commonSchemas.uuid.required(),
    memberId: commonSchemas.uuid.required(),
  }),
  body: Joi.object({
    role: Joi.string().valid('ADMIN', 'MEMBER', 'VIEWER').required(),
  }),
};

export const removeMemberSchema = {
  params: Joi.object({
    teamId: commonSchemas.uuid.required(),
    memberId: commonSchemas.uuid.required(),
  }),
};

export const joinTeamSchema = {
  body: Joi.object({
    inviteCode: Joi.string().required(),
  }),
};
