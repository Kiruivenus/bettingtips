"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tips: 0, plans: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tipsRes, plansRes] = await Promise.all([
          fetch(`${API_URL}/api/tips`),
          fetch(`${API_URL}/api/plans`)
        ]);
        
        const tips = tipsRes.ok ? await tipsRes.json() : [];
        const plans = plansRes.ok ? await plansRes.json() : [];
        
        setStats({ tips: tips.length, plans: plans.length });
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <header className="mb-8 border-b border-white/5 pb-6">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">System Overview</h1>
        <p className="text-zinc-400">Welcome back, {user?.name}. Here's what's happening today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20" />
          <h3 className="text-zinc-400 font-medium text-sm mb-1 z-10 relative">Total Tips</h3>
          {loading ? (
            <div className="h-10 w-16 bg-white/10 animate-pulse rounded z-10 relative mt-2" />
          ) : (
            <div className="text-4xl font-extrabold text-white z-10 relative">{stats.tips}</div>
          )}
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20" />
          <h3 className="text-zinc-400 font-medium text-sm mb-1 z-10 relative">Subscription Plans</h3>
          {loading ? (
            <div className="h-10 w-16 bg-white/10 animate-pulse rounded z-10 relative mt-2" />
          ) : (
            <div className="text-4xl font-extrabold text-white z-10 relative">{stats.plans}</div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-black/20 border border-white/10 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/tips" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Post New Tip</h4>
                  <p className="text-xs text-zinc-500">Publish a premium or free prediction</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
            
            <Link href="/admin/plans" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Edit Subscriptions</h4>
                  <p className="text-xs text-zinc-500">Modify pricing and plan details</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
