"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

export default function AdminFAQsPage() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({ question: '', answer: '', order: '0', isActive: true });
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/faqs/all`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setFaqs(data);
    } catch { showToast('Error fetching FAQs', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?.role === 'admin') fetchFAQs(); }, [user]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (faq?: FAQ) => {
    if (faq) {
      setCurrentFaq(faq);
      setFormData({ question: faq.question, answer: faq.answer, order: faq.order.toString(), isActive: faq.isActive });
    } else {
      setCurrentFaq(null);
      setFormData({ question: '', answer: '', order: String(faqs.length), isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const url = currentFaq ? `${API_URL}/api/faqs/${currentFaq._id}` : `${API_URL}/api/faqs`;
    const method = currentFaq ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify({ ...formData, order: Number(formData.order) })
      });
      if (!res.ok) throw new Error();
      showToast(currentFaq ? 'FAQ updated' : 'FAQ created', 'success');
      setIsModalOpen(false);
      fetchFAQs();
    } catch { showToast('Failed to save FAQ', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!currentFaq) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/faqs/${currentFaq._id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error();
      showToast('FAQ deleted', 'success');
      setIsDeleteModalOpen(false);
      fetchFAQs();
    } catch { showToast('Failed to delete FAQ', 'error'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="animate-in fade-in duration-500 relative">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-xl flex items-center ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}
      <header className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 pb-6 pt-0 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="pt-6">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Manage FAQs</h1>
          <p className="text-zinc-400">Add, edit, or remove frequently asked questions shown on the landing page.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shrink-0">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add FAQ
        </button>
      </header>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />)}</div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-2">No FAQs yet</h2>
          <p className="text-zinc-400 mb-4">Add your first FAQ to display on the landing page.</p>
          <button onClick={() => handleOpenModal()} className="px-6 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">Add FAQ</button>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={faq._id} className="bg-black/20 border border-white/10 rounded-xl p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">{faq.order}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold text-sm truncate">{faq.question}</h3>
                  {!faq.isActive && <span className="text-[10px] font-bold bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded uppercase">Hidden</span>}
                </div>
                <p className="text-zinc-500 text-xs line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleOpenModal(faq)} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button onClick={() => { setCurrentFaq(faq); setIsDeleteModalOpen(true); }} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{currentFaq ? 'Edit FAQ' : 'New FAQ'}</h3>
              <button disabled={submitting} onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Question</label>
                <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} placeholder="Which payment methods do you accept?" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Answer</label>
                <textarea required rows={4} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 resize-none" value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} placeholder="We accept..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Order (position)</label>
                  <input type="number" min="0" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" value={formData.order} onChange={e => setFormData({...formData, order: e.target.value})} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="mr-2 w-4 h-4 rounded" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                    <span className="text-sm text-zinc-300">Visible on site</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                <button type="button" disabled={submitting} onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-zinc-300 hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex items-center px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors">
                  {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />}Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && currentFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !submitting && setIsDeleteModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-2">Delete FAQ?</h3>
            <p className="text-zinc-400 text-sm mb-6">Remove "{currentFaq.question.slice(0, 50)}..."?</p>
            <div className="flex gap-3">
              <button disabled={submitting} onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-xl font-medium bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors">Cancel</button>
              <button disabled={submitting} onClick={handleDelete} className="flex-1 py-2.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 flex items-center justify-center">
                {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />}Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
