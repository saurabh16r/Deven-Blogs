'use client';

import React, { useState } from 'react';
import { Palette, CheckCircle2 } from 'lucide-react';

export default function BrandingPanel() {
  const [logoText, setLogoText] = useState('Deven');
  const [logoColor, setLogoColor] = useState('#FFC247');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="space-y-6 text-left max-w-xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold font-outfit text-white">Branding Settings</h1>
        <p className="text-xs text-zinc-500 font-sans">Modify primary accent colors, logo layouts, and font hierarchies.</p>
      </div>

      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
        <form onSubmit={handleSave} className="space-y-4">
          
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-[#FFC247] rounded-xl flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              Theme style variables updated successfully!
            </div>
          )}

          {/* Logo brand text */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase">Logo Title</label>
            <input
              type="text"
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Primary Accent Color Hex picker */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase">Brand Primary Color (#)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={logoColor}
                onChange={(e) => setLogoColor(e.target.value)}
                className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
              <input
                type="color"
                value={logoColor}
                onChange={(e) => setLogoColor(e.target.value)}
                className="w-10 h-10 border-0 rounded bg-transparent cursor-pointer shrink-0"
              />
            </div>
          </div>

          {/* Font selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase">Brand Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            >
              <option value="Inter">Inter (Sans-serif)</option>
              <option value="Outfit">Outfit (Display)</option>
              <option value="Roboto">Roboto (Clean)</option>
            </select>
          </div>

          <button
            type="submit"
            className="glow-button w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold"
          >
            <Palette className="w-4 h-4" />
            Update Branding Elements
          </button>

        </form>
      </div>
    </div>
  );
}
