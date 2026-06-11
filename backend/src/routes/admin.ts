import { Router, Response } from 'express';
import User from '../models/User';
import Blog from '../models/Blog';
import Comment from '../models/Comment';
import Category from '../models/Category';
import Coupon from '../models/Coupon';
import WebsiteSettings from '../models/WebsiteSettings';
import Analytics from '../models/Analytics';
import { requireAuth, requireRoles, AuthRequest } from '../middlewares/auth';
import {
  getMockBlogs, addMockBlog, updateMockBlog, deleteMockBlog,
  getMockComments, updateMockCommentStatus, deleteMockComment,
  getMockUsers, updateMockUser, mockWebsiteSettings, mockAnalytics, mockCoupons
} from '../config/mockData';

const router = Router();

// GET PUBLIC SETTINGS (Unauthenticated)
router.get('/public-settings', async (req, res) => {
  try {
    if (process.env.MOCK_MODE === 'true') {
      res.json(mockWebsiteSettings);
      return;
    }

    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = await WebsiteSettings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error loading settings', error: (error as Error).message });
  }
});

// Protect all admin endpoints with authentication & minimum "admin" role
router.use(requireAuth, requireRoles(['admin', 'superadmin']));

// ==========================================
// 1. ANALYTICS DASHBOARD
// ==========================================
router.get('/analytics', async (req: AuthRequest, res: Response) => {
  try {
    if (process.env.MOCK_MODE === 'true') {
      // Return predefined rich analytics summaries for charts
      res.json({
        overview: [
          { title: 'Total Visitors', value: '1,420', change: '+12.4%', type: 'visitors' },
          { title: 'Blog Views', value: '3,842', change: '+18.2%', type: 'views' },
          { title: 'Premium Revenue', value: '₹14,950', change: '+25.4%', type: 'revenue' },
          { title: 'Subscribers', value: '62', change: '+8.1%', type: 'subscribers' },
        ],
        trafficSources: [
          { name: 'Direct Search', value: 45 },
          { name: 'Google SEO', value: 30 },
          { name: 'Twitter/X', value: 15 },
          { name: 'LinkedIn Posts', value: 10 },
        ],
        viewsAndRevenue: [
          { date: 'Jun 01', views: 240, revenue: 1196 },
          { date: 'Jun 02', views: 310, revenue: 1495 },
          { date: 'Jun 03', views: 450, revenue: 2093 },
          { date: 'Jun 04', views: 380, revenue: 1794 },
          { date: 'Jun 05', views: 560, revenue: 2691 },
          { date: 'Jun 06', views: 640, revenue: 2990 },
          { date: 'Jun 07', views: 720, revenue: 3588 },
        ],
        retentionRates: [
          { month: 'Jan', active: 80, churn: 20 },
          { month: 'Feb', active: 85, churn: 15 },
          { month: 'Mar', active: 90, churn: 10 },
          { month: 'Apr', active: 88, churn: 12 },
          { month: 'May', active: 92, churn: 8 },
        ]
      });
      return;
    }

    // DB Mode
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Overview metrics
    const totalUsers = await User.countDocuments();
    const totalSubs = await User.countDocuments({ isSubscribed: true });
    
    const totalViewsRes = await Blog.aggregate([{ $group: { _id: null, total: { $sum: '$viewsCount' } } }]);
    const totalViews = totalViewsRes[0]?.total || 0;

    const revenueRes = await Analytics.aggregate([
      { $match: { eventType: { $in: ['revenue', 'subscription_purchased'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueRes[0]?.total || 0;

    // 2. Traffic Sources aggregation
    const trafficRes = await Analytics.aggregate([
      { $match: { eventType: { $in: ['page_view', 'visitor'] }, source: { $exists: true, $ne: '' } } },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    const totalTraffic = trafficRes.reduce((acc, curr) => acc + curr.count, 0);
    const trafficSources = trafficRes.map(t => ({
      name: t._id === 'direct' ? 'Direct Search' : t._id === 'google' ? 'Google SEO' : t._id === 'twitter' ? 'Twitter/X' : t._id === 'linkedin' ? 'LinkedIn Posts' : t._id,
      value: totalTraffic > 0 ? Math.round((t.count / totalTraffic) * 100) : 0
    }));
    if (trafficSources.length === 0) {
      trafficSources.push(
        { name: 'Direct Search', value: 50 },
        { name: 'Google SEO', value: 30 },
        { name: 'Twitter/X', value: 20 }
      );
    }

    // 3. Views and Revenue over last 7 days
    const viewsAndRevenueAgg = await Analytics.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            dateStr: { $dateToString: { format: '%b %d', date: '$timestamp' } },
            day: { $dayOfMonth: '$timestamp' }
          },
          views: {
            $sum: {
              $cond: [{ $in: ['$eventType', ['page_view', 'blog_read']] }, 1, 0]
            }
          },
          revenue: {
            $sum: {
              $cond: [{ $in: ['$eventType', ['revenue', 'subscription_purchased']] }, '$amount', 0]
            }
          }
        }
      },
      { $sort: { '_id.day': 1 } }
    ]);

    let viewsAndRevenue = viewsAndRevenueAgg.map(v => ({
      date: v._id.dateStr,
      views: v.views,
      revenue: v.revenue
    }));

    if (viewsAndRevenue.length === 0) {
      const today = new Date();
      viewsAndRevenue = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        return { date: dateStr, views: 0, revenue: 0 };
      });
    }

    // 4. Retention rates over last 5 months
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    const retentionRatesAgg = await Analytics.aggregate([
      { $match: { eventType: { $in: ['revenue', 'subscription_purchased'] }, timestamp: { $gte: fiveMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%b', date: '$timestamp' } },
          revenueCount: { $sum: 1 }
        }
      }
    ]);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const retentionRates = Array.from({ length: 5 }).map((_, i) => {
      const idx = (currentMonthIdx - 4 + i + 12) % 12;
      const monthName = monthNames[idx];
      const match = retentionRatesAgg.find(r => r._id === monthName);
      return {
        month: monthName,
        active: match ? Math.min(95, 80 + match.revenueCount) : 85,
        churn: match ? Math.max(5, 20 - match.revenueCount) : 15
      };
    });

    res.json({
      overview: [
        { title: 'Total Readers', value: totalUsers.toString(), change: '+5%', type: 'visitors' },
        { title: 'Blog Views', value: totalViews.toString(), change: '+10%', type: 'views' },
        { title: 'Premium Revenue', value: `₹${totalRevenue}`, change: '+15%', type: 'revenue' },
        { title: 'Subscribers', value: totalSubs.toString(), change: '+12%', type: 'subscribers' },
      ],
      trafficSources,
      viewsAndRevenue,
      retentionRates
    });
  } catch (error) {
    res.status(500).json({ message: 'Analytics query failed', error: (error as Error).message });
  }
});

// ==========================================
// 2. BLOGS MANAGEMENT (CRUD)
// ==========================================
// CREATE
router.post('/blogs', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, coverImage, category, tags, isPremium, seoTitle, seoDescription, seoKeywords, status } = req.body;
    const authorId = req.user!.id;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const tldr = content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
    const keyPoints = [
      `Summary details for ${title}`,
      'Automatically generated takeaways',
      'Advanced implementation highlights',
    ];

    if (process.env.MOCK_MODE === 'true') {
      const newBlog = {
        id: `blog-${Date.now()}`,
        title,
        slug,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80',
        content,
        summary: { tldr, keyPoints },
        author: {
          id: authorId,
          name: 'Deven Admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
          role: 'superadmin'
        },
        category: category || 'General',
        tags: tags || [],
        readTime: Math.ceil(content.split(' ').length / 200),
        status: status || 'draft',
        viewsCount: 0,
        likesCount: 0,
        commentsCount: 0,
        isPremium: !!isPremium,
        seoTitle,
        seoDescription,
        seoKeywords: seoKeywords || [],
        audioUrl: '/audio/mock-audio-1.mp3',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-working-late-at-the-office-mockup-41587-large.mp4',
        createdAt: new Date().toISOString()
      };
      addMockBlog(newBlog);
      res.status(201).json(newBlog);
      return;
    }

    // Real DB Mode
    const blog = await Blog.create({
      title,
      slug,
      content,
      coverImage,
      category,
      tags,
      isPremium,
      author: authorId,
      summary: { tldr, keyPoints },
      readTime: Math.ceil(content.split(' ').length / 200),
      seoTitle,
      seoDescription,
      seoKeywords,
      status: status || 'draft',
      audioUrl: '/audio/mock-audio-1.mp3',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-working-late-at-the-office-mockup-41587-large.mp4',
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error adding blog post', error: (error as Error).message });
  }
});

// UPDATE
router.put('/blogs/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.title) {
    updates.slug = updates.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  if (process.env.MOCK_MODE === 'true') {
    const updated = updateMockBlog(id, updates);
    if (!updated) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }
    res.json({ message: 'Blog updated successfully', blog: updated });
    return;
  }

  try {
    const blog = await Blog.findByIdAndUpdate(id, updates, { new: true });
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }
    res.json({ message: 'Blog updated successfully', blog });
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog post', error: (error as Error).message });
  }
});

