'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Bookmark, History, Users, CreditCard, User,
  ArrowLeft, Menu, X, Flame, ShieldAlert, Badge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!token) {
      router.push('/login');
      return;
    }

    if (user && user.onboardingCompleted !== true) {
      router.push('/onboarding');
    }
  }, [user, token, loading, router]);

  const isActive = (path: string) => pathname === path;

  const sidebarLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Saved Playbooks', href: '/dashboard/saved', icon: Bookmark },
    { name: 'Completed Playbooks', href: '/dashboard/history', icon: History },
    { name: 'Referrals', href: '/dashboard/referrals', icon: Users },
    { name: 'Billing & Plan', href: '/dashboard/membership', icon: CreditCard },
    { name: 'Profile Settings', href: '/dashboard/profile', icon: User },
  ];

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 rounded-full border-3 border-[#FFC247] border-t-transparent animate-spin" />
        <p className="text-zinc-400 text-xs font-semibold">Verifying account settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row relative">
      
      {/* Mobile Top Header */}
      <header className="md:hidden w-full h-14 border-b border-white/5 bg-zinc-900/60 backdrop-blur flex items-center justify-between px-4 sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="w-6.5 h-6.5 rounded bg-[#FFC247] flex items-center justify-center font-extrabold text-[11px] text-black">D</span>
          <span className="font-outfit font-extrabold text-sm text-white">Deven</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded text-zinc-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
        </button>
      </header>

      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-zinc-900/40 border-r border-white/5 px-4 py-6 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen flex flex-col justify-between ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center justify-between mb-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-7 h-7 rounded bg-[#FFC247] flex items-center justify-center font-extrabold text-[12px] text-black">D</span>
              <span className="font-outfit font-extrabold text-md text-white">Deven Blogs</span>
            </Link>
            <button className="md:hidden text-zinc-500 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Mini Block */}
          {user && (
            <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-[#FFC247]/30"
              />
              <div className="truncate text-left">
                <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20" />
                  <span className="text-[10px] font-bold text-[#FFC247]">{user.streakCount || 0} Streak</span>
                </div>
              </div>
            </div>
          )}

          {/* Nav List */}
          <nav className="space-y-1 text-left">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive(link.href)
                      ? 'bg-[#FFC247]/15 text-[#FFC247] border-l-2 border-[#FFC247]'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Link back */}
        <Link
          href="/blogs"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Playbooks
        </Link>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-8 bg-zinc-950 relative overflow-y-auto">
        {children}
      </div>

    </div>
  );
}
