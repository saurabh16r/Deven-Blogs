import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Blog from '../models/Blog';
import Comment from '../models/Comment';
import Analytics from '../models/Analytics';
import { requireAuth, AuthRequest } from '../middlewares/auth';
import { getMockUsers, getMockBlogs, updateMockUser } from '../config/mockData';
import { recordAnalyticsEvent } from '../utils/analytics';

const router = Router();

// GET PROFILE DETAILS & DASHBOARD STATS
router.get('/dashboard', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    if (process.env.MOCK_MODE === 'true') {
      const mockUsers = getMockUsers();
      const user = mockUsers.find(u => u.id === userId);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Compute statistics
      const totalBlogsRead = user.readingHistory.length;
      const totalReadingTime = Math.round(user.readingHistory.reduce((acc: number, h: any) => acc + h.duration, 0) / 60); // minutes

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          streakCount: user.streakCount,
          isSubscribed: user.isSubscribed,
          subscriptionExpiresAt: user.subscriptionExpiresAt,
          referralCode: user.referralCode,
          referredCount: user.referredCount,
          founderRole: user.founderRole,
          startupStage: user.startupStage,
          interests: user.interests,
          goals: user.goals,
          contentPreferences: user.contentPreferences,
          completedOnboarding: user.completedOnboarding,
          onboardingCompleted: user.onboardingCompleted,
          themePreference: user.themePreference || 'system',
        },
        stats: {
          totalBlogsRead,
          totalReadingTime,
          currentPlan: user.isSubscribed ? 'Premium Membership' : 'Free Tier',
        }
      });
      return;
    }

    // Real DB Mode
    const user = await User.findById(userId)
      .populate({
        path: 'readingHistory.blogId',
        select: 'title slug coverImage category readTime'
      })
      .populate({
        path: 'bookmarks',
        select: 'title slug coverImage category'
      });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const totalBlogsRead = user.readingHistory.length;
    const totalReadingTime = Math.round(user.readingHistory.reduce((acc: number, h: any) => acc + h.duration, 0) / 60);
    const savedCount = user.bookmarks.length;
    const totalPublishedBlogs = await Blog.countDocuments({ status: 'published' });
    const completedLearningPaths = new Set(
      user.readingHistory.map((entry: any) => entry.blogId?.category || '').filter((cat: string) => cat)
    ).size;
    const currentLearningPath = user.startupStage || user.interests?.[0] ||
      user.readingHistory[0]?.blogId?.category || 'Getting Started';
    const progressPercentage = totalPublishedBlogs > 0 ? Math.min(100, Math.round((totalBlogsRead / totalPublishedBlogs) * 100)) : 0;

    const continueReading = user.readingHistory
      .slice()
      .reverse()
      .slice(0, 3)
      .map((history: any) => ({
        blogId: history.blogId?._id || history.blogId,
        title: history.blogId?.title || 'Continue Reading',
        slug: history.blogId?.slug || '',
        coverImage: history.blogId?.coverImage || '',
        lastReadAt: history.readAt,
        progress: history.blogId?.readTime
          ? Math.min(100, Math.round((history.duration / (history.blogId.readTime * 60)) * 100))
          : Math.min(100, Math.round((history.duration / 300) * 100)),
      }));

    const recentHistoryItems = user.readingHistory.map((history: any) => ({
      type: 'read',
      message: `Read ${history.blogId?.title || 'an article'}`,
      timestamp: history.readAt,
      blogTitle: history.blogId?.title,
      blogSlug: history.blogId?.slug,
    }));

    const rawAnalytics = await Analytics.find({ userId }).sort({ timestamp: -1 }).limit(5);
    const analyticsActivity = rawAnalytics.map(event => {
      let message = 'Performed an activity';
      switch (event.eventType) {
        case 'bookmark_added':
          message = 'Saved an article to bookmarks';
          break;
        case 'video_play':
          message = 'Started a video summary';
          break;
        case 'blog_completed':
          message = 'Completed a full article';
          break;
        case 'subscription_purchased':
          message = 'Purchased a subscription';
          break;
        case 'comment_added':
          message = 'Commented on a post';
          break;
        default:
          message = event.eventType.replace(/_/g, ' ');
      }

      return {
        type: event.eventType,
        message,
        timestamp: event.timestamp,
        blogId: event.blogId,
      };
    });

    const recentActivity = [...recentHistoryItems, ...analyticsActivity]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        streakCount: user.streakCount,
        isSubscribed: user.isSubscribed,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        referralCode: user.referralCode,
        referredCount: user.referredCount,
        founderRole: user.founderRole,
        startupStage: user.startupStage,
        interests: user.interests,
        goals: user.goals,
        contentPreferences: user.contentPreferences,
        completedOnboarding: user.completedOnboarding,
        onboardingCompleted: user.onboardingCompleted,
        themePreference: user.themePreference || 'system',
      },
      stats: {
        totalBlogsRead,
        totalReadingTime,
        savedCount,
        completedLearningPaths,
        currentPlan: user.isSubscribed ? 'Premium Membership' : 'Free Tier',
      },
      progress: {
        currentLearningPath,
        progressPercentage,
        totalPublishedBlogs,
      },
      continueReading,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user dashboard', error: (error as Error).message });
  }
});

