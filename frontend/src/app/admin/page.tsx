'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { staticBlogs } from '@/utils/mockData';
import { Plus, Edit, Trash2, Eye, Lock, FileText, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ArticlesManager() {
  const { token } = useAuth();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get(`${API_URL}/blogs`, config);
      setBlogs(res.data);
    } catch {
      setBlogs(staticBlogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this publication?')) return;
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`${API_URL}/admin/blogs/${id}`, config);
      setBlogs(blogs.filter(b => (b.id || b._id) !== id));
    } catch {
      // Mock delete
      setBlogs(blogs.filter(b => (b.id || b._id) !== id));
    }
  };

  if (loading) {
    return <div className="text-zinc-500 text-xs py-10">Loading publications logs...</div>;
  }

  const draftsCount = blogs.filter(b => b.status === 'draft').length;
  const publishedCount = blogs.filter(b => b.status === 'published' || !b.status).length;

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold font-outfit text-white">Articles Manager</h1>
          <p className="text-xs text-zinc-500 font-sans">Publish, schedule, edit, or delete platform blogs.</p>
        </div>

        <Link
          href="/admin/blogs/new"
          className="glow-button px-4 py-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          Write Article
        </Link>
      </div>

      {/* MINI STATS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-900/45 border border-white/5 rounded-xl text-left">
          <p className="text-[9px] text-zinc-500 font-bold uppercase">Total posts</p>
          <h4 className="text-xl font-bold text-white mt-1">{blogs.length}</h4>
        </div>
        <div className="p-4 bg-zinc-900/45 border border-white/5 rounded-xl text-left">
          <p className="text-[9px] text-zinc-500 font-bold uppercase">Published</p>
          <h4 className="text-xl font-bold text-emerald-400 mt-1">{publishedCount}</h4>
        </div>
        <div className="p-4 bg-zinc-900/45 border border-white/5 rounded-xl text-left">
          <p className="text-[9px] text-zinc-500 font-bold uppercase">Drafts</p>
          <h4 className="text-xl font-bold text-yellow-400 mt-1">{draftsCount}</h4>
        </div>
        <div className="p-4 bg-zinc-900/45 border border-white/5 rounded-xl text-left">
          <p className="text-[9px] text-zinc-500 font-bold uppercase">Views Accumulation</p>
          <h4 className="text-xl font-bold text-blue-400 mt-1">
            {blogs.reduce((acc, b) => acc + (b.viewsCount || 0), 0)}
          </h4>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-[10px] text-zinc-500 uppercase font-bold border-b border-white/5">
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Billing Access</th>
                <th className="p-4">Stats</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((b) => (
                <tr key={b.id || b._id} className="border-b border-white/5 text-xs text-zinc-300 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white truncate max-w-[240px]">{b.title}</td>
                  <td className="p-4">
                    <span className="bg-zinc-950 px-2.5 py-0.5 rounded-full text-zinc-500 border border-white/5 text-[10px]">
                      {b.category}
                    </span>
                  </td>
                  <td className="p-4">
                    {b.isPremium ? (
                      <span className="flex items-center gap-1 text-orange-400 font-semibold text-[10px]">
                        <Lock className="w-3 h-3" />
                        Premium
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-[10px]">Public Free</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-zinc-500">
                      <Eye className="w-3.5 h-3.5" />
                      {b.viewsCount || 0} views
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDelete(b._id || b.id)}
                        className="p-1.5 bg-zinc-950 hover:bg-red-500/10 border border-white/5 text-zinc-500 hover:text-red-400 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
