'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FileText, MessageSquare, ArrowLeft, ShieldAlert, KanbanSquare } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isActive = (path: string) => pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#FFC247] border-t-transparent animate-spin" />
        <p className="text-zinc-500 text-xs">Authenticating clearance...</p>
      </div>
    );
  }

  // Author role wall
  const isAuthorized = user && ['author', 'admin', 'superadmin'].includes(user.role);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-8 border border-red-500/20 max-w-md w-full text-center space-y-4 shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Access Denied</h2>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            You require Content Author or Administrator permissions to view these content controls.
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

  const adminLinks = [
    { name: 'Write Article', href: '/admin/blogs/new', icon: KanbanSquare },
    { name: 'Articles Manager', href: '/admin', icon: FileText },
    { name: 'Comments Mod', href: '/admin/comments', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row relative">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900/40 border-b md:border-b-0 md:border-r border-white/5 px-4 py-6 sticky top-0 md:h-screen flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded bg-orange-500 flex items-center justify-center font-extrabold text-[12px] text-white">C</span>
            <span className="font-outfit font-extrabold text-md text-white">Content Panel</span>
          </Link>

          <nav className="space-y-1 text-left">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive(link.href)
                      ? 'bg-orange-500/15 text-orange-400 border-l-2 border-orange-500'
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

      {/* Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-zinc-950 relative overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
