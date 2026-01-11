import mongoose from 'mongoose';

const projectMemberSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
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
      enum: ['MANAGER', 'CONTRIBUTOR', 'VIEWER'],
      default: 'CONTRIBUTOR',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index
projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

// Virtual for project
projectMemberSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for user
projectMemberSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

const ProjectMember = mongoose.model('ProjectMember', projectMemberSchema);

export default ProjectMember;
