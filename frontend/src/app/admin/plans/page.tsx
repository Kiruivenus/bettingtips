"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

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
      const res = await fetch(`${API_URL}/api/plans`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setPlans(data);
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
        currency: plan.currency || 'USD',
        durationInDays: plan.durationInDays.toString(),
        features: plan.features ? plan.features.join('\n') : '',
        maxOdds: plan.maxOdds ? plan.maxOdds.toString() : '5.0',
        isActive: plan.isActive
      });
    } else {
      setCurrentPlan(null);
      setFormData({
        name: '',
        price: '',
        currency: 'USD',
        durationInDays: '30',
        features: '',
        maxOdds: '5.0',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const url = currentPlan 
      ? `${API_URL}/api/plans/${currentPlan._id}`
      : `${API_URL}/api/plans`;
    const method = currentPlan ? 'PUT' : 'POST';
    
    const payload = {
      ...formData,
      price: Number(formData.price),
      durationInDays: Number(formData.durationInDays),
      maxOdds: Number(formData.maxOdds),
      features: formData.features.split('\n').filter(f => f.trim() !== '')
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

      showToast(currentPlan ? 'Plan updated' : 'Plan created', 'success');
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
      const res = await fetch(`${API_URL}/api/plans/${currentPlan._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      showToast('Plan deleted', 'success');
      setIsDeleteModalOpen(false);
      fetchPlans();
    } catch (error) {
      showToast('Failed to delete plan', 'error');
    } finally {
      setSubmitting(false);
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
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Membership Options</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">VIP Subscription Packages</h1>
          <p className="text-xs text-zinc-400">Configure duration, pricing, and feature access tiers.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
          + Create New Package
        </Button>
      </div>

      {/* Data Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden font-numeric">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">Package Name</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">Loading plan packages...</td>
                </tr>
              ) : plans.length > 0 ? (
                plans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-zinc-100">{plan.name}</td>
                    <td className="py-3 px-4 text-zinc-300">{plan.durationInDays} Days</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">${plan.price} {plan.currency}</td>
                    <td className="py-3 px-4 text-center">
                      {plan.isActive ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px]">
                          DISABLED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(plan)}
                        className="text-xs text-zinc-400 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setCurrentPlan(plan); setIsDeleteModalOpen(true); }}
                        className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">No subscription packages configured.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="text-base font-bold text-white">
              {currentPlan ? 'Edit Plan Package' : 'Create Plan Package'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. VIP Monthly Access"
                  className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="29.99"
                    className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-numeric"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Duration (Days) *</label>
                  <input
                    type="number"
                    required
                    value={formData.durationInDays}
                    onChange={(e) => setFormData({ ...formData, durationInDays: e.target.value })}
                    placeholder="30"
                    className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-numeric"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Package Features (One per line)</label>
                <textarea
                  rows={4}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Daily High Odds Picks&#10;Instant SMS & Email Alert&#10;24/7 Analyst Support"
                  className="w-full rounded bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-zinc-800 bg-zinc-950 text-emerald-500 focus:ring-0"
                  />
                  <span className="text-zinc-200 font-semibold">Active & Available for Purchase</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                  Save Package
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
            <p className="text-zinc-400">Are you sure you want to delete this subscription package?</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete} isLoading={submitting}>
                Delete Package
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
