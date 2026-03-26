"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  confidence: number;
  result?: string;
  planId?: {
    _id: string;
    name: string;
  };
}

export default function ResultsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Navbar Placeholder - Replicating landing page style */}
      <nav className="fixed top-0 left-0 right-0 w-full z-[100] border-b border-white/5 bg-black/60 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="BettingPro" width={36} height={36} className="rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
            <span className="text-xl font-extrabold text-white">BettingPro</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/free-tips" className="hover:text-white transition-colors">Free Tips</Link>
            <Link href="/buy-tips" className="hover:text-white transition-colors">Buy Tips</Link>
            <Link href="/results" className="text-emerald-400 transition-colors">Results</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 hidden md:block">Sign In</Link>
            <Link href="/register" className="text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-5 py-2 rounded-xl transition-colors">Join Free</Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-zinc-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[100%] left-0 w-full bg-black/95 border-b border-white/5 px-4 py-4 space-y-2 text-sm font-medium shadow-2xl">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Home</Link>
            <Link href="/free-tips" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Free Tips</Link>
            <Link href="/buy-tips" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Buy Tips</Link>
            <Link href="/results" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-emerald-400 hover:bg-white/5">Results</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Sign In</Link>
          </div>
        )}
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
          <div className="space-y-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} />)}
          </div>
        ) : tips.length > 0 ? (
          <MatchResults tips={tips} showPlanBadge={true} />
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
