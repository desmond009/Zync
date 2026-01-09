import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
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
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['TEXT', 'FILE', 'SYSTEM'],
      default: 'TEXT',
    },
    fileUrl: {
      type: String,
    },
    fileMetadataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FileMetadata',
    },
    sequenceNumber: {
      type: Number,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for sorting by creation time
messageSchema.index({ createdAt: 1 });

// Compound index for project + sequence ordering
messageSchema.index({ projectId: 1, sequenceNumber: 1 }, { unique: true });

// Compound index for team scoping
messageSchema.index({ teamId: 1, projectId: 1 });

// Virtual for project
messageSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for sender
messageSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for read receipts
messageSchema.virtual('readReceipts', {
  ref: 'MessageReadReceipt',
  localField: '_id',
  foreignField: 'messageId',
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
