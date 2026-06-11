// Central simulated database for MOCK_MODE operations

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'reader' | 'author' | 'admin' | 'superadmin';
  streakCount: number;
  lastReadDate?: string;
  referralCode: string;
  referredBy?: string;
  referredCount: number;
  isSubscribed: boolean;
  subscriptionExpiresAt?: string;
  readingHistory: { blogId: string; readAt: string; duration: number }[];
  bookmarks: string[];
  founderRole?: string;
  startupStage?: string;
  interests?: string[];
  goals?: string[];
  contentPreferences?: string[];
  completedOnboarding?: boolean;
  onboardingCompleted?: boolean;
  themePreference?: 'light' | 'dark' | 'system';
}

export interface MockBlog {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  content: string;
  summary: {
    tldr: string;
    keyPoints: string[];
  };
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
  readTime: number;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  isPremium: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  audioUrl?: string;
  videoUrl?: string;
  createdAt: string;
}

export interface MockComment {
  id: string;
  blogId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  parentCommentId?: string;
  content: string;
  likes: string[]; // userIds
  reports: { userId: string; reason: string }[];
  status: 'approved' | 'reported' | 'hidden';
  createdAt: string;
}

export interface MockAnalytics {
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
  duration?: number;
  amount?: number;
  source?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface MockCoupon {
  code: string;
  discountPercentage: number;
  expiryDate: string;
  maxRedemptions: number;
  redemptionsCount: number;
  isActive: boolean;
}

// Initial Mock Datasets
export let mockUsers: MockUser[] = [
  {
    id: 'mock-user-id-superadmin',
    name: 'Deven Admin',
    email: 'admin@deven.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    role: 'superadmin',
    streakCount: 12,
    lastReadDate: new Date().toISOString(),
    referralCode: 'DEVEN100',
    referredCount: 4,
    isSubscribed: true,
    subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    readingHistory: [],
    bookmarks: ['blog-1', 'blog-3'],
    themePreference: 'system',
    completedOnboarding: true,
    onboardingCompleted: true,
  },
  {
    id: 'mock-user-id-reader',
    name: 'Alex Reader',
    email: 'reader@deven.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    role: 'reader',
    streakCount: 3,
    lastReadDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    referralCode: 'ALEX99',
    referredBy: 'DEVEN100',
    referredCount: 0,
    isSubscribed: false,
    readingHistory: [
      { blogId: 'blog-1', readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), duration: 240 },
    ],
    bookmarks: [],
    themePreference: 'system',
    completedOnboarding: true,
    onboardingCompleted: true,
  },
];

