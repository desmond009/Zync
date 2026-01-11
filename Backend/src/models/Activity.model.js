import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'TASK_CREATED',
        'TASK_UPDATED',
        'TASK_DELETED',
        'TASK_ASSIGNED',
        'TASK_MOVED',
        'TASK_COMPLETED',
        'COMMENT_ADDED',
        'MEMBER_JOINED',
        'MEMBER_LEFT',
        'FILE_UPLOADED',
        'FILE_DELETED',
        'MESSAGE_SENT',
        'PROJECT_CREATED',
        'PROJECT_UPDATED',
        'PROJECT_ARCHIVED',
      ],
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['Task', 'Comment', 'Project', 'File', 'User'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
activitySchema.index({ projectId: 1, createdAt: -1 });
activitySchema.index({ teamId: 1, createdAt: -1 });
activitySchema.index({ actorId: 1, createdAt: -1 });
activitySchema.index({ type: 1, projectId: 1 });

// Virtual for actor
activitySchema.virtual('actor', {
  ref: 'User',
  localField: 'actorId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for project
activitySchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true,
});

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
