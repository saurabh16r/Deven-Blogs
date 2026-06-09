'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroIllustration } from '@/components/HeroIllustration';
import { staticBlogs, staticTestimonials, staticFaqs, ClientBlog } from '@/utils/mockData';
import { Sparkles, ArrowRight, Zap, Play, Mic, FileText, ArrowUpRight, Flame, Heart, Star, ChevronDown, CheckCircle, ShieldCheck, Lightbulb, TrendingUp, Cpu, Megaphone, Layers, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Home() {
  const [blogs, setBlogs] = useState<ClientBlog[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${API_URL}/blogs`);
        setBlogs(res.data.slice(0, 3));
      } catch (err) {
        console.log('Backend connection failed. Using static client blogs.');
        setBlogs(staticBlogs);
      }
    };
    fetchBlogs();
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const categories = [
    { name: 'Startup Ideas', count: 12, icon: Lightbulb, color: 'text-yellow-400 bg-yellow-400/5 border-yellow-400/10' },
    { name: 'SaaS Growth', count: 18, icon: TrendingUp, color: 'text-emerald-400 bg-emerald-400/5 border-emerald-400/10' },
    { name: 'AI & Automation', count: 15, icon: Cpu, color: 'text-purple-400 bg-purple-400/5 border-purple-400/10' },
    { name: 'Marketing', count: 10, icon: Megaphone, color: 'text-blue-400 bg-blue-400/5 border-blue-400/10' },
    { name: 'Product Building', count: 14, icon: Layers, color: 'text-rose-400 bg-rose-400/5 border-rose-400/10' },
    { name: 'Fundraising', count: 8, icon: Coins, color: 'text-amber-400 bg-amber-400/5 border-amber-400/10' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#FFC247]/10 via-transparent to-transparent blur-[120px] pointer-events-none" />

      <Header />

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:py-32 px-4 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-left max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/5 bg-zinc-900/50 backdrop-blur-md text-xs font-semibold text-[#FFC247]"
          >
            <Sparkles className="w-4 h-4 text-[#FFC247]" />
            Exclusive Founder Knowledge Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-outfit tracking-tight leading-none text-white"
          >
            Build Smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC247] via-amber-300 to-[#FFC247]">
              Scale Faster.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-400 leading-relaxed font-sans"
          >
            The ultimate knowledge platform and AI-powered co-pilot for startup founders, builders, and creators. Turn strategies into execution in minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-2"
          >
            <Link
              href="/blogs"
              className="glow-button px-6 py-3 rounded-full flex items-center gap-2 group text-sm font-semibold"
            >
              Start Building
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-full border border-white/10 hover:border-white/20 bg-zinc-900/40 backdrop-blur-md transition-all text-sm font-semibold hover:bg-zinc-900/70"
            >
              Explore Plans
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <HeroIllustration />
        </motion.div>
      </section>

      {/* WHY DEVEN SECTION */}
      <section className="py-20 border-t border-white/5 relative bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-[#FFC247] tracking-widest uppercase">The Deven Playbook</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-outfit text-white">Learn, Automate, and Execute.</h3>
            <p className="text-zinc-400">
              Generic advice won't help you build a business. Deven provides practical, outcomes-oriented startup guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[#FFC247]/10 flex items-center justify-center text-[#FFC247]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">AI Founder Mentor</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Leverage Deven AI Mentor to instantly parse insights, build action plans, and answer strategy questions customized to your startup's business stage.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Mic className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">60-Second Founder Brief</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Skip long-winded essays. Get concise 60-second summary briefs, key takeaways, and tool spotlights. Cut down hours of reading into a highly structured roadmap.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Play className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Interactive Checklists</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Every playbook comes with a step-by-step action checklist saved to your dashboard. Keep track of progress and check off tasks as you launch, market, and scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED / LATEST BLOGS */}
      <section className="py-20 border-t border-white/5 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-[#FFC247] tracking-widest uppercase text-left">Curated Playbooks</h2>
              <h3 className="text-3xl font-extrabold font-outfit text-white text-left">Featured Startup Strategies</h3>
            </div>
            <Link href="/blogs" className="text-sm font-semibold text-[#FFC247] hover:text-[#E6AE3F] flex items-center gap-1.5 transition-all">
              Explore Playbooks
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article key={blog.id || blog.slug} className="glass-card rounded-2xl overflow-hidden flex flex-col">
                <div className="relative h-48 w-full overflow-hidden bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {blog.isPremium && (
                    <span className="absolute top-3 right-3 bg-[#FFC247] text-black text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                      PREMIUM
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-semibold text-zinc-300">
                    {blog.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-md font-bold text-white leading-snug line-clamp-2 hover:text-[#FFC247] transition-colors text-left">
                      <Link href={`/blogs/${blog.slug}`}>
                        {blog.title}
                      </Link>
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-3 text-left">
                      {blog.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={blog.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                        alt={blog.author?.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span>{blog.author?.name}</span>
                    </div>
                    <span>{blog.readTime} min read</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold font-outfit text-white">Find Your Focus Area</h2>
            <p className="text-zinc-400 mt-2">Explore targeted playbooks designed to grow your business.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/blogs?category=${encodeURIComponent(cat.name)}`}
                  className="glass-card rounded-xl p-5 flex items-center justify-between group border border-white/5 hover:border-[#FFC247]/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${cat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-md font-bold text-white group-hover:text-[#FFC247] transition-colors">{cat.name}</h4>
                      <p className="text-xs text-zinc-500">Startup Playbooks</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-[#FFC247] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* VIDEO SUMMARY SHOWCASE */}
      <section className="py-20 border-t border-white/5 bg-zinc-950/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <span className="text-[#FFC247] font-bold text-xs uppercase tracking-widest">Video Summary Showcase</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-outfit text-white leading-tight">
              Watch startup briefs in 60s
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              We leverage vertical reels formatting to deliver insights about validation, cold outreach, and MVP builds under a minute. No filler talk, pure execution.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-[#FFC247]" />
                <span className="text-sm font-semibold text-zinc-200">Perfect for mobile feeds and quick commute scans</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-[#FFC247]" />
                <span className="text-sm font-semibold text-zinc-200">Synchronized closed captions and layout breakdowns</span>
              </div>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 border border-white/10 hover:border-white/20 text-sm font-semibold transition-all hover:bg-zinc-900/60"
            >
              Get Video Access
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex justify-center">
            {/* Phone Video Player Mockup */}
            <div className="relative w-[280px] h-[500px] rounded-[36px] border-[6px] border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col justify-between">
              {/* Speaker Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-zinc-800 rounded-b-xl z-20" />
              
              {/* Video Mock */}
              <video
                src="https://assets.mixkit.co/videos/preview/mixkit-hand-holding-smartphone-with-green-screen-mockup-41584-large.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />

              {/* Video Overlay controls */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-transparent to-black/25">
                <span className="text-[10px] text-zinc-400 mt-4 bg-zinc-900/70 border border-white/5 backdrop-blur px-2.5 py-0.5 rounded-full w-max">
                  Now playing: Startup Validation
                </span>

                <div className="space-y-3 mb-2 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FFC247] flex items-center justify-center text-black font-extrabold text-[10px]">D</span>
                    <span className="text-xs font-bold text-white">Deven.io</span>
                  </div>
                  <p className="text-[10px] text-zinc-300 leading-snug">
                    Learn how to validate your startup ideas and launch smoke tests under 60 seconds.
                  </p>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-[#FFC247] w-2/3 h-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-bold text-[#FFC247] tracking-widest uppercase">Community Reviews</h2>
            <h3 className="text-3xl font-extrabold font-outfit text-white">What Founders Say</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {staticTestimonials.map((t, idx) => (
              <div key={idx} className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <p className="text-sm text-zinc-300 leading-relaxed italic text-left">
                  "{t.feedback}"
                </p>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#FFC247]/20"
                  />
                  <div className="text-left">
                    <h5 className="text-sm font-bold text-white">{t.name}</h5>
                    <p className="text-[11px] text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PLANS */}
      <section className="py-20 border-t border-white/5 bg-zinc-950/40" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-[#FFC247] tracking-widest uppercase">Simple Plans</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-outfit text-white">Invest in Your Business Growth</h3>
            <p className="text-zinc-400">Join a circle of high-growth founders reading Deven Premium.</p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="glass-card rounded-3xl p-8 border border-[#FFC247]/25 relative overflow-hidden flex flex-col justify-between shadow-[0_0_30px_rgba(255,194,71,0.05)] text-left">
              <div className="absolute top-0 right-0 bg-[#FFC247] text-black font-extrabold text-[10px] tracking-wider px-3.5 py-1.5 rounded-bl-xl uppercase">
                Best Value
              </div>

              <div>
                <h4 className="text-xl font-bold text-white font-outfit">Premium Founder Membership</h4>
                <p className="text-sm text-zinc-400 mt-2">Invest ₹299/month to access founder insights, step-by-step growth playbooks, AI mentoring, and actionable checklists.</p>
                
                {/* Price block */}
                <div className="my-6 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-white font-outfit">₹299</span>
                  <span className="text-zinc-500 text-sm">/ month</span>
                </div>

                <div className="border-t border-white/5 pt-6 space-y-3.5">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#FFC247]" />
                    <span className="text-sm font-medium text-zinc-200">Unlimited access to all growth playbooks</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#FFC247]" />
                    <span className="text-sm font-medium text-zinc-200">Full access to Deven AI Mentor & Checklists</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#FFC247]" />
                    <span className="text-sm font-medium text-zinc-200">Listen to post audio narrations (TTS podcast)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#FFC247]" />
                    <span className="text-sm font-medium text-zinc-200">Watch 60-second video briefs & spotlights</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#FFC247]" />
                    <span className="text-sm font-medium text-zinc-200">Community discussions & bookmarked playbooks</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href="/pricing"
                  className="glow-button w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-[0_0_20px_rgba(255,194,71,0.2)] hover:shadow-[0_0_30px_rgba(255,194,71,0.5)] transition-all"
                >
                  Get Instant Access
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[11px] text-zinc-500 text-center mt-3">Secure payment processed via Razorpay. Cancel anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQS SECTION */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-extrabold font-outfit text-white">Frequently Asked Questions</h3>
            <p className="text-zinc-400 mt-2">Find quick answers to common questions about subscription limits and playbooks.</p>
          </div>

          <div className="space-y-4">
            {staticFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden transition-colors hover:border-white/10"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left text-sm font-bold text-white transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                      activeFaq === idx ? 'rotate-180 text-[#FFC247]' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-3 text-left">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
