import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middlewares/auth';
import { getMockBlogs, getMockUsers } from '../config/mockData';
import Blog from '../models/Blog';
import User from '../models/User';

const router = Router();

// 1. AI BLOG SUMMARIZER (TL;DR & Key points)
router.post('/summarize', async (req: Request, res: Response) => {
  const { title, content } = req.body;
  if (!content) {
    res.status(400).json({ message: 'Content is required for summarizing' });
    return;
  }

  const cleanText = content.replace(/<[^>]*>/g, '');
  const tldr = `AI Summary: This article "${title || 'Untitled'}" explores key methods to optimize and scale modern development. It emphasizes clean layouts, high performance, and rapid implementation templates.`;
  const keyPoints = [
    'Leverage responsive grids and flexible margins to fit user layouts.',
    'Incorporate clean semantic HTML structure to enhance SEO crawls.',
    'Implement micro-animations to encourage interaction and lower bounce rates.',
    'Modularize configuration blocks to facilitate future product additions.'
  ];

  res.json({ tldr, keyPoints });
});

// 2. AI SEO METADATA GENERATOR
router.post('/seo', async (req: Request, res: Response) => {
  const { title, content } = req.body;
  if (!title) {
    res.status(400).json({ message: 'Title is required for generating SEO fields' });
    return;
  }

  const seoTitle = `${title} - Deven Premium Insights`;
  const seoDescription = `Read about ${title} on Deven Blogs. Access professional summaries, audio logs, and vertical summary videos designed for modern developers.`;
  const seoKeywords = title.toLowerCase().split(' ').filter((w: string) => w.length > 3).slice(0, 5);
  seoKeywords.push('deven', 'blogs', 'tech summary');

  res.json({ seoTitle, seoDescription, seoKeywords });
});

// 3. AI RECOMMENDATIONS SYSTEM
router.post('/recommendations', async (req: Request, res: Response) => {
  const { category, currentBlogId } = req.body;

  try {
    if (process.env.MOCK_MODE === 'true') {
      let blogs = [...getMockBlogs()];
      if (currentBlogId) blogs = blogs.filter(b => b.id !== currentBlogId);
      
      // Filter by category or pick randomly
      let recommended = blogs.filter(b => b.category === category);
      if (recommended.length === 0) recommended = blogs.slice(0, 2);

      res.json(recommended);
      return;
    }

    // DB Mode
    let recommended = await Blog.find({ category, status: 'published', _id: { $ne: currentBlogId } })
      .populate('author', 'name avatar')
      .limit(3);

    if (recommended.length === 0) {
      recommended = await Blog.find({ status: 'published', _id: { $ne: currentBlogId } })
        .populate('author', 'name avatar')
        .limit(3);
    }

    res.json(recommended);
  } catch (error) {
    res.status(500).json({ message: 'Error generating recommendations', error: (error as Error).message });
  }
});

