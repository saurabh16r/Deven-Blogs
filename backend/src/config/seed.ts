import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Blog from '../models/Blog';
import Comment from '../models/Comment';
import WebsiteSettings from '../models/WebsiteSettings';
import Analytics from '../models/Analytics';
import Category from '../models/Category';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Clear existing data
    await User.deleteMany({});
    await Blog.deleteMany({});
    await Comment.deleteMany({});
    await WebsiteSettings.deleteMany({});
    await Analytics.deleteMany({});
    await Category.deleteMany({});
    console.log('🗑️ Cleared existing database collections.');

    // 2. Hash password for mock users
    const hashedPassword = await bcrypt.hash('password', 10);

    // 3. Create Users
    const adminUser = await User.create({
      name: 'Deven Admin',
      email: 'admin@deven.io',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      role: 'superadmin',
      streakCount: 12,
      lastReadDate: new Date(),
      referralCode: 'DEVEN100',
      referredCount: 4,
      isSubscribed: true,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      completedOnboarding: true,
      onboardingCompleted: true,
    });

    const readerUser = await User.create({
      name: 'Alex Reader',
      email: 'reader@deven.io',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      role: 'reader',
      streakCount: 3,
      lastReadDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      referralCode: 'ALEX99',
      referredBy: 'DEVEN100',
      referredCount: 0,
      isSubscribed: false,
      founderRole: 'Solopreneur',
      startupStage: 'Building MVP',
      interests: ['SaaS Growth', 'Marketing', 'AI for Startups'],
      goals: ['Build MVP', 'Get First Customers'],
      contentPreferences: ['Reading Blogs', 'Weekly Newsletter'],
      completedOnboarding: true,
      onboardingCompleted: true,
    });

    const founder1 = await User.create({
      name: 'Sarah Founder',
      email: 'founder1@deven.io',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
      role: 'reader',
      streakCount: 5,
      referralCode: 'SARAH12',
      isSubscribed: true,
      founderRole: 'Startup Founder',
      startupStage: 'Scaling Team',
      interests: ['Leadership', 'Hiring', 'Business Strategy'],
      goals: ['Scale My Startup', 'Build a Team'],
      contentPreferences: ['Founder Case Studies', 'Weekly Newsletter'],
      completedOnboarding: true,
      onboardingCompleted: true,
    });

    const founder2 = await User.create({
      name: 'Mike Builder',
      email: 'founder2@deven.io',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
      role: 'reader',
      streakCount: 8,
      referralCode: 'MIKE99',
      isSubscribed: false,
      founderRole: 'Product Builder',
      startupStage: 'Validating an Idea',
      interests: ['Product Development', 'No-Code Tools', 'Automation'],
      goals: ['Find a Startup Idea', 'Automate Business'],
      contentPreferences: ['Watching Video Summaries', 'Reading Blogs'],
      completedOnboarding: true,
      onboardingCompleted: true,
    });

    console.log('👥 Seeded Users (admin@deven.io, reader@deven.io, founder1@deven.io, founder2@deven.io).');

    // 4. Create Categories
    const categoriesData = [
      { name: 'Startup Ideas', slug: 'startup-ideas', description: 'Brainstorm, validate, and launch high-potential business concepts.' },
      { name: 'SaaS Growth', slug: 'saas-growth', description: 'Strategies and metrics to scale software-as-a-service businesses.' },
      { name: 'AI & Automation', slug: 'ai-automation', description: 'Leverage AI and modern workflows to automate your operations.' },
      { name: 'Marketing', slug: 'marketing', description: 'Acquire users, build brand awareness, and master startup channels.' },
      { name: 'Product Building', slug: 'product-building', description: 'Build MVPs, define product-market fit, and design interfaces.' },
      { name: 'Fundraising', slug: 'fundraising', description: 'Pitch decks, investor relations, and capital raising guides.' },
      { name: 'Sales', slug: 'sales', description: 'Close deals, optimize pipelines, and drive enterprise contracts.' },
      { name: 'Branding', slug: 'branding', description: 'Craft your startup narrative, visual identity, and positioning.' },
      { name: 'Leadership', slug: 'leadership', description: 'Hiring, culture, and team building guides for founders.' },
      { name: 'Productivity', slug: 'productivity', description: 'Smarter workflows and time management tools for builders.' },
      { name: 'Founder Stories', slug: 'founder-stories', description: 'Raw, unfiltered journeys of successful founders.' },
      { name: 'Startup Case Studies', slug: 'startup-case-studies', description: 'Data-backed teardowns of fast-growing startup strategies.' },
    ];
    await Category.create(categoriesData);
    console.log('📁 Seeded Categories.');

    // 5. Create Blogs
    const blog1 = await Blog.create({
      title: 'Startup Validation: How to Prove Your Idea is Worth Building',
      slug: 'startup-validation-prove-idea-worth-building',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=80',
      content: `
        <h2>The Danger of Building in a Vacuum</h2>
        <p>Too many founders spend months and thousands of dollars building a product only to find out nobody wants it. Startup validation is the process of testing your hypothesis before writing code or spending capital.</p>
        
        <blockquote>
          "Your job as a founder is not to build a product; it is to find a customer and solve their problem."
        </blockquote>

        <h3>1. The Customer Interview Framework</h3>
        <p>Before launching a landing page, talk to at least 15 potential users. Do not ask them "Would you buy this?" (they will say yes to be polite). Instead, ask them about how they currently solve the problem, what tools they use, and how much they spent on those tools in the last 30 days.</p>
        
        <h3>2. Smoke Testing & Landing Page Pre-sales</h3>
        <p>Create a simple, high-converting landing page explaining your value proposition. Add a pricing table with a "Buy Now" button. If users click, show a message saying you are currently in beta and offer them a 50% discount to join the waitlist. Track the click-through rate; a 5%+ rate indicates strong interest.</p>

        <h3>3. Micro-MVPs: Do Things That Don't Scale</h3>
        <p>Run your service manually behind the scenes first. If you're building an AI scheduler, do the scheduling yourself manually for the first 10 customers via email. Once you understand the workflow, automate it.</p>
      `,
      summary: {
        tldr: 'A practical guide on validating startup ideas through customer interviews, smoke tests, and manual workflows before building an MVP.',
        keyPoints: [
          'Talk to customers first: Ask about past behavior and actual spending, not future intentions.',
          'Smoke tests: Use simple landing pages with waitlists to measure real demand.',
          'Manual MVPs: Perform services manually to understand user workflows before automating.',
          'Validation metrics: Aim for a 5%+ conversion rate on your landing page call-to-action.',
        ],
      },
      author: adminUser._id,
      category: 'Startup Ideas',
      tags: ['Startup Ideas', 'Validation', 'Product Market Fit', 'Solopreneur'],
      readTime: 6,
      status: 'published',
      viewsCount: 342,
      likesCount: 89,
      commentsCount: 2,
      isPremium: false,
      seoTitle: 'Startup Validation: Prove Your Idea is Worth Building - Deven Blogs',
      seoDescription: 'Learn how to validate your startup idea using customer interviews and smoke tests without writing code.',
      seoKeywords: ['Startup Validation', 'Customer Development', 'MVP Testing', 'SaaS Validation'],
      audioUrl: '/audio/mock-audio-1.mp3',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hand-holding-smartphone-with-green-screen-mockup-41584-large.mp4',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    const blog2 = await Blog.create({
      title: 'How to Find Your First 100 Customers: The Ultimate Founder\'s Playbook',
      slug: 'how-to-find-your-first-100-customers',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=630&q=80',
      content: `
        <h2>Going from 0 to 100</h2>
        <p>Getting your first 100 customers is the hardest phase of any startup. It requires doing things that don\'t scale, personal hustle, and highly targeted outreach. Scaling channels like SEO or paid ads will not work at this stage.</p>
        
        <blockquote>
          "Do things that don't scale. Recruit your first customers manually."
        </blockquote>

        <h3>1. Direct Cold Outreach</h3>
        <p>Find your ideal customer profile (ICP) on LinkedIn, Twitter, or niche communities. Send them personalized, non-spammy messages. Offer to solve their problem for free in exchange for honest feedback and a testimonial.</p>
        
        <h3>2. Leverage Niche Communities</h3>
        <p>Hang out where your target audience hangs out. Answer questions on Reddit, Indie Hackers, Quora, and Discord. Do not pitch your product immediately; build trust by providing deep value first, then mention your tool as a potential solution.</p>

        <h3>3. Build in Public</h3>
        <p>Share your metrics, struggles, and progress on social media. People love supporting builders and creators. Sharing your journey builds an audience of early adopters who feel invested in your success.</p>
      `,
      summary: {
        tldr: 'An actionable manual for startup founders to acquire their first 100 customers manually through direct outreach, building in public, and community marketing.',
        keyPoints: [
          'Manual recruitment: Reach out to potential users directly on Twitter, LinkedIn, and email.',
          'Niche communities: Add immense value in forums first, then introduce your product.',
          'Build in public: Share revenue numbers, development bugs, and milestones to generate authentic support.',
          'Feedback loops: Treat your first 100 users as partners, optimizing the product based on their input.',
        ],
      },
      author: adminUser._id,
      category: 'Marketing',
      tags: ['Marketing', 'SaaS Growth', 'User Acquisition', 'Sales'],
      readTime: 8,
      status: 'published',
      viewsCount: 512,
      likesCount: 145,
      commentsCount: 0,
      isPremium: true,
      seoTitle: 'How to Find Your First 100 Customers - Deven Blogs',
      seoDescription: 'Master the manual acquisition channels to get your first 100 startup customers with this detailed playbook.',
      seoKeywords: ['User Acquisition', 'Startup Growth', 'Indie Hackers', 'Cold Outreach'],
      audioUrl: '/audio/mock-audio-2.mp3',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-working-late-at-the-office-mockup-41587-large.mp4',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    const blog3 = await Blog.create({
      title: 'Building an MVP Without Coding: Launch Fast and Validate Early',
      slug: 'building-an-mvp-without-coding',
      coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&h=630&q=80',
      content: `
        <h2>The Power of No-Code Stack</h2>
        <p>You don\'t need a software engineering degree to build a functional software product today. A modern no-code stack allows you to build, launch, and test a fully functional MVP in a weekend.</p>
        
        <h3>1. The Core No-Code Stack</h3>
        <p>A standard no-code stack consists of: a frontend landing page (Webflow, Framer, Softr), a database (Airtable, Supabase), logic/workflows (Make.com, Zapier), and user authentication (Outseta, Memberstack).</p>
        
        <h3>2. Integrating AI into No-Code Workflows</h3>
        <p>You can connect your workflows directly to OpenAI or Anthropic APIs via Make.com. This allows you to build AI-powered applications, summary bots, automated copywriting tools, and personalized assistants without writing a line of code.</p>

        <h3>3. Premium subscription requirements</h3>
        <p>This is a premium article. Unlock to explore how to convert raw mockups into automated no-code engines, complete with pre-built Make.com blueprints and Airtable schema designs.</p>
      `,
      summary: {
        tldr: 'A deep dive into assembling a high-performance no-code stack to launch interactive MVPs, automate tasks, and build AI products.',
        keyPoints: [
          'No-code architecture: Combine Framer, Softr, Airtable, and Make.com to mimic custom applications.',
          'AI integration: Leverage API connectors in Make/Zapier to inject LLM functionality into your workflows.',
          'Launch velocity: Shift launch times from months to days, validation is cheaper.',
          'Resource pointers: Step-by-step guides on payment portal connections and database linking.',
        ],
      },
      author: adminUser._id,
      category: 'Product Building',
      tags: ['Product Building', 'No Code', 'MVP', 'AI & Automation'],
      readTime: 5,
      status: 'published',
      viewsCount: 228,
      likesCount: 67,
      commentsCount: 1,
      isPremium: true,
      seoTitle: 'Building an MVP Without Coding - Deven Blogs',
      seoDescription: 'Learn how to build and launch your startup MVP using modern no-code tools and AI automation.',
      seoKeywords: ['No-Code MVP', 'Framer Startup', 'Airtable Database', 'Make Automation'],
      audioUrl: '/audio/mock-audio-3.mp3',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-dots-in-blue-motion-40332-large.mp4',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    console.log('📝 Seeded Blogs.');

    // 6. Update bookmarks and reading history on users with valid ObjectId references
    readerUser.readingHistory.push({
      blogId: blog1._id.toString(),
      readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      duration: 240,
    });
    await readerUser.save();

    adminUser.bookmarks.push(blog1._id.toString());
    adminUser.bookmarks.push(blog3._id.toString());
    await adminUser.save();

    // 7. Create Comments
    const comment1 = await Comment.create({
      blogId: blog1._id,
      userId: readerUser._id,
      userName: readerUser.name,
      userAvatar: readerUser.avatar,
      content: 'This playbook is a lifesaver. We were about to spend $15k building a platform before validating. The smoke test checklist saved us months of work. Any advice on validating marketplace ideas?',
      likes: [adminUser._id],
      status: 'approved',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await Comment.create({
      blogId: blog1._id,
      userId: adminUser._id,
      userName: adminUser.name,
      userAvatar: adminUser.avatar,
      parentCommentId: comment1._id,
      content: 'Awesome to hear that, Alex! For marketplaces, validation is all about manual matching (do things that don\'t scale). Build a simple landing page to collect buyer demand, then manually find sellers to fulfill it. Don\'t write a line of code until you have done this 10 times.',
      likes: [],
      status: 'approved',
      createdAt: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000),
    });

    console.log('💬 Seeded Comments.');

    // 8. Create Website Settings
    await WebsiteSettings.create({
      heroTitle: 'Build Startups, Not Just Ideas.',
      heroSubheadline: 'Deven is a startup ecosystem helping founders, freelancers, students, and builders turn ideas into real businesses through expert content, mentorship, community, and execution-focused learning.',
      heroImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
      primaryCtaText: 'Start Building',
      primaryCtaLink: '/blogs',
      secondaryCtaText: 'Explore Founder Resources',
      secondaryCtaLink: '#resources',
      trustIndicators: ['Startup Resources', 'Founder Community', 'AI Learning Tools', 'Execution-Focused Content'],
      logoText: 'Deven Blogs',
      logoColor: '#FFC247',
      testimonials: [
        {
          name: 'Sarah Chen',
          role: 'SaaS Founder & Creator',
          feedback: 'The reading interface of Deven is a masterpiece. The glassmorphic design and dark color scheme make long reading hours very comfortable. AI summaries save me half my research time.',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
        },
        {
          name: 'Marcus Brody',
          role: 'Solopreneur & Developer',
          feedback: 'I subscribed for the 60-second video reviews. Getting detailed, high-level summaries on tech architecture while on the move is a superpower.',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
        },
      ],
      faqs: [
        { question: 'What is included in the premium membership?', answer: 'Premium members get full access to all articles, text-to-speech audio logs, 60s summary videos, commenting rights, bookmarking lists, and early access to newsletters.' },
        { question: 'Can I cancel my subscription anytime?', answer: 'Yes! You can cancel your subscription from your billing dashboard with a single click. You will remain premium until the end of your billing cycle.' },
        { question: 'How do streaks work?', answer: 'Reading any article for at least 30 seconds increments your daily streak. Maintaining a streak unlocks achievements and increases your profile rank.' },
      ],
      pricingPrice: 299,
      contactEmail: 'support@deven.io',
      contactPhone: '+91 98765 43210',
      contactAddress: 'Mumbai, Maharashtra, India',
    });

    console.log('⚙️ Seeded Website Settings.');

    // 9. Create historical Analytics events for beautiful Recharts rendering in DB mode
    const sources = ['direct', 'google', 'twitter', 'linkedin'];
    const now = new Date();
    
    // Seed view events for the past 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // Page Views
      const viewCount = 10 + Math.floor(Math.random() * 20);
      for (let j = 0; j < viewCount; j++) {
        await Analytics.create({
          eventType: 'page_view',
          source: sources[Math.floor(Math.random() * sources.length)],
          timestamp: date,
        });
      }

      // Revenue events (simulating subscriptions purchased on specific days)
      if (Math.random() > 0.3) {
        await Analytics.create({
          eventType: 'revenue',
          amount: 299,
          source: 'razorpay',
          timestamp: date,
        });
      }
    }

    console.log('📈 Seeded Analytics Events history.');
    console.log('✅ Database seeding completed successfully.');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  }
};
