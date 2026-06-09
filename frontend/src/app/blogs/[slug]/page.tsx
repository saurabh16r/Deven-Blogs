'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { staticBlogs } from '@/utils/mockData';
import {
  Sparkles, Play, Pause, RotateCcw, Volume2, Mic, Eye, Heart, Share2,
  Bookmark, MessageSquare, CornerDownRight, AlertTriangle, Lock, ShieldCheck,
  ArrowLeft, ArrowRight, Home, Compass, BookOpen, Mail, Info, Search, Menu,
  X, ChevronDown, Check, Globe, Download, Plus, Award, Star, CheckCircle2, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface BlogDetail {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  coverImage: string;
  content: string;
  summary: {
    tldr: string;
    keyPoints: string[];
  };
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
  readTime: number;
  likesCount: number;
  viewsCount: number;
  commentsCount: number;
  bookmarksCount?: number;
  shareCount?: number;
  videoViews?: number;
  isPremium: boolean;
  isLocked: boolean;
  audioUrl?: string;
  videoUrl?: string;
  createdAt: string;
}

interface CommentType {
  id?: string;
  _id?: string;
  userId?: {
    _id?: string;
    id?: string;
    name: string;
    avatar: string;
    role: string;
  } | any;
  userName?: string;
  userAvatar?: string;
  parentCommentId?: string;
  content: string;
  likes: string[];
  createdAt: string;
}

// Sponsor Tools Spotlight List
const sponsorTools = [
  {
    name: 'Framer',
    tagline: 'Interactive Design & Publishing',
    logo: 'F',
    logoBg: 'bg-indigo-600',
    description: 'Design and publish premium responsive sites without writing a line of code.',
    benefits: ['Subsecond load times', 'Framer motion built-in', 'Visual canvas controls'],
    url: 'https://framer.com'
  },
  {
    name: 'Notion',
    tagline: 'Connected Workspace for Creators',
    logo: 'N',
    logoBg: 'bg-zinc-800 border border-white/20',
    description: 'Structure your founder database, playbooks, team tasks, and wiki docs in one place.',
    benefits: ['Flexible templates', 'AI writing assistant', 'Rich blocks system'],
    url: 'https://notion.so'
  },
  {
    name: 'Linear',
    tagline: 'Issue Tracking & Product Planning',
    logo: 'L',
    logoBg: 'bg-violet-950',
    description: 'The product tracker designed for high-performance software engineering teams.',
    benefits: ['Subsecond keyboard shortcuts', 'Git integrations', 'Sleek dark layout UI'],
    url: 'https://linear.app'
  },
  {
    name: 'Stripe',
    tagline: 'Financial Infrastructure',
    logo: 'S',
    logoBg: 'bg-blue-600',
    description: 'Accept payments, scale checkout pages, and manage subscription billing globally.',
    benefits: ['99.99% uptime API', 'Stripe checkout builder', 'Fraud detection built-in'],
    url: 'https://stripe.com'
  },
  {
    name: 'HubSpot',
    tagline: 'CRM & Customer platform',
    logo: 'H',
    logoBg: 'bg-orange-600',
    description: 'Manage builder outreach, email lists, contact metrics, and scale growth operations.',
    benefits: ['Unified contact record', 'Automated marketing loops', 'Sleek analytics charts'],
    url: 'https://hubspot.com'
  }
];

// Terminology list under Highlight Words
const highlightWords = [
  { term: 'Clarity', definition: 'Uncompromising vision of what is important versus what is noise. True clarity keeps teams aligned and executing without distraction.' },
  { term: 'Systems', definition: 'Predictable, scalable processes over ad-hoc efforts. A great system automates tasks so you can focus on building high-leverage products.' },
  { term: 'Focus', definition: 'The ability to say "no" to 99% of good ideas to execute the 1% great idea. Focus is the ultimate leverage for small startup teams.' },
  { term: 'Compounding', definition: 'Small daily user experience improvements leading to massive long-term retention. A 1% improvement daily results in 37x growth in a year.' },
  { term: 'Product-Market Fit', definition: 'The point when organic pull from the market exceeds sales push. PMF means users are actively recommending your software.' },
  { term: 'CAC', definition: 'Customer Acquisition Cost — the total sales and marketing cost divided by the number of new customers acquired in a given period.' },
  { term: 'Retention', definition: 'The ultimate metric of product value; the percentage of users returning over time. High retention cures all acquisition problems.' }
];

// AI Translation lookup mappings
const translations: Record<string, { title: string; tldr: string; category: string; keyPoints: string[] }> = {
  es: {
    title: "Diseñando para el Futuro: La Estética Apple + Notion + Linear",
    tldr: "Un análisis profundo sobre la combinación del desenfoque de hardware de Apple, el minimalismo textual de Notion y los componentes de rendimiento oscuro de Linear para crear aplicaciones web premium modernas.",
    category: "Diseño",
    keyPoints: [
      "El difuminado del fondo añade profundidad visual y mejora la concentración.",
      "El diseño de Notion mejora la legibilidad mediante márgenes limpios.",
      "Los atajos de teclado de Linear aumentan la eficiencia del usuario.",
      "La estética premium requiere tipografías elegantes y espaciado generoso.",
      "El valor y la retención se derivan de la experiencia del desarrollador."
    ]
  },
  de: {
    title: "Design für die Zukunft: Die Ästhetik von Apple + Notion + Linear",
    tldr: "Eine analytische Tiefenanalyse der Kombination aus Apple Hardware-Unschärfe, Notion Textminimalismus und Linear Dark Performance-Komponenten zur Erstellung erstklassiger moderner Web-Apps.",
    category: "Design",
    keyPoints: [
      "Die Hintergrundunschärfe sorgt für visuelle Tiefe und besseren Fokus.",
      "Das Notion-Layout verbessert die Lesbarkeit durch klare Abstände.",
      "Die Tastenkombinationen von Linear steigern die Arbeitseffizienz.",
      "Premium-Design erfordert edle Typografie und großzügige Abstände.",
      "Benutzerbindung basiert auf optimaler Interaktion und Detailverliebtheit."
    ]
  },
  ja: {
    title: "未来に向けたデザイン：Apple + Notion + Linear の美学",
    tldr: "Apple のハードウェアブラー、Notion のテキストミニマリズム、および Linear のダークパフォーマンスコンポーネントを組み合わせて、プレミアムなモダンウェブアプリを構築するための分析的ディープダイブ。",
    category: "デザイン",
    keyPoints: [
      "背景のぼかしが視覚的な深みを与え、フォーカスを強化します。",
      "Notionスタイルのレイアウトは、すっきりとした余白で読みやすさを向上させます。",
      "Linearのキーボードショートカットは、開発の生産性を最大化します。",
      "プレミアムな質感は、洗練されたフォントと十分なホワイトスペースから生まれます。",
      "高い価値と顧客維持は、考え抜かれた開発体験デザインにかかっています。"
    ]
  },
  hi: {
    title: "भविष्य के लिए डिज़ाइन: Apple + Notion + Linear सौंदर्यशास्त्र",
    tldr: "प्रीमियम आधुनिक वेब ऐप्स तैयार करने के लिए Apple हार्डवेयर ब्लर, Notion टेक्स्ट मिनिमलिज्म और Linear डार्क परफॉर्मेंस घटकों के संयोजन का एक विश्लेषणात्मक विश्लेषण।",
    category: "डिज़ाइन",
    keyPoints: [
      "बैकग्राउंड ब्लर दृश्य गहराई जोड़ता है और फोकस को बढ़ाता है।",
      "Notion लेआउट साफ मार्जिन के माध्यम से पठनीयता में सुधार करता है।",
      "Linear कीबोर्ड शॉर्टकट उपयोगकर्ता दक्षता को बढ़ावा देते हैं।",
      "प्रीमियम सौंदर्यशास्त्र के लिए सुरुचिपूर्ण फ़ॉन्ट्स और पर्याप्त स्थान की आवश्यकता होती है।",
      "गुणवत्तायुक्त अनुभव और उपयोगकर्ता प्रतिधारण ही आपकी मुख्य ताकत है।"
    ]
  }
};

export default function SingleBlogPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, token, triggerMockSubscription, logout } = useAuth();

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Follow Author toggle
  const [isFollowing, setIsFollowing] = useState(false);

  // Likes & Saved States
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Custom Audio Player State
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(35); // simulated initial progress
  const [audioDuration, setAudioDuration] = useState('2:45');
  const [audioCurrentTime, setAudioCurrentTime] = useState('0:58');

  // Video Drawer Overlay
  const [videoOpen, setVideoOpen] = useState(false);

  // Translation States
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [translateDropdownOpen, setTranslateDropdownOpen] = useState(false);

  // Search States
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSearchBlogs = searchQuery
    ? staticBlogs.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : staticBlogs;

  // Left Sidebar Mobile State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile Dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Premium Upgrade Dialog states
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState('');

  // AI Summary tab selection
  const [summaryTab, setSummaryTab] = useState<'quick' | 'detailed' | 'action'>('quick');

  // AI Startup Mentor states
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [mentorInput, setMentorInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Checklist states
  const [checklistState, setChecklistState] = useState<Record<number, boolean>>({});

  // New Comment Input
  const [commentContent, setCommentContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [commentSort, setCommentSort] = useState<'newest' | 'popular'>('newest');

  // Comment reactions state
  const [commentReactions, setCommentReactions] = useState<Record<string, Record<string, number>>>({});
  const [userCommentReactions, setUserCommentReactions] = useState<Record<string, Record<string, boolean>>>({});

  // Right Sidebar states
  const [expandedWord, setExpandedWord] = useState<string | null>(null);
  const [toolIndex, setToolIndex] = useState(0);

  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // AI recommendations related blogs
  const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);

  // Track scroll reading duration for Streaks
  const readDurationLogged = useRef(false);

  // Audio timer simulation
  useEffect(() => {
    let interval: any;
    if (audioPlaying) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setAudioPlaying(false);
            return 0;
          }
          return prev + 0.6; // slow progression
        });
        
        setAudioCurrentTime(prev => {
          const parts = prev.split(':');
          let mins = parseInt(parts[0]);
          let secs = parseInt(parts[1]) + 1;
          if (secs >= 60) {
            mins += 1;
            secs = 0;
          }
          return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [audioPlaying]);

  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true);
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const blogRes = await axios.get(`${API_URL}/blogs/${slug}`, config);
        const fetchedBlog = blogRes.data;
        
        setBlog(fetchedBlog);
        setLikesCount(fetchedBlog.likesCount || 0);

        // Fetch Comments
        const commentsRes = await axios.get(`${API_URL}/comments/blog/${fetchedBlog._id || fetchedBlog.id}`);
        const loadedComments = commentsRes.data;
        setComments(loadedComments);
        initializeCommentReactions(loadedComments);

        // Fetch AI related recommendations
        try {
          const recRes = await axios.post(`${API_URL}/ai/recommendations`, {
            category: fetchedBlog.category,
            currentBlogId: fetchedBlog._id || fetchedBlog.id
          });
          setRelatedBlogs(recRes.data);
        } catch {
          setRelatedBlogs(staticBlogs.filter(b => b.slug !== slug));
        }

      } catch (err) {
        console.warn('Backend API connection failed. Resolving static blogs locally.');
        const found = staticBlogs.find(b => b.slug === slug);
        if (!found) {
          setError('Article not found.');
        } else {
          const isUserSubscribed = user?.isSubscribed || false;
          let mockLocked = false;
          let mockContent = found.description + ' ' + found.description + ' ' + found.description + ' ' + found.description;
          let mockTakeaways = ['Establish typography standards early.', 'Use background blurs on layout cards.', 'Support mobile menus via sliding drawers.', 'Focus on high performance indices.', 'Prioritize user-requested modifications.'];

          // Add more mock paragraphs to demonstrate rich content rendering with widgets
          mockContent = `
            <p>Designing modern software experiences requires structural layouts that compound value. When combining Apple's premium physical hardware aesthetics, Notion's typographic clarity, and Linear's dark, subsecond workflows, developers achieve a state of interaction velocity that delights early adopters.</p>
            <p>Start with layout alignment. Generous whitespace ensures headings breathe. Contrast must remain subtle yet recognizable. By structuring page layouts with fixed sidebars, center reading fields, and contextual insights sidebar blocks, readers remain in a deep flow state.</p>
            <blockquote>The fastest way to scale the wrong thing is to confuse activity with progress. Focus on compounding user engagement.</blockquote>
            <p>Next, design systems specify rigid parameters for interaction. When shadows lift cards on hover, and gradients reflect neon branding tones, developers construct micro-animations that feel premium. Simple triggers, such as tab transitions and drawer roll-outs, add delightful touchpoints.</p>
            <p>Finally, content intelligence models help summarize key parameters for busy founders. With summarized breakdowns, quick actionable takeaways, and terminology definitions, builders ingest complex playbooks in minutes instead of wading through bloated articles.</p>
          `;

          if (found.isPremium && !isUserSubscribed) {
            mockLocked = true;
            mockContent = `<p>Designing modern software experiences requires structural layouts that compound value. When combining Apple's premium physical hardware aesthetics...</p>`;
            mockTakeaways = [];
          }

          const mockBlogDetail: BlogDetail = {
            ...found,
            content: mockContent,
            isLocked: mockLocked,
            summary: {
              tldr: found.description,
              keyPoints: mockTakeaways,
            },
            audioUrl: mockLocked ? undefined : '/audio/mock.mp3',
            videoUrl: mockLocked ? undefined : 'https://assets.mixkit.co/videos/preview/mixkit-hand-holding-smartphone-with-green-screen-mockup-41584-large.mp4',
          };
          setBlog(mockBlogDetail);
          setLikesCount(found.likesCount);
          setRelatedBlogs(staticBlogs.filter(b => b.slug !== slug));

          const mockComments = [
            {
              id: 'c1',
              userName: 'Sarah Jenkins',
              userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
              content: 'This breakdown is incredibly thorough! The combination of Apple layouts with Notion clean formatting is spot on.',
              likes: [],
              createdAt: new Date(Date.now() - 600000).toISOString()
            },
            {
              id: 'c2',
              userName: 'Alex Carter',
              userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
              content: 'Is there a performance penalty when using heavy background blurs on mobile devices?',
              likes: [],
              createdAt: new Date(Date.now() - 3600000).toISOString()
            }
          ];
          setComments(mockComments);
          initializeCommentReactions(mockComments);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
    readDurationLogged.current = false;
  }, [slug, token, user?.isSubscribed]);

  // Log read duration to backend for Streaks
  useEffect(() => {
    if (!blog || readDurationLogged.current || !token) return;
    const timer = setTimeout(async () => {
      try {
        readDurationLogged.current = true;
        await axios.post(
          `${API_URL}/users/history`,
          { blogId: blog._id || blog.id, duration: 30 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Reading history logged successfully for streak updates.');
      } catch (err) {
        console.log('Offline/Mock read logger tracking active.');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [blog, token]);

  // Populate AI Mentor welcome message
  useEffect(() => {
    if (blog) {
      setChatMessages([
        {
          role: 'assistant',
          content: `Hi ${user?.name || 'there'}! 👋 I am your **Deven AI Mentor**, trained on Y Combinator frameworks and elite scaling systems.

How can I help you apply the lessons from *"${blog.title}"* to your startup?`
        }
      ]);
    }
  }, [blog, user?.name]);

  const handleSendMentorMessage = async (msgText: string) => {
    if (!msgText || !blog) return;
    
    // Add user message
    const updatedMessages = [...chatMessages, { role: 'user' as const, content: msgText }];
    setChatMessages(updatedMessages);
    setMentorInput('');
    setChatLoading(true);

    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.post(
        `${API_URL}/ai/mentor`,
        { blogId: blog._id || blog.id, message: msgText },
        config
      );
      
      setChatMessages([...updatedMessages, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      // client side simulated fallback if connection fails
      let responseText = '';
      const cleanMsg = msgText.toLowerCase();

      if (cleanMsg.includes('apply') || cleanMsg.includes('how') || cleanMsg.includes('my startup') || cleanMsg.includes('this to')) {
        responseText = `As a **${user?.founderRole || 'Founder'}** currently in the **${user?.startupStage || 'Exploring'}** stage, applying *"${blog.title}"* will require a 3-step action layout:\n\n1. **Aesthetic Audit**: Check your background blur parameters and typography lines.\n2. **Run MVP test**: Build a 48-hour prototype implementing standard components.\n3. **Keyboard speed**: Incorporate keyboard shortcuts to increase user flow speeds.`;
      } else if (cleanMsg.includes('summarize') || cleanMsg.includes('summary') || cleanMsg.includes('tldr')) {
        responseText = `Summary for **${user?.founderRole || 'Founder'}**:\n\n- **Rule**: Standardized aesthetics boost engagement.\n- **Colors**: Use carbon backgrounds (#09090b) and gold text guides.\n- **Lesson**: Do not clutter page margins; keep typography breathing.`;
      } else if (cleanMsg.includes('checklist') || cleanMsg.includes('action steps')) {
        responseText = `Checklist for your stage (**${user?.startupStage || 'Exploring'}**):\n\n* [ ] Audit styling files for reusable CSS tokens.\n* [ ] Check React server components to reduce hydration speeds.\n* [ ] Deploy an onboarding wizard flow to segment interest preferences.`;
      } else {
        responseText = `That is an insightful query regarding: "${msgText}".\n\nFor a **${user?.founderRole || 'Founder'}** aiming at "${user?.goals?.[0] || 'MVP Launch'}", I suggest focusing on rapid modular refactors first. Optimize styling wrappers and use the 60-second summary briefs to test engagement.`;
      }
      
      setChatMessages([...updatedMessages, { role: 'assistant', content: responseText }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Load checklist state
  useEffect(() => {
    if (blog && user) {
      const storageKey = `deven_checklist_${user.id || (user as any)._id}_${blog._id || blog.id || blog.slug}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setChecklistState(JSON.parse(saved));
        } catch {
          setChecklistState({});
        }
      } else {
        setChecklistState({});
      }
    }
  }, [blog, user]);

  const handleChecklistToggle = (index: number) => {
    if (!blog || !user) return;
    const newState = {
      ...checklistState,
      [index]: !checklistState[index]
    };
    setChecklistState(newState);
    
    const storageKey = `deven_checklist_${user.id || (user as any)._id}_${blog._id || blog.id || blog.slug}`;
    localStorage.setItem(storageKey, JSON.stringify(newState));
  };

  const initializeCommentReactions = (commentList: CommentType[]) => {
    const initialReactions: Record<string, Record<string, number>> = {};
    const initialUserReactions: Record<string, Record<string, boolean>> = {};
    
    commentList.forEach(c => {
      const cid = c._id || c.id || '';
      initialReactions[cid] = {
        claps: Math.floor(Math.random() * 15) + 3,
        hearts: Math.floor(Math.random() * 8) + 1,
        insights: Math.floor(Math.random() * 5),
        fires: Math.floor(Math.random() * 6) + 1
      };
      initialUserReactions[cid] = {
        claps: false,
        hearts: false,
        insights: false,
        fires: false
      };
    });
    setCommentReactions(initialReactions);
    setUserCommentReactions(initialUserReactions);
  };

  const handleLike = async () => {
    if (!blog) return;
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.post(`${API_URL}/blogs/${blog._id || blog.id}/like`, {}, config);
      setIsLiked(true);
      setLikesCount(res.data.likesCount);
      trackEvent('blog_like');
    } catch {
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    }
  };

  const trackEvent = async (eventType: string) => {
    if (!blog) return;
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.post(
        `${API_URL}/analytics/track`,
        {
          eventType,
          blogId: blog._id || blog.id,
          pageUrl: window.location.href,
        },
        config
      );
    } catch {
      // Non-blocking tracking fallback
    }
  };

  const handleSave = async () => {
    if (!blog) return;
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      await axios.post(`${API_URL}/users/bookmarks/toggle`, { blogId: blog._id || blog.id });
      setIsSaved(!isSaved);
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent || !blog) return;
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/comments`, {
        blogId: blog._id || blog.id,
        content: commentContent
      });
      const newComment = res.data;
      setComments([newComment, ...comments]);
      setCommentContent('');
      
      const cid = newComment._id || newComment.id || '';
      setCommentReactions(prev => ({
        ...prev,
        [cid]: { claps: 0, hearts: 0, insights: 0, fires: 0 }
      }));
      setUserCommentReactions(prev => ({
        ...prev,
        [cid]: { claps: false, hearts: false, insights: false, fires: false }
      }));
    } catch (err: any) {
      // client mockup fallback
      const mockComment: CommentType = {
        id: 'mock-' + Date.now(),
        userName: user?.name || 'You (Member)',
        userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
        content: commentContent,
        likes: [],
        createdAt: new Date().toISOString()
      };
      setComments([mockComment, ...comments]);
      setCommentContent('');
      
      const cid = mockComment.id || '';
      setCommentReactions(prev => ({
        ...prev,
        [cid]: { claps: 0, hearts: 0, insights: 0, fires: 0 }
      }));
      setUserCommentReactions(prev => ({
        ...prev,
        [cid]: { claps: false, hearts: false, insights: false, fires: false }
      }));
    }
  };

  const handleAddReply = async (parentCommentId: string) => {
    if (!replyContent || !blog || !token) return;

    try {
      const res = await axios.post(`${API_URL}/comments`, {
        blogId: blog._id || blog.id,
        content: replyContent,
        parentCommentId
      });
      setComments([...comments, res.data]);
      setReplyContent('');
      setReplyingToId(null);
    } catch (err: any) {
      // fallback reply
      const mockReply: CommentType = {
        id: 'reply-' + Date.now(),
        userName: user?.name || 'You (Member)',
        userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
        content: replyContent,
        likes: [],
        parentCommentId,
        createdAt: new Date().toISOString()
      };
      setComments([...comments, mockReply]);
      setReplyContent('');
      setReplyingToId(null);
    }
  };

  const handleCommentReaction = (commentId: string, reactionType: string) => {
    if (!token) {
      router.push('/login');
      return;
    }

    const currentReacted = userCommentReactions[commentId]?.[reactionType] || false;
    const diff = currentReacted ? -1 : 1;

    setCommentReactions(prev => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        [reactionType]: Math.max(0, (prev[commentId]?.[reactionType] || 0) + diff)
      }
    }));

    setUserCommentReactions(prev => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        [reactionType]: !currentReacted
      }
    }));
  };

  const verifyPremiumAccess = (feature: string) => {
    if (blog?.isLocked) {
      setPremiumFeatureName(feature);
      setUpgradeModalOpen(true);
      return false;
    }
    return true;
  };

  const handleNewsletterSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  const triggerPDFDownload = () => {
    if (!verifyPremiumAccess('PDF Playbook Download')) return;
    
    // Simulate premium PDF compilation & trigger download
    const content = `Deven Premium Playbook: ${blog?.title}\nCategory: ${blog?.category}\nAuthor: ${blog?.author?.name}\n\nKey Takeaways:\n${blog?.summary?.keyPoints?.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blog?.slug}-playbook.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#FFC247] border-t-transparent animate-spin" />
        <p className="text-zinc-500 text-xs tracking-wider font-outfit uppercase">Curating Premium reading layout...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-[#FFC247] mb-3" />
        <h2 className="text-xl font-bold text-white font-outfit">Article Not Found</h2>
        <p className="text-zinc-500 text-sm mt-1 max-w-sm">{error || 'Something went wrong.'}</p>
        <Link href="/blogs" className="mt-6 px-6 py-2.5 rounded-xl bg-[#FFC247] text-black text-xs font-bold font-outfit uppercase tracking-wider hover:bg-[#E6AE3F] transition-all">
          Go back to publications
        </Link>
      </div>
    );
  }

  // Translation helpers
  const isTranslated = currentLanguage !== 'en';
  const displayTitle = isTranslated && translations[currentLanguage] ? translations[currentLanguage].title : blog.title;
  const displayCategory = isTranslated && translations[currentLanguage] ? translations[currentLanguage].category : blog.category;
  const displayTldr = isTranslated && translations[currentLanguage] ? translations[currentLanguage].tldr : blog.summary.tldr;
  const displayKeyPoints = isTranslated && translations[currentLanguage] ? translations[currentLanguage].keyPoints : blog.summary.keyPoints;

  // Sorting comments logic
  const sortedComments = [...comments]
    .filter(c => !c.parentCommentId)
    .sort((a, b) => {
      const aId = a._id || a.id || '';
      const bId = b._id || b.id || '';
      if (commentSort === 'popular') {
        const aClaps = (commentReactions[aId]?.claps || 0) + (commentReactions[aId]?.hearts || 0);
        const bClaps = (commentReactions[bId]?.claps || 0) + (commentReactions[bId]?.hearts || 0);
        return bClaps - aClaps;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Action plan points based on category
  const getActionPlanPoints = () => {
    if (blog.category.toLowerCase() === 'design') {
      return [
        { title: 'Perform aesthetic layout audit', desc: 'Verify text-to-whitespace ratios across your client landing interface.' },
        { title: 'Define typography scale hierarchy', desc: 'Embed high-fidelity Google Fonts (Outfit/Lora) for editorial clarity.' },
        { title: 'Map background blur parameters', desc: 'Test blur density (e.g. backdrop-filter) to shield visual focus.' },
        { title: 'Implement keyboard shortcut maps', desc: 'Incorporate hotkey navigation schemas like Linear for developer tool speed.' },
      ];
    } else if (blog.category.toLowerCase() === 'technology') {
      return [
        { title: 'Transition components to server execution', desc: 'Enable React Server Components to minimize hydration script overhead.' },
        { title: 'Configure asynchronous routing params', desc: 'Set up Next.js app routes dynamically to leverage caching configurations.' },
        { title: 'Audit media payload sizes', desc: 'Compress hero images, convert asset streams to WebP/AVIF formats.' },
        { title: 'Integrate automated tests hooks', desc: 'Validate build builds and routes using compilation check commands.' },
      ];
    } else {
      return [
        { title: 'Deploy custom LLM parser pipelines', desc: 'Utilize structured JSON schemas to digest article topics dynamically.' },
        { title: 'Generate text-to-speech audio logs', desc: 'Implement automated voice synthesis modules for members accessibility.' },
        { title: 'Encode short vertical summaries', desc: 'Prepare 60-second summary briefs for onboarding channels.' },
        { title: 'Track streaks metrics variables', desc: 'Log reader duration duration via REST routes to boost active metrics.' },
      ];
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F4F4F5] flex justify-center font-sans overflow-x-hidden">
      
      {/* 3-COLUMN LAYOUT CONTAINER */}
      <div className="w-full max-w-[1440px] flex px-0 md:px-4 lg:px-8 relative justify-between">

        {/* LEFT NAVIGATION SIDEBAR (Desktop: sticky, Mobile: slide-out menu) */}
        <aside className="w-[260px] shrink-0 border-r border-white/5 pr-6 hidden xl:flex flex-col justify-between py-8 h-screen sticky top-0">
          
          {/* Top Section */}
          <div className="space-y-8">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <span className="w-9 h-9 rounded-xl bg-[#FFC247] flex items-center justify-center font-black text-black font-outfit text-xl shadow-[0_0_20px_rgba(255,194,71,0.35)] group-hover:scale-105 transition-all">
                D
              </span>
              <div className="flex flex-col">
                <span className="font-outfit font-black text-lg text-white tracking-tight leading-none">
                  Deven<span className="text-[#FFC247]">.</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1 font-outfit leading-none">
                  Built For Builders
                </span>
              </div>
            </Link>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-1">
              {[
                { name: 'Home', href: '/', icon: Home, active: false },
                { name: 'Explore', href: '/blogs', icon: Compass, active: true },
                { name: 'Bookmarks', href: '/dashboard', icon: Bookmark, active: false },
                { name: 'Library', href: '/dashboard', icon: BookOpen, active: false },
                { name: 'Newsletter', href: '#newsletter', icon: Mail, active: false },
                { name: 'About Deven', href: '/about', icon: Info, active: false },
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      item.active
                        ? 'bg-[#FFC247] text-black font-bold shadow-[0_4px_12px_rgba(255,194,71,0.15)]'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComponent className={`w-4.5 h-4.5 ${item.active ? 'stroke-[2.5px]' : 'text-zinc-400 group-hover:text-white'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Premium & Footer Section */}
          <div className="space-y-6">
            
            {/* Premium Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-white/5 relative overflow-hidden group shadow-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFC247]/5 rounded-full blur-2xl group-hover:bg-[#FFC247]/10 transition-colors" />
              
              <div className="flex items-center gap-1.5 text-[#FFC247] text-xs font-bold uppercase tracking-wider mb-2 font-outfit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deven Premium</span>
              </div>
              
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-3.5">
                Premium insights, founder playbooks, startup case studies and member-only content.
              </p>

              {user?.isSubscribed ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                  <Check className="w-4 h-4" /> Membership Active
                </div>
              ) : (
                <button
                  onClick={async () => {
                    await triggerMockSubscription();
                    window.location.reload();
                  }}
                  className="w-full text-center py-2.5 bg-[#FFC247] hover:bg-[#E6AE3F] text-black font-extrabold text-[11px] font-outfit uppercase tracking-wider rounded-xl transition-all shadow-[0_2px_10px_rgba(255,194,71,0.1)]"
                >
                  Upgrade Now
                </button>
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="space-y-3 pl-2">
              <div className="flex gap-3 text-zinc-500">
                {['Twitter', 'LinkedIn', 'Instagram'].map(platform => (
                  <a key={platform} href={`https://${platform.toLowerCase()}.com`} target="_blank" rel="noreferrer" className="text-xs hover:text-[#FFC247] transition-colors">
                    {platform}
                  </a>
                ))}
              </div>
              <p className="text-[10px] text-zinc-600 font-medium font-outfit">
                © {new Date().getFullYear()} DEVEN INC. BUILT FOR BUILDERS
              </p>
            </div>

          </div>
        </aside>

        {/* CENTER CONTENT AREA */}
        <main className="w-full xl:max-w-[750px] mx-auto px-4 md:px-6 lg:px-8 py-8 flex-1 flex flex-col min-h-screen text-left">
          
          {/* TOP RIGHT NAVIGATION HEADER */}
          <div className="w-full flex items-center justify-between border-b border-white/5 pb-4 mb-8">
            <Link href="/blogs" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white font-medium font-outfit tracking-wide transition-colors group">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              BACK TO EXPLORE
            </Link>

            <div className="flex items-center gap-3">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                title="Search publications"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Translate Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setTranslateDropdownOpen(!translateDropdownOpen)}
                  className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                  title="Translate page"
                >
                  <Globe className="w-4.5 h-4.5" />
                  {isTranslated && (
                    <span className="text-[9px] bg-[#FFC247] text-black font-extrabold px-1.5 rounded uppercase font-outfit">
                      {currentLanguage}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {translateDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setTranslateDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2.5 w-40 bg-zinc-950 border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5"
                      >
                        <span className="text-[9px] text-zinc-500 font-bold uppercase p-2 border-b border-white/5 tracking-wider font-outfit mb-1">
                          SELECT LANGUAGE
                        </span>
                        {[
                          { code: 'en', label: 'English' },
                          { code: 'es', label: 'Español' },
                          { code: 'de', label: 'Deutsch' },
                          { code: 'ja', label: '日本語' },
                          { code: 'hi', label: 'हिंदी' },
                        ].map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setCurrentLanguage(lang.code);
                              setTranslateDropdownOpen(false);
                            }}
                            className={`text-xs px-3 py-2 text-left rounded-lg transition-colors flex items-center justify-between ${
                              currentLanguage === lang.code ? 'bg-[#FFC247]/15 text-[#FFC247] font-semibold' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span>{lang.label}</span>
                            {currentLanguage === lang.code && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 border border-white/5 hover:border-white/15 rounded-full bg-zinc-900/60 transition-all text-left"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#FFC247]/30"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 pr-1 shrink-0" />
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute right-0 mt-2.5 w-56 rounded-xl border border-white/10 bg-zinc-950 p-2 shadow-2xl z-50 flex flex-col text-xs"
                        >
                          <div className="px-3 py-2 border-b border-white/5 mb-1.5 text-zinc-400">
                            <p className="text-[10px] text-zinc-500 uppercase font-semibold">Logged in as</p>
                            <p className="font-semibold text-white truncate text-xs mt-0.5">{user.email}</p>
                            {user.isSubscribed && (
                              <span className="inline-block text-[9px] bg-[#FFC247]/20 text-[#FFC247] px-2 py-0.5 rounded font-black tracking-wider uppercase mt-1.5 font-outfit">
                                PREMIUM MEMBER
                              </span>
                            )}
                          </div>
                          
                          <Link href="/dashboard" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-zinc-300 hover:bg-white/5 hover:text-white rounded-lg transition-all font-medium">
                            Dashboard
                          </Link>
                          {(user.role === 'author' || user.role === 'admin' || user.role === 'superadmin') && (
                            <Link href="/admin" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-zinc-300 hover:bg-white/5 hover:text-white rounded-lg transition-all font-medium">
                              Content Manager
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              logout();
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg mt-1 pt-2 border-t border-white/5 transition-all text-left font-medium"
                          >
                            Sign Out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
                    LOG IN
                  </Link>
                  <Link
                    href="/pricing"
                    className="px-4 py-2 text-xs font-black bg-[#FFC247] hover:bg-[#E6AE3F] text-black rounded-full transition-all font-outfit tracking-wide shadow-[0_0_15px_rgba(255,194,71,0.2)]"
                  >
                    SUBSCRIBE
                  </Link>
                </>
              )}

              {/* Mobile hamburger toggle */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="xl:hidden p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ARTICLE TITLE HEADER BLOCK */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#FFC247]/10 border border-[#FFC247]/20 text-[#FFC247] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-outfit">
                {displayCategory}
              </span>
              {blog.isPremium && (
                <span className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 font-outfit">
                  <Lock className="w-2.5 h-2.5" />
                  Premium
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight leading-[1.15] text-left">
              {displayTitle}
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 font-medium leading-relaxed font-sans mt-2">
              {displayTldr}
            </p>

            {/* Verified Author Info block */}
            <div className="flex flex-wrap items-center gap-4 pt-4 pb-4 border-b border-white/5 text-zinc-500 text-xs font-medium">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={blog.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                  alt={blog.author?.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#FFC247]/20 shadow-inner"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-zinc-200 text-xs">{blog.author?.name}</span>
                    <span title="Verified Founder Profile">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#FFC247]" />
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 uppercase mt-0.5 font-outfit tracking-wide">{blog.author?.role || 'Builder'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-auto text-zinc-500 text-[11px] font-outfit">
                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <span>{blog.readTime} MIN READ</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {blog.viewsCount || 102} VIEWS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <span className="flex items-center gap-1"><Bookmark className="w-3.5 h-3.5" /> {blog.bookmarksCount ?? 0} SAVED</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5" /> {blog.videoViews ?? 0} VIDEO VIEWS</span>
              </div>
            </div>
          </div>

          {/* ARTICLE COVER IMAGE */}
          <div className="rounded-2xl overflow-hidden aspect-[21/9] bg-zinc-900 border border-white/5 mb-6 group relative shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-700 ease-out"
            />
          </div>

          {/* QUICK ACTION TOOLBAR */}
          <div className="flex items-center justify-between border-y border-white/5 py-3 mb-8 text-zinc-400 text-xs font-semibold gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Listen Audio */}
              <button
                onClick={() => {
                  if (verifyPremiumAccess('Audio Playback')) {
                    setAudioPlaying(!audioPlaying);
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all border ${
                  audioPlaying
                    ? 'bg-[#FFC247]/10 border-[#FFC247]/30 text-[#FFC247]'
                    : 'bg-zinc-900/50 border-white/5 hover:text-white hover:border-white/10'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{audioPlaying ? 'PAUSE BRIEFING' : 'LISTEN AUDIO'}</span>
              </button>

              {/* Watch Video Summary */}
              <button
                onClick={() => {
                  if (verifyPremiumAccess('Video Summaries')) {
                    trackEvent('video_play');
                    setVideoOpen(true);
                  }
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/50 border border-white/5 hover:text-white hover:border-white/10 transition-all"
              >
                <Play className="w-4 h-4 fill-zinc-400 group-hover:fill-white" />
                <span>WATCH SUMMARY</span>
              </button>

              {/* Translate Option (links to translate indicator) */}
              <button
                onClick={() => setTranslateDropdownOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/50 border border-white/5 hover:text-white hover:border-white/10 transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>TRANSLATE</span>
              </button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Bookmark */}
              <button
                onClick={handleSave}
                className={`p-2 rounded-xl border transition-all ${
                  isSaved
                    ? 'bg-[#FFC247]/10 border-[#FFC247]/30 text-[#FFC247]'
                    : 'bg-zinc-900/50 border-white/5 hover:text-white hover:border-white/10'
                }`}
                title="Save Article"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#FFC247]' : ''}`} />
              </button>

              {/* Download PDF Playbook */}
              <button
                onClick={triggerPDFDownload}
                className="p-2 rounded-xl bg-zinc-900/50 border border-white/5 hover:text-white hover:border-white/10 transition-all"
                title="Download PDF Playbook"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Share */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  trackEvent('share_clicked');
                  alert('Copied article link to clipboard!');
                }}
                className="p-2 rounded-xl bg-zinc-900/50 border border-white/5 hover:text-white hover:border-white/10 transition-all"
                title="Copy Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SIMULATED AUDIO PROGRESS DRAWER */}
          {audioPlaying && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 p-4 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-center justify-between gap-4"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFC247] animate-ping shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold font-outfit">
                  <span>PLAYING AUDIO SUMMARY: ENG ({audioCurrentTime})</span>
                  <span>{audioDuration}</span>
                </div>
                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden relative cursor-pointer">
                  <div
                    className="bg-[#FFC247] h-full transition-all duration-300"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => setAudioPlaying(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
              >
                <Pause className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* AI SUMMARY WIDGET ("Summarized For You") */}
          <div className="bg-gradient-to-br from-zinc-900/30 to-zinc-950 border border-white/5 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-lg">
            
            {/* Sparkle Glow Background */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#FFC247]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FFC247]" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-outfit">
                  60-SECOND FOUNDER BRIEF
                </h3>
              </div>
              <span className="text-[10px] bg-[#FFC247]/10 text-[#FFC247] px-2 py-0.5 rounded-full font-bold uppercase font-outfit">
                AI Synthesis
              </span>
            </div>

            {/* Premium Block Overlay */}
            {blog.isLocked && (
              <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                <Lock className="w-8 h-8 text-[#FFC247] mb-3" />
                <h4 className="text-sm font-bold text-white uppercase font-outfit tracking-wider">60-Second Founder Brief Locked</h4>
                <p className="text-xs text-zinc-400 mt-1 mb-4 max-w-xs leading-relaxed">
                  Join Deven Premium to unlock immediate key takeaways, expanded synthesis, and actionable checklists.
                </p>
                <button
                  onClick={async () => {
                    await triggerMockSubscription();
                    window.location.reload();
                  }}
                  className="px-5 py-2 bg-[#FFC247] hover:bg-[#E6AE3F] text-black font-extrabold text-[11px] font-outfit uppercase tracking-wider rounded-xl transition-all"
                >
                  Unlock briefing
                </button>
              </div>
            )}

            {/* Interactive Tabs */}
            <div className="flex border-b border-white/5 mb-4 text-xs font-semibold">
              {[
                { id: 'quick', label: 'QUICK TAKEAWAYS' },
                { id: 'detailed', label: 'DETAILED BRIEF' },
                { id: 'action', label: 'FOUNDER ACTION PLAN' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSummaryTab(tab.id as any)}
                  className={`pb-2.5 px-3 border-b-2 transition-all -mb-px font-outfit tracking-wide ${
                    summaryTab === tab.id
                      ? 'border-[#FFC247] text-[#FFC247] font-black'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="text-xs text-zinc-300 leading-relaxed font-sans py-2">
              <AnimatePresence mode="wait">
                {summaryTab === 'quick' && (
                  <motion.ul
                    key="quick"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-3"
                  >
                    {displayKeyPoints.map((point, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFC247] mt-1.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}

                {summaryTab === 'detailed' && (
                  <motion.div
                    key="detailed"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-3"
                  >
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {isTranslated
                        ? displayTldr
                        : `This analysis evaluates the convergence of high-fidelity aesthetics and performance indexing. Combining Apple hardware layouts (like background blurring) and Notion text structure achieves maximum focus. Using hotkeys reduces latency, while the AI summarization layers help founders ingest insights in minutes instead of hours. User-centric iterations remain the core parameter for successful web design.`
                      }
                    </p>
                    <p className="text-zinc-500 text-[11px] italic mt-2">
                      Deven Synthesis Engine v1.8 • Analysis duration: 250ms
                    </p>
                  </motion.div>
                )}

                {summaryTab === 'action' && (
                  <motion.div
                    key="action"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-4"
                  >
                    {/* Progress Bar */}
                    <div className="p-3 bg-zinc-950/60 border border-white/5 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase font-outfit">
                        <span>Checklist Completion</span>
                        <span className="text-[#FFC247]">
                          {Math.round((Object.values(checklistState).filter(Boolean).length / getActionPlanPoints().length) * 100 || 0)}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-[#FFC247] h-full transition-all duration-300"
                          style={{
                            width: `${(Object.values(checklistState).filter(Boolean).length / getActionPlanPoints().length) * 100 || 0}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {getActionPlanPoints().map((step, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-zinc-950 border border-white/5 flex gap-3 items-start">
                          <input
                            type="checkbox"
                            className="mt-1 accent-[#FFC247] cursor-pointer rounded border-white/10"
                            id={`step-${idx}`}
                            checked={!!checklistState[idx]}
                            onChange={() => handleChecklistToggle(idx)}
                          />
                          <div>
                            <label htmlFor={`step-${idx}`} className="font-semibold text-zinc-200 cursor-pointer text-xs">{step.title}</label>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Generate Full Summary CTA */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-4 flex-wrap">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">
                FULL BRIEF REQUIRES PREMIUM ACCOUNT
              </span>
              <button
                onClick={() => {
                  if (verifyPremiumAccess('Full AI Synthesizer')) {
                    alert('Deven AI Synthesizer has generated the full briefing! PDF ready in downloads.');
                  }
                }}
                className="px-4 py-2 bg-zinc-900 border border-white/5 hover:border-white/10 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all font-outfit uppercase text-[10px] tracking-wider"
              >
                Generate Full Summary
              </button>
            </div>

          </div>

          {/* DYNAMIC CONTENT AREA (Parsed with Drop Cap, Quotes, and Founder widgets) */}
          <div className="relative">
            
            {/* Translated Alert Indicator */}
            {isTranslated && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 px-4 py-2 bg-[#FFC247]/10 border border-[#FFC247]/20 rounded-xl flex items-center justify-between text-xs text-[#FFC247]"
              >
                <span>Translated by Deven AI Translator to <strong>{currentLanguage.toUpperCase()}</strong>.</span>
                <button onClick={() => setCurrentLanguage('en')} className="underline font-bold text-[10px] uppercase font-outfit">
                  Show English
                </button>
              </motion.div>
            )}

            <div
              className={`article-body font-sans text-left leading-relaxed ${
                blog.isLocked ? 'max-h-[180px] overflow-hidden select-none relative mask-blur-bottom' : ''
              }`}
            >
              {/* Inject Drop Cap and founder widgets */}
              {renderContentWithWidgets(blog.content)}
            </div>

            {/* Locked Content Premium Paywall Block */}
            {blog.isLocked && (
              <div className="absolute inset-x-0 bottom-0 top-12 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent flex flex-col items-center justify-end pb-2 pt-16">
                <div className="glass-card rounded-3xl p-6 border border-[#FFC247]/25 max-w-md w-full text-center space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.85)] z-20">
                  <div className="w-12 h-12 rounded-full bg-[#FFC247]/10 flex items-center justify-center mx-auto text-[#FFC247]">
                    <Lock className="w-5 h-5" />
                  </div>
                  
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-outfit">
                    Join Deven Premium to Unlock
                  </h3>
                  
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    This is a member-only founder playbook. Unlock full reading access, audio voice synthesis, interactive widgets, and video reviews.
                  </p>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={async () => {
                        await triggerMockSubscription();
                        window.location.reload();
                      }}
                      className="glow-button w-full py-3 rounded-xl font-black text-xs font-outfit uppercase tracking-wider shadow-lg"
                    >
                      Subscribe Now (₹299/mo)
                    </button>
                    <p className="text-[9px] text-zinc-500 font-medium uppercase font-outfit">
                      Cancel anytime. Standard sandbox rules apply.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* VIDEO SUMMARY CARD SECTION */}
          {!blog.isLocked && (
            <div className="mt-8 mb-8 p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-white/5 rounded-2xl flex flex-col md:flex-row items-center gap-5 shadow-lg group">
              {/* Simulated Thumbnail */}
              <div
                onClick={() => {
                  if (verifyPremiumAccess('Video summary play')) {
                    trackEvent('video_play');
                    setVideoOpen(true);
                  }
                }}
                className="w-full md:w-32 aspect-video md:aspect-[3/4] bg-zinc-950 rounded-xl border border-white/5 relative flex items-center justify-center overflow-hidden cursor-pointer group-hover:border-emerald-500/20 shrink-0 shadow-inner"
              >
                <div className="absolute inset-0 bg-[#FFC247]/5 group-hover:bg-transparent transition-colors z-0" />
                <Play className="w-8 h-8 text-[#FFC247] z-10 drop-shadow fill-[#FFC247]/10 group-hover:scale-110 transition-transform" />
                <span className="absolute bottom-2 right-2 text-[9px] bg-black/80 text-white font-extrabold px-1.5 py-0.5 rounded font-outfit">
                  1:20 MIN
                </span>
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left">
                <span className="text-[9px] text-emerald-400 font-black tracking-wider uppercase font-outfit bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Watch this blog in 2 minutes
                </span>
                <h4 className="text-sm font-black text-white uppercase font-outfit">Deven AI Video Briefing</h4>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
                  No time for details? Swipe through this high-fidelity vertical video covering structural layout formulas and design elements.
                </p>
                <button
                  onClick={() => {
                    if (verifyPremiumAccess('Video summary open')) {
                      trackEvent('video_play');
                      setVideoOpen(true);
                    }
                  }}
                  className="mt-2 text-xs font-bold text-[#FFC247] flex items-center gap-1.5 hover:underline font-outfit uppercase tracking-wider"
                >
                  Watch Summary <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ENGAGEMENT BUTTONS SECTION */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 font-semibold gap-4 flex-wrap">
            <div className="flex gap-2">
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                  isLiked
                    ? 'bg-red-500/10 border-red-500/20 text-red-400 font-bold'
                    : 'bg-zinc-950 hover:text-white border-white/5 hover:border-white/10'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                <span>{likesCount} Likes</span>
              </button>

              {/* Bookmark Button */}
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                  isSaved
                    ? 'bg-[#FFC247]/10 border-[#FFC247]/20 text-[#FFC247] font-bold'
                    : 'bg-zinc-950 hover:text-white border-white/5 hover:border-white/10'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#FFC247]' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {/* Follow Author Button */}
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                  isFollowing
                    ? 'bg-[#FFC247] border-[#FFC247] text-black font-extrabold'
                    : 'bg-zinc-950 hover:text-white border-white/5 hover:border-white/10'
                }`}
              >
                {isFollowing ? <Check className="w-3.5 h-3.5 stroke-[2.5px]" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{isFollowing ? 'Following' : 'Follow Author'}</span>
              </button>
            </div>

            {/* Share */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                trackEvent('share_clicked');
                alert('Article link copied to clipboard!');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950 border border-white/5 hover:text-white hover:border-white/10 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Article</span>
            </button>
          </div>

          {/* DEVEN AI MENTOR SECTION */}
          <section className="pt-12 border-t border-white/5 mt-10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#FFC247]" />
                <h3 className="text-base font-black text-white uppercase tracking-wider font-outfit">
                  DEVEN AI MENTOR
                </h3>
              </div>
              <span className="text-[10px] bg-gradient-to-r from-amber-400 to-[#FFC247] text-black font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-outfit">
                PREMIUM MENTOR
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950 border border-white/5 space-y-4 shadow-lg relative overflow-hidden flex flex-col">
              
              {/* Premium Lock overlay */}
              {blog.isLocked && (
                <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                  <Lock className="w-8 h-8 text-[#FFC247] mb-3" />
                  <h4 className="text-sm font-bold text-white uppercase font-outfit tracking-wider">Deven AI Mentor Locked</h4>
                  <p className="text-xs text-zinc-400 mt-1 mb-4 max-w-xs leading-relaxed">
                    Subscribe to Deven Premium to discuss playbooks, get custom startup instructions, and ask our AI Mentor questions.
                  </p>
                  <button
                    onClick={async () => {
                      await triggerMockSubscription();
                      window.location.reload();
                    }}
                    className="px-5 py-2 bg-[#FFC247] hover:bg-[#E6AE3F] text-black font-extrabold text-[11px] font-outfit uppercase tracking-wider rounded-xl transition-all"
                  >
                    Unlock Deven AI Mentor
                  </button>
                </div>
              )}

              {/* Chat Thread */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 py-1 flex flex-col scrollbar-thin">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${
                      msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed font-sans ${
                        msg.role === 'user'
                          ? 'bg-[#FFC247]/10 border border-[#FFC247]/20 text-[#F4F4F5] rounded-tr-none text-right font-medium'
                          : 'bg-zinc-900 border border-white/5 text-zinc-300 rounded-tl-none text-left font-medium'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                
                {chatLoading && (
                  <div className="self-start flex items-center gap-2 p-3 bg-zinc-900 border border-white/5 rounded-2xl rounded-tl-none">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>

              {/* Prompt Suggestions */}
              <div className="flex gap-2 flex-wrap pt-2 border-t border-white/5">
                {[
                  { text: 'How can I apply this to my startup?', label: 'Apply to Startup' },
                  { text: 'Give me action steps for this blog', label: 'Action Checklist' },
                  { text: 'Summarize this blog playbook simply', label: 'Summarize Simply' }
                ].map(suggest => (
                  <button
                    key={suggest.label}
                    type="button"
                    onClick={() => {
                      if (!verifyPremiumAccess('Deven AI Mentor')) return;
                      handleSendMentorMessage(suggest.text);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-white/5 hover:border-[#FFC247]/30 hover:text-white transition-colors bg-zinc-900/60 text-zinc-500 font-bold uppercase tracking-wider text-[9px] font-outfit cursor-pointer"
                  >
                    {suggest.label}
                  </button>
                ))}
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!mentorInput) return;
                  if (!verifyPremiumAccess('Deven AI Mentor')) return;
                  handleSendMentorMessage(mentorInput);
                }}
                className="flex gap-2 items-center"
              >
                <input
                  type="text"
                  placeholder="Ask a question about this playbook..."
                  value={mentorInput}
                  onChange={(e) => setMentorInput(e.target.value)}
                  disabled={blog.isLocked}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFC247] placeholder-zinc-500 font-sans"
                />
                <button
                  type="submit"
                  disabled={blog.isLocked || !mentorInput || chatLoading}
                  className="bg-[#FFC247] text-black text-[11px] font-black px-4 py-2.5 rounded-xl hover:bg-[#E6AE3F] disabled:opacity-30 disabled:hover:bg-[#FFC247] transition-all font-outfit uppercase tracking-wide shadow-md cursor-pointer"
                >
                  ASK MENTOR
                </button>
              </form>

            </div>
          </section>

          {/* DISCUSSION COMMENTS SECTION */}
          <section className="pt-12 border-t border-white/5 mt-10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-[#FFC247]" />
                <h3 className="text-base font-black text-white uppercase tracking-wider font-outfit">
                  DISCUSSION ({comments.length})
                </h3>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold font-outfit">
                <span>SORT BY:</span>
                <select
                  value={commentSort}
                  onChange={(e: any) => setCommentSort(e.target.value)}
                  className="bg-transparent text-zinc-300 hover:text-white font-bold border-none outline-none cursor-pointer"
                >
                  <option value="newest" className="bg-zinc-950">NEWEST</option>
                  <option value="popular" className="bg-zinc-950">POPULAR</option>
                </select>
              </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-4 items-start bg-zinc-950 p-4 rounded-2xl border border-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                alt="Your Avatar"
                className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
              />
              <div className="flex-1 space-y-3">
                <textarea
                  rows={2}
                  placeholder={token ? "Contribute to the startup discussion..." : "Log in to post a comment"}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  disabled={!token}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFC247] transition-all resize-none font-sans"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 font-medium">Please be respectful of other builders.</span>
                  <button
                    type="submit"
                    disabled={!token || !commentContent}
                    className="bg-[#FFC247] text-black text-[11px] font-black px-4 py-2 rounded-xl hover:bg-[#E6AE3F] disabled:opacity-30 disabled:hover:bg-[#FFC247] transition-all font-outfit uppercase tracking-wide shadow-md"
                  >
                    POST COMMENT
                  </button>
                </div>
              </div>
            </form>

            {/* Comments list stream */}
            <div className="space-y-4">
              {sortedComments.map((comment) => {
                const cid = comment._id || comment.id || '';
                const replies = comments.filter(r => r.parentCommentId === cid);
                
                const authorName = comment.userName || comment.userId?.name || 'Member';
                const authorAvatar = comment.userAvatar || comment.userId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
                
                // Reaction counts
                const rCount = commentReactions[cid] || { claps: 0, hearts: 0, insights: 0, fires: 0 };
                const uReaction = userCommentReactions[cid] || { claps: false, hearts: false, insights: false, fires: false };

                return (
                  <div key={cid} className="p-5 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-4 shadow-sm hover:border-white/10 transition-all text-xs">
                    
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        className="w-8 h-8 rounded-full object-cover border border-white/15 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-200">{authorName}</span>
                          <span className="text-[9px] bg-zinc-900 border border-white/10 text-zinc-500 px-1.5 rounded uppercase font-outfit">Founder</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{new Date(comment.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-zinc-300 pl-1 leading-relaxed font-sans text-xs">{comment.content}</p>

                    {/* Emoji Reactions & Reply Bar */}
                    <div className="flex gap-4 items-center pl-1 text-[11px] text-zinc-500 font-semibold font-outfit flex-wrap">
                      <div className="flex items-center gap-1.5 bg-zinc-900 p-1.5 rounded-lg border border-white/5">
                        {[
                          { key: 'claps', emoji: '👏' },
                          { key: 'hearts', emoji: '❤️' },
                          { key: 'insights', emoji: '💡' },
                          { key: 'fires', emoji: '🔥' }
                        ].map(react => (
                          <button
                            key={react.key}
                            onClick={() => handleCommentReaction(cid, react.key)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/5 transition-all ${
                              uReaction[react.key] ? 'bg-[#FFC247]/10 text-[#FFC247]' : ''
                            }`}
                          >
                            <span>{react.emoji}</span>
                            <span className="text-[9px] font-bold">{(rCount as any)[react.key] || 0}</span>
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          if (token) {
                            setReplyingToId(replyingToId === cid ? null : cid);
                          } else {
                            router.push('/login');
                          }
                        }}
                        className="hover:text-white transition-colors"
                      >
                        REPLY
                      </button>
                    </div>

                    {/* Reply Input Box */}
                    {replyingToId === cid && (
                      <div className="flex gap-2.5 items-center pl-4 pt-1">
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FFC247] placeholder-zinc-500 font-sans"
                        />
                        <button
                          onClick={() => handleAddReply(cid)}
                          className="bg-[#FFC247] hover:bg-[#E6AE3F] text-black text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-wider font-outfit transition-all shadow-md shrink-0"
                        >
                          SEND
                        </button>
                      </div>
                    )}

                    {/* Render Replies */}
                    {replies.length > 0 && (
                      <div className="pl-6 border-l border-white/5 space-y-3.5 mt-4">
                        {replies.map((reply) => {
                          const replyAuthorName = reply.userName || reply.userId?.name || 'Member';
                          const replyAuthorAvatar = reply.userAvatar || reply.userId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
                          return (
                            <div key={reply._id || reply.id} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CornerDownRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={replyAuthorAvatar}
                                  alt={replyAuthorName}
                                  className="w-6 h-6 rounded-full object-cover border border-white/10"
                                />
                                <span className="font-bold text-zinc-300">{replyAuthorName}</span>
                                <span className="text-[9px] text-zinc-500 font-medium font-outfit">{new Date(reply.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-zinc-400 pl-6 leading-relaxed font-sans">{reply.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </section>

          {/* RECOMMENDED PUBLICATIONS SECTION */}
          <section className="pt-12 border-t border-white/5 mt-12 space-y-6">
            <h3 className="text-base font-black text-white uppercase tracking-wider font-outfit text-left">
              RECOMMENDED PUBLICATIONS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedBlogs.slice(0, 2).map((item) => (
                <div key={item.id || item.slug} className="p-4 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-white/10 flex gap-4 transition-all hover:bg-zinc-950 text-left items-center group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-20 h-20 rounded-xl object-cover bg-zinc-800 shrink-0 border border-white/5"
                  />
                  <div className="space-y-1 truncate flex-1">
                    <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-[#FFC247] transition-colors leading-snug font-outfit uppercase">
                      <Link href={`/blogs/${item.slug}`}>
                        {item.title}
                      </Link>
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide font-outfit">{item.readTime} MIN READ</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </main>

        {/* RIGHT INSIGHTS SIDEBAR (Sticky) */}
        <aside className="w-[380px] shrink-0 border-l border-white/5 pl-8 hidden lg:flex flex-col py-8 h-fit sticky top-4 gap-6 self-start">
          
          {/* Section 1: AI Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/5 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFC247]" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-outfit">SUMMARIZED FOR YOU</h4>
            </div>
            
            {blog.isLocked ? (
              <div className="space-y-2 py-1">
                <p className="text-zinc-500 blur-xs text-xs leading-relaxed select-none">
                  Establish layouts with clean typography structures. Utilize border properties and shadows to separate interactive cards. Incorporate vertical audio streams and newsletters.
                </p>
                <div className="text-[10px] text-zinc-400 font-semibold bg-[#FFC247]/10 p-2.5 rounded-lg border border-[#FFC247]/20 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#FFC247] shrink-0" />
                  <span>Join Premium to read summary points.</span>
                </div>
              </div>
            ) : (
              <ul className="space-y-2.5 text-xs text-zinc-400 font-sans leading-relaxed">
                {displayKeyPoints.slice(0, 3).map((point, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <span className="w-1 h-1 rounded-full bg-[#FFC247] mt-2 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
                {displayKeyPoints.length > 3 && (
                  <button
                    onClick={() => {
                      const el = document.querySelector('.AI-summary-box');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[10px] text-[#FFC247] hover:underline font-bold font-outfit uppercase tracking-wider"
                  >
                    Read all {displayKeyPoints.length} points
                  </button>
                )}
              </ul>
            )}
          </div>

          {/* Section 2: Highlight Words Accordion */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-white/5 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#FFC247]" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-outfit">HIGHLIGHT WORDS</h4>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold uppercase">
              Expand core startup terminology mentioned in this publication.
            </p>
            
            <div className="flex flex-col mt-2 divide-y divide-white/5">
              {highlightWords.map((word) => (
                <div key={word.term} className="py-2.5">
                  <button
                    onClick={() => setExpandedWord(expandedWord === word.term ? null : word.term)}
                    className="w-full flex items-center justify-between text-left group transition-all"
                  >
                    <span className={`text-xs font-bold transition-colors ${
                      expandedWord === word.term ? 'text-[#FFC247]' : 'text-zinc-300 group-hover:text-[#FFC247]'
                    }`}>
                      {word.term}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
                      expandedWord === word.term ? 'rotate-90 text-[#FFC247]' : ''
                    }`} />
                  </button>
                  <AnimatePresence>
                    {expandedWord === word.term && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed bg-zinc-900/40 p-2.5 rounded-xl border border-white/5">
                          {word.definition}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Founder Tool Spotlight sponsored card carousel */}
          <div className="p-5 rounded-2xl bg-[#0F0F11] border border-white/5 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-zinc-800 text-zinc-500 text-[8px] font-black uppercase rounded-bl font-outfit tracking-wider">
              SPONSORED
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#FFC247]" />
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-outfit">FOUNDER SPOTLIGHT</h4>
                </div>
                
                {/* Carousel Controls */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setToolIndex(prev => (prev - 1 + sponsorTools.length) % sponsorTools.length)}
                    className="p-1 rounded bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setToolIndex(prev => (prev + 1) % sponsorTools.length)}
                    className="p-1 rounded bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Tool Card Info */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={toolIndex}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs ${sponsorTools[toolIndex].logoBg}`}>
                      {sponsorTools[toolIndex].logo}
                    </span>
                    <div>
                      <h5 className="text-xs font-black text-white uppercase font-outfit tracking-wide">{sponsorTools[toolIndex].name}</h5>
                      <p className="text-[10px] text-zinc-500 font-semibold">{sponsorTools[toolIndex].tagline}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                    {sponsorTools[toolIndex].description}
                  </p>

                  <ul className="space-y-1">
                    {sponsorTools[toolIndex].benefits.map((ben, idx) => (
                      <li key={idx} className="flex gap-1.5 items-center text-[10px] text-zinc-500 font-medium">
                        <Check className="w-3 h-3 text-[#FFC247]" />
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={sponsorTools[toolIndex].url}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/5 font-extrabold text-[10px] font-outfit uppercase tracking-wider rounded-xl transition-all"
                  >
                    TRY {sponsorTools[toolIndex].name.toUpperCase()} NOW
                  </a>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Section 4: Newsletter Card */}
          <div id="newsletter" className="p-5 rounded-2xl bg-zinc-950 border border-white/5 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#FFC247]" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-outfit">THE DEVEN DISPATCH</h4>
            </div>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Weekly curated lessons on startup architecture, scaling bottlenecks, design loops, and AI integrations. Standard guidelines apply: zero spam, cancel with one click.
            </p>

            <form onSubmit={handleNewsletterSubscribe} className="space-y-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter founder email address"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFC247] transition-all font-sans"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#FFC247] hover:bg-[#E6AE3F] text-black font-extrabold text-[11px] font-outfit uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                SUBSCRIBE TO DISPATCH
              </button>
            </form>

            {newsletterSubscribed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-semibold font-outfit"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>WELCOME TO THE DISPATCH!</span>
              </motion.div>
            )}
          </div>

        </aside>

      </div>

      {/* FULLSCREEN VIDEO LIGHTBOX MODAL */}
      <AnimatePresence>
        {videoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={() => setVideoOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-950 border border-white/10 max-w-sm w-full rounded-3xl p-3 shadow-2xl z-10 overflow-hidden"
            >
              <button
                onClick={() => setVideoOpen(false)}
                className="absolute top-5 right-5 p-2 bg-black/60 backdrop-blur-md rounded-full text-zinc-400 hover:text-white border border-white/10 z-20 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="rounded-2xl overflow-hidden aspect-[9/16] bg-black relative flex items-center justify-center border border-white/5">
                <video
                  src={blog.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-8 left-4 right-4 bg-zinc-950/85 backdrop-blur-md px-3.5 py-3 rounded-xl border border-white/5 text-center text-[10px] leading-relaxed text-[#FFC247]">
                  <strong className="text-white block mb-0.5 uppercase tracking-wide font-outfit text-[9px]">DEVEN VIDEO SUMMARY</strong>
                  Highlights: {blog.title}. Complete notes and action playbooks are available in the post.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE MOCK UPGRADE DIALOG MODAL */}
      <AnimatePresence>
        {upgradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setUpgradeModalOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-zinc-950 border border-white/10 max-w-md w-full rounded-3xl p-6 shadow-2xl z-10 space-y-5 text-center overflow-hidden"
            >
              {/* Gold light burst */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FFC247]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="w-12 h-12 rounded-full bg-[#FFC247]/10 flex items-center justify-center mx-auto text-[#FFC247]">
                <Lock className="w-5 h-5" />
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-black text-white uppercase tracking-wider font-outfit">
                  UNLOCK {premiumFeatureName.toUpperCase() || 'PREMIUM'}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  Upgrade your account to Deven Premium to unlock audio voice briefings, video reviews, tool spotlights, and full AI synthesis playbooks.
                </p>
              </div>

              {/* Benefits list */}
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 text-left space-y-2">
                {[
                  'Professional audio synthesis reads',
                  '60s vertical summary video briefs',
                  'Full AI takeaways & action checklists',
                  'Founder tool spotlights & deals',
                  'Interactive replies & claps reactions'
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-center text-xs text-zinc-300 font-medium">
                    <Check className="w-4 h-4 text-[#FFC247]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={async () => {
                    await triggerMockSubscription();
                    setUpgradeModalOpen(false);
                    window.location.reload();
                  }}
                  className="glow-button w-full py-3 rounded-xl font-black text-xs font-outfit uppercase tracking-wider shadow-lg"
                >
                  SUBSCRIBE NOW (₹299/mo)
                </button>
                <button
                  onClick={() => setUpgradeModalOpen(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 font-semibold font-outfit uppercase tracking-wide"
                >
                  CLOSE DIALOG
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN SEARCH MODAL OVERLAY */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-12">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={() => {
              setSearchOpen(false);
              setSearchQuery('');
            }} />
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-zinc-950 border border-white/10 max-w-xl w-full rounded-2xl p-4 shadow-2xl z-10 flex flex-col max-h-[80vh] overflow-hidden"
            >
              {/* Search Bar */}
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Search className="w-5 h-5 text-zinc-500 ml-1 shrink-0" />
                <input
                  type="text"
                  placeholder="Search publications, tech parameters, layouts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-zinc-500 font-medium font-sans"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="p-1 rounded bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto pt-4 divide-y divide-white/5">
                {filteredSearchBlogs.length > 0 ? (
                  filteredSearchBlogs.map((blog: any) => (
                    <Link
                      key={blog.id}
                      href={`/blogs/${blog.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="p-3.5 hover:bg-white/5 rounded-xl block transition-all group text-left"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[9px] bg-[#FFC247]/10 text-[#FFC247] px-2 py-0.5 rounded-full font-bold uppercase font-outfit tracking-wider shrink-0">
                          {blog.category}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-bold font-outfit uppercase shrink-0">
                          {blog.readTime} MIN READ
                        </span>
                      </div>
                      <h5 className="text-xs font-black text-white group-hover:text-[#FFC247] transition-colors mt-2 font-outfit uppercase tracking-wide">
                        {blog.title}
                      </h5>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1 leading-relaxed">
                        {blog.description}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12 text-zinc-500 font-medium font-sans text-xs">
                    No publications matched your parameters.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE LEFT MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 xl:hidden">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-[280px] bg-zinc-950 border-r border-white/10 p-6 flex flex-col justify-between z-10 overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <Link href="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
                    <span className="w-8 h-8 rounded-lg bg-[#FFC247] flex items-center justify-center font-black text-black font-outfit text-md">
                      D
                    </span>
                    <span className="font-outfit font-black text-base text-white">
                      Deven<span className="text-[#FFC247]">.</span>
                    </span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="flex flex-col gap-1.5">
                  {[
                    { name: 'Home', href: '/', icon: Home, active: false },
                    { name: 'Explore', href: '/blogs', icon: Compass, active: true },
                    { name: 'Bookmarks', href: '/dashboard', icon: Bookmark, active: false },
                    { name: 'Library', href: '/dashboard', icon: BookOpen, active: false },
                    { name: 'Newsletter', href: '#newsletter', icon: Mail, active: false },
                    { name: 'About Deven', href: '/about', icon: Info, active: false },
                  ].map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                          item.active
                            ? 'bg-[#FFC247] text-black font-bold'
                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-6 pt-6 border-t border-white/5">
                {/* Premium Card */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-white/5">
                  <div className="flex items-center gap-1.5 text-[#FFC247] text-[10px] font-bold uppercase tracking-wider mb-2 font-outfit">
                    <Sparkles className="w-3 h-3" />
                    <span>Deven Premium</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mb-3 leading-relaxed">
                    Premium insights, founder playbooks, and startup member content.
                  </p>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await triggerMockSubscription();
                      window.location.reload();
                    }}
                    className="w-full text-center py-2 bg-[#FFC247] hover:bg-[#E6AE3F] text-black font-bold text-[10px] font-outfit uppercase tracking-wider rounded-lg"
                  >
                    Upgrade Now
                  </button>
                </div>

                <p className="text-[9px] text-zinc-600 font-semibold font-outfit uppercase">
                  © {new Date().getFullYear()} DEVEN INC.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Helper block to inject widgets between HTML paragraphs
const renderFounderWidgetsBlock = () => {
  return (
    <div className="space-y-6 my-8">
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5">
        <div className="flex items-center gap-2 text-emerald-400 mb-3 font-semibold text-xs uppercase font-outfit">
          <Plus className="w-4 h-4" /> Key Founder Lessons
        </div>
        <ul className="space-y-2 text-xs text-zinc-400">
          <li className="flex gap-2"><span className="text-[#FFC247] font-bold">1.</span> Talk to 10 active customers weekly without fail.</li>
          <li className="flex gap-2"><span className="text-[#FFC247] font-bold">2.</span> Keep your burn rate lean until product-market fit.</li>
          <li className="flex gap-2"><span className="text-[#FFC247] font-bold">3.</span> Design decisions should prioritize user task velocity.</li>
        </ul>
      </div>

      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5">
        <div className="flex items-center gap-2 text-red-400 mb-3 font-semibold text-xs uppercase font-outfit">
          <AlertTriangle className="w-4 h-4" /> Common Founder Mistakes
        </div>
        <ul className="space-y-2 text-xs text-zinc-400">
          <li className="flex gap-2"><span className="text-red-400 font-bold">1.</span> Writing code before confirming user paint points.</li>
          <li className="flex gap-2"><span className="text-red-400 font-bold">2.</span> Marketing to general audiences instead of developers.</li>
          <li className="flex gap-2"><span className="text-red-400 font-bold">3.</span> Ignoring typography layouts and micro-interactions.</li>
        </ul>
      </div>
    </div>
  );
};

const renderContentWithWidgets = (htmlContent: string) => {
  const paragraphs = htmlContent.split('</p>');
  
  if (paragraphs.length <= 2) {
    return (
      <div className="space-y-6">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        {renderFounderWidgetsBlock()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {paragraphs.map((p, idx) => {
        if (!p.trim()) return null;
        
        // Add drop-cap to the first paragraph
        const paragraphHtml = idx === 0
          ? p.replace(/<p([^>]*)>/, '<p$1 class="first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:text-[#FFC247] first-letter:mr-3.5 first-letter:float-left first-letter:leading-[0.8] first-letter:pt-2 first-letter:font-black">') + '</p>'
          : p + '</p>';
        
        return (
          <React.Fragment key={idx}>
            <div dangerouslySetInnerHTML={{ __html: paragraphHtml }} />
            
            {/* Inject Startup Framework after paragraph 1 */}
            {idx === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-8 p-6 rounded-2xl bg-zinc-900/60 border border-white/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFC247]/5 rounded-full blur-2xl" />
                <div className="flex items-center gap-2 text-[#FFC247] mb-3">
                  <Award className="w-5 h-5 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-outfit">Startup Framework</span>
                </div>
                <h4 className="text-sm font-black text-white mb-2 uppercase font-outfit">The 3-Step Iteration Loop</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Avoid the building trap by verifying demand prior to writing a line of code. Code in increments of 48 hours, release to active design testers, measure engagement metrics, and refactor code variables.
                </p>
                <div className="mt-4 flex gap-6 text-[10px] text-zinc-500 font-bold uppercase tracking-wide font-outfit flex-wrap">
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#FFC247]" /> Hypothesis</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#FFC247]" /> Validate Metrics</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#FFC247]" /> Scale / Pivot</span>
                </div>
              </motion.div>
            )}

            {/* Inject Quote Card after paragraph 2 */}
            {idx === 1 && (
              <div className="my-10 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-zinc-950 to-zinc-900 border-l-4 border-[#FFC247] shadow-lg relative">
                <span className="absolute top-1 right-4 text-7xl font-serif text-white/5 select-none font-bold">“</span>
                <p className="text-lg md:text-xl font-serif font-medium text-white italic leading-relaxed">
                  "The fastest way to scale the wrong thing is to confuse activity with progress."
                </p>
                <p className="text-[10px] text-[#FFC247] font-black tracking-wider uppercase mt-4 font-outfit">
                  — Deven Founder Playbooks
                </p>
              </div>
            )}

            {/* Inject Founder Lessons & Mistakes after paragraph 3 */}
            {idx === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5">
                  <div className="flex items-center gap-2 text-emerald-400 mb-3 font-semibold text-[10px] uppercase font-outfit tracking-wide">
                    <Plus className="w-4 h-4" /> Key Founder Lessons
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-400">
                    <li className="flex gap-2"><span className="text-[#FFC247] font-bold">1.</span> Talk to 10 active customers weekly without fail.</li>
                    <li className="flex gap-2"><span className="text-[#FFC247] font-bold">2.</span> Keep your burn rate lean until product-market fit.</li>
                    <li className="flex gap-2"><span className="text-[#FFC247] font-bold">3.</span> Design decisions should prioritize user task velocity.</li>
                  </ul>
                </div>
                <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5">
                  <div className="flex items-center gap-2 text-red-400 mb-3 font-semibold text-[10px] uppercase font-outfit tracking-wide">
                    <AlertTriangle className="w-4 h-4" /> Common Founder Mistakes
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-400">
                    <li className="flex gap-2"><span className="text-red-400 font-bold">1.</span> Writing code before confirming user paint points.</li>
                    <li className="flex gap-2"><span className="text-red-400 font-bold">2.</span> Marketing to general audiences instead of developers.</li>
                    <li className="flex gap-2"><span className="text-red-400 font-bold">3.</span> Ignoring typography layouts and micro-interactions.</li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* Inject Actionable Takeaways & Recommended Reads at the end */}
            {idx === paragraphs.length - 2 && (
              <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-[#FFC247]/5 via-transparent to-transparent border border-[#FFC247]/10">
                <div className="flex items-center gap-2 text-[#FFC247] mb-3">
                  <Sparkles className="w-4.5 h-4.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-outfit">Actionable Takeaways</span>
                </div>
                <p className="text-xs text-zinc-300 mb-4 leading-relaxed font-sans">
                  Focus on compounding user engagement; leverage AI summaries to deliver premium values quickly, and reduce load times under 200ms.
                </p>
                <div className="border-t border-white/5 pt-4">
                  <span className="text-[9px] text-zinc-500 font-black uppercase block mb-2.5 font-outfit tracking-wide">Recommended Founder Reads</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <a href="https://highgrowthhandbook.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#FFC247] hover:underline font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-500" /> High Growth Handbook (Elad Gil)
                    </a>
                    <a href="https://www.amazon.com/Hard-Thing-About-Things-Building/dp/0062273202" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#FFC247] hover:underline font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-500" /> The Hard Thing About Hard Things
                    </a>
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
