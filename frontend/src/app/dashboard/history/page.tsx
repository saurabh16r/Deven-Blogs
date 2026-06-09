'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { History, Clock, BookOpen } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function HistoryPage() {
  const { token } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch {
        // simulate mock logs
        setHistory([
          {
            blogId: 'blog-1',
            blogTitle: 'Designing for the Future: The Apple + Notion + Linear Aesthetics',
            blogCoverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
            blogSlug: 'designing-for-the-future-apple-notion-linear',
            readAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            duration: 180
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchHistory();
  }, [token]);

  if (loading) {
    return <div className="text-zinc-500 text-xs py-10">Loading reading history...</div>;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold font-outfit text-white">Reading History</h1>
        <p className="text-xs text-zinc-500 font-sans">A timeline of your finished articles and reading duration details.</p>
      </div>

      {history.length === 0 ? (
        <div className="glass-card rounded-2xl py-16 text-center space-y-2">
          <History className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No history found</h3>
          <p className="text-xs text-zinc-500 font-sans">Articles you browse for 30s or more are logged here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((h, idx) => (
            <div key={idx} className="glass-card rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border border-white/5">
              <div className="flex gap-4 items-center truncate text-left">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={h.blogCoverImage || h.blogId?.coverImage || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&q=80'}
                  alt={h.blogTitle || h.blogId?.title}
                  className="w-14 h-14 rounded-lg object-cover bg-zinc-800 shrink-0"
                />
                <div className="truncate space-y-1">
                  <h3 className="text-xs font-bold text-white truncate hover:text-[#FFC247]">
                    <Link href={`/blogs/${h.blogSlug || h.blogId?.slug}`}>{h.blogTitle || h.blogId?.title}</Link>
                  </h3>
                  <div className="flex items-center gap-1.5 text-[9px] text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Spent {Math.round(h.duration / 60) || 1} min reading</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 font-mono sm:text-right shrink-0">
                <p>Read Date</p>
                <p className="font-semibold text-zinc-400 mt-0.5">{new Date(h.readAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
