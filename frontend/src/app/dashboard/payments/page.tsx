"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';
import Link from 'next/link';

interface Payment {
  _id: string;
  user: { name: string; email: string };
  plan: { name: string; durationInDays: number };
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'declined';
  createdAt: string;
}

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${API_URL}/api/payments/history`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setPayments(data);
        }
      } catch (error) {
        console.error("Failed to fetch payments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user]);

  if (loading) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-500">
        <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-6 mb-8 flex flex-col justify-center">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Payment History</h1>
          <p className="text-zinc-400 text-sm">Loading your transactions...</p>
        </header>

        <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl border border-white/5" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-6 mb-8 flex flex-col justify-center">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Payment History</h1>
        <p className="text-zinc-400 text-sm">View all your past and pending subscriptions.</p>
      </header>

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-8">
      {payments.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No payments yet</h2>
          <p className="text-zinc-400 mb-6">You haven't made any purchases. Once you subscribe, your receipts will appear here.</p>
          <Link href="/dashboard/plans" className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            View Plans
          </Link>
        </div>
      ) : (
        <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-zinc-400 border-b border-white/10 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Method</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {payments.map(payment => (
                  <tr key={payment._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      {new Date(payment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{payment.plan?.name || "Unknown Plan"}</td>
                    <td className="px-6 py-4 font-bold">{payment.currency} {payment.amount}</td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-zinc-400 bg-white/5 px-2.5 py-1 rounded-md text-xs">
                        {payment.method === 'mpesa_manual' ? 'M-Pesa (Manual)' : 
                         payment.method === 'paypal_ff' ? 'PayPal F&F' : 
                         payment.method === 'till' ? 'M-Pesa Till' :
                         payment.method === 'airtel' ? 'Airtel Money' :
                         payment.method?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                        ${payment.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          payment.status === 'declined' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {payment.status === 'completed' ? 'Completed' : 
                          payment.status === 'declined' ? 'Declined' : 
                          'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
