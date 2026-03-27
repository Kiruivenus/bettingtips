"use client";

import React from 'react';
import { LiveScoresContent } from '@/components/livescores/LiveScoresContent';

export default function DashboardLiveScoresPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-[-5%] w-[40%] h-[100%] rounded-full bg-emerald-500/8 blur-[100px] pointer-events-none" />
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Live Scores & Results</h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Track real-time scores, upcoming fixtures, and past match results across all global leagues.
        </p>
      </header>

      <div className="px-4 sm:px-6 md:px-8 pb-8">
        <LiveScoresContent />
      </div>
    </div>
  );
}
