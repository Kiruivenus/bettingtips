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

  // Group tips by date
  const groupedResults = tips.reduce((groups: Record<string, Tip[]>, tip) => {
    const date = new Date(tip.matchDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(tip);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedResults).sort((a, b) => 
    new Date(groupedResults[b][0].matchDate).getTime() - new Date(groupedResults[a][0].matchDate).getTime()
  );

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
        <div className="space-y-12">
          {[1, 2].map(i => (
            <div key={i}>
              <div className="h-6 w-48 bg-white/5 rounded-lg mb-6 animate-pulse" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(j => <Skeleton key={j} />)}
              </div>
            </div>
          ))}
        </div>
      ) : sortedDates.length > 0 ? (
        <div className="space-y-16">
          {sortedDates.map(date => (
            <section key={date}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-lg font-black text-zinc-100 whitespace-nowrap">{date}</h2>
                <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedResults[date].map(tip => (
                  <div key={tip._id} className={`group relative bg-zinc-900/40 border rounded-2xl p-6 transition-all hover:bg-zinc-900/60 ${tip.status === 'won' ? 'border-emerald-500/20 hover:border-emerald-500/40' : 'border-red-500/20 hover:border-red-500/40'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-1.5 pt-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-max ${tip.isPremium ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                          {tip.isPremium ? (tip.planId?.name || 'VIP Premium') : 'Public Tip'}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500">{tip.league}</span>
                      </div>
                      <div className={`flex flex-col items-end gap-1.5`}>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${tip.status === 'won' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {tip.status === 'won' ? 'WIN ✓' : 'LOST ✗'}
                        </span>
                        <span className="text-[10px] font-black text-white bg-white/5 px-2 py-0.5 rounded">@{tip.odds.toFixed(2)}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mb-4 line-clamp-1">{tip.match}</h3>
                    
                    <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                      <div>
                        <p className="text-[9px] text-zinc-600 uppercase font-black mb-0.5">Prediction</p>
                        <p className="text-sm font-black text-white group-hover:text-zinc-200 transition-colors">{tip.prediction}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] text-zinc-600 uppercase font-black mb-0.5">Time</p>
                         <p className="text-xs font-bold text-zinc-400">
                           {new Date(tip.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
          <p className="text-zinc-500 font-bold italic">No match results archived yet.</p>
        </div>
      )}
      </div>
    </div>
  );
}
