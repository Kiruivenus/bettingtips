"use client";

import React, { useEffect, useState } from 'react';
import { API_URL } from '@/lib/constants';

interface Tip {
  _id: string;
  match: string;
  league: string;
  prediction: string;
  odds: number;
  status: 'pending' | 'won' | 'lost';
  isPremium: boolean;
  matchDate: string;
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
        <h2 className="text-2xl font-extrabold text-white mb-2">Today's Picks</h2>
        <p className="text-zinc-500 text-sm mb-6">Active predictions for upcoming matches.</p>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-2xl" />)}</div>
        ) : pendingTips.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingTips.map(tip => (
              <div key={tip._id} className="bg-zinc-900/80 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">{tip.league}</span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {new Date(tip.matchDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-4 leading-tight">{tip.match}</h3>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Prediction</p>
                    <p className="text-sm font-bold text-emerald-400">{tip.prediction}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Odds</p>
                    <div className="bg-white/10 px-3 py-1 rounded-lg">
                      <span className="text-sm font-extrabold text-white">{tip.odds.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-zinc-400">No active free tips right now. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Past Results */}
      <section>
        <h2 className="text-2xl font-extrabold text-white mb-2">Past Results</h2>
        <p className="text-zinc-500 text-sm mb-6">Full transparent history of all free tips.</p>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />)}</div>
        ) : pastTips.length > 0 ? (
          <div className="overflow-x-auto bg-black/20 border border-white/5 rounded-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Match</th>
                  <th className="py-4 px-5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">League</th>
                  <th className="py-4 px-5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Prediction</th>
                  <th className="py-4 px-5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Odds</th>
                  <th className="py-4 px-5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">Result</th>
                </tr>
              </thead>
              <tbody>
                {pastTips.map(tip => (
                  <tr key={tip._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-5 text-xs text-zinc-400 whitespace-nowrap">
                      {new Date(tip.matchDate).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-5 text-sm font-semibold text-white">{tip.match}</td>
                    <td className="py-4 px-5 text-xs text-zinc-400">{tip.league}</td>
                    <td className="py-4 px-5 text-sm text-zinc-300">{tip.prediction}</td>
                    <td className="py-4 px-5 text-sm font-bold text-white">{tip.odds.toFixed(2)}</td>
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg ${
                        tip.status === 'won'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {tip.status === 'won' ? '✓ Win' : '✗ Loss'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
