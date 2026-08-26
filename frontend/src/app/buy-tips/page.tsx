"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { API_URL } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Commercial Subscriptions
            </span>
            <h1 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              VIP Prediction Access Tiers
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Select your membership package to instantly unlock high-odds, verified premium football tips.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="h-96 rounded-lg bg-zinc-900 border border-zinc-800 animate-pulse" />
              ))
            ) : plans.length > 0 ? (
              plans.map((plan, idx) => {
                const isPopular = idx === 1;
                const isSelected = selectedPlanId === plan._id;
                return (
                  <div
                    key={plan._id}
                    className={`rounded-lg border p-6 flex flex-col justify-between space-y-6 transition-all ${
                      isSelected
                        ? 'bg-zinc-900 border-emerald-500 ring-2 ring-emerald-500/20'
                        : isPopular
                        ? 'bg-zinc-900/90 border-emerald-500/60'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-base font-bold text-white">{plan.name}</h2>
                          <span className="text-xs text-zinc-400">{plan.durationInDays} Days Coverage</span>
                        </div>
                        {isPopular && (
                          <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold uppercase tracking-wider">
                            Popular Choice
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-1 font-numeric">
                        <span className="text-3xl font-bold text-white">${plan.price}</span>
                        <span className="text-xs text-zinc-400">/ {plan.durationInDays} days</span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-zinc-300 pt-4 border-t border-zinc-800">
                        {plan.features && plan.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2">
                      {user ? (
                        <Link href={`/dashboard?checkoutPlan=${plan._id}`} className="block">
                          <Button
                            variant={isPopular ? 'primary' : 'secondary'}
                            size="md"
                            className="w-full"
                          >
                            Subscribe to {plan.name}
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/login?redirect=/buy-tips`} className="block">
                          <Button
                            variant={isPopular ? 'primary' : 'secondary'}
                            size="md"
                            className="w-full"
                          >
                            Sign In to Purchase
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 p-12 text-center text-xs text-zinc-500 bg-zinc-900 rounded-lg border border-zinc-800">
                No subscription plans currently available. Please check back shortly.
              </div>
            )}
          </div>

          {/* Payment Methods & Instant Unlock Matrix */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-sm font-bold text-white">Supported Settlement Methods & Automated Fulfillment</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Instant dashboard unlock upon payment authorization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded bg-zinc-950 border border-zinc-800/80 space-y-2">
                <span className="font-semibold text-zinc-200 block">Credit & Debit Cards (Stripe)</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Automated processing via 256-bit encrypted Stripe checkout. Instant access granted automatically.
                </p>
              </div>

              <div className="p-4 rounded bg-zinc-950 border border-zinc-800/80 space-y-2">
                <span className="font-semibold text-zinc-200 block">PayPal Gateway</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Secure international PayPal transfer. Account unlocked immediately upon webhook verification.
                </p>
              </div>

              <div className="p-4 rounded bg-zinc-950 border border-zinc-800/80 space-y-2">
                <span className="font-semibold text-zinc-200 block">Manual / Mobile Payments</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Local payment option with transaction reference verification reviewed by our administrative team.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