// 4. AI STARTUP MENTOR (Chat handler)
router.post('/mentor', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { blogId, message } = req.body;
  const userId = req.user?.id;

  if (!message) {
    res.status(400).json({ message: 'Message is required for AI Startup Mentor' });
    return;
  }

  try {
    let blogTitle = 'this playbook';
    let blogCategory = 'Startup Development';
    let userRole = 'Founder';
    let userStage = 'Exploring';
    let userInterests: string[] = [];
    let userGoals: string[] = [];

    // Fetch User and Blog context
    if (process.env.MOCK_MODE === 'true') {
      const mockUsers = getMockUsers();
      const mockUser = mockUsers.find(u => u.id === userId);
      if (mockUser) {
        userRole = mockUser.founderRole || 'Founder';
        userStage = mockUser.startupStage || 'Exploring';
        userInterests = mockUser.interests || [];
        userGoals = mockUser.goals || [];
      }

      const mockBlogs = getMockBlogs();
      const mockBlog = mockBlogs.find(b => b.id === blogId || b.slug === blogId);
      if (mockBlog) {
        blogTitle = mockBlog.title;
        blogCategory = mockBlog.category;
      }
    } else {
      const dbUser = await User.findById(userId);
      if (dbUser) {
        userRole = dbUser.founderRole || 'Founder';
        userStage = dbUser.startupStage || 'Exploring';
        userInterests = dbUser.interests || [];
        userGoals = dbUser.goals || [];
      }

      const dbBlog = await Blog.findById(blogId);
      if (dbBlog) {
        blogTitle = dbBlog.title;
        blogCategory = dbBlog.category;
      }
    }

    // OpenAI Integration if API key is present
    if (process.env.OPENAI_API_KEY) {
      try {
        const { default: OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const systemPrompt = `You are the Deven AI Startup Mentor, an Y-Combinator style startup coach that provides actionable advice.
The user is reading a blog post titled "${blogTitle}" in the "${blogCategory}" category.
User details:
- Role: ${userRole}
- Startup Stage: ${userStage}
- Core Interests: ${userInterests.join(', ') || 'None specified'}
- Goals: ${userGoals.join(', ') || 'None specified'}

Provide a personalized, actionable, premium answer to their question about how to apply this blog to their startup. Be brief, bold, minimal, and premium. Format with standard markdown and bullets.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 450,
          temperature: 0.7,
        });

        res.json({
          response: completion.choices[0].message?.content || 'Unable to parse AI response.',
          isMock: false
        });
        return;
      } catch (err: any) {
        console.warn('Failed to call OpenAI API, falling back to simulated response:', err.message);
      }
    }

    // High quality personalized mockup response fallback
    let responseText = '';
    const cleanMsg = message.toLowerCase();

    if (cleanMsg.includes('apply') || cleanMsg.includes('how') || cleanMsg.includes('my startup') || cleanMsg.includes('this to')) {
      responseText = `As a **${userRole}** currently in the **${userStage}** phase, applying the lessons from *"${blogTitle}"* will give your startup a strong execution blueprint. Here is how you should proceed:

1. **Leverage the ${blogCategory} Principles**: Immediately align your core loops with the frameworks detailed in the playbook. 
2. **Launch a validation experiment**: Given your goals (${userGoals[0] || 'Build MVP and validate'}), design a 48-hour MVP that implements clean vertical blurs and Notion-style typographic layouts.
3. **Establish keyboard shortcut loops**: If your product is developer-focused, make it keyboard-driven (using hotkeys like Linear) to maximize user task speed.

Would you like me to outline a step-by-step checklist tailored for your engineering team?`;
    } else if (cleanMsg.includes('summarize') || cleanMsg.includes('summary') || cleanMsg.includes('tldr')) {
      responseText = `Here is the executive summary of *"${blogTitle}"* tailored for your role as **${userRole}**:

- **Core Thesis**: Modern startup software requires high-performance aesthetics (combining Apple hardware feel, Notion workspaces, and Linear hotkey efficiency).
- **Key Takeaway**: Do not build bloated dashboards. Use clean radial background glows (#FFC247), dark carbon palettes (#09090b), and keyboard-driven mechanics.
- **Action Step**: Audit your landing page's copy and layout hierarchy today to ensure maximum reading clarity and visual polish.`;
    } else if (cleanMsg.includes('checklist') || cleanMsg.includes('action steps')) {
      responseText = `Here is a custom action checklist based on *"${blogTitle}"* for your stage (**${userStage}**):

* [ ] **Define the ICP**: Verify if your target developers value keyboard-first interactions.
* [ ] **Map the Styling Tokens**: Standardize colors around carbon darks, gold highlights, and glassmorphic blurs.
* [ ] **Optimize Build Pipeline**: Transition to Next.js App Router server components to keep your load time under 200ms.
* [ ] **Verify Reading Streaks**: Ensure active users are tracked to boost overall retention index.`;
    } else {
      responseText = `That is an excellent question! Regarding your query: *"${message}"*

From the perspective of a **${userRole}** navigating the **${userStage}** startup path:
- Focus on reducing interactive friction by modularizing your page structures and using reusable styling wrappers.
- In the *"${blogTitle}"* post, the core recommendation is to prioritize user task velocity over aesthetic complexity.
- Connect this to your goals (${userGoals.join(', ') || 'Launch MVP'}) by starting with a minimal, beautiful landing block.

How else can I help you optimize your SaaS architecture today?`;
    }

    res.json({
      response: responseText,
      isMock: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in AI Startup Mentor', error: (error as Error).message });
  }
});

export default router;
