"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tips: 0, plans: 0, pendingPayments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tipsRes, plansRes, paymentsRes] = await Promise.all([
          fetch(`${API_URL}/api/tips`).catch(() => null),
          fetch(`${API_URL}/api/plans`).catch(() => null),
          fetch(`${API_URL}/api/payments/pending-count`, {
            headers: { 'Authorization': `Bearer ${user?.token}` }
          }).catch(() => null),
        ]);
        
        const tips = tipsRes?.ok ? await tipsRes.json() : [];
        const plans = plansRes?.ok ? await plansRes.json() : [];
        const payments = paymentsRes?.ok ? await paymentsRes.json() : { count: 0 };
        
        setStats({
          tips: Array.isArray(tips) ? tips.length : 0,
          plans: Array.isArray(plans) ? plans.length : 0,
          pendingPayments: payments.count || 0
        });
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchStats();
  }, [user]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Control Center</span>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Overview</h1>
        <p className="text-xs text-zinc-400">Platform operational metrics and quick administrative actions.</p>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-numeric">
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 space-y-1">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-medium">Logged Predictions</span>
          {loading ? (
            <div className="h-7 w-12 bg-zinc-800 animate-pulse rounded" />
          ) : (
            <span className="text-2xl font-bold text-white">{stats.tips}</span>
          )}
        </div>

        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 space-y-1">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-medium">Active VIP Plans</span>
          {loading ? (
            <div className="h-7 w-12 bg-zinc-800 animate-pulse rounded" />
          ) : (
            <span className="text-2xl font-bold text-white">{stats.plans}</span>
          )}
        </div>

        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 space-y-1">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-medium">Pending Verifications</span>
          {loading ? (
            <div className="h-7 w-12 bg-zinc-800 animate-pulse rounded" />
          ) : (
            <span className={`text-2xl font-bold ${stats.pendingPayments > 0 ? 'text-rose-400' : 'text-zinc-200'}`}>
              {stats.pendingPayments}
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Group */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Administrative Tasks</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <Link
            href="/admin/tips"
            className="p-3.5 rounded bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center justify-between text-zinc-200"
          >
            <div>
              <span className="font-semibold block text-white">Post / Manage Predictions</span>
              <span className="text-[11px] text-zinc-500">Publish free or VIP match picks</span>
            </div>
            <span className="text-zinc-500 font-bold">→</span>
          </Link>

          <Link
            href="/admin/payments"
            className="p-3.5 rounded bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center justify-between text-zinc-200"
          >
            <div>
              <span className="font-semibold block text-white">Review Payments</span>
              <span className="text-[11px] text-zinc-500">Verify manual transfers</span>
            </div>
            <span className="text-zinc-500 font-bold">→</span>
          </Link>

          <Link
            href="/admin/users"
            className="p-3.5 rounded bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center justify-between text-zinc-200"
          >
            <div>
              <span className="font-semibold block text-white">Manage User Directory</span>
              <span className="text-[11px] text-zinc-500">Update roles and subscriptions</span>
            </div>
            <span className="text-zinc-500 font-bold">→</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
