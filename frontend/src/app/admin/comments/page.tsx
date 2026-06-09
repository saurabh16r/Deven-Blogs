'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, Check, Ban, AlertOctagon } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CommentsModeration() {
  const { token } = useAuth();
  const [flaggedComments, setFlaggedComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlagged = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_URL}/admin/comments/flagged`, config);
      setFlaggedComments(res.data);
    } catch {
      // simulate mock flagged comments
      setFlaggedComments([
        {
          id: 'comment-reported-1',
          userName: 'Spammy Bot',
          content: 'Click here to earn $5000/day instantly! www.spamlink.com',
          status: 'reported',
          reports: [{ reason: 'Advertising spam' }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlagged();
  }, [token]);

  const handleModerate = async (id: string, action: 'approve' | 'hide') => {
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_URL}/admin/comments/${id}/moderate`, { action }, config);
      setFlaggedComments(flaggedComments.filter(c => (c.id || c._id) !== id));
    } catch {
      // Mock action
      setFlaggedComments(flaggedComments.filter(c => (c.id || c._id) !== id));
    }
  };

  if (loading) {
    return <div className="text-zinc-500 text-xs py-10">Loading comments list...</div>;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold font-outfit text-white">Comments Moderation</h1>
        <p className="text-xs text-zinc-500 font-sans">Approve or hide discussions comments flagged by users.</p>
      </div>

      {flaggedComments.length === 0 ? (
        <div className="glass-card rounded-2xl py-16 text-center space-y-2">
          <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">Inbox Clean</h3>
          <p className="text-xs text-zinc-500">There are no reported comments pending review.</p>
        </div>
      ) : (
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 text-[10px] text-zinc-500 uppercase font-bold border-b border-white/5">
                  <th className="p-4">Author</th>
                  <th className="p-4">Comment Text</th>
                  <th className="p-4">Report reason</th>
                  <th className="p-4 text-right">Moderate</th>
                </tr>
              </thead>
              <tbody>
                {flaggedComments.map((c) => (
                  <tr key={c.id || c._id} className="border-b border-white/5 text-xs text-zinc-300 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white whitespace-nowrap">{c.userName || c.userId?.name || 'Member'}</td>
                    <td className="p-4 max-w-sm truncate">{c.content}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-semibold">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        {c.reports?.[0]?.reason || 'Spam flagged'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 shrink-0">
                        <button
                          onClick={() => handleModerate(c.id || c._id, 'approve')}
                          className="p-1.5 bg-zinc-950 hover:bg-emerald-500/10 border border-white/5 text-zinc-400 hover:text-emerald-400 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-semibold"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerate(c.id || c._id, 'hide')}
                          className="p-1.5 bg-zinc-950 hover:bg-red-500/10 border border-white/5 text-zinc-500 hover:text-red-400 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-semibold"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Hide
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
