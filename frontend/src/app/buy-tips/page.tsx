"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { API_URL } from '@/lib/constants';

interface Plan {
  _id: string;
  name: string;
  price: number;
  currency: string;
  durationInDays: number;
  features: string[];
  maxOdds: number;
  isActive: boolean;
}

export default function BuyTipsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_URL}/api/plans`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setPlans(data.filter((p: Plan) => p.isActive));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchPlans();
  }, []);

  // color schemes based on plan index
  const colors = [
    { border: 'border-blue-500/30', glow: 'bg-blue-500/5', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', btn: 'bg-blue-500 hover:bg-blue-600', accent: 'text-blue-400' },
    { border: 'border-emerald-500/30', glow: 'bg-emerald-500/5', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', btn: 'bg-emerald-500 hover:bg-emerald-600', accent: 'text-emerald-400' },
    { border: 'border-amber-500/30', glow: 'bg-amber-500/5', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', btn: 'bg-amber-500 hover:bg-amber-600', accent: 'text-amber-400' },
    { border: 'border-purple-500/30', glow: 'bg-purple-500/5', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', btn: 'bg-purple-500 hover:bg-purple-600', accent: 'text-purple-400' },
    { border: 'border-rose-500/30', glow: 'bg-rose-500/5', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', btn: 'bg-rose-500 hover:bg-rose-600', accent: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="BettingPro" width={36} height={36} className="rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
            <span className="text-xl font-extrabold text-white">BettingPro</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/free-tips" className="hover:text-white transition-colors">Free Tips</Link>
            <Link href="/buy-tips" className="text-emerald-400">Buy Tips</Link>
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
          <div className="md:hidden bg-black/90 border-t border-white/5 px-4 py-4 space-y-2 text-sm font-medium">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Home</Link>
            <Link href="/free-tips" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Free Tips</Link>
            <Link href="/buy-tips" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-emerald-400 hover:bg-white/5">Buy Tips</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Sign In</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-14 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-[-5%] w-[50%] h-[60%] rounded-full bg-emerald-500/8 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-[-5%] w-[40%] h-[50%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-4">
          👑 Premium Predictions
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">Buy Football Betting Tips</h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-6">
          Purchase verified predictions from expert tipsters. Each plan includes a set number of maximum odds. Choose your plan and start winning today.
        </p>
        <p className="text-zinc-500 text-sm max-w-lg mx-auto">
          We accept Credit/Debit Cards, PayPal, M-Pesa, and manual payment. <Link href="/#contact" className="text-emerald-400 hover:text-emerald-300">Contact us</Link> for other options.
        </p>
      </section>

      {/* Plans */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => <div key={i} className="h-96 bg-white/5 animate-pulse rounded-2xl" />)}
            </div>
          ) : plans.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan, idx) => {
                const c = colors[idx % colors.length];
                const isMiddle = plans.length >= 3 && idx === Math.floor(plans.length / 2);
                return (
                  <div key={plan._id} className={`relative bg-zinc-900/80 border rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-2 ${c.border} ${isMiddle ? 'shadow-[0_0_50px_rgba(16,185,129,0.08)] md:-mt-4 md:mb-4' : ''}`}>
                    {/* Glow */}
                    <div className={`absolute top-0 right-0 w-32 h-32 ${c.glow} rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none`} />

                    {isMiddle && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                        Most Popular
                      </div>
                    )}

                    {/* Plan Name Badge */}
                    <div className={`inline-flex self-start items-center px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-4 ${c.badge}`}>
                      {plan.name}
                    </div>

                    {/* Price */}
                    <div className="mb-2">
                      <span className="text-4xl font-extrabold text-white">{plan.currency} {plan.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-zinc-500 mb-4">Valid for {plan.durationInDays} days</p>

                    {/* Max Odds highlight */}
                    {plan.maxOdds > 0 && (
                      <div className={`mb-6 p-3 rounded-xl border ${c.border} ${c.glow} flex items-center gap-3`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-extrabold ${c.accent} bg-white/5 border border-white/10 shrink-0`}>
                          {plan.maxOdds}
                        </div>
                        <div>
                          <div className={`text-sm font-bold ${c.accent}`}>Maximum Odds</div>
                          <div className="text-xs text-zinc-500">Up to {plan.maxOdds} odds per prediction</div>
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features?.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                          <svg className={`w-4 h-4 ${c.accent} shrink-0 mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* Payment Buttons */}
                    <div className="space-y-3 mt-auto">
                      <Link href="/login" className={`w-full flex items-center justify-center h-12 rounded-xl font-bold text-sm text-white transition-all ${c.btn}`}>
                        Subscribe Now
                      </Link>
                      <p className="text-center text-[10px] text-zinc-600">Secure payment · Instant access after payment</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/3 border border-white/10 rounded-2xl max-w-xl mx-auto">
              <h2 className="text-xl font-bold text-white mb-2">Plans Coming Soon</h2>
              <p className="text-zinc-400 text-sm mb-6">Premium subscription plans are being prepared by our team.</p>
              <Link href="/free-tips" className="text-emerald-400 text-sm font-bold hover:text-emerald-300">
                View Free Tips Instead →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 border-t border-white/5 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-white text-center mb-12">How To Buy Football Tips</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Choose a Plan', desc: 'Pick the plan that matches your needs and budget.' },
              { step: '2', title: 'Create Account', desc: 'Sign up in seconds for free — no credit card required.' },
              { step: '3', title: 'Make Payment', desc: 'Pay using your preferred method — card, PayPal, or M-Pesa.' },
              { step: '4', title: 'Get Tips', desc: 'Access premium picks instantly in your dashboard.' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-lg mx-auto mb-4">{item.step}</div>
                <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 border-t border-white/5 text-center">
        <p className="text-zinc-400 mb-4">Not sure yet? Try our free picks first.</p>
        <Link href="/free-tips" className="inline-flex items-center justify-center h-10 px-6 text-sm font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all">
          View Free Tips →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black py-8 px-6 text-center">
        <p className="text-zinc-600 text-sm">© 2015–2026 BettingPro. All rights reserved. Bet responsibly. 18+</p>
      </footer>
    </div>
  );
}
