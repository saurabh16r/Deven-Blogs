'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Lock, CheckCircle2, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const result = await updateProfile(name, avatar, password || undefined);
    setLoading(false);
    if (result) {
      setSuccess(true);
      setPassword('');
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold font-outfit text-white">Profile Settings</h1>
        <p className="text-xs text-zinc-500 font-sans">Manage display name, password credentials, and avatar photos.</p>
      </div>

      <div className="max-w-xl bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-[#FFC247] rounded-xl flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              Profile updated successfully!
            </div>
          )}

          {/* Email (Read Only) */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase">Email Address (Primary)</label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-zinc-950 border border-white/5 opacity-50 cursor-not-allowed rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-400"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase">Display Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFC247]"
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            </div>
          </div>

          {/* Avatar Url */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase">Avatar Image URL</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFC247]"
            />
          </div>

          {/* Password update */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase">New Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFC247]"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-button w-full py-2.5 rounded-xl text-xs font-semibold"
          >
            {loading ? 'Saving Changes...' : 'Save Settings'}
          </button>

        </form>
      </div>

      {/* Appearance Settings */}
      <div className="max-w-xl bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white font-outfit">Appearance Settings</h2>
          <p className="text-xs text-zinc-500 font-sans">Choose how Deven Blogs looks to you. Select a theme or sync with your system.</p>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {/* Light Theme Option */}
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all text-center cursor-pointer ${
              theme === 'light'
                ? 'border-[#FFC247] bg-[#FFC247]/5 text-white'
                : 'border-white/5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-[#FFC247]' : 'text-zinc-500'}`} />
            <div className="text-xs font-semibold">Light</div>
          </button>

          {/* Dark Theme Option */}
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all text-center cursor-pointer ${
              theme === 'dark'
                ? 'border-[#FFC247] bg-[#FFC247]/5 text-white'
                : 'border-white/5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-[#FFC247]' : 'text-zinc-500'}`} />
            <div className="text-xs font-semibold">Dark</div>
          </button>

          {/* System Theme Option */}
          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all text-center cursor-pointer ${
              theme === 'system'
                ? 'border-[#FFC247] bg-[#FFC247]/5 text-white'
                : 'border-white/5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Laptop className={`w-5 h-5 ${theme === 'system' ? 'text-[#FFC247]' : 'text-zinc-500'}`} />
            <div className="text-xs font-semibold">System</div>
          </button>
        </div>
      </div>

    </div>
  );
}
