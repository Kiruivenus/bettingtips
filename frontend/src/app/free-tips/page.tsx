"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { API_URL } from '@/lib/constants';

interface Tip {
  _id: string;
  match: string;
  league: string;
  prediction: string;
  odds: number;
  status: 'pending' | 'won' | 'lost' | 'UPCOMING' | 'ACTIVE' | 'LOCKED' | 'COMPLETED' | 'VOID';
  isPremium: boolean;
  accessLevel?: string;
  matchDate: string;
  confidence: number;
  planIds?: Array<{ _id: string; name: string }> | string[];
}

export default function FreeTipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('all');

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tips`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setTips(data.filter((t: Tip) => !t.isPremium || t.accessLevel === 'FREE'));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  const leagues = Array.from(new Set(tips.map(t => t.league))).filter(Boolean);

  const filteredTips = tips.filter(tip => {
    const matchesSearch = tip.match.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tip.league.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tip.prediction.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLeague = selectedLeague === 'all' || tip.league === selectedLeague;
    return matchesSearch && matchesLeague;
  });

  const isPendingStatus = (s: string) => s === 'pending' || s === 'UPCOMING' || s === 'ACTIVE' || s === 'LOCKED';

  const pendingTips = filteredTips.filter(t => isPendingStatus(t.status)).slice(0, 5);
  const settledTips = filteredTips.filter(t => !isPendingStatus(t.status));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Open Analytics</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Free Football Predictions</h1>
              <p className="text-xs text-zinc-400">Daily selections evaluated by our analytical team with verified outcomes.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Filter by team or league..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full sm:w-64 rounded-md bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="h-9 w-full sm:w-48 rounded-md bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Leagues</option>
                {leagues.map(league => (
                  <option key={league} value={league}>{league}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Pending Predictions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Upcoming Fixtures ({pendingTips.length})
              </h2>
            </div>

            <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-numeric">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3 px-4">Kickoff / League</th>
                      <th className="py-3 px-4">Fixture</th>
                      <th className="py-3 px-4">Predicted Selection</th>
                      <th className="py-3 px-4 text-right">Odds</th>
                      <th className="py-3 px-4 text-center">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-500">
                          Fetching open picks...
                        </td>
                      </tr>
                    ) : pendingTips.length > 0 ? (
                      pendingTips.map((tip) => (
                        <tr key={tip._id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <span className="block text-zinc-300 font-medium">{tip.league}</span>
                            <span className="text-[11px] text-zinc-500">
                              {new Date(tip.matchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-zinc-100">{tip.match}</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded bg-zinc-800 text-emerald-400 border border-zinc-700 font-medium">
                              {tip.prediction}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-400">
                            {tip.odds ? tip.odds.toFixed(2) : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 text-[10px]">
                              {tip.confidence ? `${tip.confidence}%` : 'Standard'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-500">
                          No pending free predictions matching criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Settled Predictions Feed */}
          <div className="space-y-4 pt-6">
            <div className="border-b border-zinc-800 pb-2">
              <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Recently Settled Picks</h2>
            </div>

            <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-numeric">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3 px-4">Date / League</th>
                      <th className="py-3 px-4">Fixture</th>
                      <th className="py-3 px-4">Selection</th>
                      <th className="py-3 px-4 text-right">Odds</th>
                      <th className="py-3 px-4 text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-500">Loading history...</td>
                      </tr>
                    ) : settledTips.length > 0 ? (
                      settledTips.map((tip) => (
                        <tr key={tip._id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <span className="block text-zinc-300 font-medium">{tip.league}</span>
                            <span className="text-[11px] text-zinc-500">
                              {new Date(tip.matchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-200">{tip.match}</td>
                          <td className="py-3 px-4 text-zinc-300">{tip.prediction}</td>
                          <td className="py-3 px-4 text-right font-medium text-zinc-300">{tip.odds ? tip.odds.toFixed(2) : 'N/A'}</td>
                          <td className="py-3 px-4 text-center">
                            {tip.status === 'won' || tip.status === 'COMPLETED' ? (
                              <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold text-[10px]">
                                WON
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-bold text-[10px]">
                                LOST
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-500">No settled predictions logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
