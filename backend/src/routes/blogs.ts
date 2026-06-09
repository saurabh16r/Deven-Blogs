import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import Blog from '../models/Blog';
import User from '../models/User';
import Category from '../models/Category';
import Analytics from '../models/Analytics';
import { requireAuth, AuthRequest } from '../middlewares/auth';
import { getMockBlogs, getMockUsers } from '../config/mockData';
import { recordAnalyticsEvent, parseTokenUserId } from '../utils/analytics';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-deven-blogs';

// Helper to determine if user is subscribed by parsing token from header manually (since routes are public but behavior changes based on subscription)
const checkSubscriptionStatus = async (authHeader?: string): Promise<boolean> => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.split(' ')[1];

  if (token.startsWith('mock-token-')) {
    const roleSuffix = token.replace('mock-token-', '');
    // mock users other than standard reader are simulated as premium
    return roleSuffix !== 'reader';
  }

  if (process.env.MOCK_MODE === 'true') {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const mockUsers = getMockUsers();
      const user = mockUsers.find(u => u.id === decoded.id);
      return user ? user.isSubscribed : false;
    } catch {
      return false;
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id);
    return user ? user.isSubscribed : false;
  } catch {
    return false;
  }
};

// GET ALL BLOGS
router.get('/', async (req, res) => {
  try {
    const { search, category, tag, sort } = req.query;

    if (process.env.MOCK_MODE === 'true') {
      let blogsList = [...getMockBlogs()];

      // Search
      if (search) {
        const q = (search as string).toLowerCase();
        blogsList = blogsList.filter(
          b => b.title.toLowerCase().includes(q) || b.content.toLowerCase().includes(q)
        );
      }

      // Category filter
      if (category) {
        blogsList = blogsList.filter(b => b.category.toLowerCase() === (category as string).toLowerCase());
      }

      // Tag filter
      if (tag) {
        blogsList = blogsList.filter(b => b.tags.some(t => t.toLowerCase() === (tag as string).toLowerCase()));
      }

      // Sort
      if (sort === 'trending') {
        blogsList.sort((a, b) => b.likesCount - a.likesCount);
      } else if (sort === 'most_read') {
        blogsList.sort((a, b) => b.viewsCount - a.viewsCount);
      } else {
        // Latest (default)
        blogsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      // Hide core text and flags for listing preview
      const listing = blogsList.map(b => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        coverImage: b.coverImage,
        description: b.summary.tldr,
        category: b.category,
        tags: b.tags,
        readTime: b.readTime,
        author: b.author,
        isPremium: b.isPremium,
        viewsCount: b.viewsCount,
        likesCount: b.likesCount,
        commentsCount: b.commentsCount,
        createdAt: b.createdAt,
      }));

      res.json(listing);
      return;
    }

    // Real DB Mode
    const query: any = { status: 'published' };

    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { content: { $regex: search as string, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (tag) {
      query.tags = { $regex: `^${tag}$`, $options: 'i' };
    }

    let sortCriteria: any = { createdAt: -1 };
    if (sort === 'trending') {
      sortCriteria = { likesCount: -1 };
    } else if (sort === 'most_read') {
      sortCriteria = { viewsCount: -1 };
    }

    const dbBlogs = await Blog.find(query).populate('author', 'name avatar role').sort(sortCriteria);
    res.json(dbBlogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error: (error as Error).message });
  }
});

// GET CATEGORIES AND COUNT
router.get('/meta/categories', async (req, res) => {
  try {
    if (process.env.MOCK_MODE === 'true') {
      const blogsList = getMockBlogs();
      const catCounts: Record<string, number> = {};
      blogsList.forEach(b => {
        catCounts[b.category] = (catCounts[b.category] || 0) + 1;
      });
      const categories = Object.keys(catCounts).map(name => ({
        name,
        count: catCounts[name],
        slug: name.toLowerCase(),
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'
      }));
      res.json(categories);
      return;
    }

    // DB Mode
    const categories = await Category.find();
    const result = await Promise.all(
      categories.map(async cat => {
        const count = await Blog.countDocuments({ category: cat.name, status: 'published' });
        return {
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          count,
        };
      })
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: (error as Error).message });
  }
});

