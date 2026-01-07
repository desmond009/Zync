import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    inviteCode: {
      type: String,
      unique: true,
      default: () => nanoid(),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for owner
teamSchema.virtual('owner', {
  ref: 'User',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for members
teamSchema.virtual('members', {
  ref: 'TeamMember',
  localField: '_id',
  foreignField: 'teamId',
});

// Virtual for projects
teamSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'teamId',
});

const Team = mongoose.model('Team', teamSchema);

export default Team;
