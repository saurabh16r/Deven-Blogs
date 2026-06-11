'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart2, HelpCircle, Palette, CreditCard, Users, ArrowLeft, ShieldAlert,
  SlidersHorizontal, Sparkles, Image
} from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isActive = (path: string) => pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#FFC247] border-t-transparent animate-spin" />
        <p className="text-zinc-500 text-xs">Verifying root keys...</p>
      </div>
    );
  }

  // Superadmin wall
  const isSuper = user && user.role === 'superadmin';

  if (!isSuper) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-8 border border-red-500/20 max-w-md w-full text-center space-y-4 shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Root Access Denied</h2>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            You require Administrator or Super Admin permissions to customize brand properties.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="glow-button w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Reader Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const superLinks = [
    { name: 'Analytics Board', href: '/superadmin', icon: BarChart2 },
    { name: 'Homepage Builder', href: '/superadmin/cms', icon: SlidersHorizontal },
    { name: 'Hero Settings', href: '/superadmin/hero', icon: Sparkles },
    { name: 'Media Library', href: '/superadmin/media', icon: Image },
    { name: 'Branding Panel', href: '/superadmin/branding', icon: Palette },
    { name: 'Pricing & Coupons', href: '/superadmin/pricing', icon: CreditCard },
    { name: 'User Management', href: '/superadmin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row relative">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900/40 border-b md:border-b-0 md:border-r border-white/5 px-4 py-6 sticky top-0 md:h-screen flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded bg-emerald-500 flex items-center justify-center font-extrabold text-[12px] text-white">S</span>
            <span className="font-outfit font-extrabold text-md text-white">Super CMS</span>
          </Link>

          <nav className="space-y-1 text-left">
            {superLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive(link.href)
                      ? 'bg-emerald-500/15 text-emerald-400 border-l-2 border-emerald-500'
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

        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-500 hover:text-white transition-colors mt-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard Home
        </Link>
      </aside>

      {/* Main Workspace content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-zinc-950 relative overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
