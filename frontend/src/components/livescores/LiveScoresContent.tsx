"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { API_URL } from '@/lib/constants';
import { MatchCard } from '@/components/livescores/MatchCard';

type Tab = 'live' | 'upcoming' | 'results';

export const LiveScoresContent = () => {
  const [activeTab, setActiveTab] = useState<Tab>('live');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('all');

  const fetchMatches = async (tab: Tab, isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const endpoint = tab === 'live' ? 'live' : tab === 'upcoming' ? 'upcoming' : 'results';
      const res = await fetch(`${API_URL}/api/livescores/${endpoint}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      if (Array.isArray(data)) setMatches(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Could not load live score data from ESPN.');
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
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab]);

  // Extract all unique league names for the filter pills
  const availableLeagues = useMemo(() => {
    const set = new Set<string>();
    matches.forEach(m => {
      if (m.league?.name) set.add(m.league.name);
    });
    return Array.from(set).sort();
  }, [matches]);

  // Filter matches by search query & league selection
  const filteredMatches = useMemo(() => {
    return matches.filter((m: any) => {
      const matchesSearch = !searchQuery.trim() ||
        m.teams?.home?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.teams?.away?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.league?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLeague = selectedLeague === 'all' || m.league?.name === selectedLeague;
      
      return matchesSearch && matchesLeague;
    });
  }, [matches, searchQuery, selectedLeague]);

  // Group filtered matches by League Name for crisp structured display
  const groupedByLeague = useMemo(() => {
    const groups: Record<string, { leagueLogo: string; items: any[] }> = {};
    
    filteredMatches.forEach(m => {
      const name = m.league?.name || 'Other Competitions';
      if (!groups[name]) {
        groups[name] = {
          leagueLogo: m.league?.logo || '',
          items: []
        };
      }
      groups[name].items.push(m);
    });

    return Object.entries(groups);
  }, [filteredMatches]);

  return (
    <div className="space-y-6">
      
      {/* Controls & Search */}
      <div className="space-y-4 border-b border-zinc-800 pb-4">
        
        {/* Top Controls Row: Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Tab Buttons */}
          <div className="flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-md w-full sm:w-auto">
            {(['live', 'upcoming', 'results'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedLeague('all'); }}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors capitalize ${
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

          {/* Search Box & Total Match Counter */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search team or league..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-numeric font-medium text-emerald-400 shrink-0">
              {filteredMatches.length} Fixtures Loaded
            </span>
          </div>

        </div>

        {/* League Selector Pills */}
        {availableLeagues.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setSelectedLeague('all')}
              className={`px-3 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedLeague === 'all'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              All Competitions ({matches.length})
            </button>

            {availableLeagues.map((league) => (
              <button
                key={league}
                onClick={() => setSelectedLeague(league)}
                className={`px-3 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                  selectedLeague === league
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {league}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Fixtures Feed Grouped by League */}
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
              className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-medium text-zinc-200 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : groupedByLeague.length > 0 ? (
          <div className="space-y-8">
            {groupedByLeague.map(([leagueName, group]) => (
              <div key={leagueName} className="space-y-3">
                {/* Sticky League Header */}
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/80 sticky top-16 bg-zinc-950/90 backdrop-blur-md z-20 py-2">
                  {group.leagueLogo && (
                    <img src={group.leagueLogo} alt={leagueName} className="w-4 h-4 object-contain" />
                  )}
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">{leagueName}</h3>
                  <span className="text-[10px] font-numeric text-zinc-500 font-medium">({group.items.length})</span>
                </div>

                {/* Matches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((match: any) => (
                    <MatchCard key={match.fixture.id} match={match} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-lg max-w-xl mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-zinc-200">No {activeTab} matches found</h3>
            <p className="text-xs text-zinc-500">There are currently no {activeTab} fixtures matching your query criteria.</p>
          </div>
        )}
      </div>

    </div>
  );
};
