"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Tip {
  _id: string;
  match: string;
  league: string;
  prediction: string;
  odds: number;
  status: 'pending' | 'won' | 'lost';
  isPremium: boolean;
  matchDate: string;
  confidence: number;
}

export default function FreeTipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/tips');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setTips(data.filter((t: Tip) => !t.isPremium));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
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
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="BettingPro" width={36} height={36} className="rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
            <span className="text-xl font-extrabold text-white">BettingPro</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/free-tips" className="text-emerald-400">Free Tips</Link>
            <Link href="/buy-tips" className="hover:text-white transition-colors">Buy Tips</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 hidden md:block">Sign In</Link>
            <Link href="/register" className="text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-5 py-2 rounded-xl transition-colors">Join Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 right-[-5%] w-[50%] h-[60%] rounded-full bg-blue-500/8 blur-[130px] pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
          🎁 No subscription required
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">Free Football Tips</h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-8">Expert football predictions, verified results, and a fully transparent track record — all completely free.</p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center min-w-[120px]">
            <div className="text-3xl font-extrabold text-emerald-400">{successRate}%</div>
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-1">Success Rate</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center min-w-[120px]">
            <div className="text-3xl font-extrabold text-blue-400">{wins}</div>
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-1">Wins</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center min-w-[120px]">
            <div className="text-3xl font-extrabold text-red-400">{totalResolved - wins}</div>
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-1">Losses</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center min-w-[120px]">
            <div className="text-3xl font-extrabold text-white">{totalResolved}</div>
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-1">Total Tips</div>
          </div>
        </div>
      </section>

      {/* Today's Free Tips */}
      <section className="py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-extrabold text-white mb-2">Today's Picks</h2>
          <p className="text-zinc-500 text-sm mb-8">Active predictions for upcoming matches.</p>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-2xl" />)}</div>
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
            <div className="text-center py-16 bg-white/3 border border-white/10 rounded-2xl">
              <p className="text-zinc-400">No active free tips right now. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Past Results */}
      <section className="py-12 px-4 border-t border-white/5 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Past Results & Archive</h2>
              <p className="text-zinc-500 text-sm">Full transparent history of all free tips. We never hide losses.</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              <span className="text-xs text-zinc-400">Overall:</span>
              <span className={`text-sm font-extrabold ${successRate >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>{successRate}% win rate</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />)}</div>
          ) : pastTips.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Match</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">League</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Prediction</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Odds</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {pastTips.map(tip => (
                    <tr key={tip._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="py-3 px-4 text-xs text-zinc-400 whitespace-nowrap">
                        {new Date(tip.matchDate).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-white">{tip.match}</td>
                      <td className="py-3 px-4 text-xs text-zinc-400">{tip.league}</td>
                      <td className="py-3 px-4 text-sm text-zinc-300">{tip.prediction}</td>
                      <td className="py-3 px-4 text-sm font-bold text-white">{tip.odds.toFixed(2)}</td>
                      <td className="py-3 px-4 text-center">
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
            <div className="text-center py-16 border border-white/5 rounded-2xl text-zinc-500">
              No past results yet. Results appear here once tips are resolved.
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-white/5 text-center">
        <h2 className="text-2xl font-extrabold text-white mb-3">Want Higher Odds & More Picks?</h2>
        <p className="text-zinc-400 mb-8 max-w-lg mx-auto">Our premium plans give you access to exclusive VIP tips with higher odds and up to 70+ picks per plan.</p>
        <Link href="/buy-tips" className="inline-flex items-center justify-center h-12 px-8 text-base font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded-2xl transition-all shadow-[0_0_25px_rgba(52,211,153,0.3)]">
          View Premium Plans →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black py-8 px-6 text-center">
        <p className="text-zinc-600 text-sm">© 2015–2026 BettingPro. All rights reserved. Bet responsibly. 18+</p>
      </footer>
    </div>
  );
}
