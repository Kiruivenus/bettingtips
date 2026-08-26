import React from 'react';

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
      id: number;
      status: {
        elapsed: number;
        short: string;
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

export const MatchCard: React.FC<MatchProps> = ({ match }) => {
  const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'BT'].includes(match.fixture.status.short);
  const isFinished = match.fixture.status.short === 'FT';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-numeric transition-colors hover:border-zinc-700">
      {/* League Header */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          {match.league.logo && <img src={match.league.logo} alt={match.league.name} className="w-4 h-4 object-contain" />}
          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 truncate max-w-[160px]">{match.league.name}</span>
        </div>
        <div>
          {isLive ? (
            <div className="flex items-center gap-1.5 bg-rose-950 text-rose-400 border border-rose-800/60 px-2 py-0.5 rounded text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              LIVE {match.fixture.status.elapsed}'
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
            <div className="w-6 h-6 rounded bg-zinc-950 p-1 flex items-center justify-center border border-zinc-800 shrink-0">
              <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-full h-full object-contain" />
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
            <div className="w-6 h-6 rounded bg-zinc-950 p-1 flex items-center justify-center border border-zinc-800 shrink-0">
              <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-full h-full object-contain" />
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
