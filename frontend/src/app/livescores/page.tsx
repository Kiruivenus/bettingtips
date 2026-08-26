"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { LiveScoresContent } from '@/components/livescores/LiveScoresContent';

export default function LiveScoresPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="border-b border-zinc-800 pb-6 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Real-Time Data Feed</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Live Scores & Upcoming Fixtures</h1>
            <p className="text-xs text-zinc-400">Continuous match tracking and real-time score updates.</p>
          </div>

          <LiveScoresContent />

        </div>
      </main>

      <Footer />
    </div>
  );
}
