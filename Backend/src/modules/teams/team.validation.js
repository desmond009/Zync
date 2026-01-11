import Joi from 'joi';
import { commonSchemas } from '../../middleware/validation.js';

export const createTeamSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    description: Joi.string().trim().max(500).allow('', null),
    avatar: Joi.string().uri().allow('', null),
  }),
};

export const updateTeamSchema = {
  params: Joi.object({
    teamId: commonSchemas.uuid.required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(50),
    description: Joi.string().trim().max(500).allow('', null),
    avatar: Joi.string().uri().allow('', null),
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

export const inviteMemberByEmailSchema = {
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
    inviteCode: Joi.string().length(8).uppercase().required(),
  }),
};

export const transferOwnershipSchema = {
  params: Joi.object({
    teamId: commonSchemas.uuid.required(),
  }),
  body: Joi.object({
    newOwnerId: commonSchemas.uuid.required(),
  }),
};

export const updateSettingsSchema = {
  params: Joi.object({
    teamId: commonSchemas.uuid.required(),
  }),
  body: Joi.object({
    allowMemberInvite: Joi.boolean(),
    requireApproval: Joi.boolean(),
    defaultRole: Joi.string().valid('MEMBER', 'VIEWER'),
  }),
};