// UPDATE PROFILE
router.put('/profile', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, avatar, password } = req.body;

    if (process.env.MOCK_MODE === 'true') {
      const updatedUser: any = {};
      if (name) updatedUser.name = name;
      if (avatar) updatedUser.avatar = avatar;

      const user = updateMockUser(userId, updatedUser);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json({ message: 'Profile updated successfully', user });
      return;
    }

    // DB Mode
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed', error: (error as Error).message });
  }
});

// GET BOOKMARKS (SAVED BLOGS)
router.get('/bookmarks', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    if (process.env.MOCK_MODE === 'true') {
      const mockUsers = getMockUsers();
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const allBlogs = getMockBlogs();
      const bookmarks = allBlogs.filter(b => user.bookmarks.includes(b.id));
      res.json(bookmarks);
      return;
    }

    // DB Mode
    const user = await User.findById(userId).populate({
      path: 'bookmarks',
      populate: { path: 'author', select: 'name avatar role' }
    });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user.bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Bookmarks fetch failed', error: (error as Error).message });
  }
});

// TOGGLE BOOKMARK
router.post('/bookmarks/toggle', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { blogId } = req.body;

    if (!blogId) {
      res.status(400).json({ message: 'blogId is required' });
      return;
    }

    if (process.env.MOCK_MODE === 'true') {
      const mockUsers = getMockUsers();
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const isBookmarked = user.bookmarks.includes(blogId);
      if (isBookmarked) {
        user.bookmarks = user.bookmarks.filter(id => id !== blogId);
      } else {
        user.bookmarks.push(blogId);
        await recordAnalyticsEvent({ eventType: 'bookmark_added', blogId, userId });
      }

      res.json({ isBookmarked: !isBookmarked, bookmarks: user.bookmarks });
      return;
    }

    // DB Mode
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const index = user.bookmarks.indexOf(blogId);
    let isBookmarked = false;

    if (index > -1) {
      user.bookmarks.splice(index, 1);
    } else {
      user.bookmarks.push(blogId);
      isBookmarked = true;
      await recordAnalyticsEvent({
        eventType: 'bookmark_added',
        blogId,
        userId,
      });
    }

    await user.save();
    res.json({ isBookmarked, bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: 'Bookmark toggle failed', error: (error as Error).message });
  }
});

