'use client';

import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { staticBlogs, ClientBlog } from '@/utils/mockData';
import { Search, SlidersHorizontal, Eye, Heart, MessageSquare, Play, X, Clock, Calendar, Bookmark, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function BlogsListingContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [blogs, setBlogs] = useState<ClientBlog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTag, setSelectedTag] = useState('');
  const [sortTab, setSortTab] = useState<'latest' | 'trending' | 'most_read'>('latest');

  // Video Summary Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState('');
  const [activeVideoTitle, setActiveVideoTitle] = useState('');

  // Collect unique categories & tags from mock for filter list
  const categoriesList = ['All', 'Startup Ideas', 'SaaS Growth', 'AI & Automation', 'Marketing', 'Product Building', 'Fundraising', 'Sales'];
  const tagsList = ['All', 'SaaS', 'MVP', 'No-Code', 'Growth', 'Validation', 'Fundraising', 'Marketing', 'Productivity'];

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (searchTerm) query.append('search', searchTerm);
        if (selectedCategory && selectedCategory !== 'All') query.append('category', selectedCategory);
        if (selectedTag && selectedTag !== 'All') query.append('tag', selectedTag);
        query.append('sort', sortTab);

        const res = await axios.get(`${API_URL}/blogs?${query.toString()}`);
        setBlogs(res.data);
      } catch (err) {
        console.warn('Backend API connection failed. Sorting/filtering static client blogs.');
        
        // Local Filter Fallback
        let filtered = [...staticBlogs];
        if (searchTerm) {
          filtered = filtered.filter(
            b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 b.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        if (selectedCategory && selectedCategory !== 'All') {
          filtered = filtered.filter(b => b.category.toLowerCase() === selectedCategory.toLowerCase());
        }
        if (selectedTag && selectedTag !== 'All') {
          filtered = filtered.filter(b => b.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()));
        }

        // Sorts
        if (sortTab === 'trending') {
          filtered.sort((a, b) => b.likesCount - a.likesCount);
        } else if (sortTab === 'most_read') {
          filtered.sort((a, b) => b.viewsCount - a.viewsCount);
        } else {
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setBlogs(filtered);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      loadBlogs();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCategory, selectedTag, sortTab]);

  const openVideoModal = (videoUrl: string, title: string) => {
    setActiveVideoUrl(videoUrl);
    setActiveVideoTitle(title);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Banner Section */}
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">Explore Startup Playbooks</h1>
          <p className="text-sm text-zinc-400">Discover exclusive growth playbooks, Deven AI Mentor support, and 60-second founder briefs.</p>
        </div>

        {/* Filters and Search Bar Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Side Filters (Desktop only) */}
          <div className="hidden lg:block space-y-6 bg-zinc-900/40 border border-white/5 rounded-2xl p-5 sticky top-24 text-left">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <SlidersHorizontal className="w-4.5 h-4.5 text-[#FFC247]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Refine List</h3>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Category</label>
              <div className="flex flex-col gap-1.5">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg transition-colors ${
                      (cat === 'All' && !selectedCategory) || selectedCategory === cat
                        ? 'bg-[#FFC247]/10 text-[#FFC247] font-semibold'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {tagsList.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === 'All' ? '' : tag)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                      (tag === 'All' && !selectedTag) || selectedTag === tag
                        ? 'bg-[#FFC247] border-[#FFC247] text-black font-semibold'
                        : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Blogs Grid Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search Bar + Sort Tabs */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search articles or code snippets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#FFC247] transition-all"
                />
              </div>

              {/* Sort Tabs */}
              <div className="flex bg-zinc-900/80 border border-white/5 rounded-full p-1 self-stretch sm:self-auto">
                {(['latest', 'trending', 'most_read'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSortTab(tab)}
                    className={`text-xs px-3.5 py-1.5 rounded-full capitalize font-semibold transition-all ${
                      sortTab === tab
                        ? 'bg-[#FFC247] text-black shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Categories (Horizontal Scrollable) */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
                  className={`text-xs py-1.5 px-3 rounded-full border shrink-0 transition-all ${
                    (cat === 'All' && !selectedCategory) || selectedCategory === cat
                      ? 'bg-[#FFC247] border-[#FFC247] text-black font-bold'
                      : 'bg-zinc-900/60 border-white/5 text-zinc-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Listings Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-80 w-full rounded-2xl bg-zinc-900/40 border border-white/5 animate-pulse" />
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="glass-card rounded-2xl py-16 text-center space-y-4">
                <SlidersHorizontal className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="text-md font-bold text-white">No articles found</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">We couldn't find matches for your search filters. Try broadening your keywords.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedTag('');
                  }}
                  className="text-xs text-[#FFC247] font-semibold border-b border-[#FFC247]"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogs.map((blog) => (
                  <article
                    key={blog.id || blog.slug}
                    className="glass-card rounded-2xl overflow-hidden flex flex-col border border-white/5 hover:border-white/10"
                  >
                    {/* Cover Photo */}
                    <div className="relative h-44 w-full bg-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      {blog.isPremium && (
                        <span className="absolute top-3 right-3 bg-[#FFC247] text-black text-[9px] font-extrabold px-2 py-0.5 rounded shadow">
                          PREMIUM
                        </span>
                      )}
                      <span className="absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur px-2 py-0.5 rounded text-[10px] text-zinc-300">
                        {blog.category}
                      </span>
                    </div>

                    {/* Metadata Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                      <div className="space-y-1.5">
                        <h3 className="text-md font-bold text-white hover:text-[#FFC247] transition-colors leading-snug line-clamp-2">
                          <Link href={`/blogs/${blog.slug}`}>
                            {blog.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-zinc-400 line-clamp-3">
                          {blog.description}
                        </p>
                      </div>

                      {/* Summary Player actions & Authors */}
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={blog.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                            alt={blog.author?.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="text-[10px]">
                            <p className="font-bold text-zinc-300">{blog.author?.name}</p>
                            <p className="text-zinc-500">Author</p>
                          </div>
                        </div>

                        {/* Watch summary button (simulates premium teaser video) */}
                        <button
                          onClick={() => openVideoModal('https://assets.mixkit.co/videos/preview/mixkit-hand-holding-smartphone-with-green-screen-mockup-41584-large.mp4', blog.title)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-[10px] text-zinc-300 hover:text-white hover:border-[#FFC247]/30 transition-all font-semibold"
                        >
                          <Play className="w-3 h-3 text-[#FFC247] fill-[#FFC247]/20" />
                          Watch 60s
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* VIDEO MODAL WINDOW */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-950 border border-white/10 max-w-sm w-full rounded-3xl p-3 shadow-2xl overflow-hidden z-10 flex flex-col"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white border border-white/5 z-20"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="rounded-2xl overflow-hidden aspect-[9/16] bg-black relative flex items-center justify-center">
                <video
                  src={activeVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
                {/* Closed caption simulation overlay */}
                <div className="absolute bottom-12 left-4 right-4 bg-zinc-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/5 text-center text-[10px] text-[#FFC247] font-semibold leading-relaxed">
                  "Deven Blogs: Here is a quick 60-second summary on the core concepts discussed in this post. Watch full highlights!"
                </div>
              </div>
              <div className="px-3.5 py-3 text-left">
                <h4 className="text-xs text-zinc-400 font-semibold truncate">Previewing summary</h4>
                <p className="text-xs font-bold text-white truncate">{activeVideoTitle}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default function BlogsListing() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#FFC247] border-t-transparent animate-spin" />
        <p className="text-zinc-500 text-xs tracking-wider">Loading dynamic insights...</p>
      </div>
    }>
      <BlogsListingContent />
    </Suspense>
  );
}
