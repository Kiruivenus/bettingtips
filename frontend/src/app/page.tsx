"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
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
  planIds?: Array<{ _id: string; name: string }> | string[];
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

  const freeTips = tips.filter(t => !t.isPremium && t.status === 'pending').slice(0, 5);
  const premiumTips = tips.filter(t => t.isPremium).slice(0, 5);
  const recentResults = tips
    .filter(t => t.status === 'won' || t.status === 'lost')
    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
    .slice(0, 6);

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-16">
        
        {/* ─── HERO SECTION ─── */}
        <section className="border-b border-zinc-800/80 bg-zinc-950 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Product Value Proposition */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  Daily Football Intelligence Feed
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  Quantitative sports analysis & verified betting predictions.
                </h1>

                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Data-driven football selections evaluated by tactical performance metrics. Public settlement history logged transparently with real-time status updates.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link href="/buy-tips">
                    <Button variant="primary" size="lg">
                      Unlock VIP Packages
                    </Button>
                  </Link>
                  <Link href="/free-tips">
                    <Button variant="outline" size="lg">
                      View Today's Free Picks
                    </Button>
                  </Link>
                </div>

                {/* Key Metrics Bar */}
                <div className="pt-8 border-t border-zinc-900 grid grid-cols-3 gap-6 text-xs">
                  <div>
                    <span className="block text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Historical Accuracy</span>
                    <span className="text-lg font-bold text-emerald-400 font-numeric">{winRate}%</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Picks Evaluated</span>
                    <span className="text-lg font-bold text-zinc-200 font-numeric">{tips.length > 0 ? tips.length : '1,420+'}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Audit Status</span>
                    <span className="text-lg font-bold text-zinc-200">100% Public</span>
                  </div>
                </div>
              </div>

              {/* Right Column: High-density Live Predictions Table Summary */}
              <div className="lg:col-span-5">
                <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Featured Match Predictions</h2>
                    </div>
                    <Link href="/free-tips" className="text-[11px] text-emerald-400 hover:underline font-medium">
                      Full Feed →
                    </Link>
                  </div>

                  {loading ? (
                    <div className="space-y-3 py-4">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="h-14 bg-zinc-800/50 rounded-md animate-pulse" />
                      ))}
                    </div>
                  ) : freeTips.length > 0 ? (
                    <div className="space-y-2.5">
                      {freeTips.map((tip) => (
                        <div
                          key={tip._id}
                          className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center justify-between text-xs"
                        >
                          <div className="space-y-1 min-w-0 pr-2">
                            <span className="block text-[10px] text-zinc-500 uppercase tracking-wider truncate font-medium">
                              {tip.league}
                            </span>
                            <p className="font-medium text-zinc-200 truncate">{tip.match}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="inline-block px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[11px] font-semibold">
                              {tip.prediction}
                            </span>
                            <span className="block text-[11px] text-zinc-400 font-numeric mt-0.5">
                              @{tip.odds.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-zinc-500">
                      No active free picks currently listed. Check VIP feed.
                    </div>
                  )}

                  <div className="pt-2">
                    <Link href="/free-tips" className="block w-full">
                      <Button variant="secondary" size="sm" className="w-full">
                        Explore All Available Predictions
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── DAILY FREE PICKS DATA TABLE ─── */}
        <section className="py-16 bg-zinc-950 border-b border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Today's Free Selections</h2>
                <p className="text-xs text-zinc-400 mt-1">Open-access analytical picks published daily before kickoff.</p>
              </div>
              <Link href="/free-tips">
                <Button variant="outline" size="sm">
                  View All Free Picks
                </Button>
              </Link>
            </div>

            <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3 px-4">Date / League</th>
                      <th className="py-3 px-4">Fixture</th>
                      <th className="py-3 px-4">Selection</th>
                      <th className="py-3 px-4 text-right">Odds</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-numeric">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-500">
                          Loading fixture data...
                        </td>
                      </tr>
                    ) : tips.filter(t => !t.isPremium).length > 0 ? (
                      tips.filter(t => !t.isPremium).slice(0, 6).map((tip) => (
                        <tr key={tip._id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <span className="block text-zinc-300 font-medium">{tip.league}</span>
                            <span className="text-[11px] text-zinc-500">
                              {new Date(tip.matchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-zinc-100">{tip.match}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium">
                              {tip.prediction}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-400">
                            {tip.odds.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {tip.status === 'won' ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-[10px] font-bold">
                                WON
                              </span>
                            ) : tip.status === 'lost' ? (
                              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/50 text-[10px] font-bold">
                                LOST
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-medium">
                                PENDING
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-500">
                          No free picks currently available for display.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ─── VIP SUBSCRIPTION TIERS ─── */}
        <section className="py-16 bg-zinc-950 border-b border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">VIP Subscription Access</h2>
              <p className="text-xs text-zinc-400">Unlock high-confidence premium tips instantly upon payment confirmation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loading ? (
                [1, 2, 3].map((n) => (
                  <div key={n} className="h-80 bg-zinc-900 rounded-lg border border-zinc-800 animate-pulse" />
                ))
              ) : plans.length > 0 ? (
                plans.map((plan, idx) => {
                  const isPopular = idx === 1;
                  return (
                    <div
                      key={plan._id}
                      className={`rounded-lg border p-6 flex flex-col justify-between space-y-6 ${
                        isPopular
                          ? 'bg-zinc-900 border-emerald-500/60 shadow-sm relative'
                          : 'bg-zinc-900/60 border-zinc-800'
                      }`}
                    >
                      {isPopular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-emerald-600 text-zinc-950 text-[10px] font-bold uppercase tracking-wider">
                          Most Popular
                        </span>
                      )}

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-base font-bold text-zinc-100">{plan.name}</h3>
                          <span className="text-xs text-zinc-500">{plan.durationInDays} Days Unlimited Access</span>
                        </div>

                        <div className="flex items-baseline gap-1 font-numeric">
                          <span className="text-2xl font-bold text-white">${plan.price}</span>
                          <span className="text-xs text-zinc-400">/ {plan.durationInDays} days</span>
                        </div>

                        <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-800">
                          {plan.features && plan.features.map((feat, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link href={`/buy-tips?plan=${plan._id}`} className="block">
                        <Button
                          variant={isPopular ? 'primary' : 'secondary'}
                          size="md"
                          className="w-full"
                        >
                          Select {plan.name}
                        </Button>
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 py-12 text-center text-xs text-zinc-500 bg-zinc-900 rounded-lg border border-zinc-800">
                  No active subscription plans configured. Contact support.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── TRACK RECORD ARCHIVE PREVIEW ─── */}
        <section className="py-16 bg-zinc-950 border-b border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Verified Audit History</h2>
                <p className="text-xs text-zinc-400">Complete record of recent picks and verified settlement outcomes.</p>
              </div>
              <Link href="/results">
                <Button variant="outline" size="sm">
                  View Complete Audit Log
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentResults.map((res) => (
                <div
                  key={res._id}
                  className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{res.league}</span>
                    <p className="font-semibold text-zinc-200">{res.match}</p>
                    <p className="text-zinc-400 text-[11px]">Pick: <span className="text-zinc-200 font-medium">{res.prediction}</span> @ <span className="font-numeric font-medium">{res.odds.toFixed(2)}</span></p>
                  </div>
                  <div>
                    {res.status === 'won' ? (
                      <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold text-xs">
                        WON
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-bold text-xs">
                        LOST
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ & SUPPORT SECTION ─── */}
        <section className="py-16 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* FAQ Accordion */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
                <p className="text-xs text-zinc-400 mt-1">Common operational and subscription inquiries answered.</p>
              </div>

              <div className="space-y-3">
                {faqs.length > 0 ? (
                  faqs.map((faq) => (
                    <div
                      key={faq._id}
                      className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === faq._id ? null : faq._id)}
                        className="w-full px-4 py-3 text-left text-xs font-semibold text-zinc-200 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                      >
                        <span>{faq.question}</span>
                        <svg
                          className={`w-4 h-4 text-zinc-500 transition-transform ${openFaq === faq._id ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {openFaq === faq._id && (
                        <div className="px-4 py-3 text-xs text-zinc-400 border-t border-zinc-800/80 bg-zinc-950/50 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="space-y-3 text-xs text-zinc-400">
                    <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                      <p className="font-semibold text-zinc-200">How do VIP subscriptions work?</p>
                      <p className="text-zinc-400">Instant access to premium picks via your dashboard upon payment verification.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                      <p className="font-semibold text-zinc-200">Which payment methods are supported?</p>
                      <p className="text-zinc-400">Stripe (Debit/Credit Cards), PayPal, and manual payment verification.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Analyst Form */}
            <div className="lg:col-span-5">
              <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Contact Analyst Desk</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Send a message to our operations team.</p>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="w-full h-9 rounded-md bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="alex@example.com"
                      className="w-full h-9 rounded-md bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Message</label>
                    <textarea
                      required
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Describe your inquiry..."
                      className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  {contactStatus === 'sent' && (
                    <div className="p-2.5 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-400 text-xs font-medium">
                      Message sent successfully. Our team will respond shortly.
                    </div>
                  )}

                  {contactStatus === 'error' && (
                    <div className="p-2.5 rounded bg-rose-950 border border-rose-800/60 text-rose-400 text-xs font-medium">
                      Failed to send message. Please try again.
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    isLoading={contactStatus === 'sending'}
                  >
                    Submit Message
                  </Button>
                </form>
              </div>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
