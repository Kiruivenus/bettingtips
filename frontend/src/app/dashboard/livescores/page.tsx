"use client";

import React from 'react';
import { LiveScoresContent } from '@/components/livescores/LiveScoresContent';

export default function DashboardLiveScoresPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-[-5%] w-[40%] h-[100%] rounded-full bg-emerald-500/8 blur-[100px] pointer-events-none" />

      </header>

      <div className="px-4 sm:px-6 md:px-8 pb-8">
        <LiveScoresContent />
      </div>
    </div>
  );
}
