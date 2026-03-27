"use client";

import React, { useEffect, useState } from 'react';
import { API_URL } from '@/lib/constants';
import { MatchCard } from '@/components/livescores/MatchCard';

type Tab = 'live' | 'upcoming' | 'results';

export const LiveScoresContent = () => {
  const [activeTab, setActiveTab] = useState<Tab>('live');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async (tab: Tab, isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const endpoint = tab === 'live' ? 'live' : tab === 'upcoming' ? 'upcoming' : 'results';
      const res = await fetch(`${API_URL}/api/livescores/${endpoint}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setMatches(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Could not load matches. Please try again later.');
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(activeTab);

    let interval: NodeJS.Timeout;
    if (activeTab === 'live') {
      interval = setInterval(() => {
        fetchMatches('live', true);
      }, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab]);

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex items-center justify-center p-1 bg-white/5 border border-white/5 rounded-2xl max-w-sm mx-auto">
        <button 
          onClick={() => setActiveTab('live')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'live' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-zinc-400 hover:text-white'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'live' ? 'bg-black' : 'bg-red-500 animate-pulse'}`} />
          Live
        </button>
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'upcoming' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-zinc-400 hover:text-white'}`}
        >
          Upcoming
        </button>
        <button 
          onClick={() => setActiveTab('results')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'results' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-zinc-400 hover:text-white'}`}
        >
          Results
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-44 bg-white/5 rounded-2xl border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-500/5 border border-red-500/10 rounded-3xl max-w-xl mx-auto">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <p className="text-zinc-300 font-medium mb-6">{error}</p>
            <button 
              onClick={() => fetchMatches(activeTab)}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold transition-colors"
            >
              Retry
            </button>
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {matches.map((match: any) => (
              <MatchCard key={match.fixture.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/3 border border-white/5 rounded-3xl max-w-2xl mx-auto backdrop-blur-sm">
              <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-500">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            <h3 className="text-xl font-bold text-white mb-2">No {activeTab} matches found</h3>
            <p className="text-zinc-500 max-w-xs mx-auto">There are currently no {activeTab} football matches to display. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
};
