'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Gift, Copy, Share2, Users } from 'lucide-react';

export default function ReferralsPage() {
  const { user } = useAuth();
  
  const referralCode = user?.referralCode || 'DEVEN100';
  const referredCount = user?.referredCount || 0;
  const inviteLink = `https://deven.io/signup?ref=${referralCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold font-outfit text-white">Referrals Program</h1>
        <p className="text-xs text-zinc-500 font-sans">Share Deven Blogs with friends and unlock billing rewards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Referral code widget */}
        <div className="md:col-span-2 bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-6">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#FFC247]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Referral Link</h3>
          </div>

          <div className="space-y-4">
            {/* Invite link copy box */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Invite URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-400 focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(inviteLink)}
                  className="px-3.5 py-2 bg-zinc-900 border border-white/10 hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              </div>
            </div>

            {/* Code copy box */}
            <div className="w-max bg-zinc-950 p-3 rounded-xl border border-white/5 flex items-center gap-4 text-xs">
              <div>
                <p className="text-[9px] text-zinc-500 uppercase">Referral Code</p>
                <p className="font-bold text-white tracking-wider mt-0.5">{referralCode}</p>
              </div>
              <button
                onClick={() => copyToClipboard(referralCode)}
                className="text-[10px] text-[#FFC247] font-semibold border-b border-[#FFC247]"
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>

        {/* Referred count stats */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Friends Invited</h3>
          </div>
          
          <div className="text-center">
            <h4 className="text-5xl font-extrabold text-white font-outfit">{referredCount}</h4>
            <p className="text-[10px] text-zinc-500 mt-1">successful signups</p>
          </div>

          <p className="text-[10px] text-zinc-400 text-center leading-relaxed bg-zinc-950/50 p-2.5 rounded-lg border border-white/5">
            Earn 15 days of free premium access for every friend who purchases a subscription.
          </p>
        </div>
      </div>
    </div>
  );
}