// DELETE
router.delete('/blogs/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (process.env.MOCK_MODE === 'true') {
    deleteMockBlog(id);
    res.json({ message: 'Blog deleted successfully' });
    return;
  }

  try {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog post', error: (error as Error).message });
  }
});

// ==========================================
// 3. COMMENT MODERATION
// ==========================================
router.get('/comments/flagged', async (req, res) => {
  try {
    if (process.env.MOCK_MODE === 'true') {
      const flagged = getMockComments().filter(c => c.status === 'reported');
      res.json(flagged);
      return;
    }

    const comments = await Comment.find({ status: 'reported' }).populate('userId', 'name email');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching flagged comments', error: (error as Error).message });
  }
});

router.post('/comments/:id/moderate', async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' | 'hide'

  const newStatus = action === 'approve' ? 'approved' : 'hidden';

  if (process.env.MOCK_MODE === 'true') {
    updateMockCommentStatus(id, newStatus);
    res.json({ message: `Comment status updated to ${newStatus}` });
    return;
  }

  try {
    const comment = await Comment.findByIdAndUpdate(id, { status: newStatus }, { new: true });
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
    res.json({ message: `Comment status updated to ${newStatus}`, comment });
  } catch (error) {
    res.status(500).json({ message: 'Error moderating comment', error: (error as Error).message });
  }
});

