"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';

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
      const res = await fetch(`${API_URL}/api/contact`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
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
      await fetch(`${API_URL}/api/contact/${id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${user?.token}` } });
      setMessages(messages.map(m => m._id === id ? { ...m, isRead: true } : m));
    } catch { showToast('Failed to mark as read', 'error'); }
    finally { setProcessingId(null); }
  };

  const deleteMessage = async (id: string) => {
    setProcessingId(id);
    try {
      await fetch(`${API_URL}/api/contact/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user?.token}` } });
      setMessages(messages.filter(m => m._id !== id));
      showToast('Message deleted', 'success');
    } catch { showToast('Failed to delete', 'error'); }
    finally { setProcessingId(null); }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded border shadow-lg text-xs font-medium ${
          toast.type === 'success' ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-rose-950 border-rose-800 text-rose-300'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Communication Inbox</span>
        <h1 className="text-2xl font-bold text-white tracking-tight">Customer Support Inquiries</h1>
        <p className="text-xs text-zinc-400">Review and resolve messages submitted via contact desk.</p>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden font-numeric">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">Sender Details</th>
                <th className="py-3 px-4">Message Snippet</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500">Loading inbox messages...</td>
                </tr>
              ) : messages.length > 0 ? (
                messages.map((m) => (
                  <React.Fragment key={m._id}>
                    <tr className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="block font-semibold text-zinc-100">{m.name}</span>
                        <span className="text-[11px] text-zinc-500">{m.email} • {new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-300 max-w-xs truncate">
                        {m.message}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {m.isRead ? (
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px]">
                            READ
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-bold text-[10px]">
                            NEW
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setExpandedId(expandedId === m._id ? null : m._id);
                            if (!m.isRead) markRead(m._id);
                          }}
                          className="text-xs text-zinc-400 hover:text-white transition-colors"
                        >
                          {expandedId === m._id ? 'Collapse' : 'Expand'}
                        </button>
                        <button
                          onClick={() => deleteMessage(m._id)}
                          disabled={processingId === m._id}
                          className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {expandedId === m._id && (
                      <tr className="bg-zinc-950/80">
                        <td colSpan={4} className="p-4 text-xs text-zinc-300 leading-relaxed border-b border-zinc-800">
                          <div className="space-y-2">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Full Inquiry Body:</span>
                            <p className="bg-zinc-900 p-3 rounded border border-zinc-800 text-zinc-200 whitespace-pre-wrap">{m.message}</p>
                            <a
                              href={`mailto:${m.email}?subject=Re: Support Inquiry`}
                              className="inline-block px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                            >
                              Reply via Email →
                            </a>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500">No support messages in inbox.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
