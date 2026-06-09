'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, ArrowRight, Home, LayoutDashboard } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SuccessPage() {
  const { refreshUserStats } = useAuth();

  useEffect(() => {
    // Blast confetti twice on launch
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    const timer = setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }, 400);

    // Sync state from backend
    refreshUserStats();

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative">
      <Header />

      <main className="max-w-md mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center space-y-6">
        
        <div className="w-16 h-16 rounded-full bg-[#FFC247]/10 flex items-center justify-center text-[#FFC247] shadow-[0_0_30px_rgba(255,194,71,0.2)] animate-pulse">
          <ShieldCheck className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold font-outfit text-white">Subscription Active!</h1>
          <p className="text-zinc-400 text-sm">
            Thank you for subscribing! You are now a premium member of <strong>Deven Blogs Founder Premium</strong>.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/5 w-full text-left space-y-3">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Unlocked Privileges</p>
          <ul className="text-xs text-zinc-300 space-y-2">
            <li className="flex gap-2">
              <span className="text-[#FFC247] font-bold">✓</span>
              Unlimited access to all growth playbooks
            </li>
            <li className="flex gap-2">
              <span className="text-[#FFC247] font-bold">✓</span>
              Deven AI Mentor & checklist tracking tools
            </li>
            <li className="flex gap-2">
              <span className="text-[#FFC247] font-bold">✓</span>
              60-second vertical video briefs & tool highlights
            </li>
            <li className="flex gap-2">
              <span className="text-[#FFC247] font-bold">✓</span>
              Synthesized audio playbooks (podcast style)
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/dashboard"
            className="glow-button flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/blogs"
            className="flex-1 py-2.5 bg-zinc-900 border border-white/10 hover:border-white/20 rounded-xl text-xs text-zinc-200 font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            Start Playbooks
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
