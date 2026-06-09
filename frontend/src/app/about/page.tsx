'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Target, Eye, Users2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-12 text-left">
        <div className="space-y-4">
          <span className="text-[#FFC247] font-bold text-xs uppercase tracking-widest">About Us</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-outfit text-white tracking-tight leading-none">
            We simplify complex insights.
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
            Deven was founded to help engineers, indiehackers, and design leads consume high-level industry briefings under a minute. By combining rich reading structures with voice narration and teaser clips, we change how you learn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <Target className="w-6 h-6 text-[#FFC247]" />
            <h3 className="text-sm font-bold text-white uppercase">Our Mission</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Equip modern builders with technical reviews, removing text fluff to highlight implementation details.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-3">
            <Eye className="w-6 h-6 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase">Our Vision</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Become the default learning node where developers read, listen, and sync skills within seconds.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-3">
            <Users2 className="w-6 h-6 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase">Our Values</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Maintain professional typography, fast static builds, and automated AI summary precision.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
