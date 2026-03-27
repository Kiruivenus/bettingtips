"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
  result?: string;
  planIds?: Array<{ _id: string; name: string }> | string[];
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
  const activeId = typeof userActivePlan === 'string' ? userActivePlan : userActivePlan?._id;
  const hasAccess = isFree || (isSubscriptionActive && (activeId === planId || user?.role === 'admin'));

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
                if (!t.planIds) return false;
                // Handle both populated and unpopulated planIds
                const ids = t.planIds.map((p: any) => typeof p === 'object' && p ? p._id : p);
                return ids.includes(planId);
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
        <header className="md:sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-6 mb-8">
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
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <>
            {/* Active / Pending Tips */}
            <section>
              <h2 className="text-lg font-bold text-white mb-6">Today's Picks</h2>
              {pendingTips.length > 0 ? (
                <MatchResults tips={pendingTips} showPlanBadge={false} />
              ) : (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-zinc-400">No active predictions right now. Check back soon!</p>
                </div>
              )}
            </section>

            {/* Past Results */}
            {pastTips.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-white mb-6">Past Results</h2>
                <MatchResults tips={pastTips} showPlanBadge={false} />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
