import Analytics from '../models/Analytics';
import { mockAnalytics } from '../config/mockData';
import mongoose from 'mongoose';

export interface AnalyticsEventPayload {
  eventType: 'page_view' | 'blog_read' | 'video_play' | 'video_completed' | 'blog_completed' | 'revenue' | 'visitor' | 'bookmark_added' | 'share_clicked' | 'comment_added' | 'subscription_purchased' | 'community_post_created' | 'blog_like';
  blogId?: string;
  userId?: string;
  pageUrl?: string;
  duration?: number;
  amount?: number;
  source?: string;
  metadata?: Record<string, any>;
}

export const recordAnalyticsEvent = async (payload: AnalyticsEventPayload): Promise<void> => {
  if (process.env.MOCK_MODE === 'true') {
    mockAnalytics.push({
      eventType: payload.eventType,
      blogId: payload.blogId,
      userId: payload.userId,
      pageUrl: payload.pageUrl,
      duration: payload.duration,
      amount: payload.amount,
      source: payload.source,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const event: any = {
    eventType: payload.eventType,
    timestamp: new Date(),
  };

  if (payload.blogId) event.blogId = new mongoose.Types.ObjectId(payload.blogId);
  if (payload.userId) event.userId = new mongoose.Types.ObjectId(payload.userId);
  if (payload.pageUrl) event.pageUrl = payload.pageUrl;
  if (payload.duration !== undefined) event.duration = payload.duration;
  if (payload.amount !== undefined) event.amount = payload.amount;
  event.source = payload.source || 'direct';
  if (payload.metadata) event.metadata = payload.metadata;

  await Analytics.create(event);
};

export const parseTokenUserId = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) return null;
  const token = authorizationHeader.split(' ')[1];
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'super-secret-key-deven') as { id?: string };
    return decoded?.id || null;
  } catch {
    return null;
  }
};
