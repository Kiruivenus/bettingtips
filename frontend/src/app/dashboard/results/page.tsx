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
  planId?: {
    _id: string;
    name: string;
  };
}

export default function DashboardResultsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tips`);
        if (res.ok) {
          const data = await res.json();
          // Only show won/lost tips on the results page
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

  const Skeleton = () => (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 w-24 bg-white/10 rounded" />
        <div className="h-4 w-12 bg-white/10 rounded" />
      </div>
      <div className="h-6 w-48 bg-white/10 rounded mb-4" />
      <div className="h-10 w-full bg-white/10 rounded" />
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-6 mb-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
          📊 Accuracy Archive
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Match Results</h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Total transparency. Browse our complete historical performance across both free segments and premium VIP plans.
        </p>
      </header>

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-12">
      {loading ? (
        <div className="space-y-8">
          {[1, 2, 3].map(i => <Skeleton key={i} />)}
        </div>
      ) : tips.length > 0 ? (
        <MatchResults tips={tips} showPlanBadge={true} />
      ) : (
        <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
          <p className="text-zinc-500 font-bold italic">No match results archived yet.</p>
        </div>
      )}
      </div>
    </div>
  );
}
