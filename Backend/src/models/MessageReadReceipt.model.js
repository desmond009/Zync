import mongoose from 'mongoose';

const messageReadReceiptSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    readAt: {
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
messageReadReceiptSchema.index({ messageId: 1, userId: 1 }, { unique: true });

// Virtual for message
messageReadReceiptSchema.virtual('message', {
  ref: 'Message',
  localField: 'messageId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for user
messageReadReceiptSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

const MessageReadReceipt = mongoose.model('MessageReadReceipt', messageReadReceiptSchema);

export default MessageReadReceipt;
