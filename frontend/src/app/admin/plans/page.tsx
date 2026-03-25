"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Plan {
  _id: string;
  name: string;
  price: number;
  currency: string;
  durationInDays: number;
  features: string[];
  maxOdds: number;
  isActive: boolean;
}

export default function AdminPlansPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    currency: 'USD',
    durationInDays: '',
    features: '',
    maxOdds: '',
    isActive: true
  });
  
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/plans', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      showToast('Error fetching plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchPlans();
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (plan?: Plan) => {
    if (plan) {
      setCurrentPlan(plan);
      setFormData({
        name: plan.name,
        price: plan.price.toString(),
        currency: plan.currency,
        durationInDays: plan.durationInDays.toString(),
        features: plan.features.join(', '),
        maxOdds: (plan.maxOdds || 0).toString(),
        isActive: plan.isActive
      });
    } else {
      setCurrentPlan(null);
      setFormData({ name: '', price: '', currency: 'USD', durationInDays: '', features: '', maxOdds: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const url = currentPlan 
      ? `http://localhost:5000/api/plans/${currentPlan._id}`
      : 'http://localhost:5000/api/plans';
      
    const method = currentPlan ? 'PUT' : 'POST';
    
    const payload = {
      name: formData.name,
      price: Number(formData.price),
      currency: formData.currency,
      durationInDays: Number(formData.durationInDays),
      features: formData.features.split(',').map(f => f.trim()).filter(f => f.length > 0),
      maxOdds: Number(formData.maxOdds) || 0,
      isActive: formData.isActive
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

      if (!res.ok) throw new Error('Failed to save plan');

      showToast(currentPlan ? 'Plan updated successfully' : 'Plan created successfully', 'success');
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      showToast('Failed to save plan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentPlan) return;
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/plans/${currentPlan._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      showToast('Plan deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      fetchPlans();
    } catch (error) {
      showToast('Failed to delete plan', 'error');
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
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Manage Plans</h1>
          <p className="text-zinc-400">Create, edit, and configure subscription tiers.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add New Plan
        </button>
      </header>

      {/* Main Content */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-2xl border border-white/5" />)}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No plans yet</h2>
          <p className="text-zinc-400 mb-6">You haven't created any subscription plans. Click 'Add Plan' to create one.</p>
          <button onClick={() => handleOpenModal()} className="px-6 py-2.5 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors">
            Configure First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan._id} className={`bg-black/20 border ${plan.isActive ? 'border-amber-500/20' : 'border-white/5'} rounded-2xl p-6 relative overflow-hidden flex flex-col`}>
              {plan.isActive && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10" />}
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${plan.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-amber-400">
                    {plan.currency} {plan.price}
                    <span className="text-sm text-zinc-500 font-medium ml-1">/ {plan.durationInDays} days</span>
                  </div>
                  {plan.maxOdds > 0 && (
                    <div className="text-xs text-emerald-400 font-bold mt-1">Up to {plan.maxOdds} odds included</div>
                  )}
                </div>
              </div>

              <div className="flex-1 mb-6 relative z-10">
                <ul className="space-y-2">
                  {plan.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-start text-sm text-zinc-300">
                      <svg className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-xs text-zinc-500 italic">+{plan.features.length - 4} more features</li>
                  )}
                </ul>
              </div>

              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5 relative z-10">
                <button 
                  onClick={() => handleOpenModal(plan)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm font-medium py-2 rounded-xl border border-white/10 transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => { setCurrentPlan(plan); setIsDeleteModalOpen(true); }}
                  className="flex-none p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{currentPlan ? 'Edit Configuration' : 'Create New Plan'}</h3>
              <button disabled={submitting} onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Plan Name</label>
                  <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. VIP Access" />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Price</label>
                  <input required type="number" step="0.01" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50" 
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Duration (Days)</label>
                  <input required type="number" min="1" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50" 
                    value={formData.durationInDays} onChange={e => setFormData({...formData, durationInDays: e.target.value})} placeholder="30" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Max Odds Included</label>
                  <input type="number" min="0" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50" 
                    value={formData.maxOdds} onChange={e => setFormData({...formData, maxOdds: e.target.value})} placeholder="e.g. 50" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Features (comma separated)</label>
                  <textarea required rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 resize-none" 
                    value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} placeholder="Daily picks, 90% Win rate, Premium support..." />
                </div>

                <div className="col-span-2 flex items-center mt-2">
                  <input type="checkbox" id="isActive" className="w-4 h-4 rounded bg-black/40 border-white/10 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-900" 
                    checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                  <label htmlFor="isActive" className="ml-2 text-sm text-zinc-300">Plan is active and visible to users</label>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button type="button" disabled={submitting} onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-zinc-300 hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex items-center justify-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold transition-all disabled:opacity-50">
                  {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : null}
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !submitting && setIsDeleteModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Plan?</h3>
            <p className="text-zinc-400 text-sm mb-6">Are you sure you want to permanently remove "{currentPlan.name}"? This action cannot be undone.</p>
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
