"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const headers: any = {};
        if (user?.token) {
          headers['Authorization'] = `Bearer ${user.token}`;
        }
        const res = await fetch(`${API_URL}/api/tips`, {
          headers
        });
        const data = await res.json();
        setTips(data);
      } catch (error) {
        console.error("Error fetching tips", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, [user]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Today's Betting Tips</h1>
          <p className="text-zinc-400 text-lg">Expert predictions to give you the winning edge.</p>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : tips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
          <svg className="w-16 h-16 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-xl font-medium text-white mb-2">No tips available</h3>
          <p className="text-zinc-400">Check back later for today's predictions.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tips.map((tip) => (
            <div 
              key={tip._id} 
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group
                ${tip.isPremium 
                  ? 'bg-gradient-to-b from-amber-500/10 to-black/40 border-amber-500/20 hover:border-amber-500/40' 
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 backdrop-blur-sm'
                }
              `}
            >
              {tip.isPremium && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-[10px] font-bold uppercase tracking-widest text-white py-1 px-3 rounded-bl-lg shadow-lg">
                    Premium
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md uppercase tracking-wider">
                      {tip.league}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm
                    ${tip.status === 'won' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
                      tip.status === 'lost' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 
                      'bg-zinc-800 text-zinc-300 border border-zinc-700'}
                  `}>
                    {tip.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1 leading-tight">{tip.match}</h3>
                <p className="text-xs text-zinc-500 mb-6 flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(tip.matchDate).toLocaleString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 font-medium mb-1 uppercase tracking-wider">Prediction</p>
                    <p className={`font-bold ${tip.isPremium ? 'text-amber-400' : 'text-white'}`}>
                      {tip.prediction}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 font-medium mb-1 uppercase tracking-wider">Odds</p>
                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-emerald-500 border border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      <span className="text-sm font-bold text-white">{tip.odds.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Premium Lock Overlay for exact masking (if implemented by API, assuming API blocks prediction text) */}
              {tip.isPremium && tip.prediction === 'Hidden' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-white font-bold mb-1">Premium Tip</p>
                  <p className="text-xs text-zinc-300 mb-4">Upgrade your plan to unlock this prediction.</p>
                  <Link href="/dashboard/plans" className="text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-black py-2 px-4 rounded-full transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                    Upgrade Now
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
