"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/contact', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setMessages(data);
    } catch { showToast('Error fetching messages', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?.role === 'admin') fetchMessages(); }, [user]);

  const showToast = (msg: string, type: 'success'|'error') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const markRead = async (id: string) => {
    setProcessingId(id);
    try {
      await fetch(`http://localhost:5000/api/contact/${id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${user?.token}` } });
      setMessages(messages.map(m => m._id === id ? { ...m, isRead: true } : m));
    } catch { showToast('Failed to mark as read', 'error'); }
    finally { setProcessingId(null); }
  };

  const deleteMessage = async (id: string) => {
    setProcessingId(id);
    try {
      await fetch(`http://localhost:5000/api/contact/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user?.token}` } });
      setMessages(messages.filter(m => m._id !== id));
      showToast('Message deleted', 'success');
    } catch { showToast('Failed to delete', 'error'); }
    finally { setProcessingId(null); }
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="animate-in fade-in duration-500 relative">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-xl flex items-center ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      <header className="mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Contact Messages</h1>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-amber-500 text-white rounded-full">{unreadCount}</span>
          )}
        </div>
        <p className="text-zinc-400">Messages submitted from the website landing page contact form.</p>
      </header>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-xl" />)}</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-2">No messages yet</h2>
          <p className="text-zinc-400">Contact form submissions from the landing page will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg._id} className={`border rounded-xl overflow-hidden transition-all ${!msg.isRead ? 'bg-amber-500/5 border-amber-500/20' : 'bg-black/20 border-white/5'}`}>
              <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === msg._id ? null : msg._id)}>
                <div className="flex items-center gap-3">
                  {!msg.isRead && <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{msg.name}</span>
                      <span className="text-zinc-500 text-xs">&lt;{msg.email}&gt;</span>
                    </div>
                    <p className={`text-xs truncate max-w-md ${msg.isRead ? 'text-zinc-500' : 'text-zinc-300'}`}>{msg.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-[10px] text-zinc-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  <svg className={`w-4 h-4 text-zinc-500 transition-transform ${expandedId === msg._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {expandedId === msg._id && (
                <div className="px-4 pb-4 border-t border-white/5 pt-4">
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">{msg.message}</p>
                  <div className="flex gap-2">
                    {!msg.isRead && (
                      <button disabled={processingId === msg._id} onClick={() => markRead(msg._id)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                        Mark as Read
                      </button>
                    )}
                    <a href={`mailto:${msg.email}`} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors">
                      Reply via Email
                    </a>
                    <button disabled={processingId === msg._id} onClick={() => deleteMessage(msg._id)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors ml-auto">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