// ==========================================
// 4. USER ROLES & CRUD
// ==========================================
router.get('/users', async (req, res) => {
  try {
    if (process.env.MOCK_MODE === 'true') {
      res.json(getMockUsers());
      return;
    }

    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error loading users', error: (error as Error).message });
  }
});

router.put('/users/:id/role', async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['reader', 'author', 'admin', 'superadmin'].includes(role)) {
    res.status(400).json({ message: 'Invalid role assignment' });
    return;
  }

  if (process.env.MOCK_MODE === 'true') {
    const updated = updateMockUser(id, { role });
    if (!updated) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ message: 'Role modified successfully', user: updated });
    return;
  }

  try {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ message: 'Role modified successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Role update failed', error: (error as Error).message });
  }
});

// ==========================================
// 5. CMS WEBSITE BUILDER SETTINGS
// ==========================================
router.get('/settings', async (req, res) => {
  try {
    if (process.env.MOCK_MODE === 'true') {
      res.json(mockWebsiteSettings);
      return;
    }

    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = await WebsiteSettings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error loading settings', error: (error as Error).message });
  }
});

router.put('/settings', async (req, res) => {
  const updates = req.body;

  if (process.env.MOCK_MODE === 'true') {
    Object.assign(mockWebsiteSettings, updates);
    res.json({ message: 'CMS Settings updated successfully', settings: mockWebsiteSettings });
    return;
  }

  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = new WebsiteSettings();
    }
    Object.assign(settings, updates);
    await settings.save();
    res.json({ message: 'CMS Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: (error as Error).message });
  }
});

// ==========================================
// 6. COUPON MANAGEMENT
// ==========================================
router.get('/coupons', async (req, res) => {
  try {
    if (process.env.MOCK_MODE === 'true') {
      res.json(mockCoupons);
      return;
    }

    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons', error: (error as Error).message });
  }
});

router.post('/coupons', async (req, res) => {
  const { code, discountPercentage, expiryDate, maxRedemptions } = req.body;

  if (process.env.MOCK_MODE === 'true') {
    const newCoupon = {
      code: code.toUpperCase(),
      discountPercentage,
      expiryDate,
      maxRedemptions: maxRedemptions || 100,
      redemptionsCount: 0,
      isActive: true
    };
    mockCoupons.push(newCoupon);
    res.status(201).json(newCoupon);
    return;
  }

  try {
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountPercentage,
      expiryDate,
      maxRedemptions,
    });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error creating coupon', error: (error as Error).message });
  }
});

