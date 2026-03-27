"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LiveScoresContent } from '@/components/livescores/LiveScoresContent';

export default function LiveScoresPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 w-full z-[100] border-b border-white/5 bg-black/60 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Platinum Picks" width={36} height={36} className="rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
            <span className="text-xl font-extrabold text-white">Platinum Picks</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/free-tips" className="hover:text-white transition-colors">Free Tips</Link>
            <Link href="/livescores" className="text-emerald-400">Live Scores</Link>
            <Link href="/buy-tips" className="hover:text-white transition-colors">Buy Tips</Link>
            <Link href="/results" className="hover:text-white transition-colors">Results</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block text-sm font-medium text-zinc-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5">Sign In</Link>
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
            <Link href="/livescores" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-emerald-400 hover:bg-white/5">Live Scores</Link>
            <Link href="/buy-tips" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Buy Tips</Link>
            <Link href="/results" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Results</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Sign In</Link>
          </div>
        )}
      </nav>

      <section className="pt-28 pb-24 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
        
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Real-Time Football Scores</h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-12">
          Stay updated with the latest match status, live results, and upcoming fixtures from all the major leagues worldwide.
        </p>

        <LiveScoresContent />
      </section>

      {/* Footer (Simplified) */}
      <footer className="py-12 border-t border-white/5 bg-black/40 text-center">
        <p className="text-zinc-500 text-sm">© 2026 Platinum Picks • Real-time sports data visualization</p>
      </footer>
    </div>
  );
}
