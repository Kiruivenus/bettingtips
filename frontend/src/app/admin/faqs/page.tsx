"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

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
      if (Array.isArray(data)) setFaqs(data);
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
    const payload = { ...formData, order: Number(formData.order) };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save FAQ');
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
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('FAQ deleted', 'success');
      setIsDeleteModalOpen(false);
      fetchFAQs();
    } catch { showToast('Failed to delete FAQ', 'error'); }
    finally { setSubmitting(false); }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Knowledge Base</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">FAQ Management</h1>
          <p className="text-xs text-zinc-400">Create and re-order frequently asked questions for public display.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
          + Create New FAQ
        </Button>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden font-numeric">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Question</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500">Loading FAQ records...</td>
                </tr>
              ) : faqs.length > 0 ? (
                faqs.map((f) => (
                  <tr key={f._id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-zinc-300">#{f.order}</td>
                    <td className="py-3 px-4">
                      <span className="block font-semibold text-zinc-100">{f.question}</span>
                      <span className="text-[11px] text-zinc-500 line-clamp-1">{f.answer}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {f.isActive ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px]">
                          HIDDEN
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(f)}
                        className="text-xs text-zinc-400 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setCurrentFaq(f); setIsDeleteModalOpen(true); }}
                        className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500">No FAQ entries registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-lg space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">
              {currentFaq ? 'Edit FAQ Entry' : 'Create FAQ Entry'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Question Title *</label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. Which payment methods are supported?"
                  className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Answer Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Provide clear, concise instructions..."
                  className="w-full rounded bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Display Priority Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-numeric"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-zinc-800 bg-zinc-950 text-emerald-500 focus:ring-0"
                    />
                    <span className="text-zinc-200 font-semibold">Active & Visible</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                  Save Entry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-sm space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Confirm Deletion</h3>
            <p className="text-zinc-400">Are you sure you want to delete this FAQ entry?</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete} isLoading={submitting}>
                Delete Entry
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
