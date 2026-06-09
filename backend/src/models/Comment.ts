import mongoose, { Schema, Document } from 'mongoose';

export interface ICommentReport {
  userId: string;
  reason: string;
}

export interface IComment extends Document {
  blogId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  parentCommentId?: mongoose.Types.ObjectId | string;
  content: string;
  likes: string[]; // User ObjectIds
  reports: ICommentReport[];
  status: 'approved' | 'reported' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
    content: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reports: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['approved', 'reported', 'hidden'],
      default: 'approved',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
