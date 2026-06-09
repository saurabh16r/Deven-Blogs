'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-6 text-left">
        <h1 className="text-3xl font-extrabold font-outfit text-white">Terms & Conditions</h1>
        <p className="text-xs text-zinc-500">Effective Date: June 7, 2026</p>
        
        <div className="space-y-4 text-xs text-zinc-400 leading-relaxed font-sans border-t border-white/5 pt-6">
          <p>
            Welcome to Deven Blogs. By accessing this SaaS portal, registering reader logins, or purchasing premium memberships, you validate these terms of service.
          </p>
          <h3 className="text-sm font-bold text-white uppercase mt-4">1. Membership and Billing</h3>
          <p>
            Subscription services cost ₹299 per month. Memberships recur automatically. Users can cancel billing from their dashboard before the next invoice date.
          </p>
          <h3 className="text-sm font-bold text-white uppercase mt-4">2. Intellectual Property</h3>
          <p>
            All text content, AI summaries, text-to-speech audio outputs, sitemaps, and design customizers are exclusive property of Deven. Copying content without explicit authorization is forbidden.
          </p>
          <h3 className="text-sm font-bold text-white uppercase mt-4">3. Termination of Use</h3>
          <p>
            We reserve the right to suspend or block reader access immediately if comments, replies, or code block comments violate standard moderation regulations.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
