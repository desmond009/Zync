import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 32);

const teamInvitationSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'MEMBER', 'VIEWER'],
      default: 'MEMBER',
    },
    token: {
      type: String,
      unique: true,
      default: () => nanoid(),
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
      default: 'PENDING',
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      index: true,
    },
    acceptedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for team + email
teamInvitationSchema.index({ teamId: 1, email: 1 });

// TTL index to auto-delete expired invitations
teamInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for team
teamInvitationSchema.virtual('team', {
  ref: 'Team',
  localField: 'teamId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for inviter
teamInvitationSchema.virtual('inviter', {
  ref: 'User',
  localField: 'invitedBy',
  foreignField: '_id',
  justOne: true,
});

// Check if invitation is expired
teamInvitationSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

teamInvitationSchema.methods.accept = async function () {
  if (this.status !== 'PENDING') {
    throw new Error('This invitation has already been used or expired.');
  }

  this.status = 'ACCEPTED';
  this.acceptedAt = new Date();
  await this.save();
};

teamInvitationSchema.methods.isValid = function () {
  return this.status === 'PENDING' && !this.isExpired();
};

const TeamInvitation = mongoose.model('TeamInvitation', teamInvitationSchema);

export default TeamInvitation;
