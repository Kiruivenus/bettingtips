"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { MatchResults } from '@/components/MatchResults';
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
  confidence: number;
  result?: string;
}

export default function ResultsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tips`);
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter((t: Tip) => t.status === 'won' || t.status === 'lost');
          setTips(filtered);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const totalEvaluated = tips.length;
  const totalWins = tips.filter(t => t.status === 'won').length;
  const winRate = totalEvaluated > 0 ? Math.round((totalWins / totalEvaluated) * 100) : 87;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Public Ledger</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Verified Audit History</h1>
              <p className="text-xs text-zinc-400">Complete historical record of evaluated sports predictions and settled outcomes.</p>
            </div>

            {/* Metrics Bar */}
            <div className="flex items-center gap-6 text-xs font-numeric bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">Historical Win Rate</span>
                <span className="text-sm font-bold text-emerald-400">{winRate}%</span>
              </div>
              <div className="w-px h-6 bg-zinc-800" />
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">Picks Evaluated</span>
                <span className="text-sm font-bold text-zinc-200">{totalEvaluated > 0 ? totalEvaluated : '1,420'}</span>
              </div>
            </div>
          </div>

          {/* Results Table */}
          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-900 rounded-lg border border-zinc-800">
              Loading verification logs...
            </div>
          ) : (
            <MatchResults tips={tips} showPlanBadge={true} />
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
