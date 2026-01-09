import mongoose from 'mongoose';

const fileMetadataSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
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
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
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

// Compound indexes for scoped queries
fileMetadataSchema.index({ projectId: 1, deletedAt: 1 });
fileMetadataSchema.index({ teamId: 1, deletedAt: 1 });
fileMetadataSchema.index({ uploaderId: 1, createdAt: -1 });

// Virtual for project
fileMetadataSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for uploader
fileMetadataSchema.virtual('uploader', {
  ref: 'User',
  localField: 'uploaderId',
  foreignField: '_id',
  justOne: true,
});

// Soft delete query middleware
fileMetadataSchema.pre(/^find/, function () {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
});

const FileMetadata = mongoose.model('FileMetadata', fileMetadataSchema);

export default FileMetadata;