// GET ONBOARDING COHORT ANALYTICS
router.get('/onboarding-analytics', async (req, res) => {
  try {
    if (process.env.MOCK_MODE === 'true') {
      const mockUsers = getMockUsers();
      const interestsCounts: Record<string, number> = {};
      const goalsCounts: Record<string, number> = {};
      const stageCounts: Record<string, number> = {};
      const roleCounts: Record<string, number> = {};
      const preferenceCounts: Record<string, number> = {};

      mockUsers.forEach(u => {
        if (u.interests) {
          u.interests.forEach(i => interestsCounts[i] = (interestsCounts[i] || 0) + 1);
        }
        if (u.goals) {
          u.goals.forEach(g => goalsCounts[g] = (goalsCounts[g] || 0) + 1);
        }
        if (u.startupStage) {
          stageCounts[u.startupStage] = (stageCounts[u.startupStage] || 0) + 1;
        }
        if (u.founderRole) {
          roleCounts[u.founderRole] = (roleCounts[u.founderRole] || 0) + 1;
        }
        if (u.contentPreferences) {
          u.contentPreferences.forEach(p => preferenceCounts[p] = (preferenceCounts[p] || 0) + 1);
        }
      });

      const popularInterests = Object.keys(interestsCounts).map(name => ({ name, count: interestsCounts[name] })).sort((a,b)=>b.count-a.count);
      const selectedGoals = Object.keys(goalsCounts).map(name => ({ name, count: goalsCounts[name] })).sort((a,b)=>b.count-a.count);
      const startupStages = Object.keys(stageCounts).map(name => ({ name, count: stageCounts[name] })).sort((a,b)=>b.count-a.count);
      const founderSegments = Object.keys(roleCounts).map(name => ({ name, count: roleCounts[name] })).sort((a,b)=>b.count-a.count);
      const preferenceTrends = Object.keys(preferenceCounts).map(name => ({ name, count: preferenceCounts[name] })).sort((a,b)=>b.count-a.count);

      res.json({ popularInterests, selectedGoals, startupStages, founderSegments, preferenceTrends });
      return;
    }

    // Real DB Mode Aggregations
    const dbInterests = await User.aggregate([
      { $match: { completedOnboarding: true, interests: { $exists: true, $ne: [] } } },
      { $unwind: "$interests" },
      { $group: { _id: "$interests", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const dbGoals = await User.aggregate([
      { $match: { completedOnboarding: true, goals: { $exists: true, $ne: [] } } },
      { $unwind: "$goals" },
      { $group: { _id: "$goals", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const dbStages = await User.aggregate([
      { $match: { completedOnboarding: true, startupStage: { $exists: true, $ne: '' } } },
      { $group: { _id: "$startupStage", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const dbRoles = await User.aggregate([
      { $match: { completedOnboarding: true, founderRole: { $exists: true, $ne: '' } } },
      { $group: { _id: "$founderRole", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const dbPrefs = await User.aggregate([
      { $match: { completedOnboarding: true, contentPreferences: { $exists: true, $ne: [] } } },
      { $unwind: "$contentPreferences" },
      { $group: { _id: "$contentPreferences", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const popularInterests = dbInterests.length > 0 ? dbInterests.map(i => ({ name: i._id, count: i.count })) : [
      { name: 'SaaS Growth', count: 12 }, { name: 'Marketing', count: 9 }, { name: 'AI for Startups', count: 8 }, { name: 'Product Development', count: 7 }
    ];
    const selectedGoals = dbGoals.length > 0 ? dbGoals.map(g => ({ name: g._id, count: g.count })) : [
      { name: 'Get First Customers', count: 15 }, { name: 'Build MVP', count: 10 }, { name: 'Raise Funding', count: 6 }
    ];
    const startupStages = dbStages.length > 0 ? dbStages.map(s => ({ name: s._id, count: s.count })) : [
      { name: 'Building MVP', count: 8 }, { name: 'Growing Revenue', count: 5 }, { name: 'Validating an Idea', count: 4 }
    ];
    const founderSegments = dbRoles.length > 0 ? dbRoles.map(r => ({ name: r._id, count: r.count })) : [
      { name: 'Startup Founder', count: 14 }, { name: 'Solopreneur', count: 8 }, { name: 'Aspiring Founder', count: 4 }
    ];
    const preferenceTrends = dbPrefs.length > 0 ? dbPrefs.map(p => ({ name: p._id, count: p.count })) : [
      { name: 'Reading Blogs', count: 18 }, { name: 'Founder Case Studies', count: 10 }, { name: 'Weekly Newsletter', count: 8 }
    ];

    res.json({ popularInterests, selectedGoals, startupStages, founderSegments, preferenceTrends });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving onboarding analytics', error: (error as Error).message });
  }
});

export default router;
