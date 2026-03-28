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
  
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/payments`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      // Sort newest first
      setPayments(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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
      
      showToast(`Payment ${action}d successfully`, 'success');
      fetchPayments();
    } catch (error) {
      showToast(`Failed to ${action} payment`, 'error');
    } finally {
      setProcessingId(null);
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

      <header className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 pb-6 pt-0 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 mb-8">
        <div className="pt-6">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Manage Transactions</h1>
          <p className="text-zinc-400">Review automated receipts and manually approve specific payment flows.</p>
        </div>
      </header>

      {/* Main Content */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl border border-white/5" />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white/5 border border-white/10 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-2">No transactions</h2>
          <p className="text-zinc-400 mb-6">No payments have been recorded in the platform yet.</p>
        </div>
      ) : (
        <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-zinc-400 border-b border-white/10 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Txn Details</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Receipt Info</th>
                  <th className="px-6 py-4 font-medium">Status / Method</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {payments.map(p => (
                  <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white mb-0.5">{p.currency} {p.amount}</div>
                      <div className="text-xs text-zinc-500">{new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="px-6 py-4">
                      {p.user ? (
                        <>
                          <div className="font-bold text-zinc-300">{p.user.name}</div>
                          <div className="text-[10px] text-zinc-500">{p.user.email}</div>
                        </>
                      ) : (
                        <span className="text-zinc-500 italic">User removed</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-amber-400 font-bold text-xs">{p.plan?.name || 'Unknown Plan'}</span>
                        <span className="text-[10px] text-zinc-500 font-mono tracking-wider max-w-[150px] truncate" title={p.transactionId}>
                          ID: {p.transactionId || '---'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 w-max">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase
                          ${p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            p.status === 'declined' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {p.status}
                        </span>
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-zinc-400 border border-white/10">
                          {p.method === 'mpesa_manual' ? 'M-Pesa (Manual)' : 
                           p.method === 'paypal_ff' ? 'PayPal F&F' : 
                           p.method === 'till' ? 'M-Pesa Till' :
                           p.method === 'airtel' ? 'Airtel Money' :
                           p.method?.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status === 'pending' ? (
                        processingId === p._id ? (
                          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block mr-8" />
                        ) : (
                          <div className="flex items-center justify-end gap-2 text-xs">
                            <button 
                              onClick={() => handleAction(p._id, 'approve')}
                              className="px-3 py-1.5 rounded-lg font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleAction(p._id, 'reject')}
                              className="px-3 py-1.5 rounded-lg font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="text-[10px] text-zinc-500 italic uppercase">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
