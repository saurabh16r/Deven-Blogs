'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Save, CheckCircle2, Sliders, Upload, Image as ImageIcon, Link as LinkIcon, 
  Sparkles, ListPlus, Monitor, Smartphone, Check
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface MediaItem {
  _id?: string;
  id?: string;
  url: string;
  fileName: string;
}

export default function HeroManagement() {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [heroTitle, setHeroTitle] = useState('Build Startups, [Not Just Ideas.]');
  const [heroSubheadline, setHeroSubheadline] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [primaryCtaText, setPrimaryCtaText] = useState('Start Building');
  const [primaryCtaLink, setPrimaryCtaLink] = useState('/blogs');
  const [secondaryCtaText, setSecondaryCtaText] = useState('Explore Founder Resources');
  const [secondaryCtaLink, setSecondaryCtaLink] = useState('#resources');
  const [trustIndicatorsText, setTrustIndicatorsText] = useState('');

  // UI state
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load current settings & media library
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Load Settings
        const settingsRes = await axios.get(`${API_URL}/admin/settings`, config);
        const data = settingsRes.data;
        
        setHeroTitle(data.heroTitle || 'Build Startups, [Not Just Ideas.]');
        setHeroSubheadline(data.heroSubheadline || '');
        setHeroImage(data.heroImage || '');
        setPrimaryCtaText(data.primaryCtaText || 'Start Building');
        setPrimaryCtaLink(data.primaryCtaLink || '/blogs');
        setSecondaryCtaText(data.secondaryCtaText || 'Explore Founder Resources');
        setSecondaryCtaLink(data.secondaryCtaLink || '#resources');
        
        if (data.trustIndicators && Array.isArray(data.trustIndicators)) {
          setTrustIndicatorsText(data.trustIndicators.join(', '));
        } else {
          setTrustIndicatorsText('Startup Resources, Founder Community, AI Learning Tools, Execution-Focused Content');
        }

        // Load Media for picker
        const mediaRes = await axios.get(`${API_URL}/media/library`, config);
        setMediaList(mediaRes.data);
      } catch (err) {
        console.error('Failed to load settings or media library', err);
        setErrorMsg('Failed to initialize homepage settings.');
      }
    };

    fetchData();
  }, [token]);

  // Handle local background image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };
      const res = await axios.post(`${API_URL}/media/upload`, formData, config);
      setHeroImage(res.data.url);
      
      // Add to list if not present
      setMediaList(prev => [res.data, ...prev]);
    } catch (err) {
      console.error('Upload failed', err);
      setErrorMsg('Failed to upload hero image.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Save settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMsg('');

    // Parse trust indicators
    const trustIndicators = trustIndicatorsText
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const payload = {
      heroTitle,
      heroSubheadline,
      heroImage,
      primaryCtaText,
      primaryCtaLink,
      secondaryCtaText,
      secondaryCtaLink,
      trustIndicators
    };

    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.put(`${API_URL}/admin/settings`, payload, config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('Save failed', err);
      setErrorMsg('Failed to save Hero section configuration.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to highlight bracketed text or last comma text
  const getRenderedHeadline = (title: string) => {
    const regex = /\[(.*?)\]/g;
    if (regex.test(title)) {
      return title.replace(regex, '<span class="text-[#FFC247] bg-clip-text bg-gradient-to-r from-[#FFC247] via-amber-300 to-[#FFC247]">$1</span>');
    }
    const parts = title.split(',');
    if (parts.length > 1) {
      const last = parts[parts.length - 1];
      const rest = parts.slice(0, parts.length - 1).join(',');
      return `${rest}, <span class="text-[#FFC247] bg-clip-text bg-gradient-to-r from-[#FFC247] via-amber-300 to-[#FFC247]">${last}</span>`;
    }
    return title;
  };

  const parsedIndicators = trustIndicatorsText
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);

  return (
    <div className="space-y-6 text-left w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-white">Hero Management</h1>
        <p className="text-xs text-zinc-400 font-sans mt-1">Configure and style the main website Hero section dynamically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form - Left Side */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
            <form onSubmit={handleSave} className="space-y-4">
              
              {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-[#FFC247] rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  Hero section updated successfully!
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <span>⚠️ {errorMsg}</span>
                </div>
              )}

              {/* Title / Headline */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Hero Headline</label>
                  <span className="text-[9px] text-zinc-500">Use [words] to highlight text</span>
                </div>
                <input
                  type="text"
                  required
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFC247]"
                  placeholder="Build Startups, [Not Just Ideas.]"
                />
              </div>

              {/* Subheadline */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Subheadline</label>
                <textarea
                  rows={3}
                  required
                  value={heroSubheadline}
                  onChange={(e) => setHeroSubheadline(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-[#FFC247] resize-none leading-relaxed"
                  placeholder="Deven is a startup ecosystem..."
                />
              </div>

              {/* Background Image Options */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Hero Background Image</label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFC247]"
                    placeholder="https://images.unsplash.com/... or upload"
                  />
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2.5 border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white rounded-xl transition-all"
                    title="Upload Local File"
                  >
                    <Upload className="w-4.5 h-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(!showMediaPicker)}
                    className="p-2.5 border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white rounded-xl transition-all"
                    title="Choose from Media Library"
                  >
                    <ImageIcon className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Media Library Quick Picker */}
                {showMediaPicker && (
                  <div className="bg-zinc-950 border border-white/10 rounded-xl p-3 mt-2 grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto">
                    {mediaList.map((m) => {
                      const id = m._id || m.id;
                      return (
                        <div 
                          key={id}
                          onClick={() => {
                            setHeroImage(m.url);
                            setShowMediaPicker(false);
                          }}
                          className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border ${
                            heroImage === m.url ? 'border-[#FFC247]' : 'border-white/5 hover:border-white/20'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.url} alt={m.fileName} className="w-full h-full object-cover" />
                        </div>
                      );
                    })}
                    {mediaList.length === 0 && (
                      <p className="text-[10px] text-zinc-600 col-span-4 py-4 text-center">Media Library is empty.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Primary CTA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Primary Button Text</label>
                  <input
                    type="text"
                    required
                    value={primaryCtaText}
                    onChange={(e) => setPrimaryCtaText(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Primary Link</label>
                  <input
                    type="text"
                    required
                    value={primaryCtaLink}
                    onChange={(e) => setPrimaryCtaLink(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Secondary CTA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Secondary Button Text</label>
                  <input
                    type="text"
                    required
                    value={secondaryCtaText}
                    onChange={(e) => setSecondaryCtaText(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Secondary Link</label>
                  <input
                    type="text"
                    required
                    value={secondaryCtaLink}
                    onChange={(e) => setSecondaryCtaLink(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Trust Indicators (Comma-Separated)</label>
                <textarea
                  rows={2}
                  required
                  value={trustIndicatorsText}
                  onChange={(e) => setTrustIndicatorsText(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-[#FFC247] resize-none"
                  placeholder="Startup Resources, Founder Community, ..."
                />
              </div>

              <button
                type="submit"
                disabled={loading || uploading}
                className="glow-button w-full py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>

            </form>
          </div>
        </div>

        {/* Dynamic Simulator Preview - Right Side */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FFC247]" />
              Live Workspace Simulator
            </span>
            <div className="flex bg-zinc-900 border border-white/10 rounded-xl overflow-hidden p-0.5">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-[10px] font-bold transition-all ${
                  previewDevice === 'desktop' ? 'bg-[#FFC247] text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-[10px] font-bold transition-all ${
                  previewDevice === 'mobile' ? 'bg-[#FFC247] text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mobile
              </button>
            </div>
          </div>

          {/* Simulated Preview Container */}
          <div className="relative border border-white/10 rounded-[32px] overflow-hidden bg-zinc-950 shadow-2xl transition-all duration-300">
            {/* Device Frame Wrap */}
            <div className={`mx-auto transition-all duration-300 ${
              previewDevice === 'mobile' ? 'max-w-[340px] border-x-[8px] border-zinc-800 rounded-[28px]' : 'w-full'
            }`}>
              {/* Top notch for mobile only */}
              {previewDevice === 'mobile' && (
                <div className="h-5 bg-zinc-800 w-full relative flex justify-center items-center">
                  <div className="w-16 h-3 bg-zinc-950 rounded-b-lg absolute top-0" />
                </div>
              )}

              {/* Simulated Hero Section Body */}
              <div 
                className="relative bg-zinc-950 py-16 px-6 overflow-hidden flex flex-col justify-center min-h-[460px] bg-cover bg-center"
                style={{ 
                  backgroundImage: heroImage ? `url(${heroImage})` : 'none',
                }}
              >
                {/* Reduced dark overlay (25%-35% opacity) to make the startup image clearly visible */}
                <div className="absolute inset-0 bg-zinc-950/30 z-0" />
                
                {/* Left-to-right gradient overlay for text readability, fading to transparent on the right */}
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/95 to-zinc-950/40 lg:to-transparent z-0 pointer-events-none" />

                {/* Content grid */}
                <div className={`relative z-10 grid gap-8 items-center ${
                  previewDevice === 'desktop' ? 'grid-cols-12' : 'grid-cols-1'
                }`}>
                  {/* Left Column Content (col-span-6 split-screen layout) */}
                  <div className={previewDevice === 'desktop' ? 'col-span-6 space-y-4 text-left' : 'space-y-4 text-center'}>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/5 bg-zinc-900/50 backdrop-blur-md text-[9px] font-bold text-[#FFC247] ${
                      previewDevice === 'mobile' ? 'mx-auto' : ''
                    }`}>
                      <Sparkles className="w-3 h-3 text-[#FFC247]" />
                      Exclusive Founder Knowledge Platform
                    </div>

                    <h1 
                      className={`font-extrabold font-outfit text-white leading-tight ${
                        previewDevice === 'desktop' ? 'text-3xl' : 'text-2xl'
                      }`}
                      dangerouslySetInnerHTML={{ __html: getRenderedHeadline(heroTitle) }}
                    />

                    <p className="text-zinc-300 text-[10px] leading-relaxed font-sans max-w-md">
                      {heroSubheadline || 'Configure your subheadline details in the dashboard inputs...'}
                    </p>

                    <div className={`flex flex-wrap gap-3 pt-2 ${previewDevice === 'mobile' ? 'justify-center' : ''}`}>
                      <span className="px-4 py-2 bg-[#FFC247] text-black rounded-full font-bold text-[9px] cursor-pointer hover:opacity-90 transition-opacity">
                        {primaryCtaText}
                      </span>
                      <span className="px-4 py-2 border border-white/10 hover:border-white/20 bg-zinc-900/40 backdrop-blur-md text-white rounded-full font-bold text-[9px] cursor-pointer transition-all">
                        {secondaryCtaText}
                      </span>
                    </div>

                    {/* Trust Indicators list below buttons */}
                    <div className={`pt-4 border-t border-white/5 flex flex-wrap gap-x-4 gap-y-1.5 ${previewDevice === 'mobile' ? 'justify-center' : ''}`}>
                      {parsedIndicators.map((ind, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[9px] text-zinc-300 font-bold font-sans">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC247] shrink-0" />
                          <span>{ind}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column Content - Empty visual layout */}
                  {previewDevice === 'desktop' && (
                    <div className="col-span-6 h-full min-h-[150px]" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
