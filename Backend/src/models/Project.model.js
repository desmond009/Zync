import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
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
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['BACKLOG', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'],
      default: 'BACKLOG',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'NONE'],
      default: 'NONE',
    },
    leadUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    startDate: {
      type: Date,
    },
    targetDate: {
      type: Date,
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for team
projectSchema.virtual('team', {
  ref: 'Team',
  localField: 'teamId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for members
projectSchema.virtual('members', {
  ref: 'ProjectMember',
  localField: '_id',
  foreignField: 'projectId',
});

// Virtual for tasks
projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId',
});

// Virtual for messages
projectSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'projectId',
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
