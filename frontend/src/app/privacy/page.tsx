'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-6 text-left">
        <h1 className="text-3xl font-extrabold font-outfit text-white">Privacy Policy</h1>
        <p className="text-xs text-zinc-500">Effective Date: June 7, 2026</p>
        
        <div className="space-y-4 text-xs text-zinc-400 leading-relaxed font-sans border-t border-white/5 pt-6">
          <p>
            At Deven, we prioritize the protection of your personal information. This Privacy Policy details how we compile, encrypt, and analyze your metrics, email accounts, and reading streak histories.
          </p>
          <h3 className="text-sm font-bold text-white uppercase mt-4">1. Data compilation</h3>
          <p>
            We compile your name, email addresses, payment signatures via Razorpay SDK integrations, and profile avatar layouts. We also track analytical data such as click durations on summaries and audio tracks.
          </p>
          <h3 className="text-sm font-bold text-white uppercase mt-4">2. Cookies usage</h3>
          <p>
            We deploy secure local cookies to store JWT tokens. These cookies authorize reading dashboard views and lock files indicators automatically.
          </p>
          <h3 className="text-sm font-bold text-white uppercase mt-4">3. Security</h3>
          <p>
            All connection data is encrypted over TLS. Credit credentials and card numbers are processed directly by Razorpay PCI-compliant servers; Deven never logs card credentials.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
