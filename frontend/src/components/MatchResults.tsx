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
  confidence?: number;
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

  const getTimeRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    if (diff <= 0) return "Matched";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h and ${minutes}min`;
    return `${minutes}min`;
  };

  if (tips.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
        <p className="text-zinc-500 font-bold italic">No match results found.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/5 rounded-2xl border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Desktop Header */}
      <div className="hidden md:flex items-center gap-4 px-6 py-3 bg-white/10 border-b border-white/5 text-[10px] uppercase tracking-widest font-black text-zinc-500">
        <div className="w-12 shrink-0">Date</div>
        <div className="flex-1">Event</div>
        <div className="text-right min-w-[120px]">Market</div>
        <div className="w-12 text-right">Odds</div>
        <div className="w-24 text-right">Result</div>
        <div className="w-6 shrink-0"></div>
      </div>

      {/* Mobile Header */}
      <div className="grid md:hidden grid-cols-2 bg-white/10 border-b border-white/5 text-[10px] uppercase tracking-widest font-black text-zinc-500">
        <div className="px-4 py-3 border-r border-white/5 text-center">Event</div>
        <div className="px-4 py-3 text-center">Betting tip</div>
      </div>

      <div className="divide-y divide-white/10 md:divide-white/5">
        {sortedDates.map((dateStr) => (
          <React.Fragment key={dateStr}>
            {groupedResults[dateStr].map((tip, index) => (
              <div key={tip._id} className="relative">
                {/* Desktop Layout */}
                <div className="hidden md:flex items-center gap-4 py-4 px-6 hover:bg-white/[0.03] transition-all duration-300 group">
                  <div className="w-12 shrink-0 text-red-500 font-black text-xs tracking-tight">
                    {index === 0 ? dateStr : ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-blue-400 hover:text-blue-300 border-b border-blue-400/20 hover:border-blue-400/50 font-bold text-[13px] cursor-pointer truncate transition-all">
                        {tip.match}
                      </span>
                      {showPlanBadge && tip.isPremium && (
                        <span className="text-[8px] font-black uppercase tracking-tighter bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          PRO
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{tip.league}</div>
                  </div>
                  <div className="text-zinc-400 font-medium text-xs text-right min-w-[120px]">
                    {tip.prediction}
                  </div>
                  <div className="text-zinc-500 font-bold text-xs w-12 text-right">
                    {tip.odds.toFixed(2)}
                  </div>
                  <div className="w-24 text-right font-black text-sm text-white">
                    {tip.status === 'pending' ? (
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center justify-end gap-1.5">
                        {new Date(tip.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      tip.result || (tip.status === 'won' ? 'WON' : 'LOST')
                    )}
                  </div>
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
                      <div className="w-5 h-5 rounded-full border border-white/10 border-dashed animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Mobile Layout (Resembling reference image) */}
                <div className="md:hidden grid grid-cols-2 group hover:bg-white/[0.02] transition-colors">
                  {/* Event Info */}
                  <div className="p-4 border-r border-white/5 space-y-2">
                    <div className="text-blue-400 font-bold text-sm leading-tight hover:text-blue-300 transition-colors">
                      {tip.match}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[11px] text-zinc-400 font-medium">
                        {new Date(tip.matchDate).toLocaleDateString('en-GB') + ' - ' + new Date(tip.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 capitalize">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        {getTimeRemaining(tip.matchDate)}
                      </div>
                    </div>
                  </div>

                  {/* Betting Tip Info */}
                  <div className="p-4 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="text-white font-black text-sm">
                        {tip.prediction}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="text-[11px] text-zinc-400 flex justify-between">
                          <span>Odds</span>
                          <span className="font-black text-white">{tip.odds.toFixed(2)}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 flex justify-between">
                          <span>Stake</span>
                          <span className="font-black text-white">{(tip.confidence ? Math.round(tip.confidence / 10) : 10)}/10</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <button className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                        View
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      
                      {/* Status indicator on mobile */}
                      {tip.status !== 'pending' && (
                        <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                          tip.status === 'won' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {tip.status}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
