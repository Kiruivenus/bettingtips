"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';

interface Payment {
  _id: string;
  user: { name: string; email: string };
  plan: { name: string; durationInDays: number };
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'declined';
  transactionId: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/payments`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPayments(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (error) {
      showToast('Error fetching payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchPayments();
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (paymentId: string, action: 'approve' | 'reject') => {
    setProcessingId(paymentId);
    try {
      const res = await fetch(`${API_URL}/api/payments/${action}/${paymentId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error(`Failed to ${action}`);
      
      showToast(`Payment ${action === 'approve' ? 'approved' : 'declined'} successfully`, 'success');
      fetchPayments();
    } catch (error) {
      showToast(`Failed to ${action} payment`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPayments = payments.filter(p => filterStatus === 'all' || p.status === filterStatus);

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
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Financial Verification</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Payment Receipts & Subscriptions</h1>
          <p className="text-xs text-zinc-400">Audit transaction references and authorize manual subscription requests.</p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 w-full sm:w-40 rounded bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="completed">Completed</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden font-numeric">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Plan / Gateway</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">Loading payment ledger...</td>
                </tr>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="block font-semibold text-zinc-100">{p.user?.name || 'User'}</span>
                      <span className="text-[11px] text-zinc-500">{p.user?.email || '-'} • {new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="block font-semibold text-zinc-200">{p.plan?.name || 'VIP Package'}</span>
                      <span className="text-[11px] text-zinc-500 uppercase">Method: {p.method} • Ref: {p.transactionId || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      ${p.amount} {p.currency || 'USD'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.status === 'completed' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold text-[10px]">
                          COMPLETED
                        </span>
                      ) : p.status === 'declined' ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-bold text-[10px]">
                          DECLINED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-bold text-[10px]">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAction(p._id, 'approve')}
                            disabled={processingId === p._id}
                            className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 text-[10px] font-semibold transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(p._id, 'reject')}
                            disabled={processingId === p._id}
                            className="px-2 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-800 text-[10px] font-semibold transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-[11px]">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">No payment records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
