"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

interface Tip {
  _id: string;
  match: string;
  league: string;
  odds: number;
  prediction: string;
  confidence: number;
  matchDate: string;
  status: 'pending' | 'won' | 'lost';
  isPremium: boolean;
  planIds?: Array<{ _id: string; name: string }>;
  result?: string;
}

interface Plan {
  _id: string;
  name: string;
}

export default function AdminTipsPage() {
  const { user } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [formData, setFormData] = useState({
    match: '',
    league: '',
    odds: '',
    prediction: '',
    confidence: '80',
    matchDate: '',
    status: 'pending',
    isPremium: false,
    planIds: [] as string[],
    result: ''
  });
  
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [quickResults, setQuickResults] = useState<Record<string, string>>({});
  const [quickUpdating, setQuickUpdating] = useState<string | null>(null);

  const fetchTips = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/tips`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setTips(data);
    } catch (error) {
      showToast('Error fetching tips', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_URL}/api/plans`);
      const data = await res.json();
      if (Array.isArray(data)) setPlans(data);
    } catch (error) {
      console.error('Error fetching plans', error);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTips();
      fetchPlans();
    }
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (tip?: Tip) => {
    if (tip) {
      setCurrentTip(tip);
      setFormData({
        match: tip.match,
        league: tip.league,
        odds: tip.odds.toString(),
        prediction: tip.prediction,
        confidence: tip.confidence.toString(),
        matchDate: new Date(tip.matchDate).toISOString().slice(0, 16),
        status: tip.status,
        isPremium: tip.isPremium,
        planIds: Array.isArray(tip.planIds) ? tip.planIds.map((p: any) => typeof p === 'object' ? p._id : p) : [],
        result: tip.result || ''
      });
    } else {
      setCurrentTip(null);
      setFormData({
        match: '', league: '', odds: '', prediction: '',
        confidence: '80', matchDate: new Date().toISOString().slice(0, 16),
        status: 'pending', isPremium: false, planIds: [] as string[],
        result: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const url = currentTip 
      ? `${API_URL}/api/tips/${currentTip._id}`
      : `${API_URL}/api/tips`;
    const method = currentTip ? 'PUT' : 'POST';
    
    const payload = {
      ...formData,
      odds: Number(formData.odds),
      confidence: Number(formData.confidence),
      planIds: formData.isPremium ? formData.planIds : []
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save tip');

      showToast(currentTip ? 'Tip updated successfully' : 'Tip created successfully', 'success');
      setIsModalOpen(false);
      fetchTips();
    } catch (error) {
      showToast('Failed to save tip', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentTip) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/tips/${currentTip._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      showToast('Tip deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      fetchTips();
    } catch (error) {
      showToast('Failed to delete tip', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickUpdate = async (tipId: string, status: 'won' | 'lost') => {
    setQuickUpdating(tipId);
    try {
      const res = await fetch(`${API_URL}/api/tips/${tipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status, result: quickResults[tipId] || '' })
      });
      if (!res.ok) throw new Error('Failed to update');
      showToast(`Tip marked as ${status}`, 'success');
      fetchTips();
    } catch (error) {
      showToast('Failed to update tip', 'error');
    } finally {
      setQuickUpdating(null);
    }
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
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Content Control</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Predictions & Tips Management</h1>
          <p className="text-xs text-zinc-400">Create, edit, settlement resolution, and tier assignments.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
          + Create New Tip
        </Button>
      </div>

      {/* Predictions Data Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden font-numeric">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">Fixture / League</th>
                <th className="py-3 px-4">Prediction</th>
                <th className="py-3 px-4 text-right">Odds</th>
                <th className="py-3 px-4 text-center">Tier</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">Loading prediction records...</td>
                </tr>
              ) : tips.length > 0 ? (
                tips.map((tip) => (
                  <tr key={tip._id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="block font-semibold text-zinc-100">{tip.match}</span>
                      <span className="text-[11px] text-zinc-500">{tip.league} • {new Date(tip.matchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium">
                        {tip.prediction}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">{tip.odds.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      {tip.isPremium ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/50 text-[10px] font-bold">
                          VIP
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px]">
                          FREE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {tip.status === 'won' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold text-[10px]">
                          WON
                        </span>
                      ) : tip.status === 'lost' ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-bold text-[10px]">
                          LOST
                        </span>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleQuickUpdate(tip._id, 'won')}
                            disabled={quickUpdating === tip._id}
                            className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 text-[10px] font-semibold transition-colors"
                          >
                            Mark Won
                          </button>
                          <button
                            onClick={() => handleQuickUpdate(tip._id, 'lost')}
                            disabled={quickUpdating === tip._id}
                            className="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-800 text-[10px] font-semibold transition-colors"
                          >
                            Mark Lost
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(tip)}
                        className="text-xs text-zinc-400 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setCurrentTip(tip); setIsDeleteModalOpen(true); }}
                        className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">No prediction records registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">
              {currentTip ? 'Edit Prediction Entry' : 'Create New Prediction Entry'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Fixture Match Name *</label>
                <input
                  type="text"
                  required
                  value={formData.match}
                  onChange={(e) => setFormData({ ...formData, match: e.target.value })}
                  placeholder="e.g. Arsenal vs Chelsea"
                  className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">League *</label>
                  <input
                    type="text"
                    required
                    value={formData.league}
                    onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                    placeholder="e.g. Premier League"
                    className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Odds *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.odds}
                    onChange={(e) => setFormData({ ...formData, odds: e.target.value })}
                    placeholder="1.85"
                    className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-numeric"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Prediction Selection *</label>
                  <input
                    type="text"
                    required
                    value={formData.prediction}
                    onChange={(e) => setFormData({ ...formData, prediction: e.target.value })}
                    placeholder="e.g. Home Win / Over 2.5"
                    className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Kickoff Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.matchDate}
                    onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                    className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-numeric"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                    className="rounded border-zinc-800 bg-zinc-950 text-emerald-500 focus:ring-0"
                  />
                  <span className="text-zinc-200 font-semibold">VIP Premium Pick</span>
                </label>
              </div>

              {formData.isPremium && (
                <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                  <label className="block text-zinc-300 font-medium">Assign VIP Subscription Plans</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto p-2 bg-zinc-950 rounded border border-zinc-800">
                    {plans.map(plan => (
                      <label key={plan._id} className="flex items-center gap-2 text-zinc-300">
                        <input
                          type="checkbox"
                          checked={formData.planIds.includes(plan._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, planIds: [...formData.planIds, plan._id] });
                            } else {
                              setFormData({ ...formData, planIds: formData.planIds.filter(id => id !== plan._id) });
                            }
                          }}
                        />
                        <span>{plan.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-sm space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Confirm Deletion</h3>
            <p className="text-zinc-400">Are you sure you want to permanently remove this prediction entry?</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete} isLoading={submitting}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
