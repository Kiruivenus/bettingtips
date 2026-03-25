"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';

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
  planId?: {
    _id: string;
    name: string;
  };
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
    planId: ''
  });
  
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTips = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/tips`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setTips(data);
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
      setPlans(data);
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
        planId: typeof tip.planId === 'object' ? tip.planId?._id || '' : (tip.planId || '')
      });
    } else {
      setCurrentTip(null);
      setFormData({
        match: '', league: '', odds: '', prediction: '',
        confidence: '80', matchDate: new Date().toISOString().slice(0, 16),
        status: 'pending', isPremium: false, planId: ''
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
      planId: formData.isPremium ? formData.planId : null
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

  return (
    <div className="animate-in fade-in duration-500 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-xl flex items-center transition-all ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <div className="mr-3">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      <header className="mb-8 border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Manage Tips</h1>
          <p className="text-zinc-400">Post new match predictions, update outcomes, and manage visibility.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Post New Tip
        </button>
      </header>

      {/* Main Content */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl border border-white/5" />)}
        </div>
      ) : tips.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No betting tips found</h2>
          <p className="text-zinc-400 mb-6">Start by providing value to your users! Click 'Post New Tip'</p>
          <button onClick={() => handleOpenModal()} className="px-6 py-2.5 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors">
            Create First Tip
          </button>
        </div>
      ) : (
        <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-zinc-400 border-b border-white/10 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Match Details</th>
                  <th className="px-6 py-4 font-medium">Prediction</th>
                  <th className="px-6 py-4 font-medium">Stats</th>
                  <th className="px-6 py-4 font-medium">Status / Tier</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {tips.map(tip => (
                  <tr key={tip._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white mb-1">{tip.match}</div>
                      <div className="text-xs text-zinc-500 flex items-center gap-2">
                        <span>{tip.league}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                        <span>{new Date(tip.matchDate).toLocaleDateString()} {new Date(tip.matchDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-amber-400">{tip.prediction}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded w-max">Odds: {tip.odds}</span>
                        <span className="text-xs text-zinc-400">{tip.confidence}% Confidence</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 w-max">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase
                          ${tip.status === 'won' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            tip.status === 'lost' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {tip.status}
                        </span>
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tip.isPremium ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                          {tip.isPremium ? `${tip.planId?.name || 'VIP'} Premium` : 'Free Tip'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(tip)} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors" title="Edit Tip">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => { setCurrentTip(tip); setIsDeleteModalOpen(true); }} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Delete Tip">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-xl overflow-y-auto max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-md px-6 py-4 border-b border-white/5 flex justify-between items-center z-10">
              <h3 className="text-lg font-bold text-white">{currentTip ? 'Edit Prediction' : 'Post Match Prediction'}</h3>
              <button disabled={submitting} onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-5 mb-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Match (e.g. Arsenal vs Chelsea)</label>
                  <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" 
                    value={formData.match} onChange={e => setFormData({...formData, match: e.target.value})} placeholder="Team A vs Team B" />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">League / Tournament</label>
                  <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" 
                    value={formData.league} onChange={e => setFormData({...formData, league: e.target.value})} placeholder="Premier League" />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Prediction</label>
                  <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" 
                    value={formData.prediction} onChange={e => setFormData({...formData, prediction: e.target.value})} placeholder="Over 2.5 Goals" />
                </div>

                <div className="col-span-1 md:col-span-1">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Odds</label>
                  <input required type="number" step="0.01" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" 
                    value={formData.odds} onChange={e => setFormData({...formData, odds: e.target.value})} placeholder="1.85" />
                </div>
                
                <div className="col-span-1 md:col-span-1">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Confidence (%)</label>
                  <input required type="number" min="1" max="100" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" 
                    value={formData.confidence} onChange={e => setFormData({...formData, confidence: e.target.value})} placeholder="80" />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Match Date & Time</label>
                  <input required type="datetime-local" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 [color-scheme:dark]" 
                    value={formData.matchDate} onChange={e => setFormData({...formData, matchDate: e.target.value})} />
                </div>

                <div className="col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-sm font-bold text-white mb-3">Settings</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center mb-3">
                      <input type="checkbox" id="isPremium" className="w-4 h-4 rounded bg-black/40 border-white/10 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900" 
                        checked={formData.isPremium} onChange={e => setFormData({...formData, isPremium: e.target.checked})} />
                      <label htmlFor="isPremium" className="ml-2 text-sm text-zinc-300 font-bold uppercase tracking-wider text-[10px]">VIP Premium Option</label>
                    </div>

                    {formData.isPremium && (
                      <div className="mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Select Subscription Plan</label>
                        <select 
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 text-sm"
                          value={formData.planId}
                          onChange={e => setFormData({...formData, planId: e.target.value})}
                          required={formData.isPremium}
                        >
                          <option value="">-- Associate with a Plan --</option>
                          {plans.map(plan => (
                            <option key={plan._id} value={plan._id}>{plan.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="pt-2 border-t border-white/5">
                      <label className="block text-xs font-medium text-zinc-400 mb-2">Match Status</label>
                      <div className="flex gap-2">
                        {['pending', 'won', 'lost'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setFormData({...formData, status: s})}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border ${
                              formData.status === s 
                                ? s === 'won' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                                : s === 'lost' ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                                : 'bg-white/5 text-zinc-500 border-transparent hover:bg-white/10'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-white/5 pt-4">
                <button type="button" disabled={submitting} onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-zinc-300 hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex items-center justify-center px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors">
                  {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : null}
                  Save Prediction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !submitting && setIsDeleteModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Tip?</h3>
            <p className="text-zinc-400 text-sm mb-6">Are you sure you want to permanently remove "{currentTip.match}" tip? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button disabled={submitting} onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-xl font-medium bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors">Cancel</button>
              <button disabled={submitting} onClick={handleDelete} className="flex-1 py-2.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center">
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
