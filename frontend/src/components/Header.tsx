'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, ShieldCheck, FileText, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: 'Explore Blogs', href: '/blogs' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-zinc-950/70 border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-lg bg-[#FFC247] flex items-center justify-center font-extrabold text-black font-outfit text-lg shadow-[0_0_15px_rgba(255,194,71,0.3)] group-hover:scale-105 transition-transform">
            D
          </span>
          <span className="font-outfit font-extrabold text-xl tracking-tight text-white">
            Deven<span className="text-[#FFC247]">.</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-[#FFC247] ${
                isActive(link.href) ? 'text-[#FFC247] font-semibold' : 'text-zinc-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* AUTH BUTTONS / DROPDOWN */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={resolvedTheme}
                initial={{ y: -10, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 10, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-[#FFC247]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#FFC247]" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-white/5 border border-white/5 transition-all text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#FFC247]/30"
                />
                <span className="text-sm font-medium max-w-[100px] truncate text-zinc-200">
                  {user.name}
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-2xl z-20"
                    >
                      <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                        <p className="text-xs text-zinc-500">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                        {user.isSubscribed && (
                          <span className="inline-block text-[10px] bg-[#FFC247]/20 text-[#FFC247] px-2 py-0.5 rounded font-semibold mt-1">
                            PRO MEMBER
                          </span>
                        )}
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#FFC247]" />
                        Dashboard
                      </Link>

                      {(user.role === 'author' || user.role === 'admin' || user.role === 'superadmin') && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <FileText className="w-4 h-4 text-orange-400" />
                          Content Admin
                        </Link>
                      )}

                      {user.role === 'superadmin' && (
                        <Link
                          href="/superadmin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Super Admin CMS
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors mt-1.5 pt-2 border-t border-white/5"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold bg-[#FFC247] text-black px-4 py-2 rounded-full shadow-[0_0_15px_rgba(255,194,71,0.2)] hover:bg-[#E6AE3F] transition-all hover:shadow-[0_0_20px_rgba(255,194,71,0.4)]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU TRIGGER & THEME TOGGLE */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={resolvedTheme}
                initial={{ y: -10, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 10, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-5 h-5 text-[#FFC247]" />
                ) : (
                  <Moon className="w-5 h-5 text-[#FFC247]" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAV DROPDOWN */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-zinc-950 px-4 py-4 space-y-3"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base font-medium py-1.5 ${
                  isActive(link.href) ? 'text-[#FFC247]' : 'text-zinc-400'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-zinc-300 py-1.5"
                  >
                    <LayoutDashboard className="w-5 h-5 text-[#FFC247]" />
                    User Dashboard
                  </Link>
                  {(user.role === 'author' || user.role === 'admin' || user.role === 'superadmin') && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-zinc-300 py-1.5"
                    >
                      <FileText className="w-5 h-5 text-orange-400" />
                      Content Admin
                    </Link>
                  )}
                  {user.role === 'superadmin' && (
                    <Link
                      href="/superadmin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-zinc-300 py-1.5"
                    >
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      Super Admin CMS
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2 text-red-400 py-1.5 text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 rounded-lg border border-white/10 text-zinc-300"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 rounded-lg bg-[#FFC247] text-black font-semibold"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
export default Header;