export let mockBlogs: MockBlog[] = [
  {
    id: 'blog-1',
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

      <table class="w-full border-collapse border border-zinc-800 my-6">
        <thead>
          <tr class="bg-zinc-900 text-left">
            <th class="p-3 border border-zinc-800">Validation Method</th>
            <th class="p-3 border border-zinc-800">Core Metric</th>
            <th class="p-3 border border-zinc-800">Effort Level</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-3 border border-zinc-800">Customer Interviews</td>
            <td class="p-3 border border-zinc-800">15+ Qualitative Chats</td>
            <td class="p-3 border border-zinc-800">Medium</td>
          </tr>
          <tr class="bg-zinc-900/50">
            <td class="p-3 border border-zinc-800">Landing Page Smoke Test</td>
            <td class="p-3 border border-zinc-800">5%+ Conversion Rate</td>
            <td class="p-3 border border-zinc-800">Low</td>
          </tr>
          <tr>
            <td class="p-3 border border-zinc-800">Manual Concierge MVP</td>
            <td class="p-3 border border-zinc-800">10 Paid Transactions</td>
            <td class="p-3 border border-zinc-800">High</td>
          </tr>
        </tbody>
      </table>

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
    author: {
      id: 'mock-user-id-superadmin',
      name: 'Deven Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      role: 'superadmin',
    },
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
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'blog-2',
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
    author: {
      id: 'mock-user-id-superadmin',
      name: 'Deven Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      role: 'superadmin',
    },
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
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'blog-3',
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
    author: {
      id: 'mock-user-id-superadmin',
      name: 'Deven Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      role: 'superadmin',
    },
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
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export let mockComments: MockComment[] = [
  {
    id: 'comment-1',
    blogId: 'blog-1',
    userId: 'mock-user-id-reader',
    userName: 'Alex Reader',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    content: 'This playbook is a lifesaver. We were about to spend $15k building a platform before validating. The smoke test checklist saved us months of work. Any advice on validating marketplace ideas?',
    likes: ['mock-user-id-superadmin'],
    reports: [],
    status: 'approved',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comment-2',
    blogId: 'blog-1',
    userId: 'mock-user-id-superadmin',
    userName: 'Deven Admin',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    parentCommentId: 'comment-1',
    content: 'Awesome to hear that, Alex! For marketplaces, validation is all about manual matching (do things that don\'t scale). Build a simple landing page to collect buyer demand, then manually find sellers to fulfill it. Don\'t write a line of code until you have done this 10 times.',
    likes: [],
    reports: [],
    status: 'approved',
    createdAt: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export let mockAnalytics: MockAnalytics[] = [
  { eventType: 'page_view', pageUrl: '/', source: 'direct', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { eventType: 'page_view', pageUrl: '/blogs', source: 'google', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { eventType: 'blog_read', blogId: 'blog-1', duration: 180, source: 'google', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { eventType: 'revenue', amount: 299, source: 'razorpay', timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() },
  { eventType: 'revenue', amount: 299, source: 'razorpay', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  { eventType: 'visitor', pageUrl: '/', source: 'twitter', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
];

export let mockCoupons: MockCoupon[] = [
  { code: 'DEVEN50', discountPercentage: 50, expiryDate: '2026-12-31T23:59:59.000Z', maxRedemptions: 100, redemptionsCount: 22, isActive: true },
  { code: 'EARLYBIRD', discountPercentage: 30, expiryDate: '2026-10-31T23:59:59.000Z', maxRedemptions: 50, redemptionsCount: 45, isActive: true },
];

export let mockWebsiteSettings = {
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
};

export interface MockMedia {
  id: string;
  url: string;
  publicId: string;
  fileName: string;
  fileType: string;
  size: number;
  createdAt: string;
}

export let mockMedia: MockMedia[] = [
  { id: 'media-1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', publicId: 'mock-1', fileName: 'Design Abstract.jpg', fileType: 'image/jpeg', size: 104857, createdAt: new Date().toISOString() },
  { id: 'media-2', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80', publicId: 'mock-2', fileName: 'TS Coding.jpg', fileType: 'image/jpeg', size: 204857, createdAt: new Date().toISOString() },
  { id: 'media-3', url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80', publicId: 'mock-3', fileName: 'AI Glowing Neural.jpg', fileType: 'image/jpeg', size: 304857, createdAt: new Date().toISOString() },
  { id: 'media-4', url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80', publicId: 'mock-4', fileName: 'Hardware Setup.jpg', fileType: 'image/jpeg', size: 404857, createdAt: new Date().toISOString() },
];

export const getMockMedia = () => mockMedia;
export const addMockMedia = (item: MockMedia) => {
  mockMedia.push(item);
  return item;
};
export const deleteMockMedia = (id: string) => {
  mockMedia = mockMedia.filter(m => m.id !== id);
};

// Functions to modify and retrieve mock state
export const getMockBlogs = () => mockBlogs;
export const addMockBlog = (blog: MockBlog) => {
  mockBlogs.push(blog);
  return blog;
};
export const updateMockBlog = (id: string, updated: Partial<MockBlog>) => {
  mockBlogs = mockBlogs.map(b => b.id === id ? { ...b, ...updated } as MockBlog : b);
  return mockBlogs.find(b => b.id === id);
};
export const deleteMockBlog = (id: string) => {
  mockBlogs = mockBlogs.filter(b => b.id !== id);
};

export const getMockComments = (blogId?: string) => {
  if (blogId) return mockComments.filter(c => c.blogId === blogId);
  return mockComments;
};
export const addMockComment = (comment: MockComment) => {
  mockComments.push(comment);
  return comment;
};
export const deleteMockComment = (id: string) => {
  mockComments = mockComments.filter(c => c.id !== id);
};
export const updateMockCommentStatus = (id: string, status: 'approved' | 'reported' | 'hidden') => {
  mockComments = mockComments.map(c => c.id === id ? { ...c, status } : c);
};

export const getMockUsers = () => mockUsers;
export const addMockUser = (user: MockUser) => {
  mockUsers.push(user);
  return user;
};
export const updateMockUser = (id: string, updated: Partial<MockUser>) => {
  mockUsers = mockUsers.map(u => u.id === id ? { ...u, ...updated } as MockUser : u);
  return mockUsers.find(u => u.id === id);
};
