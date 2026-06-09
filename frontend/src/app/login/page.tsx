'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Mail, Lock, LogIn, ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid email or password.');
      }
    } catch (err) {
      setError('Connection failure. Local sandbox fallback active.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'reader' | 'admin') => {
    setLoading(true);
    const emailAddr = role === 'admin' ? 'admin@deven.io' : 'reader@deven.io';
    try {
      await login(emailAddr);
      router.push('/dashboard');
    } catch {
      setError('Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMock = async () => {
    setLoading(true);
    try {
      await googleLogin('Google Scholar', 'google.scholar@deven.io', 'google-id-123', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80');
      router.push('/dashboard');
    } catch {
      setError('Google simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFC247]/5 blur-[100px] pointer-events-none" />

      {/* Back button */}
      <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Return Home
      </Link>

      <div className="w-full max-w-md space-y-6 relative z-10 text-left">
        
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1.5 justify-center">
            <span className="w-7 h-7 rounded-lg bg-[#FFC247] flex items-center justify-center font-extrabold text-black font-outfit text-sm">D</span>
            <span className="font-outfit font-extrabold text-lg text-white">Deven<span className="text-[#FFC247]">.</span></span>
          </Link>
          <h2 className="text-xl font-bold text-white tracking-tight">Access Your Dashboard</h2>
          <p className="text-xs text-zinc-500">Read blogs, sync streaks, and watch video briefings.</p>
        </div>

        {/* Card wrapper */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-5">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

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
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Password</label>
                <Link href="/forgot-password" className="text-[10px] text-zinc-500 hover:text-white">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required={email !== 'admin@deven.io' && email !== 'reader@deven.io'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFC247] transition-all"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glow-button w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Validating...' : 'Log In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-2 text-[10px] text-zinc-600 uppercase font-bold">
            <hr className="flex-1 border-white/5" />
            <span>Or Connect with</span>
            <hr className="flex-1 border-white/5" />
          </div>

          {/* Social button */}
          <button
            onClick={handleGoogleMock}
            className="w-full py-2.5 bg-zinc-950 border border-white/10 hover:border-white/20 rounded-xl text-xs text-zinc-300 font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Quick login short cuts */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <p className="text-[10px] font-bold text-zinc-500 uppercase text-center">Developer Shortcuts</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin('reader')}
                className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-[10px] text-zinc-300 font-medium transition-colors"
              >
                Log In Reader
              </button>
              <button
                onClick={() => handleQuickLogin('admin')}
                className="py-1.5 px-3 bg-[#FFC247]/10 hover:bg-[#FFC247]/20 border border-[#FFC247]/10 rounded-lg text-[10px] text-[#FFC247] font-medium transition-colors"
              >
                Log In Admin
              </button>
            </div>
          </div>

        </div>

        <p className="text-center text-xs text-zinc-500">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#FFC247] hover:underline">Sign up</Link>
        </p>

      </div>
    </div>
  );
}
