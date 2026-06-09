export interface ClientBlog {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  description: string;
  category: string;
  tags: string[];
  readTime: number;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  isPremium: boolean;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export const staticBlogs: ClientBlog[] = [
  {
    id: 'blog-1',
    title: 'Startup Validation: How to Prove Your Idea is Worth Building',
    slug: 'startup-validation-prove-idea-worth-building',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    description: 'A practical guide on validating startup ideas through customer interviews, smoke tests, and manual workflows before building an MVP.',
    category: 'Startup Ideas',
    tags: ['Startup Ideas', 'Validation', 'Product Market Fit', 'Solopreneur'],
    readTime: 6,
    author: {
      name: 'Deven Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      role: 'superadmin',
    },
    isPremium: false,
    viewsCount: 342,
    likesCount: 89,
    commentsCount: 2,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'blog-2',
    title: 'How to Find Your First 100 Customers: The Ultimate Founder\'s Playbook',
    slug: 'how-to-find-your-first-100-customers',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    description: 'Master the manual acquisition channels to get your first 100 startup customers with this detailed playbook.',
    category: 'Marketing',
    tags: ['Marketing', 'SaaS Growth', 'User Acquisition', 'Sales'],
    readTime: 8,
    author: {
      name: 'Deven Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      role: 'superadmin',
    },
    isPremium: true,
    viewsCount: 512,
    likesCount: 145,
    commentsCount: 0,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'blog-3',
    title: 'Building an MVP Without Coding: Launch Fast and Validate Early',
    slug: 'building-an-mvp-without-coding',
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    description: 'Learn how to build and launch your startup MVP using modern no-code tools and AI automation.',
    category: 'Product Building',
    tags: ['Product Building', 'No Code', 'MVP', 'AI & Automation'],
    readTime: 5,
    author: {
      name: 'Deven Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      role: 'superadmin',
    },
    isPremium: true,
    viewsCount: 228,
    likesCount: 67,
    commentsCount: 1,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const staticTestimonials = [
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
  {
    name: 'David K.',
    role: 'Independent Indiehacker',
    feedback: 'Deven Blogs is the first platform that gets typography right. Code snippets load instantly, the TTS audio is flawless, and the streak widgets make reading a rewarding habit.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
  },
];

export const staticFaqs = [
  {
    question: 'What is included in the premium membership?',
    answer: 'Premium members get full access to all articles, text-to-speech audio logs, 60s summary videos, commenting rights, bookmarking lists, and early access to newsletters.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes! You can cancel your subscription from your billing dashboard with a single click. You will remain premium until the end of your billing cycle.',
  },
  {
    question: 'How do streaks work?',
    answer: 'Reading any article for at least 30 seconds increments your daily streak. Maintaining a streak unlocks achievements and increases your profile rank.',
  },
  {
    question: 'Are there any discounts for annual terms?',
    answer: 'Yes, we periodically offer coupons like DEVEN50 and EARLYBIRD which give up to 50% discount on subscription checkouts.',
  },
];
