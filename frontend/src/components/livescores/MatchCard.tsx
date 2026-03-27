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
  const isUpcoming = match.fixture.status.short === 'NS';

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all duration-300 group">
      {/* League Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          {match.league.logo && <img src={match.league.logo} alt={match.league.name} className="w-5 h-5 object-contain" />}
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 group-hover:text-zinc-400 transition-colors">{match.league.name}</span>
        </div>
        <div>
          {isLive ? (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-2 py-1 rounded-md text-[10px] font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              LIVE {match.fixture.status.elapsed}'
            </div>
          ) : isFinished ? (
            <span className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded-md">FINISHED</span>
          ) : (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
              {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Teams & Score */}
      <div className="grid grid-cols-1 gap-4">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 p-1.5 flex items-center justify-center border border-white/5">
              <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-semibold text-zinc-200">{match.teams.home.name}</span>
          </div>
          <span className={`text-xl font-bold ${isLive ? 'text-white' : 'text-zinc-500'}`}>
            {match.goals.home ?? '-'}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 p-1.5 flex items-center justify-center border border-white/5">
              <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-semibold text-zinc-200">{match.teams.away.name}</span>
          </div>
          <span className={`text-xl font-bold ${isLive ? 'text-white' : 'text-zinc-500'}`}>
            {match.goals.away ?? '-'}
          </span>
        </div>
      </div>

      {/* Footer Info (Date) */}
      {!isLive && (
        <div className="mt-4 pt-3 border-t border-white/5 flex justify-center">
            <span className="text-[10px] text-zinc-600 font-medium">
                {new Date(match.fixture.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
        </div>
      )}
    </div>
  );
};
