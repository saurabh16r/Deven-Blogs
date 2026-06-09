'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Mail, Lock, User, UserPlus, ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referredBy, setReferredBy] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await signup(name, email, password, referredBy || undefined);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Signup failed. Email may already be in use.');
      }
    } catch {
      setError('Connection failed. Sandbox mock active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFC247]/5 blur-[100px] pointer-events-none" />

      <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Return Home
      </Link>

      <div className="w-full max-w-md space-y-6 relative z-10 text-left">
        
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1.5 justify-center">
            <span className="w-7 h-7 rounded-lg bg-[#FFC247] flex items-center justify-center font-extrabold text-black font-outfit text-sm">D</span>
            <span className="font-outfit font-extrabold text-lg text-white">Deven<span className="text-[#FFC247]">.</span></span>
          </Link>
          <h2 className="text-xl font-bold text-white tracking-tight">Create your account</h2>
          <p className="text-xs text-zinc-500 font-sans">Begin your reading streak habit today.</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Reader"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFC247] transition-all"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              </div>
            </div>

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

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFC247] transition-all"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Referral Code (Optional)</label>
              <input
                type="text"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value)}
                placeholder="e.g. DEVEN100"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white uppercase focus:outline-none focus:border-[#FFC247] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glow-button w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="text-[#FFC247] hover:underline">Log in</Link>
        </p>

      </div>
    </div>
  );

}
