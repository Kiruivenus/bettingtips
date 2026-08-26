import React from 'react';

interface Tip {
  _id: string;
  match: string;
  league: string;
  prediction: string;
  odds: number;
  status: 'pending' | 'won' | 'lost' | 'UPCOMING' | 'ACTIVE' | 'LOCKED' | 'COMPLETED' | 'VOID';
  isPremium: boolean;
  matchDate: string;
  confidence?: number;
  result?: string;
  planIds?: Array<{ _id: string; name: string }> | string[];
}

interface MatchResultsProps {
  tips: Tip[];
  showPlanBadge?: boolean;
}

export const MatchResults: React.FC<MatchResultsProps> = ({ tips, showPlanBadge = false }) => {
  if (tips.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-900/60 border border-zinc-800 rounded-lg">
        <p className="text-xs text-zinc-500 font-medium">No verified match records logged for selected filters.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-900/90 rounded-lg border border-zinc-800 overflow-hidden font-numeric">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
              <th className="py-3 px-4">Date / League</th>
              <th className="py-3 px-4">Fixture / Match</th>
              <th className="py-3 px-4">Selection</th>
              <th className="py-3 px-4 text-right">Odds</th>
              <th className="py-3 px-4 text-center">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {tips.map((tip) => (
              <tr key={tip._id} className="hover:bg-zinc-800/40 transition-colors">
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="block text-zinc-300 font-medium">{tip.league}</span>
                  <span className="text-[11px] text-zinc-500">
                    {new Date(tip.matchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-zinc-100">
                  <div className="flex items-center gap-2">
                    <span>{tip.match}</span>
                    {showPlanBadge && tip.isPremium && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/50 text-[9px] font-bold uppercase">
                        VIP
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium">
                    {tip.prediction}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400 whitespace-nowrap">
                  {tip.odds ? tip.odds.toFixed(2) : 'N/A'}
                </td>
                <td className="py-3 px-4 text-center whitespace-nowrap">
                  {tip.status === 'won' || tip.status === 'COMPLETED' ? (
                    <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold text-[10px]">
                      WON {tip.result ? `(${tip.result})` : ''}
                    </span>
                  ) : tip.status === 'lost' ? (
                    <span className="px-2.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-bold text-[10px]">
                      LOST {tip.result ? `(${tip.result})` : ''}
                    </span>
                  ) : tip.status === 'LOCKED' ? (
                    <span className="px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 font-bold text-[10px]">
                      LOCKED
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px]">
                      PENDING
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
