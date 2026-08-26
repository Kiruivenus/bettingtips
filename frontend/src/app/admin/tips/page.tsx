"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

interface Tip {
  _id: string;
  externalFixtureId?: string;
  homeTeam?: string;
  awayTeam?: string;
  match: string;
  league: string;
  predictionType?: '1X2' | 'BTTS' | 'OVER_UNDER_2_5' | 'CORRECT_SCORE' | 'CUSTOM';
  selection?: string;
  prediction: string;
  probability?: number;
  confidence: number;
  referenceOdds?: number | null;
  odds: number;
  accessLevel?: 'FREE' | 'VIP_BASIC' | 'VIP_PREMIUM' | 'VIP_ELITE' | 'VIP';
  status: 'UPCOMING' | 'ACTIVE' | 'LOCKED' | 'COMPLETED' | 'VOID' | 'FAILED' | 'pending' | 'won' | 'lost';
  source?: string;
  isPremium: boolean;
  matchDate: string;
  planIds?: Array<{ _id: string; name: string }>;
  result?: string;
  createdAt?: string;
}

interface Plan {
  _id: string;
  name: string;
}

interface AutoGenResult {
  success: boolean;
  fixturesScanned: number;
  predictionsCreated: number;
  duplicatesSkipped: number;
  invalidFixtures: number;
  errors: number;
  message: string;
}

export default function AdminTipsPage() {
  const { user } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [autoGenResultModal, setAutoGenResultModal] = useState<AutoGenResult | null>(null);
  
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
  const [autoGenerating, setAutoGenerating] = useState(false);
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

  const handleAutoGenerate = async () => {
    if (autoGenerating) return;
    try {
      setAutoGenerating(true);
      const res = await fetch(`${API_URL}/api/tips/auto-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        }
      });
      const data: AutoGenResult = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to execute auto-generation');
      }

      setAutoGenResultModal(data);
      fetchTips();
    } catch (error: any) {
      showToast(error.message || 'Error executing prediction generation', 'error');
    } finally {
      setAutoGenerating(false);
    }
  };

  const handleOpenModal = (tip?: Tip) => {
    if (tip) {
      setCurrentTip(tip);
      setFormData({
        match: tip.match,
        league: tip.league,
        odds: tip.referenceOdds ? tip.referenceOdds.toString() : (tip.odds ? tip.odds.toString() : ''),
        prediction: tip.prediction || tip.selection || '',
        confidence: tip.confidence ? tip.confidence.toString() : '80',
        matchDate: new Date(tip.matchDate).toISOString().slice(0, 16),
        status: tip.status,
        isPremium: tip.isPremium || tip.accessLevel === 'VIP',
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
      odds: formData.odds ? Number(formData.odds) : 0,
      referenceOdds: formData.odds ? Number(formData.odds) : null,
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
          <p className="text-xs text-zinc-400">Automated ESPN AI sync, settlement resolution, and access enforcement.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoGenerate}
            isLoading={autoGenerating}
            disabled={autoGenerating}
            className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-950/50 disabled:opacity-50"
          >
            ⚡ Sync Now
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
            + Manual Override
          </Button>
        </div>
      </div>

      {/* Automated Engine Banner */}
      <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-3.5 flex items-center justify-between text-xs text-emerald-300">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div>
            <span className="font-bold text-white">🤖 Automated AI Entry & Plan Allocation Active</span>
            <p className="text-emerald-400/80 text-[11px]">Upcoming games are automatically fetched from ESPN, analyzed by AI, and allocated across all active subscription plans every 15 minutes. Zero manual entry required.</p>
          </div>
        </div>
      </div>

      {/* Predictions Data Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden font-numeric">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">Fixture / League</th>
                <th className="py-3 px-4">Market / Selection</th>
                <th className="py-3 px-4 text-center">Prob / Conf</th>
                <th className="py-3 px-4 text-right">Odds</th>
                <th className="py-3 px-4 text-center">Access</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">Loading prediction records...</td>
                </tr>
              ) : tips.length > 0 ? (
                tips.map((tip) => {
                  const displayOdds = tip.referenceOdds || tip.odds;
                  const isFree = !tip.isPremium || tip.accessLevel === 'FREE';

                  return (
                    <tr key={tip._id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="block font-semibold text-zinc-100">{tip.match}</span>
                        <span className="text-[11px] text-zinc-500">
                          {tip.league} • {new Date(tip.matchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium">
                          {tip.prediction || tip.selection}
                        </span>
                        {tip.predictionType && (
                          <span className="ml-1 text-[10px] text-zinc-500 uppercase font-mono">[{tip.predictionType}]</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] font-medium text-zinc-300">
                          {tip.probability ? `${tip.probability}%` : 'N/A'} / {tip.confidence}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        {displayOdds && displayOdds > 0 ? (
                          <span className="text-emerald-400">{displayOdds.toFixed(2)}</span>
                        ) : (
                          <span className="text-zinc-500 text-[10px] font-normal">Odds unavailable</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!isFree ? (
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
                        {tip.status === 'won' || tip.status === 'COMPLETED' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold text-[10px]">
                            WON {tip.result ? `(${tip.result})` : ''}
                          </span>
                        ) : tip.status === 'lost' ? (
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-bold text-[10px]">
                            LOST {tip.result ? `(${tip.result})` : ''}
                          </span>
                        ) : tip.status === 'LOCKED' ? (
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 font-bold text-[10px]">
                            LOCKED
                          </span>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleQuickUpdate(tip._id, 'won')}
                              disabled={quickUpdating === tip._id}
                              className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 text-[10px] font-semibold transition-colors"
                            >
                              Won
                            </button>
                            <button
                              onClick={() => handleQuickUpdate(tip._id, 'lost')}
                              disabled={quickUpdating === tip._id}
                              className="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-800 text-[10px] font-semibold transition-colors"
                            >
                              Lost
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">No prediction records registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auto-Generation Result Breakdown Modal */}
      {autoGenResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                AI Prediction Generation Completed
              </h3>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span>Predictions created</span>
                <span className="font-bold text-emerald-400 font-numeric">{autoGenResultModal.predictionsCreated}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span>Existing predictions skipped</span>
                <span className="font-bold text-amber-400 font-numeric">{autoGenResultModal.duplicatesSkipped}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span>Fixtures unavailable</span>
                <span className="font-bold text-zinc-400 font-numeric">{autoGenResultModal.invalidFixtures}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Generation errors</span>
                <span className="font-bold text-rose-400 font-numeric">{autoGenResultModal.errors}</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 bg-zinc-950 p-2.5 rounded border border-zinc-800">
              {autoGenResultModal.message}
            </p>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setAutoGenResultModal(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

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
                  <label className="block text-zinc-300 font-medium mb-1">Odds (Leave empty if unavailable)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.odds}
                    onChange={(e) => setFormData({ ...formData, odds: e.target.value })}
                    placeholder="e.g. 1.85"
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
