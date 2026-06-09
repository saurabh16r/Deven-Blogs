'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFC247]/5 blur-[100px] pointer-events-none" />

      <Link href="/login" className="absolute top-6 left-6 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Return to Login
      </Link>

      <div className="w-full max-w-md space-y-6 relative z-10 text-left">
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight font-outfit">Reset Password</h2>
          <p className="text-xs text-zinc-400">Enter your email and we'll send you recovery details.</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@deven.io"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFC247] transition-all"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                </div>
              </div>

              <button
                type="submit"
                className="glow-button w-full py-2.5 rounded-xl text-xs font-semibold"
              >
                Send Instructions
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#FFC247] mx-auto animate-bounce" />
              <h3 className="text-sm font-bold text-white">Instructions Dispatched</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                If the account exists, we have emailed instructions to <strong>{email}</strong>.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
