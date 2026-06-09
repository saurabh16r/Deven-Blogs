'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setSent(true);
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-12 text-left">
        <div className="space-y-3">
          <span className="text-[#FFC247] font-bold text-xs uppercase tracking-widest">Support Node</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-outfit text-white tracking-tight">Get in touch.</h1>
          <p className="text-zinc-400 text-sm">Have feedback about our summary tools or billing options? Let us know.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Support contacts */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#FFC247]/10 flex items-center justify-center text-[#FFC247] shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase">Email Briefings</h4>
                <p className="text-xs text-zinc-400 mt-0.5">support@deven.io</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase">Direct Hotlines</h4>
                <p className="text-xs text-zinc-400 mt-0.5">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase">Headquarters</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Mumbai, Maharashtra, India</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Alex Reader"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFC247] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="alex@deven.io"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFC247] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Message</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what you need help with..."
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-[#FFC247] transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="glow-button w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Request
              </button>
            </form>

            {sent && (
              <div className="flex items-center gap-2 text-[#FFC247] text-xs justify-center pt-2">
                <CheckCircle2 className="w-4 h-4" />
                Request submitted successfully!
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
