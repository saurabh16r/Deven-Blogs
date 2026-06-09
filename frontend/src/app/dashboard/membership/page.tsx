'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, Award, ArrowUpRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function MembershipPage() {
  const { user } = useAuth();
  const [cancelRequested, setCancelRequested] = useState(false);

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to stop your billing renewal? You will retain access until the end of your billing cycle.')) {
      setCancelRequested(true);
    }
  };

  const mockInvoices = [
    { id: 'INV-0223', date: 'June 01, 2026', amount: '₹299', status: 'Paid' },
    { id: 'INV-0198', date: 'May 01, 2026', amount: '₹299', status: 'Paid' }
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold font-outfit text-white">Membership Details</h1>
        <p className="text-xs text-zinc-500 font-sans">View billing dates, billing logs, and active credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tier info card */}
        <div className="md:col-span-2 bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#FFC247]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Plan details</h3>
            </div>
            <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              user?.isSubscribed ? 'bg-[#FFC247]/15 text-[#FFC247]' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {user?.isSubscribed ? 'Active PRO' : 'Free account'}
            </span>
          </div>

          {user?.isSubscribed ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase">Billing rate</p>
                  <p className="font-bold text-white mt-0.5">₹299 / month</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase">Renewal Date</p>
                  <p className="font-bold text-white mt-0.5">July 07, 2026</p>
                </div>
              </div>

              {!cancelRequested ? (
                <button
                  onClick={handleCancel}
                  className="py-2 px-4 bg-zinc-950 border border-white/5 hover:border-red-500/30 text-zinc-400 hover:text-red-400 rounded-xl font-semibold transition-all"
                >
                  Cancel auto-renewal
                </button>
              ) : (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  Auto-renewal has been cancelled. Plan terminates on July 07, 2026.
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center space-y-4">
              <Award className="w-12 h-12 text-zinc-700 mx-auto" />
              <h4 className="text-sm font-bold text-white">Unlock knowledge tools</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Join our premium membership to read restricted blogs, get text-to-speech audio, and watch 60s summary briefings.
              </p>
              <Link
                href="/pricing"
                className="glow-button inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold"
              >
                Join Premium
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Invoice widget */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Invoices</h3>
          
          {user?.isSubscribed ? (
            <div className="space-y-3">
              {mockInvoices.map((inv) => (
                <div key={inv.id} className="p-3 bg-zinc-950/50 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{inv.id}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{inv.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-zinc-300">{inv.amount}</p>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 rounded">{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 py-6 text-center font-sans">No invoices logged.</p>
          )}
        </div>

      </div>
    </div>
  );
}
// simple helper to return ArrowRight
const ArrowRight: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);
