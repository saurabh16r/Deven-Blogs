'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  BookOpen, Clock, Zap, Flame, Bookmark, ArrowRight, BookMarked, 
  Play, Sparkles, Brain, Award, GraduationCap, ChevronRight, Heart, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface DashboardData {
  stats: {
    totalBlogsRead: number;
    totalReadingTime: number;
    currentPlan: string;
  };
  user: {
    name: string;
    role: string;
    streakCount: number;
    isSubscribed: boolean;
  };
}

interface PersonalizedFeed {
  feed: {
    recommended: any[];
    trending: any[];
    playbooks: any[];
    caseStudies: any[];
    growth: any[];
  };
  aiRecommendation: {
    text: string;
    items: { title: string; type: string }[];
  };
}

export default function DashboardHome() {
  const { token, user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [feedData, setFeedData] = useState<PersonalizedFeed | null>(null);
  const [activeTab, setActiveTab] = useState<'recommended' | 'trending' | 'playbooks' | 'caseStudies' | 'growth'>('recommended');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const loadDashboardData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Parallel requests
        const [dashRes, bookRes, feedRes] = await Promise.all([
          axios.get(`${API_URL}/users/dashboard`, config),
          axios.get(`${API_URL}/users/bookmarks`, config),
          axios.get(`${API_URL}/blogs/personalized`, config)
        ]);

        setData(dashRes.data);
        setBookmarks(bookRes.data.slice(0, 3));
        setFeedData(feedRes.data);

      } catch (err) {
        console.warn('API error in dashboard. Simulating offline metrics and founder feed.', err);
        
        // Simulating Dashboard Stats
        setData({
          stats: {
            totalBlogsRead: user?.streakCount ? Math.floor(user.streakCount * 1.5) : 3,
            totalReadingTime: user?.streakCount ? user.streakCount * 12 : 24,
            currentPlan: user?.isSubscribed ? 'Premium Membership' : 'Free Tier',
          },
          user: {
            name: user?.name || 'Alex Reader',
            role: user?.role || 'reader',
            streakCount: user?.streakCount || 3,
            isSubscribed: user?.isSubscribed || false,
          }
        });

        // Simulating Bookmarks list
        setBookmarks([]);

        // Simulating Personalized Founder Feed
        setFeedData({
          feed: {
            recommended: [
              {
                id: 'mock-1',
                title: 'Startup Validation: How to Prove Your Idea is Worth Building',
                slug: 'startup-validation-prove-idea-worth-building',
                coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=80',
                category: 'Startup Ideas',
                readTime: 6,
                isPremium: false,
                likesCount: 89,
                viewsCount: 342,
                createdAt: new Date().toISOString()
              },
              {
                id: 'mock-2',
                title: 'How to Find Your First 100 Customers: The Ultimate Founder\'s Playbook',
                slug: 'how-to-find-your-first-100-customers',
                coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=630&q=80',
                category: 'Marketing',
                readTime: 8,
                isPremium: true,
                likesCount: 145,
                viewsCount: 512,
                createdAt: new Date().toISOString()
              }
            ],
            trending: [
              {
                id: 'mock-2',
                title: 'How to Find Your First 100 Customers: The Ultimate Founder\'s Playbook',
                slug: 'how-to-find-your-first-100-customers',
                coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=630&q=80',
                category: 'Marketing',
                readTime: 8,
                isPremium: true,
                likesCount: 145,
                viewsCount: 512,
                createdAt: new Date().toISOString()
              }
            ],
            playbooks: [
              {
                id: 'mock-1',
                title: 'Startup Validation: How to Prove Your Idea is Worth Building',
                slug: 'startup-validation-prove-idea-worth-building',
                coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=80',
                category: 'Startup Ideas',
                readTime: 6,
                isPremium: false,
                likesCount: 89,
                viewsCount: 342,
                createdAt: new Date().toISOString()
              }
            ],
            caseStudies: [
              {
                id: 'mock-1',
                title: 'Startup Validation: How to Prove Your Idea is Worth Building',
                slug: 'startup-validation-prove-idea-worth-building',
                coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=80',
                category: 'Startup Ideas',
                readTime: 6,
                isPremium: false,
                likesCount: 89,
                viewsCount: 342,
                createdAt: new Date().toISOString()
              }
            ],
            growth: [
              {
                id: 'mock-2',
                title: 'How to Find Your First 100 Customers: The Ultimate Founder\'s Playbook',
                slug: 'how-to-find-your-first-100-customers',
                coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=630&q=80',
                category: 'Marketing',
                readTime: 8,
                isPremium: true,
                likesCount: 145,
                viewsCount: 512,
                createdAt: new Date().toISOString()
              }
            ]
          },
          aiRecommendation: {
            text: `Based on your focus as ${user?.founderRole || 'a Founder'} in the stage '${user?.startupStage || 'Exploring'}', we suggest prioritizing scaling frameworks. Master SaaS marketing and team-building playbooks to accelerate growth.`,
            items: [
              { title: "SaaS Launch Optimization Playbook", type: "Future Course" },
              { title: "The High-Performance Founder", type: "Future Book" },
              { title: "Weekly Startup Strategy Dispatch", type: "Newsletter" }
            ]
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [token, user]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#FFC247] border-t-transparent animate-spin" />
        <p className="text-zinc-500 text-xs">Loading analytics stats...</p>
      </div>
    );
  }

  const streakDays = [
    { day: 'M', active: true },
    { day: 'T', active: true },
    { day: 'W', active: true },
    { day: 'T', active: false },
    { day: 'F', active: false },
    { day: 'S', active: false },
    { day: 'S', active: false },
  ];

  const currentFeed = feedData?.feed[activeTab] || [];

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto pb-12">
      {/* Header greetings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold font-outfit text-white">Hello, {data?.user.name}</h1>
            {user?.founderRole && (
              <span className="bg-[#FFC247]/10 text-[#FFC247] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#FFC247]/20 uppercase tracking-wide">
                {user.founderRole}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500">Track your daily builder metrics and personalized founder playbooks.</p>
        </div>
        
        {/* Upgrade shortcut if free tier */}
        {!user?.isSubscribed && (
          <Link href="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFC247] hover:bg-[#ffcd66] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#FFC247]/10 transition-all font-outfit">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Upgrade to Premium
          </Link>
        )}
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between backdrop-blur-sm">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Playbooks Completed</p>
            <h3 className="text-3xl font-extrabold text-white font-outfit">{data?.stats.totalBlogsRead}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FFC247]/10 flex items-center justify-center text-[#FFC247]">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between backdrop-blur-sm">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Minutes Focused</p>
            <h3 className="text-3xl font-extrabold text-white font-outfit">{data?.stats.totalReadingTime}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between backdrop-blur-sm">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Billing Tier</p>
            <h3 className="text-md font-bold text-white leading-none mt-2.5 truncate">{data?.stats.currentPlan}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* MID SECTION: HABIT & BOOKMARKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak Flame widget */}
        <div className="lg:col-span-1 bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Builder Habit</h3>
          </div>

          <div className="text-center space-y-1">
            <span className="text-5xl font-extrabold text-[#FFC247] font-outfit">{data?.user.streakCount}</span>
            <span className="text-zinc-500 text-xs font-semibold block">Day Build Streak</span>
          </div>

          <div className="flex justify-between items-center bg-zinc-950/50 p-3 rounded-xl border border-white/5">
            {streakDays.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 font-bold">{d.day}</span>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  d.active ? 'bg-orange-500 text-white shadow shadow-orange-500/30' : 'bg-zinc-900 text-zinc-600'
                }`}>
                  ✓
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Articles preview */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4 flex flex-col justify-between backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4.5 h-4.5 text-[#FFC247]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Saved Playbooks</h3>
            </div>
            <Link href="/dashboard/saved" className="text-xs text-zinc-500 hover:text-[#FFC247] flex items-center gap-1">
              View list
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {bookmarks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-zinc-600 space-y-2">
              <BookMarked className="w-8 h-8" />
              <p className="text-xs">Your saved playbooks list is empty</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 pt-2">
              {bookmarks.map((b) => (
                <div key={b.id || b._id} className="p-3 bg-zinc-950/60 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate hover:text-[#FFC247] transition-all">
                      <Link href={`/blogs/${b.slug}`}>{b.title}</Link>
                    </h4>
                    <span className="text-[9px] text-zinc-500 mt-1 block">Category: {b.category}</span>
                  </div>
                  <Link href={`/blogs/${b.slug}`} className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white shrink-0">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI RECOMMENDATION INSIGHTS WIDGET */}
      {feedData?.aiRecommendation && (
        <div className="relative p-0.5 rounded-2xl bg-gradient-to-r from-[#FFC247]/30 to-purple-500/10 shadow-xl overflow-hidden">
          <div className="bg-zinc-900/90 rounded-[14px] p-6 space-y-6 relative backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFC247]/10 flex items-center justify-center text-[#FFC247]">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wider uppercase">Deven AI Mentor</h3>
                  <p className="text-[10px] text-zinc-500">Continuous feed optimization active</p>
                </div>
              </div>
              <span className="self-start sm:self-center px-2 py-0.5 bg-[#FFC247] text-black text-[9px] font-extrabold rounded uppercase tracking-wider animate-pulse">
                Personalized
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">{feedData.aiRecommendation.text}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {feedData.aiRecommendation.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-zinc-950/60 rounded-xl border border-white/5 flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {item.type.includes('Course') && <GraduationCap className="w-4 h-4 text-purple-400" />}
                      {item.type.includes('Book') && <Award className="w-4 h-4 text-emerald-400" />}
                      {item.type.includes('Newsletter') && <Zap className="w-4 h-4 text-blue-400" />}
                      {!item.type.includes('Course') && !item.type.includes('Book') && !item.type.includes('Newsletter') && <Sparkles className="w-4 h-4 text-[#FFC247]" />}
                    </div>
                    <div className="space-y-0.5 text-left">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{item.type}</span>
                      <h4 className="text-[11px] font-bold text-white leading-tight">{item.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YOUR FOUNDER FEED SECTION */}
      <div className="space-y-6">
        <div className="border-b border-white/5 pb-2">
          <h2 className="text-lg font-extrabold font-outfit text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFC247]" />
            Your Personalized Feed
          </h2>
          <p className="text-xs text-zinc-500">Based on your role, stages, interests, and goals.</p>
        </div>

        {/* Tab Selection Row */}
        <div className="flex border-b border-white/5 overflow-x-auto pb-px scrollbar-none gap-2">
          {[
            { id: 'recommended', label: 'Recommended' },
            { id: 'trending', label: 'Trending' },
            { id: 'playbooks', label: 'Playbooks' },
            { id: 'caseStudies', label: 'Case Studies' },
            { id: 'growth', label: 'Growth Strategies' }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 text-xs font-bold transition-all relative whitespace-nowrap border-b-2 cursor-pointer ${
                  isSelected 
                    ? 'border-[#FFC247] text-white' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Feed Cards Grid */}
        {currentFeed.length === 0 ? (
          <div className="py-12 text-center bg-zinc-900/20 rounded-2xl border border-dashed border-white/5 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-zinc-700" />
            <p className="text-xs text-zinc-500 font-bold">No personalized playbooks in this category yet</p>
            <p className="text-[10px] text-zinc-600">Explore other categories or expand your settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentFeed.map((blog) => (
              <motion.article 
                key={blog.id || blog._id}
                whileHover={{ y: -4 }}
                className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all flex flex-col h-full shadow-lg group relative"
              >
                {/* Image Wrap */}
                <div className="aspect-[1.8/1] relative overflow-hidden bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={blog.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'} 
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {blog.isPremium && (
                    <span className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-[#FFC247] text-black text-[9px] font-extrabold px-2 py-0.5 rounded shadow flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      PREMIUM
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur-md text-[9px] font-bold px-2 py-0.5 rounded text-zinc-300">
                    {blog.category}
                  </span>
                </div>

                {/* Card details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold">
                      <span>{blog.readTime} min read</span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{blog.viewsCount || 0}</span>
                        <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" />{blog.likesCount || 0}</span>
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#FFC247] transition-all leading-snug line-clamp-2">
                      {blog.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={blog.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50&q=80'} 
                        alt={blog.author?.name || 'Author'}
                        className="w-5 h-5 rounded-full object-cover border border-white/10"
                      />
                      <span className="text-[10px] text-zinc-400 font-semibold truncate max-w-[100px]">
                        {blog.author?.name || 'Deven Writer'}
                      </span>
                    </div>

                    <Link 
                      href={`/blogs/${blog.slug}`}
                      className="text-[10px] font-extrabold text-[#FFC247] hover:text-white flex items-center gap-0.5 font-outfit"
                    >
                      Start Playbook
                      <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
