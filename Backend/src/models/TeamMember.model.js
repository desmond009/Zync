import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'],
      default: 'MEMBER',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INVITED', 'PENDING', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    invitedAt: {
      type: Date,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    permissions: {
      canCreateProjects: {
        type: Boolean,
        default: function () {
          return ['OWNER', 'ADMIN', 'MEMBER'].includes(this.role);
        },
      },
      canDeleteProjects: {
        type: Boolean,
        default: function () {
          return ['OWNER', 'ADMIN'].includes(this.role);
        },
      },
      canInviteMembers: {
        type: Boolean,
        default: function () {
          return ['OWNER', 'ADMIN'].includes(this.role);
        },
      },
      canManageMembers: {
        type: Boolean,
        default: function () {
          return ['OWNER', 'ADMIN'].includes(this.role);
        },
      },
      canManageSettings: {
        type: Boolean,
        default: function () {
          return this.role === 'OWNER';
        },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index
teamMemberSchema.index({ teamId: 1, userId: 1 }, { unique: true });

// Additional indexes
teamMemberSchema.index({ teamId: 1, role: 1 });
teamMemberSchema.index({ userId: 1, status: 1 });

// Virtual for team
teamMemberSchema.virtual('team', {
  ref: 'Team',
  localField: 'teamId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for user
teamMemberSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Method to check if has permission
teamMemberSchema.methods.hasPermission = function (permission) {
  return this.permissions[permission] === true;
};

// Method to update last seen
teamMemberSchema.methods.updateLastSeen = function () {
  this.lastSeenAt = new Date();
  return this.save();
};

// Pre-save hook to set permissions based on role
teamMemberSchema.pre('save', function (next) {
  if (this.isModified('role')) {
    this.permissions = {
      canCreateProjects: ['OWNER', 'ADMIN', 'MEMBER'].includes(this.role),
      canDeleteProjects: ['OWNER', 'ADMIN'].includes(this.role),
      canInviteMembers: ['OWNER', 'ADMIN'].includes(this.role),
      canManageMembers: ['OWNER', 'ADMIN'].includes(this.role),
      canManageSettings: this.role === 'OWNER',
    };
  }
  next();
});

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

export default TeamMember;
