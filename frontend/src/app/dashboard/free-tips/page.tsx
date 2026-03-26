"use client";

import React, { useEffect, useState } from 'react';
import { API_URL } from '@/lib/constants';
import { MatchResults } from '@/components/MatchResults';

interface Tip {
  _id: string;
  match: string;
  league: string;
  prediction: string;
  odds: number;
  status: 'pending' | 'won' | 'lost';
  isPremium: boolean;
  matchDate: string;
  result?: string;
}

export default function DashboardFreeTipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tips`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setTips(data.filter((t: Tip) => !t.isPremium));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  const pendingTips = tips.filter(t => t.status === 'pending');
  const pastTips = tips
    .filter(t => t.status === 'won' || t.status === 'lost')
    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());

  const totalResolved = pastTips.length;
  const wins = pastTips.filter(t => t.status === 'won').length;
  const successRate = totalResolved > 0 ? Math.round((wins / totalResolved) * 100) : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Free Football Tips</h1>
        <p className="text-zinc-400 text-lg">Expert football predictions, verified results, completely free.</p>
        
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center min-w-[100px]">
            <div className="text-2xl font-extrabold text-emerald-400">{successRate}%</div>
            <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-1">Success Rate</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center min-w-[100px]">
            <div className="text-2xl font-extrabold text-blue-400">{wins}</div>
            <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-1">Wins</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center min-w-[100px]">
            <div className="text-2xl font-extrabold text-red-400">{totalResolved - wins}</div>
            <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-1">Losses</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center min-w-[100px]">
            <div className="text-2xl font-extrabold text-white">{totalResolved}</div>
            <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-1">Total Tips</div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-12">
      {/* Today's Free Tips */}
      <section>
        <h2 className="text-2xl font-extrabold text-white mb-6">Today's Picks</h2>
        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl" />)}
          </div>
        ) : pendingTips.length > 0 ? (
          <MatchResults tips={pendingTips} showPlanBadge={false} />
        ) : (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-zinc-400">No active free tips right now. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Past Results */}
      <section>
        <h2 className="text-2xl font-extrabold text-white mb-6">Past Results</h2>
        {loading ? (
          <div className="space-y-4">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />)}</div>
        ) : pastTips.length > 0 ? (
          <MatchResults tips={pastTips} showPlanBadge={false} />
        ) : (
          <div className="text-center py-12 border border-white/5 rounded-2xl bg-white/5 text-zinc-500">
            No past results yet.
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
