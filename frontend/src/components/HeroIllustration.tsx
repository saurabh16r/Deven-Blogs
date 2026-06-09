'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BarChart2, Play, Mic, FileText, CheckCircle2 } from 'lucide-react';

export const HeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center overflow-visible">
      {/* Glow Backdrop */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#FFC247]/10 blur-[100px] animate-pulse" />
      <div className="absolute w-[200px] h-[200px] rounded-full bg-orange-500/5 blur-[80px] delay-1000 animate-pulse" />

      {/* Grid Pattern Behind */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] rounded-2xl" />

      {/* Floating Elements Container */}
      <div className="relative w-full max-w-[420px] h-full flex items-center justify-center">

        {/* Central "Dashboard" Preview Glass Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-[260px] rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl p-5 shadow-2xl relative overflow-hidden"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">DEVEN_CORE_V1</span>
          </div>

          {/* Simulated Code/Text Grid */}
          <div className="space-y-3">
            <div className="h-4 bg-zinc-800 rounded-md w-3/4 animate-pulse" />
            <div className="h-3 bg-zinc-800/60 rounded-md w-full" />
            <div className="h-3 bg-zinc-800/60 rounded-md w-5/6" />
            
            {/* Visual Mini Chart */}
            <div className="h-20 bg-[#FFC247]/5 border border-[#FFC247]/15 rounded-lg flex items-end gap-1.5 p-2.5 mt-4">
              {[30, 45, 25, 60, 75, 40, 90].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
                  className="flex-1 bg-[#FFC247] rounded-sm relative"
                >
                  <span className="absolute inset-0 bg-gradient-to-t from-orange-500/30 to-transparent rounded-sm" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Float Object 1: AI summary block */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-4 -right-6 rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-md p-3.5 flex items-center gap-3 shadow-xl max-w-[190px]"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FFC247]/10 flex items-center justify-center text-[#FFC247]">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-white">AI Key Takeaways</h5>
            <p className="text-[10px] text-[#FFC247] font-semibold">TLDR Generated</p>
          </div>
        </motion.div>

        {/* Float Object 2: Audio player summary bubble */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -bottom-2 -left-8 rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-md p-3.5 flex items-center gap-3 shadow-xl"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
            <Mic className="w-4.5 h-4.5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-white">Audio Summary</h5>
            <p className="text-[10px] text-zinc-400">Listen in 2 minutes</p>
          </div>
        </motion.div>

        {/* Float Object 3: 60s Video shorts */}
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-24 -left-12 rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-md p-3 flex items-center gap-2.5 shadow-xl"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Play className="w-4 h-4 fill-emerald-400/20" />
          </div>
          <span className="text-xs font-semibold text-zinc-200">60s Video Teaser</span>
        </motion.div>

      </div>
    </div>
  );
};
export default HeroIllustration;
