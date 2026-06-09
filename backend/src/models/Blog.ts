import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogSummary {
  tldr: string;
  keyPoints: string[];
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  coverImage: string;
  content: string;
  summary: IBlogSummary;
  author: mongoose.Types.ObjectId | string;
  category: string;
  tags: string[];
  readTime: number;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: Date;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  isPremium: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  audioUrl?: string;
  videoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    coverImage: { type: String, default: '' },
    content: { type: String, required: true },
    summary: {
      tldr: { type: String, default: '' },
      keyPoints: [{ type: String }],
    },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    readTime: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled'],
      default: 'draft',
    },
    scheduledAt: { type: Date },
    viewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
    audioUrl: { type: String },
    videoUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);
