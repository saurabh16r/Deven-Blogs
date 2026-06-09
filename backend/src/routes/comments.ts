import { Router, Response } from 'express';
import Comment from '../models/Comment';
import User from '../models/User';
import Blog from '../models/Blog';
import { requireAuth, AuthRequest } from '../middlewares/auth';
import { getMockComments, addMockComment, updateMockCommentStatus, getMockUsers } from '../config/mockData';
import { recordAnalyticsEvent } from '../utils/analytics';

const router = Router();

// GET ALL COMMENTS FOR A BLOG
router.get('/blog/:blogId', async (req, res) => {
  try {
    const { blogId } = req.params;

    if (process.env.MOCK_MODE === 'true') {
      const list = getMockComments(blogId).filter(c => c.status === 'approved');
      res.json(list);
      return;
    }

    // DB Mode
    const comments = await Comment.find({ blogId, status: 'approved' })
      .populate('userId', 'name avatar role')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving comments', error: (error as Error).message });
  }
});

// CREATE NEW COMMENT
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { blogId, content, parentCommentId } = req.body;

    if (!content || !blogId) {
      res.status(400).json({ message: 'Blog ID and content are required' });
      return;
    }

    // Verify subscription permission (Premium users get comment rights on premium blogs, or generally)
    const isSubscribed = req.user!.isSubscribed;

    if (process.env.MOCK_MODE === 'true') {
      const mockUsers = getMockUsers();
      const commenter = mockUsers.find((u: any) => u.id === userId);

      const newComment = {
        id: `mock-comment-id-${Date.now()}`,
        blogId,
        userId,
        userName: commenter ? commenter.name : 'Unknown User',
        userAvatar: commenter ? commenter.avatar : '',
        parentCommentId,
        content,
        likes: [],
        reports: [],
        status: 'approved' as const,
        createdAt: new Date().toISOString(),
      };

      addMockComment(newComment);
      res.status(201).json(newComment);
      return;
    }

    // Real DB Mode
    const blog = await Blog.findById(blogId);
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }

    // Enforce lock if blog is premium and reader is unsubscribed
    if (blog.isPremium && !isSubscribed) {
      res.status(403).json({ message: 'Subscribe to join the discussion.' });
      return;
    }

    const comment = await Comment.create({
      blogId,
      userId,
      parentCommentId,
      content,
    });

    await Blog.findByIdAndUpdate(blogId, { $inc: { commentsCount: 1 } });
    await recordAnalyticsEvent({
      eventType: 'comment_added',
      blogId,
      userId,
    });

    const populatedComment = await comment.populate('userId', 'name avatar role');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to post comment', error: (error as Error).message });
  }
});

// LIKE COMMENT
router.post('/:id/like', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!.id;

  if (process.env.MOCK_MODE === 'true') {
    res.json({ message: 'Comment liked (Mock Mode)', success: true });
    return;
  }

  try {
    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    const idx = comment.likes.indexOf(userId);
    if (idx > -1) {
      comment.likes.splice(idx, 1);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.json({ likesCount: comment.likes.length, isLiked: idx === -1 });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle like', error: (error as Error).message });
  }
});

// REPORT COMMENT
router.post('/:id/report', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!.id;
  const { reason } = req.body;

  if (process.env.MOCK_MODE === 'true') {
    updateMockCommentStatus(id, 'reported');
    res.json({ message: 'Comment reported (Mock Mode)', success: true });
    return;
  }

  try {
    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    comment.reports.push({ userId, reason: reason || 'Spam / Harassment' });
    comment.status = 'reported';
    await comment.save();

    res.json({ message: 'Comment reported successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to report comment', error: (error as Error).message });
  }
});

export default router;
