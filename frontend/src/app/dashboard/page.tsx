"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';

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

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const userActivePlan = user?.activePlan;
  const isSubscriptionActive = user?.subscriptionExpiry
    ? new Date(user.subscriptionExpiry) > new Date()
    : false;

  useEffect(() => {
    refreshUser(); // Sync user state on dashboard entry
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_URL}/api/plans`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setPlans(data.filter((p: Plan) => p.isActive));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const isPlanOwned = (planId: string) => {
    if (!isSubscriptionActive || !userActivePlan) return false;
    const activeId = typeof userActivePlan === 'string' ? userActivePlan : userActivePlan._id;
    return activeId === planId;
  };

  const colors = [
    { border: 'border-blue-500/30', glow: 'shadow-[0_0_25px_rgba(59,130,246,0.1)]', accent: 'text-blue-400', bg: 'from-blue-500/10 to-blue-500/5', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', btn: 'bg-blue-500 hover:bg-blue-600' },
    { border: 'border-purple-500/30', glow: 'shadow-[0_0_25px_rgba(168,85,247,0.1)]', accent: 'text-purple-400', bg: 'from-purple-500/10 to-purple-500/5', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', btn: 'bg-purple-500 hover:bg-purple-600' },
    { border: 'border-amber-500/30', glow: 'shadow-[0_0_25px_rgba(245,158,11,0.1)]', accent: 'text-amber-400', bg: 'from-amber-500/10 to-amber-500/5', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', btn: 'bg-amber-500 hover:bg-amber-600' },
    { border: 'border-rose-500/30', glow: 'shadow-[0_0_25px_rgba(244,63,94,0.1)]', accent: 'text-rose-400', bg: 'from-rose-500/10 to-rose-500/5', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', btn: 'bg-rose-500 hover:bg-rose-600' },
    { border: 'border-cyan-500/30', glow: 'shadow-[0_0_25px_rgba(6,182,212,0.1)]', accent: 'text-cyan-400', bg: 'from-cyan-500/10 to-cyan-500/5', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', btn: 'bg-cyan-500 hover:bg-cyan-600' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">My Plans</h1>
        <p className="text-zinc-400 text-sm">Choose a plan to view today's expert predictions.</p>
      </header>

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {/* Sorting Logic: 
                1. If there is an active primitive plan, show it first.
                2. Then show the Free Plan card.
                3. Then show all other premium plans (locked).
            */}

            {/* 1. Active Premium Plan (if any) */}
            {plans.filter(p => isPlanOwned(p._id)).map((plan, idx) => {
              const c = colors[plans.indexOf(plan) % colors.length];
              return (
                <Link
                  key={plan._id}
                  href={`/dashboard/games/${plan._id}`}
                  className={`group relative overflow-hidden rounded-2xl border ${c.border} bg-gradient-to-b ${c.bg} p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${c.glow}`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                  <div className="flex items-center justify-between mb-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${c.badge}`}>
                      {plan.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">Active</span>
                      <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center`}>
                        <svg className={`w-4 h-4 ${c.accent}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-zinc-400 mb-4 flex-1">Access premium predictions with up to {plan.maxOdds} odds.</p>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span className={`text-2xl font-extrabold ${c.accent}`}>{plan.currency} {plan.price}</span>
                    <span className="text-xs text-zinc-500">/ {plan.durationInDays} days</span>
                  </div>

                  {plan.features?.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {plan.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                          <svg className={`w-3.5 h-3.5 ${c.accent} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className={`mt-auto flex items-center justify-center h-11 rounded-xl font-bold text-sm text-white ${c.btn} transition-colors`}>
                    View Games →
                  </div>
                </Link>
              );
            })}

            {/* 2. Free Plan Card */}
            <Link
              href="/dashboard/games/free"
              className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.08)]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                  Free Plan
                </span>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Free Betting Tips</h3>
              <p className="text-sm text-zinc-400 mb-6 flex-1">Access our daily free predictions with full transparency and verified results.</p>

              <div className="flex items-center gap-3 mb-6">
                <div className="text-2xl font-extrabold text-emerald-400">FREE</div>
                <span className="text-xs text-zinc-500">/ forever</span>
              </div>

              <ul className="space-y-2 mb-6">
                {['Daily free predictions', 'Full results archive', 'Basic match analysis'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-center justify-center h-11 rounded-xl font-bold text-sm text-black bg-emerald-400 group-hover:bg-emerald-300 transition-colors shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                Claim Free Bet
              </div>
            </Link>

            {/* 3. Other Premium Plan Cards (Locked) */}
            {plans.filter(p => !isPlanOwned(p._id)).map((plan, idx) => {
              const originalIdx = plans.indexOf(plan);
              const c = colors[originalIdx % colors.length];

              return (
                <Link
                  key={plan._id}
                  href="/dashboard/buy-tips"
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                  {/* Lock Overlay */}
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
                    <div className="flex flex-col items-center text-center px-6">
                      <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <p className="text-white font-bold text-sm mb-1">Upgrade to Unlock</p>
                      <p className="text-zinc-400 text-xs">Purchase this plan to access premium tips</p>
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/10 text-xs font-bold uppercase tracking-wider">
                      {plan.name}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-zinc-500 mb-4 flex-1">Up to {plan.maxOdds} odds premium predictions.</p>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-2xl font-extrabold text-zinc-400">{plan.currency} {plan.price}</span>
                    <span className="text-xs text-zinc-600">/ {plan.durationInDays} days</span>
                  </div>

                  {plan.features?.length > 0 && (
                    <ul className="space-y-2 mb-6 opacity-50">
                      {plan.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-zinc-500">
                          <svg className="w-3.5 h-3.5 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto flex items-center justify-center h-11 rounded-xl font-bold text-sm text-zinc-400 bg-white/5 border border-white/10 group-hover:border-amber-500/30 group-hover:text-amber-400 transition-all">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Locked – Buy Plan
                  </div>
                </Link>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}
