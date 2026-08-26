"use client";

import React, { useState } from 'react';

interface Team {
  name: string;
  logo: string;
}

interface League {
  name: string;
  logo: string;
}

interface MatchProps {
  match: {
    fixture: {
      id: string | number;
      status: {
        elapsed: number | null;
        displayClock?: string;
        short: string;
        detail?: string;
      };
      date: string;
    };
    league: League;
    teams: {
      home: Team;
      away: Team;
    };
    goals: {
      home: number | null;
      away: number | null;
    };
  };
}

// Helper component for team & league logos with graceful fallback on broken image links
const ImageWithFallback: React.FC<{ src?: string; alt: string; className: string; fallbackText: string }> = ({
  src,
  alt,
  className,
  fallbackText
}) => {
  const [imgError, setImgError] = useState(!src);

  if (imgError || !src) {
    return (
      <span className="flex items-center justify-center font-bold text-[9px] uppercase text-zinc-400 bg-zinc-800/40 rounded w-full h-full">
        {fallbackText.slice(0, 2)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImgError(true)}
    />
  );
};

export const MatchCard: React.FC<MatchProps> = ({ match }) => {
  const statusShort = match.fixture.status?.short || 'NS';
  const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'BT'].includes(statusShort);
  const isFinished = statusShort === 'FT';

  // Format live time cleanly (e.g. "LIVE 12'", "LIVE HT", "LIVE 45'+2")
  let liveTimeString = 'LIVE';
  if (statusShort === 'HT') {
    liveTimeString = 'LIVE HT';
  } else if (match.fixture.status.displayClock) {
    const raw = match.fixture.status.displayClock;
    liveTimeString = raw.toLowerCase().startsWith('live') ? raw.toUpperCase() : `LIVE ${raw.endsWith("'") ? raw : raw + "'"}`;
  } else if (match.fixture.status.elapsed !== null && match.fixture.status.elapsed !== undefined) {
    liveTimeString = `LIVE ${match.fixture.status.elapsed}'`;
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-numeric transition-colors hover:border-zinc-700">
      {/* League Header */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <div className="w-4 h-4 flex items-center justify-center shrink-0 overflow-hidden bg-transparent">
            <ImageWithFallback
              src={match.league.logo}
              alt={match.league.name}
              className="w-full h-full object-contain"
              fallbackText={match.league.name || 'LG'}
            />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 truncate max-w-[170px]">
            {match.league.name}
          </span>
        </div>

        <div className="shrink-0">
          {isLive ? (
            <div className="flex items-center gap-1.5 bg-rose-950 text-rose-400 border border-rose-800/60 px-2 py-0.5 rounded text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {liveTimeString}
            </div>
          ) : isFinished ? (
            <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">FINISHED</span>
          ) : (
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 border border-emerald-800/50 px-2 py-0.5 rounded">
              {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Teams & Score */}
      <div className="space-y-2 text-xs">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-6 h-6 flex items-center justify-center shrink-0 overflow-hidden bg-transparent">
              <ImageWithFallback
                src={match.teams.home.logo}
                alt={match.teams.home.name}
                className="w-full h-full object-contain"
                fallbackText={match.teams.home.name}
              />
            </div>
            <span className="font-semibold text-zinc-200 truncate">{match.teams.home.name}</span>
          </div>
          <span className={`font-bold text-sm shrink-0 ${isLive ? 'text-white' : 'text-zinc-400'}`}>
            {match.goals.home ?? '-'}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-6 h-6 flex items-center justify-center shrink-0 overflow-hidden bg-transparent">
              <ImageWithFallback
                src={match.teams.away.logo}
                alt={match.teams.away.name}
                className="w-full h-full object-contain"
                fallbackText={match.teams.away.name}
              />
            </div>
            <span className="font-semibold text-zinc-200 truncate">{match.teams.away.name}</span>
          </div>
          <span className={`font-bold text-sm shrink-0 ${isLive ? 'text-white' : 'text-zinc-400'}`}>
            {match.goals.away ?? '-'}
          </span>
        </div>
      </div>
    </div>
  );
};
