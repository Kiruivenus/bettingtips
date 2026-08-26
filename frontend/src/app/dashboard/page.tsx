"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

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

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const userActivePlan = user?.activePlan;
  const isSubscriptionActive = user?.subscriptionExpiry
    ? new Date(user.subscriptionExpiry) > new Date()
    : false;

  useEffect(() => {
    refreshUser();
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_URL}/api/plans`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setPlans(data.filter((p: Plan) => p.isActive));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const isPlanOwned = (planId: string) => {
    if (!isSubscriptionActive || !userActivePlan) return false;
    const activeId = typeof userActivePlan === 'string' ? userActivePlan : userActivePlan._id;
    return activeId === planId;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">User Workspace</span>
        <h1 className="text-2xl font-bold text-white tracking-tight">Active Memberships & Predictions</h1>
        <p className="text-xs text-zinc-400">Manage active VIP packages and view unlocked match selections.</p>
      </div>

      {/* Subscription Status Banner */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-medium">Subscription Status</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSubscriptionActive ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
            <span className="text-sm font-bold text-white">
              {isSubscriptionActive ? 'VIP Access Granted' : 'Standard Free Tier'}
            </span>
          </div>
          {isSubscriptionActive && user?.subscriptionExpiry && (
            <span className="text-xs text-zinc-400 font-numeric block pt-0.5">
              Active until: {new Date(user.subscriptionExpiry).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>

        <Link href="/buy-tips">
          <Button variant={isSubscriptionActive ? 'secondary' : 'primary'} size="sm">
            {isSubscriptionActive ? 'Extend Membership' : 'Upgrade to VIP'}
          </Button>
        </Link>
      </div>

      {/* Available Package Feeds */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Prediction Package Portals</h2>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-zinc-900 rounded-lg border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            
            {/* Free Plan Access Card */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase">
                    Free Daily Picks
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">OPEN</span>
                </div>
                <h3 className="text-sm font-bold text-white">Free Tips Feed</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Open-access football predictions available daily to all registered members.
                </p>
              </div>

              <Link href="/free-tips">
                <Button variant="secondary" size="sm" className="w-full">
                  Access Free Picks →
                </Button>
              </Link>
            </div>

            {/* Owned VIP Plans */}
            {plans.filter(p => isPlanOwned(p._id)).map((plan) => (
              <div key={plan._id} className="bg-zinc-900 rounded-lg border border-emerald-500/60 p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold uppercase">
                      UNLOCKED VIP
                    </span>
                    <span className="text-xs text-emerald-400 font-bold font-numeric">${plan.price}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{plan.name} Package</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Premium selections with high-confidence odds and match statistics.
                  </p>
                </div>

                <Link href={`/dashboard/games/${plan._id}`}>
                  <Button variant="primary" size="sm" className="w-full">
                    View VIP Picks →
                  </Button>
                </Link>
              </div>
            ))}

            {/* Locked VIP Plans */}
            {plans.filter(p => !isPlanOwned(p._id)).map((plan) => (
              <div key={plan._id} className="bg-zinc-900/60 rounded-lg border border-zinc-800/80 p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-500 text-[10px] font-semibold uppercase">
                      LOCKED VIP
                    </span>
                    <span className="text-xs text-zinc-400 font-numeric">${plan.price}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-300">{plan.name} Package</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Requires active {plan.name} subscription authorization.
                  </p>
                </div>

                <Link href={`/buy-tips?plan=${plan._id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Unlock Package Access
                  </Button>
                </Link>
              </div>
            ))}

          </div>
        )}
      </div>

    </div>
  );
}