// LOG READING HISTORY & UPDATE STREAK
router.post('/history', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { blogId, duration } = req.body; // duration in seconds

    if (!blogId) {
      res.status(400).json({ message: 'blogId is required' });
      return;
    }

    const todayStr = new Date().toDateString();

    if (process.env.MOCK_MODE === 'true') {
      const mockUsers = getMockUsers();
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Add to reading history
      user.readingHistory.push({
        blogId,
        readAt: new Date().toISOString(),
        duration: duration || 30
      });

      await recordAnalyticsEvent({
        eventType: 'blog_read',
        blogId,
        userId,
      });

      // Update Streaks
      let newStreak = user.streakCount;
      if (!user.lastReadDate) {
        newStreak = 1;
      } else {
        const lastRead = new Date(user.lastReadDate);
        const lastReadStr = lastRead.toDateString();

        if (lastReadStr !== todayStr) {
          const diffTime = Math.abs(new Date().getTime() - lastRead.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 1) {
            newStreak += 1;
          } else {
            newStreak = 1; // reset streak
          }
        }
      }

      user.streakCount = newStreak;
      user.lastReadDate = new Date().toISOString();

      res.json({ message: 'Reading history logged', streakCount: user.streakCount });
      return;
    }

    // DB Mode
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.readingHistory.push({
      blogId,
      readAt: new Date(),
      duration: duration || 30,
    });

    await recordAnalyticsEvent({
      eventType: 'blog_read',
      blogId,
      userId,
    });

    const blog = await Blog.findById(blogId);
    if (blog) {
      const completedThreshold = Math.max(30, Math.round(blog.readTime * 60 * 0.8));
      if ((duration || 0) >= completedThreshold) {
        await recordAnalyticsEvent({
          eventType: 'blog_completed',
          blogId,
          userId,
        });
      }
    }

    let newStreak = user.streakCount;
    if (!user.lastReadDate) {
      newStreak = 1;
    } else {
      const lastRead = new Date(user.lastReadDate);
      if (lastRead.toDateString() !== todayStr) {
        const diffTime = Math.abs(new Date().getTime() - lastRead.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }
    }

    user.streakCount = newStreak;
    user.lastReadDate = new Date();
    await user.save();

    res.json({ message: 'Reading history logged', streakCount: user.streakCount });
  } catch (error) {
    res.status(500).json({ message: 'History log failed', error: (error as Error).message });
  }
});

// GET READING HISTORY LIST
router.get('/history', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    if (process.env.MOCK_MODE === 'true') {
      const mockUsers = getMockUsers();
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const allBlogs = getMockBlogs();
      const history = user.readingHistory.map(h => {
        const blog = allBlogs.find(b => b.id === h.blogId);
        return {
          blogId: h.blogId,
          readAt: h.readAt,
          duration: h.duration,
          blogTitle: blog ? blog.title : 'Deleted Blog',
          blogCoverImage: blog ? blog.coverImage : '',
          blogSlug: blog ? blog.slug : ''
        };
      });

      res.json(history.reverse());
      return;
    }

    // DB Mode
    const user = await User.findById(userId).populate('readingHistory.blogId', 'title coverImage slug');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user.readingHistory.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history list', error: (error as Error).message });
  }
});

// SUBMIT ONBOARDING SELECTIONS
router.put('/onboarding', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { founderRole, startupStage, interests, goals, contentPreferences, skip } = req.body;

    if (process.env.MOCK_MODE === 'true') {
      const mockUsers = getMockUsers();
      const user = mockUsers.find(u => u.id === userId);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      user.completedOnboarding = true;
      user.onboardingCompleted = true;
      if (!skip) {
        user.founderRole = founderRole;
        user.startupStage = startupStage;
        user.interests = interests || [];
        user.goals = goals || [];
        user.contentPreferences = contentPreferences || [];
      }

      res.json({ message: 'Onboarding completed successfully', user });
      return;
    }

    // Real DB Mode
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.completedOnboarding = true;
    user.onboardingCompleted = true;
    if (!skip) {
      user.founderRole = founderRole;
      user.startupStage = startupStage;
      user.interests = interests || [];
      user.goals = goals || [];
      user.contentPreferences = contentPreferences || [];
    }

    await user.save();
    res.json({ message: 'Onboarding completed successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error saving onboarding details', error: (error as Error).message });
  }
});

// UPDATE THEME PREFERENCE
router.put('/theme', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { themePreference } = req.body;
    if (!['light', 'dark', 'system'].includes(themePreference)) {
      res.status(400).json({ message: 'Invalid theme preference' });
      return;
    }

    if (process.env.MOCK_MODE === 'true') {
      const user = updateMockUser(userId, { themePreference });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json({ message: 'Theme updated successfully', themePreference });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.themePreference = themePreference;
    await user.save();
    res.json({ message: 'Theme updated successfully', themePreference });
  } catch (error) {
    res.status(500).json({ message: 'Theme update failed', error: (error as Error).message });
  }
});

export default router;
