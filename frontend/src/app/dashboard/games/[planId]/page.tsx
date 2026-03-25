"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
  planId?: { _id: string; name: string } | string;
}

interface Plan {
  _id: string;
  name: string;
  price: number;
  currency: string;
  durationInDays: number;
  maxOdds: number;
}

export default function GamesPage() {
  const params = useParams();
  const planId = params.planId as string;
  const { user } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const isFree = planId === 'free';

  // Check if user actually owns this plan (skip for free)
  const userActivePlan = user?.activePlan;
  const isSubscriptionActive = user?.subscriptionExpiry
    ? new Date(user.subscriptionExpiry) > new Date()
    : false;
  const hasAccess = isFree || (isSubscriptionActive && userActivePlan === planId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers: Record<string, string> = {};
        if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;

        // Fetch tips
        const tipsRes = await fetch(`${API_URL}/api/tips`, { headers });
        if (tipsRes.ok) {
          const tipsData = await tipsRes.json();
          if (Array.isArray(tipsData)) {
            if (isFree) {
              setTips(tipsData.filter((t: Tip) => !t.isPremium));
            } else {
              setTips(tipsData.filter((t: Tip) => {
                const tipPlanId = typeof t.planId === 'object' && t.planId ? t.planId._id : t.planId;
                return tipPlanId === planId;
              }));
            }
          }
        }

        // Fetch plan info if not free
        if (!isFree) {
          const planRes = await fetch(`${API_URL}/api/plans`);
          if (planRes.ok) {
            const plansData = await planRes.json();
            const found = Array.isArray(plansData) ? plansData.find((p: Plan) => p._id === planId) : null;
            if (found) setPlan(found);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [planId, isFree, user]);

  const pendingTips = tips.filter(t => t.status === 'pending');
  const pastTips = tips.filter(t => t.status === 'won' || t.status === 'lost');

  const planName = isFree ? 'Free Tips' : (plan?.name || 'Premium Plan');
  const planDescription = isFree
    ? 'Daily free expert predictions with full transparency.'
    : `Premium predictions with up to ${plan?.maxOdds || 'N/A'} odds.`;

  // If user doesn't have access to this plan, redirect message
  if (!loading && !hasAccess) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-6 mb-8">
          <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-white transition-colors mb-3 inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Plans
          </Link>
          <h1 className="text-2xl font-bold text-white">{planName}</h1>
        </header>
        <div className="px-4 sm:px-6 md:px-8 pb-8">
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Plan Not Active</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-sm">You need to purchase this plan to view its premium predictions.</p>
            <Link href="/dashboard/buy-tips" className="inline-flex items-center justify-center h-11 px-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              Buy Plan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-6 mb-8">
        <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-white transition-colors mb-3 inline-flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Plans
        </Link>
        <h1 className="text-2xl font-bold text-white mb-1">{planName}</h1>
        <p className="text-zinc-400 text-sm">{planDescription}</p>
      </header>

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-12">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-52 bg-white/5 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <>
            {/* Active / Pending Tips */}
            <section>
              <h2 className="text-lg font-bold text-white mb-4">Today's Picks</h2>
              {pendingTips.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingTips.map(tip => (
                    <div key={tip._id} className={`bg-zinc-900/80 border rounded-2xl p-5 transition-all duration-300 hover:border-emerald-500/30 hover:-translate-y-1 ${isFree ? 'border-white/10' : 'border-amber-500/20'}`}>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">{tip.league}</span>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          {new Date(tip.matchDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-4 leading-tight">{tip.match}</h3>
                      <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Prediction</p>
                          <p className={`text-sm font-bold ${isFree ? 'text-emerald-400' : 'text-amber-400'}`}>{tip.prediction}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Odds</p>
                          <div className="bg-white/10 px-3 py-1 rounded-lg">
                            <span className="text-sm font-extrabold text-white">{tip.odds.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-zinc-400">No active predictions right now. Check back soon!</p>
                </div>
              )}
            </section>

            {/* Past Results */}
            {pastTips.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-white mb-4">Past Results</h2>
                <div className="overflow-x-auto bg-black/20 border border-white/5 rounded-2xl">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                        <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Match</th>
                        <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Prediction</th>
                        <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Odds</th>
                        <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastTips.map(tip => (
                        <tr key={tip._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-xs text-zinc-400 whitespace-nowrap">{new Date(tip.matchDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-white">{tip.match}</td>
                          <td className="py-3 px-4 text-sm text-zinc-300">{tip.prediction}</td>
                          <td className="py-3 px-4 text-sm font-bold text-white">{tip.odds.toFixed(2)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                              tip.status === 'won' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {tip.status === 'won' ? '✓ Win' : '✗ Loss'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
