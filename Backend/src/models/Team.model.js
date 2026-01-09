import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);
const slugId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6);

// Helper function to generate slug
const generateSlug = (name) => {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${baseSlug}-${slugId()}`;
};

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      minlength: [2, 'Team name must be at least 2 characters'],
      maxlength: [50, 'Team name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    avatar: {
      type: String, // Cloudinary URL
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
      default: () => nanoid().toUpperCase().substring(0, 8),
      uppercase: true,
      length: 8,
    },
    settings: {
      allowMemberInvite: {
        type: Boolean,
        default: false,
      },
      requireApproval: {
        type: Boolean,
        default: true,
      },
      defaultRole: {
        type: String,
        enum: ['MEMBER', 'VIEWER'],
        default: 'MEMBER',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
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

// Virtual for member count
teamSchema.virtual('memberCount', {
  ref: 'TeamMember',
  localField: '_id',
  foreignField: 'teamId',
  count: true,
});

// Compound index for active teams
teamSchema.index({ isActive: 1, createdAt: -1 });

// Pre-save hook to generate slug
teamSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('name')) {
    if (!this.slug) {
      this.slug = generateSlug(this.name);
    }
  }
  next();
});

// Method to soft delete
teamSchema.methods.softDelete = function () {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

// Method to restore
teamSchema.methods.restore = function () {
  this.isActive = true;
  this.deletedAt = null;
  return this.save();
};

const Team = mongoose.model('Team', teamSchema);

export default Team;