// GET PERSONALIZED FOUNDER FEED
router.get('/personalized', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    let user: any;
    let blogs: any[] = [];

    if (process.env.MOCK_MODE === 'true') {
      const mockUsers = getMockUsers();
      user = mockUsers.find(u => u.id === userId);
      blogs = [...getMockBlogs()];
    } else {
      user = await User.findById(userId);
      blogs = await Blog.find({ status: 'published' }).populate('author', 'name avatar role');
    }

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const userInterests = user.interests || [];
    const userGoals = user.goals || [];
    const userStage = user.startupStage || '';

    // Affinity Scoring System
    const getAffinityScore = (blog: any) => {
      let score = 0;
      
      // Interest/Category Match
      if (userInterests.some((interest: string) => 
        interest.toLowerCase() === blog.category.toLowerCase()
      )) {
        score += 10;
      }

      // Tags Match
      blog.tags.forEach((tag: string) => {
        if (userInterests.some((interest: string) => 
          interest.toLowerCase() === tag.toLowerCase() || 
          tag.toLowerCase().includes(interest.toLowerCase())
        )) {
          score += 3;
        }
      });

      // Goals Match
      if (userGoals.some((g: string) => g.includes('MVP') || g.includes('Product')) && 
          (blog.tags.includes('React') || blog.tags.includes('Next.js') || blog.tags.includes('No-Code') || blog.category === 'Technology')) {
        score += 5;
      }
      if (userGoals.some((g: string) => g.includes('Revenue') || g.includes('Customers') || g.includes('Brand')) && 
          (blog.tags.includes('Design') || blog.tags.includes('UX') || blog.category === 'Design')) {
        score += 5;
      }

      // Stage Match
      if (userStage.includes('Exploring') || userStage.includes('Validating')) {
        if (blog.category === 'Design') score += 4;
      } else {
        if (blog.category === 'AI' || blog.category === 'Technology') score += 4;
      }

      return score;
    };

    // Sort all blogs by affinity score descending
    const sortedBlogs = blogs
      .map(blog => {
        const blogObj = typeof blog.toObject === 'function' ? blog.toObject() : blog;
        return {
          ...blogObj,
          id: blogObj.id || blogObj._id.toString(),
          affinityScore: getAffinityScore(blogObj)
        };
      })
      .sort((a, b) => b.affinityScore - a.affinityScore);

    // 1. Recommended For You: top scoring blogs
    let recommended = sortedBlogs.filter(b => b.affinityScore > 0).slice(0, 3);
    if (recommended.length === 0) {
      recommended = sortedBlogs.slice(0, 3);
    }

    // 2. Trending In Your Category
    let trending = sortedBlogs
      .filter(b => userInterests.includes(b.category) || b.affinityScore > 5)
      .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
      .slice(0, 3);
    if (trending.length === 0) {
      trending = sortedBlogs.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 3);
    }

    // 3. Founder Playbooks
    let playbooks = sortedBlogs
      .filter(b => b.category === 'Design' || b.tags.includes('Productivity'))
      .slice(0, 3);
    if (playbooks.length === 0) {
      playbooks = sortedBlogs.slice(0, 2);
    }

    // 4. Startup Case Studies
    let caseStudies = sortedBlogs
      .filter(b => b.tags.includes('Design') || b.tags.includes('UX') || b.category === 'Design')
      .slice(0, 3);
    if (caseStudies.length === 0) {
      caseStudies = sortedBlogs.slice(1, 3);
    }

    // 5. Growth Strategies
    let growth = sortedBlogs
      .filter(b => b.category === 'Technology' || b.tags.includes('Next.js') || b.tags.includes('WebDev'))
      .slice(0, 3);
    if (growth.length === 0) {
      growth = sortedBlogs.slice(0, 3);
    }

    // 6. AI Recommendations
    let aiRecText = "Based on your focus as " + (user.founderRole || "a Product Builder") + ", ";
    if (userStage) {
      aiRecText += "your current startup stage is '" + userStage + "'. We recommend focusing on building quick, reusable Next.js components to launch your MVP fast. ";
    } else {
      aiRecText += "we suggest starting with our core design playbooks to establish standard layouts. ";
    }

    if (userGoals.length > 0) {
      aiRecText += "To help achieve your goal of '" + userGoals[0] + "', check out our premium guides on Linear style dashboard building.";
    }

    const aiItems = [
      { title: "SaaS Launch Optimization Playbook", type: "Future Course" },
      { title: "The High-Performance Founder", type: "Future Book" },
      { title: "Weekly Startup Strategy Dispatch", type: "Newsletter" }
    ];

    if (userInterests.includes('AI for Startups') || userInterests.includes('Automation')) {
      aiItems.unshift({ title: "Custom LLM Integrations Kit", type: "Future Deven Product" });
    }

    res.json({
      feed: {
        recommended,
        trending,
        playbooks,
        caseStudies,
        growth
      },
      aiRecommendation: {
        text: aiRecText,
        items: aiItems
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error generating personalized feed', error: (error as Error).message });
  }
});

