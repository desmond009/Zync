import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      index: true,
    },
    type: {
      type: String,
      enum: [
        'TASK_ASSIGNED',
        'TASK_UPDATED',
        'TASK_COMMENT',
        'MENTION',
        'DEADLINE_APPROACHING',
        'TEAM_INVITE',
        'PROJECT_ADDED',
        'MESSAGE',
      ],
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    deduplicationKey: {
      type: String,
      index: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ userId: 1, projectId: 1 });
notificationSchema.index({ userId: 1, teamId: 1 });
notificationSchema.index({ userId: 1, deduplicationKey: 1 }, { unique: true, sparse: true });

// Virtual for user
notificationSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
