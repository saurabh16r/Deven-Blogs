'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { staticBlogs } from '@/utils/mockData';
import { Bookmark, Trash2, ArrowUpRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function BookmarksPage() {
  const { token } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(res.data);
    } catch {
      // simulate fallback
      setBookmarks(staticBlogs.slice(0, 1));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBookmarks();
  }, [token]);

  const removeBookmark = async (blogId: string) => {
    try {
      await axios.post(
        `${API_URL}/users/bookmarks/toggle`,
        { blogId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookmarks(bookmarks.filter(b => (b._id || b.id) !== blogId));
    } catch {
      // mock deletion
      setBookmarks(bookmarks.filter(b => (b._id || b.id) !== blogId));
    }
  };

  if (loading) {
    return <div className="text-zinc-500 text-xs py-10">Loading saved blogs...</div>;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold font-outfit text-white">Saved Bookmarks</h1>
        <p className="text-xs text-zinc-500 font-sans">Access references you saved for offline study.</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="glass-card rounded-2xl py-16 text-center space-y-2">
          <Bookmark className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No saved bookmarks</h3>
          <p className="text-xs text-zinc-500">Bookmarks you save during study show up here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookmarks.map((b) => (
            <div key={b.id || b._id} className="glass-card rounded-xl p-4 flex gap-4 items-center justify-between border border-white/5">
              <div className="flex gap-4 items-center truncate">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.coverImage}
                  alt={b.title}
                  className="w-14 h-14 rounded-lg object-cover bg-zinc-800 shrink-0"
                />
                <div className="truncate text-left space-y-1">
                  <h3 className="text-xs font-bold text-white truncate hover:text-[#FFC247]">
                    <Link href={`/blogs/${b.slug}`}>{b.title}</Link>
                  </h3>
                  <span className="inline-block text-[9px] bg-zinc-950 px-2 py-0.5 rounded text-zinc-400 font-mono">{b.category}</span>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => removeBookmark(b._id || b.id)}
                  className="p-2 bg-zinc-950 hover:bg-red-500/10 border border-white/5 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
