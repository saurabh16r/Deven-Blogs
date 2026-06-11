'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, Image, Trash2, Copy, Check, Eye, X, File, Search, RefreshCw, AlertCircle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface MediaItem {
  id?: string;
  _id?: string;
  url: string;
  publicId: string;
  fileName: string;
  fileType: string;
  size: number;
  createdAt: string;
}

export default function MediaLibrary() {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Fetch all media
  const loadMedia = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_URL}/media/library`, config);
      setMediaList(res.data);
    } catch (err) {
      console.error('Failed to load media library', err);
      showNotification('error', 'Failed to retrieve media library items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [token]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Upload file handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB for development sanity
    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'File is too large. Maximum size is 5MB.');
      return;
    }

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
      setMediaList(prev => [res.data, ...prev]);
      showNotification('success', `Uploaded "${file.name}" successfully.`);
    } catch (err) {
      console.error('Upload failed', err);
      showNotification('error', 'Upload failed. Please check file format and try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Copy Link
  const handleCopyLink = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    const itemId = item._id || item.id || '';
    setCopiedId(itemId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete handler
  const handleDelete = async () => {
    if (!selectedItem || !token) return;
    const itemId = selectedItem._id || selectedItem.id;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/media/${itemId}`, config);
      setMediaList(prev => prev.filter(m => (m._id || m.id) !== itemId));
      showNotification('success', 'Media asset deleted successfully.');
      setSelectedItem(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Delete failed', err);
      showNotification('error', 'Failed to delete media asset.');
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Filter list
  const filteredList = mediaList.filter(item => 
    item.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left w-full max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Media Library</h1>
          <p className="text-xs text-zinc-400 font-sans mt-1">Upload, view, and organize assets for the Deven platform.</p>
        </div>

        {/* Upload Button */}
        <div>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*,.svg"
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="glow-button px-5 py-2.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all disabled:opacity-50"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Uploading Asset...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Upload New Image
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold text-white ${
              notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-[#FFC247]' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Actions Bar */}
      <div className="flex items-center gap-4 bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search assets by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button 
          onClick={loadMedia} 
          className="p-2 border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white rounded-xl transition-all"
          title="Refresh Library"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Media Gallery Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#FFC247] border-t-transparent animate-spin" />
          <p className="text-zinc-500 text-xs font-sans">Scanning media files...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="py-20 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-6 space-y-4 bg-zinc-900/10">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 border border-white/5">
            <Image className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No Assets Found</h3>
            <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
              {searchQuery ? "No assets matched your search query." : "You haven't uploaded any media files yet. Click upload to get started."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filteredList.map((item) => {
            const itemId = item._id || item.id || '';
            return (
              <motion.div
                key={itemId}
                layoutId={`card-${itemId}`}
                onClick={() => setSelectedItem(item)}
                className="group relative cursor-pointer glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 bg-zinc-900/30 transition-all flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.fileName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-white/10 hover:bg-[#FFC247] hover:text-black flex items-center justify-center text-white transition-all shadow"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink(item);
                      }}
                      className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-white/10 hover:bg-[#FFC247] hover:text-black flex items-center justify-center text-white transition-all shadow"
                    >
                      {copiedId === itemId ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 text-left flex-1 flex flex-col justify-between bg-zinc-950/40">
                  <p className="text-[10px] font-bold text-white truncate w-full" title={item.fileName}>
                    {item.fileName}
                  </p>
                  <div className="flex justify-between items-center text-[9px] text-zinc-500 mt-2">
                    <span>{formatBytes(item.size)}</span>
                    <span className="uppercase">{item.fileType.split('/')[1] || 'FILE'}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Preview Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setShowDeleteConfirm(false);
                }}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-950/80 border border-white/10 hover:bg-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Large Image Preview */}
              <div className="flex-[3] bg-zinc-950 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-white/5 min-h-[300px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedItem.url}
                  alt={selectedItem.fileName}
                  className="max-h-[450px] max-w-full object-contain rounded-lg shadow-lg"
                />
              </div>

              {/* Sidebar Info */}
              <div className="flex-[2] p-6 text-left flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Asset Details</h3>
                  <div className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Filename</span>
                      <p className="text-zinc-200 font-bold break-all">{selectedItem.fileName}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Mime Type</span>
                      <p className="text-zinc-300 font-mono">{selectedItem.fileType}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">File Size</span>
                      <p className="text-zinc-300 font-medium">{formatBytes(selectedItem.size)}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Uploaded On</span>
                      <p className="text-zinc-400">
                        {new Date(selectedItem.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  {/* Copy Link Action */}
                  <button
                    onClick={() => handleCopyLink(selectedItem)}
                    className="w-full bg-zinc-950 border border-white/10 hover:border-[#FFC247]/30 py-2.5 rounded-xl text-xs text-zinc-200 hover:text-white flex items-center justify-center gap-2 transition-all font-semibold"
                  >
                    {(copiedId === selectedItem._id || copiedId === selectedItem.id) ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        Copied Link!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Asset URL
                      </>
                    )}
                  </button>

                  {/* Delete Block */}
                  {showDeleteConfirm ? (
                    <div className="space-y-2 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                      <p className="text-[10px] text-rose-300 font-semibold leading-relaxed">
                        Are you sure? This cannot be undone and will break any pages using this URL.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDelete}
                          className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-all"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-zinc-400 hover:text-white font-medium text-[10px] transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full bg-rose-500/10 border border-rose-500/20 hover:bg-rose-600 hover:text-white py-2.5 rounded-xl text-xs text-rose-400 flex items-center justify-center gap-2 transition-all font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Permanently
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
