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
  const [searchQuery, setSearchQuery] = useState('');

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
      setError('Could not load live score data from server.');
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

  const filteredMatches = matches.filter((m: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.teams?.home?.name?.toLowerCase().includes(q) ||
      m.teams?.away?.name?.toLowerCase().includes(q) ||
      m.league?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-md w-full sm:w-auto">
          {(['live', 'upcoming', 'results'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab === 'live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search team or league..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 rounded-md bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid List */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-36 bg-zinc-900/60 rounded-lg border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-lg max-w-lg mx-auto space-y-3">
            <p className="text-xs text-zinc-400">{error}</p>
            <button 
              onClick={() => fetchMatches(activeTab)}
              className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-xs font-medium text-zinc-200 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((match: any) => (
              <MatchCard key={match.fixture.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-lg max-w-xl mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-zinc-200">No {activeTab} matches found</h3>
            <p className="text-xs text-zinc-500">There are currently no {activeTab} fixtures matching your query.</p>
          </div>
        )}
      </div>
    </div>
  );
};
