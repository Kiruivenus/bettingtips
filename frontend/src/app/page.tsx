"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
}

interface Plan {
  _id: string;
  name: string;
  price: number;
  currency: string;
  durationInDays: number;
  features: string[];
  isActive: boolean;
}

interface FAQ {
  _id: string;
  question: string;
  answer: string;
}

export default function LandingPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tipsRes, plansRes, faqsRes] = await Promise.all([
          fetch(`${API_URL}/api/tips`).catch(() => null),
          fetch(`${API_URL}/api/plans`).catch(() => null),
          fetch(`${API_URL}/api/faqs`).catch(() => null),
        ]);
        if (tipsRes?.ok) { const d = await tipsRes.json(); if (Array.isArray(d)) setTips(d); }
        if (plansRes?.ok) { const d = await plansRes.json(); if (Array.isArray(d)) setPlans(d); }
        if (faqsRes?.ok) { const d = await faqsRes.json(); if (Array.isArray(d)) setFaqs(d); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const freeTips = tips.filter(t => !t.isPremium && t.status === 'pending').slice(0, 4);
  const premiumTips = tips.filter(t => t.isPremium).slice(0, 4);
  const recentResults = tips
    .filter(t => t.status === 'won' || t.status === 'lost')
    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
    .slice(0, 8);

  const winRate = recentResults.length > 0
    ? Math.round((recentResults.filter(t => t.status === 'won').length / recentResults.length) * 100)
    : 87;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('sending');
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      if (!res.ok) throw new Error();
      setContactStatus('sent');
      setContactForm({ name: '', email: '', message: '' });
    } catch {
      setContactStatus('error');
    }
  };

  const Skeleton = ({ className }: { className: string }) => (
    <div className={`bg-white/5 animate-pulse rounded-2xl ${className}`} />
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden font-sans">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 w-full z-[100] border-b border-white/5 bg-black/60 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Platinum Picks" width={36} height={36} className="rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
            <span className="text-xl font-extrabold text-white">Platinum Picks</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link href="/free-tips" className="hover:text-white transition-colors">Free Tips</Link>
            <Link href="/buy-tips" className="hover:text-white transition-colors">Buy Tips</Link>
            <Link href="/results" className="hover:text-white transition-colors">Results</Link>
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
            <a href="#plans" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block text-sm font-medium text-zinc-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">Sign In</Link>
            <Link href="/register" className="text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-5 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(52,211,153,0.3)]">Join Free</Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-zinc-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[100%] left-0 w-full bg-black/95 border-b border-white/5 px-4 py-4 space-y-2 text-sm font-medium shadow-2xl">
            {['#plans', '#results', '#faq'].map(href => (
              <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5 hover:text-white transition-colors capitalize">
                {href.replace('#', '').replace('-', ' ')}
              </a>
            ))}
            <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Support</Link>
            <Link href="/free-tips" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Free Tips Page</Link>
            <Link href="/buy-tips" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Buy Tips</Link>
            <Link href="/results" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Results Page</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Sign In</Link>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-36 pb-24 px-4 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-0 right-[-5%] w-[60%] h-[70%] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-[-5%] w-[40%] h-[50%] rounded-full bg-blue-600/8 blur-[120px] pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Expert tips published daily
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
          <span className="text-white">Win More With </span>
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Verified</span>
          <br />
          <span className="text-white">Football Predictions</span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Professional football betting tips with outstanding win rates. Buy safe, verified predictions from expert tipsters and start profiting today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <a href="#plans" className="inline-flex items-center justify-center h-14 px-8 text-base font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded-2xl transition-all shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:shadow-[0_0_40px_rgba(52,211,153,0.5)]">
            Buy Betting Tips
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
          <a href="#free-tips" className="inline-flex items-center justify-center h-14 px-8 text-base font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl transition-all">
            View Free Tips
          </a>
        </div>

        {/* Stats bar */}
        <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Win Rate', value: `${winRate}%` },
            { label: 'Tips Published', value: `${tips.length > 0 ? tips.length + '+' : '500+'}` },
            { label: 'Active Plans', value: `${plans.length > 0 ? plans.length : '3'}` },
            { label: 'Satisfied Users', value: '2,000+' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/8 transition-colors">
              <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 mb-1">{stat.value}</div>
              <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FREE TIPS ─── */}
      <section id="free-tips" className="py-24 px-4 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 items-stretch mb-16">
            <div className="lg:col-span-1 bg-gradient-to-br from-blue-600/20 to-zinc-900 border border-blue-500/20 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" /></svg>
                </div>
                <h2 className="text-3xl font-black text-white mb-4 leading-tight">Public Betting Feed</h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                  Get access to our daily curated free picks. These are analyzed by our junior scouts to give you a taste of our accuracy without any cost. 
                  <span className="block mt-2 font-bold text-blue-400/80 italic">Verified transparency, no registration required.</span>
                </p>
              </div>
              <Link href="/free-tips" className="relative z-10 w-full h-12 flex items-center justify-center bg-blue-500 hover:bg-blue-400 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-blue-500/30">
                Claim Free Bet
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>

            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
              {loading ? (
                [1,2,3,4].map(i => <Skeleton key={i} className="h-full min-h-[200px]" />)
              ) : freeTips.length > 0 ? (
                freeTips.map(tip => (
                  <div key={tip._id} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">{tip.league}</span>
                        <span className="text-[10px] font-bold text-zinc-600">{new Date(tip.matchDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-4 line-clamp-2">{tip.match}</h3>
                    </div>
                    <div className="bg-black/40 rounded-xl p-3 flex justify-between items-center border border-white/5 group-hover:border-blue-500/10 transition-colors">
                       <div>
                        <p className="text-[9px] text-zinc-600 uppercase font-bold mb-0.5">Prediction</p>
                        <p className="text-sm font-black text-emerald-400">{tip.prediction}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-zinc-600 uppercase font-bold mb-0.5">Odds</p>
                        <p className="text-sm font-black text-white px-2 py-0.5 bg-white/5 rounded">@{tip.odds.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                  <p className="text-zinc-500 font-bold italic">No public picks available for this hour.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PREMIUM TIPS ─── */}
      <section id="premium-tips" className="py-24 px-4 border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-1 bg-gradient-to-br from-amber-600/20 to-zinc-900 border border-amber-500/20 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                </div>
                <h2 className="text-3xl font-black text-white mb-4 leading-tight">VIP Insider Picks</h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                  Unlock our highest-confidence picks analyzed by seasoned football experts. These selections go through 3 stages of verification before being published.
                  <span className="block mt-2 font-bold text-amber-400/80 italic">Average win rate of over 85% this month.</span>
                </p>
              </div>
              <Link href="/buy-tips" className="relative z-10 w-full h-12 flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition-all shadow-lg hover:shadow-amber-500/30">
                Buy Premium Odds
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </Link>
            </div>

            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
              {loading ? (
                [1,2,3,4].map(i => <Skeleton key={i} className="h-full min-h-[200px]" />)
              ) : premiumTips.length > 0 ? (
                premiumTips.map(tip => (
                   <div key={tip._id} className="bg-zinc-900/60 border border-amber-500/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all group flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
                    <div>
                      <div className="flex justify-between items-center mb-4 relative z-10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">{tip.league}</span>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          <span className="text-[10px] font-black text-amber-500">VIP</span>
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-white mb-4 line-clamp-2 relative z-10">{tip.match}</h3>
                    </div>

                    <div className="bg-black/40 rounded-xl p-3 border border-amber-500/10 relative overflow-hidden group-hover:border-amber-500/20 transition-all">
                      <div className="flex justify-between items-center blur-sm select-none">
                         <div>
                          <p className="text-[9px] text-zinc-600 uppercase font-bold mb-0.5">Prediction</p>
                          <p className="text-sm font-black text-amber-400">WIN (1X2)</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-zinc-600 uppercase font-bold mb-0.5">Odds</p>
                          <p className="text-sm font-black text-white px-2 py-0.5 bg-white/5 rounded">@2.10</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
                        <Link href="/register" className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-lg hover:bg-amber-500/20 transition-all">
                          Subscribe
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                  <p className="text-zinc-500 font-bold italic">Premium picks are currently being finalized.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SUBSCRIPTION PLANS ─── */}
      <section id="plans" className="py-24 px-4 border-t border-white/5 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              💳 Choose A Plan
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">Buy Football Predictions</h2>
            <p className="text-zinc-400 text-lg">Purchase tips from verified expert tipsters. Choose your payment method and unlock premium predictions today.</p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[1,2,3].map(i => <Skeleton key={i} className="h-80" />)}
            </div>
          ) : plans.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {plans.map((plan, index) => {
                const isPopular = index === Math.floor(plans.length / 2);
                return (
                  <div key={plan._id} className={`relative bg-zinc-900/80 border rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 ${isPopular ? 'border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.1)]' : 'border-white/10 hover:border-white/20'}`}>
                    {isPopular && (
                      <>
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-t-2xl" />
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full">
                          Most Popular
                        </div>
                      </>
                    )}
                    <h3 className="text-xl font-extrabold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-2">
                      <span className="text-4xl font-extrabold text-white">{plan.currency} {plan.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-zinc-500 mb-6">Valid for {plan.durationInDays} days</p>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features?.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                          <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link href="/login" className={`w-full flex items-center justify-center h-12 rounded-xl font-bold text-sm transition-all ${isPopular ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'}`}>
                      Subscribe Now
                    </Link>
                    <p className="text-center text-[10px] text-zinc-600 mt-3">Secure payment · Instant access</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/3 border border-white/10 rounded-2xl max-w-2xl mx-auto">
              <p className="text-zinc-400">Subscription plans will be available soon.</p>
            </div>
          )}

          <p className="text-center text-zinc-500 text-sm mt-10">
            We accept Credit/Debit Card, PayPal, M-Pesa, and other payment methods. 
            <a href="#contact" className="text-emerald-400 ml-1 hover:text-emerald-300">Contact us</a> for other options.
          </p>
        </div>
      </section>

      {/* ─── RECENT RESULTS ─── */}
      <section id="results" className="py-24 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">📊 Track Record</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">Recent Tips Archive</h2>
            <p className="text-zinc-400">Our verified historical performance — fully transparent, no cherrypicking.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-28" />)}
            </div>
          ) : recentResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentResults.map(tip => (
                <div key={tip._id} className={`p-4 rounded-2xl border flex flex-col justify-between ${tip.status === 'won' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase text-zinc-500">{tip.league}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${tip.status === 'won' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>{tip.status === 'won' ? 'WIN ✓' : 'LOSS ✗'}</span>
                    </div>
                    <p className="text-xs font-semibold text-white leading-tight mb-1">{tip.match}</p>
                    <p className="text-[10px] text-zinc-500">{tip.prediction}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs font-bold ${tip.status === 'won' ? 'text-emerald-400' : 'text-red-400'}`}>@{tip.odds.toFixed(2)}</span>
                    <span className="text-[10px] text-zinc-600">{new Date(tip.matchDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-white/5 rounded-2xl text-zinc-500">Results will appear here as tips are resolved.</div>
          )}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 px-4 border-t border-white/5 bg-black/20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">❓ FAQ</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="text-zinc-400 mt-3">Everything you need to know before you buy football tips.</p>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : faqs.length > 0 ? (
            <div className="space-y-3">
              {faqs.map(faq => (
                <div key={faq._id} className={`border rounded-2xl overflow-hidden transition-all ${openFaq === faq._id ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-zinc-900/40 hover:border-white/20'}`}>
                  <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenFaq(openFaq === faq._id ? null : faq._id)}>
                    <span className="font-semibold text-white text-sm pr-4">{faq.question}</span>
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${openFaq === faq._id ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10'}`}>
                      <svg className={`w-4 h-4 transition-transform text-zinc-400 ${openFaq === faq._id ? 'rotate-180 text-emerald-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </button>
                  {openFaq === faq._id && (
                    <div className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Default FAQs when DB is empty */
            <div className="space-y-3">
              {[
                { q: 'Which payment methods do you accept?', a: 'We accept Credit/Debit Card, PayPal, M-Pesa, and manual bank transfer. Contact us via the form below for other payment options like Skrill, Neteller or Crypto.' },
                { q: 'How will I receive the tips after paying?', a: 'Tips are instantly unlocked in your account dashboard after your payment is verified. You\'ll also receive an email confirmation with instructions.' },
                { q: 'If I buy more than one tip, will I get a discount?', a: 'Yes! Our monthly and weekly plans offer significant savings compared to single-tip purchases. Check our plans section above for the best deals.' },
                { q: 'What is your refund policy?', a: 'We don\'t offer refunds once tips have been delivered, however, please contact us if you have any issues and we\'ll work to resolve them.' },
                { q: 'How do I know the tips are genuine?', a: 'All our tips are logged publicly with full transparency. You can view our complete tips archive including wins and losses — we never hide our record.' },
              ].map((item, i) => (
                <div key={i} className={`border rounded-2xl overflow-hidden ${openFaq === String(i) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-zinc-900/40'}`}>
                  <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenFaq(openFaq === String(i) ? null : String(i))}>
                    <span className="font-semibold text-white text-sm pr-4">{item.q}</span>
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${openFaq === String(i) ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10'}`}>
                      <svg className={`w-4 h-4 text-zinc-400 transition-transform ${openFaq === String(i) ? 'rotate-180 text-emerald-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </button>
                  {openFaq === String(i) && (
                    <div className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="py-24 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-4">✉️ Get In Touch</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Contact Us</h2>
            <p className="text-zinc-400 mt-3">Have a question about our tips or payment? We typically reply within a few hours.</p>
          </div>

          <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-8">
            {contactStatus === 'sent' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-zinc-400">We'll get back to you as soon as possible.</p>
                <button onClick={() => setContactStatus('idle')} className="mt-6 text-sm text-emerald-400 hover:text-emerald-300 font-medium">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2">Your Name</label>
                    <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-zinc-600" placeholder="John Smith" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2">Your Email</label>
                    <input required type="email" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-zinc-600" placeholder="john@example.com" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Your Message</label>
                  <textarea required rows={5} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-zinc-600 resize-none" placeholder="I'm interested in the VIP plan..." value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} />
                </div>
                {contactStatus === 'error' && (
                  <p className="text-red-400 text-sm font-medium">Failed to send message. Please try again.</p>
                )}
                <button type="submit" disabled={contactStatus === 'sending'} className="w-full h-12 rounded-xl font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {contactStatus === 'sending' ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Sending...</> : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 bg-black py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.png" alt="Platinum Picks" width={36} height={36} className="rounded-xl" />
                <span className="text-xl font-extrabold text-white">Platinum Picks</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed mb-4">Expert football betting tips and predictions. Verified tipsters with transparent results.</p>
              <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <svg className="w-4 h-4 text-amber-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span className="text-amber-400 text-xs font-medium">Gamble Responsibly. 18+</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">Premium Tips</h4>
              <ul className="space-y-3">
                {['Bet Of The Day', 'High Odds Tips', 'Over 2.5 Goals', 'Under 2.5 Goals', 'Asian Handicap', 'Double Chance'].map(item => (
                  <li key={item}><a href="#premium-tips" className="text-zinc-500 text-sm hover:text-emerald-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">Information</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Free Tips', href: '#free-tips' },
                  { label: 'Paid Tips', href: '#plans' },
                  { label: 'Results Archive', href: '#results' },
                  { label: 'FAQ', href: '#faq' },
                  { label: 'Contact Us', href: '#contact' },
                  { label: 'Sign Up Free', href: '/register' },
                ].map(item => (
                  <li key={item.label}><a href={item.href} className="text-zinc-500 text-sm hover:text-emerald-400 transition-colors">{item.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">Contact Info</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-zinc-500 text-sm">
                  <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  support@bettingpro.com
                </li>
                <li className="text-zinc-500 text-sm">Available Mon–Sat<br />8AM – 8PM EAT</li>
              </ul>
              <div className="mt-6 flex gap-3">
                <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Telegram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="WhatsApp">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-600 text-sm">© 2015–2026 Platinum Picks. All Rights Reserved.</p>
            <p className="text-zinc-600 text-xs text-center md:text-right max-w-md">
              Betting involves financial risk. Tips are for informational purposes only. Please bet responsibly and within your means. This service is for users 18+.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
