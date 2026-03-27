"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function DashboardBuyTipsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const colors = [
    { border: 'border-blue-500/30', glow: 'bg-blue-500/5', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', btn: 'bg-blue-500 hover:bg-blue-600', accent: 'text-blue-400' },
    { border: 'border-emerald-500/30', glow: 'bg-emerald-500/5', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', btn: 'bg-emerald-500 hover:bg-emerald-600', accent: 'text-emerald-400' },
    { border: 'border-amber-500/30', glow: 'bg-amber-500/5', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', btn: 'bg-amber-500 hover:bg-amber-600', accent: 'text-amber-400' },
    { border: 'border-purple-500/30', glow: 'bg-purple-500/5', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', btn: 'bg-purple-500 hover:bg-purple-600', accent: 'text-purple-400' },
    { border: 'border-rose-500/30', glow: 'bg-rose-500/5', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', btn: 'bg-rose-500 hover:bg-rose-600', accent: 'text-rose-400' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="md:sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-[-5%] w-[40%] h-[100%] rounded-full bg-emerald-500/8 blur-[100px] pointer-events-none" />
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Buy Football Betting Tips</h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Purchase verified predictions from expert tipsters. Each plan includes a set number of maximum odds. Choose your plan and start winning today.
        </p>
      </header>

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-12">
      <section>
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-96 bg-white/5 animate-pulse rounded-2xl" />)}
          </div>
        ) : plans.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, idx) => {
              const c = colors[idx % colors.length];
              const isMiddle = plans.length >= 3 && idx === Math.floor(plans.length / 2);
              return (
                <div key={plan._id} className={`relative bg-zinc-900/80 border rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-2 ${c.border} ${isMiddle ? 'shadow-[0_0_30px_rgba(16,185,129,0.08)]' : ''}`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${c.glow} rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none`} />

                  {isMiddle && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                      Most Popular
                    </div>
                  )}

                  <div className={`inline-flex self-start items-center px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-4 ${c.badge}`}>
                    {plan.name}
                  </div>

                  <div className="mb-2">
                    <span className="text-3xl font-extrabold text-white">{plan.currency} {plan.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-zinc-500 mb-4">Valid for {plan.durationInDays} days</p>

                  {plan.maxOdds > 0 && (
                    <div className={`mb-6 p-3 rounded-xl border ${c.border} ${c.glow} flex items-center gap-3`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-extrabold ${c.accent} bg-white/5 border border-white/10 shrink-0`}>
                        {plan.maxOdds}
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${c.accent}`}>Maximum Odds</div>
                        <div className="text-xs text-zinc-500">Up to {plan.maxOdds} odds</div>
                      </div>
                    </div>
                  )}

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features?.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                        <svg className={`w-4 h-4 ${c.accent} shrink-0 mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3 mt-auto">
                    <Link href={`/dashboard/plans?planId=${plan._id}`} className={`w-full flex items-center justify-center h-12 rounded-xl font-bold text-sm text-white transition-all ${c.btn}`}>
                      Choose Plan
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-2">Plans Coming Soon</h2>
            <p className="text-zinc-400 text-sm mb-6">Premium subscription plans are being prepared by our team.</p>
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
