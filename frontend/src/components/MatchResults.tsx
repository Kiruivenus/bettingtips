import React from 'react';

interface Tip {
  _id: string;
  match: string;
  league: string;
  prediction: string;
  odds: number;
  status: 'pending' | 'won' | 'lost';
  isPremium: boolean;
  matchDate: string;
  result?: string;
  planIds?: Array<{ _id: string; name: string }> | string[];
}

interface MatchResultsProps {
  tips: Tip[];
  showPlanBadge?: boolean;
}

export const MatchResults: React.FC<MatchResultsProps> = ({ tips, showPlanBadge = false }) => {
  // Group tips by date
  const groupedResults = tips.reduce((groups: Record<string, Tip[]>, tip) => {
    const date = new Date(tip.matchDate);
    // Use DD.MM format as in screenshot
    const dateStr = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit'
    });
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(tip);
    return groups;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(groupedResults).sort((a, b) => {
    return new Date(groupedResults[b][0].matchDate).getTime() - new Date(groupedResults[a][0].matchDate).getTime();
  });

  if (tips.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
        <p className="text-zinc-500 font-bold italic">No match results found.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/5 rounded-2xl border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm">
      <div className="divide-y divide-white/5">
        {sortedDates.map((dateStr) => (
          <div key={dateStr} className="flex flex-col">
            {groupedResults[dateStr].map((tip, index) => (
              <div 
                key={tip._id} 
                className="flex items-center gap-4 py-4 px-4 hover:bg-white/[0.03] transition-all duration-300 group"
              >
                {/* Date Column */}
                <div className="w-12 shrink-0 text-red-500 font-black text-xs tracking-tight">
                  {index === 0 ? dateStr : ''}
                </div>

                {/* Match Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-blue-400 hover:text-blue-300 border-b border-blue-400/20 hover:border-blue-400/50 font-bold text-[13px] cursor-pointer truncate transition-all">
                      {tip.match}
                    </span>
                    {showPlanBadge && tip.isPremium && (
                      <span className="text-[8px] font-black uppercase tracking-tighter bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/10">
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{tip.league}</div>
                </div>

                {/* Market / Prediction */}
                <div className="hidden md:block text-zinc-400 font-medium text-xs text-right min-w-[120px]">
                  {tip.prediction}
                </div>

                {/* Odds */}
                <div className="text-zinc-500 font-bold text-xs w-12 text-right">
                  {tip.odds.toFixed(2)}
                </div>

                {/* Score / Result */}
                <div className="w-24 text-right font-black text-sm text-white">
                  {tip.status === 'pending' ? (
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center justify-end gap-1.5">
                       {new Date(tip.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    tip.result || (tip.status === 'won' ? 'WON' : 'LOST')
                  )}
                </div>

                {/* Status Icon */}
                <div className="w-6 flex justify-center shrink-0">
                  {tip.status === 'won' ? (
                    <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/40">
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : tip.status === 'lost' ? (
                    <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/40">
                       <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-zinc-800 border-dashed animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
