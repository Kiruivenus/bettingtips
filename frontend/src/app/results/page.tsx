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
  planId?: {
    _id: string;
    name: string;
  };
}

export default function ResultsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/tips');
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
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Navbar Placeholder - Replicating landing page style */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="BettingPro" width={32} height={32} className="rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
            <span className="text-lg font-black text-white">BettingPro</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">Home</Link>
            <Link href="/buy-tips" className="bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-lg shadow-emerald-500/20">Buy Tips</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 pt-32 pb-24">
        <header className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
            📊 Accuracy Archive
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Match Results</h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed">
            Total transparency. Browse our complete historical performance across both free segments and premium VIP plans.
          </p>
        </header>

        {loading ? (
          <div className="space-y-12">
            {[1, 2].map(i => (
              <div key={i}>
                <div className="h-6 w-48 bg-white/5 rounded-lg mb-6 animate-pulse" />
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(j => <Skeleton key={j} />)}
                </div>
              </div>
            ))}
          </div>
        ) : sortedDates.length > 0 ? (
          <div className="space-y-16">
            {sortedDates.map(date => (
              <section key={date}>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-lg font-black text-zinc-100 whitespace-nowrap">{date}</h2>
                  <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
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
          <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
            <p className="text-zinc-500 font-bold italic">No match results archived yet.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 bg-black/40 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="BettingPro" width={24} height={24} className="rounded opacity-50" />
            <span className="text-sm font-black text-zinc-600 uppercase tracking-widest">BettingPro Transparency League</span>
          </div>
          <p className="text-zinc-600 text-[10px] font-medium text-center md:text-right">
            © 2026 BettingPro. All picks are logged in our database for audit. Gamble responsibly (18+).
          </p>
        </div>
      </footer>
    </div>
  );
}
