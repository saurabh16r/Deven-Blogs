import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  eventType:
    | 'page_view'
    | 'blog_read'
    | 'video_play'
    | 'video_completed'
    | 'blog_completed'
    | 'revenue'
    | 'visitor'
    | 'bookmark_added'
    | 'share_clicked'
    | 'comment_added'
    | 'subscription_purchased'
    | 'community_post_created'
    | 'blog_like';
  blogId?: string;
  userId?: string;
  pageUrl?: string;
  duration?: number; // in seconds
  amount?: number; // for billing/revenue
  source?: string; // referrer source (e.g. direct, google, twitter)
  metadata?: Record<string, any>;
  timestamp: Date;
}

const AnalyticsSchema: Schema = new Schema(
  {
    eventType: {
      type: String,
      enum: [
        'page_view',
        'blog_read',
        'video_play',
        'video_completed',
        'blog_completed',
        'revenue',
        'visitor',
        'bookmark_added',
        'share_clicked',
        'comment_added',
        'subscription_purchased',
        'community_post_created',
        'blog_like',
      ],
      required: true,
    },
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    pageUrl: { type: String },
    duration: { type: Number },
    amount: { type: Number },
    source: { type: String, default: 'direct' },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