// GET SINGLE BLOG BY SLUG WITH PAYWALL
router.get('/:slug', async (req, res): Promise<void> => {
  try {
    const { slug } = req.params;
    const isSubscribed = await checkSubscriptionStatus(req.headers.authorization);

    if (process.env.MOCK_MODE === 'true') {
      const blogsList = getMockBlogs();
      const blog = blogsList.find(b => b.slug === slug);

      if (!blog) {
        res.status(404).json({ message: 'Blog not found' });
        return;
      }

      // Record views increments
      blog.viewsCount += 1;
      await recordAnalyticsEvent({
        eventType: 'blog_read',
        blogId: blog.id,
        userId: parseTokenUserId(req.headers.authorization) || undefined,
        pageUrl: req.originalUrl,
      });

      // Handle locking logic
      if (blog.isPremium && !isSubscribed) {
        // Truncate to 20% of the content length
        const charLimit = Math.floor(blog.content.length * 0.2);
        let truncatedContent = blog.content.substring(0, charLimit);
        
        // Ensure we end cleanly at a paragraph block
        const lastParaIndex = truncatedContent.lastIndexOf('</p>');
        if (lastParaIndex > 50) {
          truncatedContent = truncatedContent.substring(0, lastParaIndex + 4);
        }

        res.json({
          ...blog,
          content: truncatedContent,
          isLocked: true,
          // Remove premium assets for security
          summary: {
            tldr: blog.summary.tldr,
            keyPoints: [], // Hide takeaways
          },
          audioUrl: undefined,
          videoUrl: undefined,
        });
        return;
      }

      res.json({ ...blog, isLocked: false });
      return;
    }

    // Real DB Mode
    const blog = await Blog.findOne({ slug }).populate('author', 'name avatar role');
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }

    // Increment view count
    blog.viewsCount += 1;
    await blog.save();

    if (blog.isPremium && !isSubscribed) {
      await recordAnalyticsEvent({
        eventType: 'blog_read',
        blogId: blog._id.toString(),
        userId: parseTokenUserId(req.headers.authorization) || undefined,
        pageUrl: req.originalUrl,
      });

      const charLimit = Math.floor(blog.content.length * 0.2);
      let truncatedContent = blog.content.substring(0, charLimit);
      const lastParaIndex = truncatedContent.lastIndexOf('</p>');
      if (lastParaIndex > 50) {
        truncatedContent = truncatedContent.substring(0, lastParaIndex + 4);
      }

      res.json({
        _id: blog._id,
        title: blog.title,
        slug: blog.slug,
        coverImage: blog.coverImage,
        content: truncatedContent,
        category: blog.category,
        tags: blog.tags,
        readTime: blog.readTime,
        author: blog.author,
        isPremium: true,
        isLocked: true,
        summary: {
          tldr: blog.summary.tldr,
          keyPoints: [],
        },
        createdAt: blog.createdAt,
      });
      return;
    }

    const [bookmarksCount, eventCounts] = await Promise.all([
      User.countDocuments({ bookmarks: blog._id }),
      Analytics.aggregate([
        { $match: { blogId: blog._id } },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const countsByEvent = eventCounts.reduce((map: Record<string, number>, item: any) => {
      map[item._id] = item.count;
      return map;
    }, {});

    await recordAnalyticsEvent({
      eventType: 'blog_read',
      blogId: blog._id.toString(),
      userId: parseTokenUserId(req.headers.authorization) || undefined,
      pageUrl: req.originalUrl,
    });

    res.json({
      ...blog.toObject(),
      isLocked: false,
      bookmarksCount,
      shareCount: countsByEvent.share_clicked || 0,
      videoViews: countsByEvent.video_play || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog details', error: (error as Error).message });
  }
});

// LIKE BLOG (requires auth)
router.post('/:id/like', async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  // For simplicity, we increment likes count
  if (process.env.MOCK_MODE === 'true') {
    const blogsList = getMockBlogs();
    const blog = blogsList.find(b => b.id === id);
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }
    blog.likesCount += 1;
    await recordAnalyticsEvent({
      eventType: 'blog_like',
      blogId: blog.id,
      userId: parseTokenUserId(req.headers.authorization) || undefined,
    });
    res.json({ likesCount: blog.likesCount });
    return;
  }

  try {
    const blog = await Blog.findByIdAndUpdate(id, { $inc: { likesCount: 1 } }, { new: true });
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }
    await recordAnalyticsEvent({
      eventType: 'blog_like',
      blogId: blog._id.toString(),
      userId: parseTokenUserId(req.headers.authorization) || undefined,
    });
    res.json({ likesCount: blog.likesCount });
  } catch (error) {
    res.status(500).json({ message: 'Error liking blog', error: (error as Error).message });
  }
});

export default router;
