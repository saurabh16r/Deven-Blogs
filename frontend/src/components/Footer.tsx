'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const Footer: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-zinc-950 border-t border-white/5 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#FFC247] flex items-center justify-center font-extrabold text-black font-outfit text-md">
                D
              </span>
              <span className="font-outfit font-extrabold text-lg text-white">
                Deven<span className="text-[#FFC247]">.</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-400">
              Premium blogs, AI summaries, and expert insights designed for modern learners. Learn faster, grow smarter.
            </p>
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} Deven Inc. All rights reserved.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/blogs" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  All Blogs
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Stay Updated</h4>
            <p className="text-sm text-zinc-400">
              Get weekly takeaways and notifications about newly published articles.
            </p>

            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-zinc-900 border border-white/10 rounded-full px-4 py-2.5 pl-10 pr-12 text-sm text-white focus:outline-none focus:border-[#FFC247] transition-all"
              />
              <Mail className="absolute left-3.5 w-4 h-4 text-zinc-500" />
              <button
                type="submit"
                className="absolute right-1.5 bg-[#FFC247] hover:bg-[#E6AE3F] text-black text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
              >
                Join
              </button>
            </form>

            {subscribed && (
              <div className="flex items-center gap-1.5 text-[#FFC247] text-xs transition-opacity duration-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Subscribed successfully!
              </div>
            )}
          </div>

        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500">
            Powered by Next.js 15, Tailwind v4 & Express REST.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-zinc-500">Language: English</span>
            <span className="text-xs text-zinc-500">
              Theme: {resolvedTheme === 'dark' ? 'Carbon Dark' : 'Cloud Light'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
