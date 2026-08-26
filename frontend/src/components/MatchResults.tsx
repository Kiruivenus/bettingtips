import React, { useState } from 'react';

interface Tip {
  _id: string;
  match: string;
  league: string;
  prediction: string;
  odds: number;
  referenceOdds?: number | null;
  status: 'pending' | 'won' | 'lost' | 'UPCOMING' | 'ACTIVE' | 'LOCKED' | 'COMPLETED' | 'VOID';
  isPremium: boolean;
  matchDate: string;
  confidence?: number;
  confidenceLevel?: 'VERY HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'NO PREDICTION';
  result?: string;
  keyFactors?: string[];
  riskFactors?: string[];
  planIds?: Array<{ _id: string; name: string }> | string[];
}

interface MatchResultsProps {
  tips: Tip[];
  showPlanBadge?: boolean;
}

export const MatchResults: React.FC<MatchResultsProps> = ({ tips, showPlanBadge = false }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (tips.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-900/60 border border-zinc-800 rounded-lg font-sans">
        <p className="text-xs text-zinc-500 font-medium">No verified match records logged for selected filters.</p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full bg-zinc-900/90 rounded-lg border border-zinc-800 overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
              <th className="py-3 px-4">Date / League</th>
              <th className="py-3 px-4">Fixture / Match</th>
              <th className="py-3 px-4">Selection</th>
              <th className="py-3 px-4 text-center">Confidence Level</th>
              <th className="py-3 px-4 text-right">Odds</th>
              <th className="py-3 px-4 text-center">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {tips.map((tip) => {
              const isExpanded = expandedId === tip._id;
              const hasFactors = (tip.keyFactors && tip.keyFactors.length > 0) || (tip.riskFactors && tip.riskFactors.length > 0);

              const confLevel = tip.confidenceLevel || (tip.confidence && tip.confidence >= 85 ? 'VERY HIGH' : tip.confidence && tip.confidence >= 75 ? 'HIGH' : 'MODERATE');

              return (
                <React.Fragment key={tip._id}>
                  <tr className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="block text-zinc-300 font-medium">{tip.league}</span>
                      <span className="text-[11px] text-zinc-500 font-numeric">
                        {new Date(tip.matchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-100">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span>{tip.match}</span>
                          {showPlanBadge && tip.isPremium && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/50 text-[9px] font-bold uppercase">
                              VIP
                            </span>
                          )}
                        </div>
                        {hasFactors && (
                          <button
                            onClick={() => toggleExpand(tip._id)}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium text-left inline-flex items-center gap-1"
                          >
                            <span>{isExpanded ? 'Hide AI Analysis ▲' : 'View AI Analysis ▼'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium">
                        {tip.prediction}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        confLevel === 'VERY HIGH' 
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                          : confLevel === 'HIGH'
                          ? 'bg-teal-950 text-teal-400 border-teal-800/60'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}>
                        {confLevel} {tip.confidence ? `(${tip.confidence}%)` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400 whitespace-nowrap font-numeric">
                      {tip.referenceOdds ? tip.referenceOdds.toFixed(2) : (tip.odds ? tip.odds.toFixed(2) : 'N/A')}
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
                          UPCOMING
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Expanded Analysis Details */}
                  {isExpanded && hasFactors && (
                    <tr className="bg-zinc-950/80 border-b border-zinc-800">
                      <td colSpan={6} className="p-4 space-y-3">
                        <div className="grid md:grid-cols-2 gap-4 text-xs">
                          {tip.keyFactors && tip.keyFactors.length > 0 && (
                            <div className="bg-zinc-900 border border-emerald-500/20 rounded-lg p-3 space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                                Key Predictive Factors
                              </span>
                              <ul className="space-y-1 text-zinc-300">
                                {tip.keyFactors.map((kf, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-emerald-500 font-bold">•</span>
                                    <span>{kf}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {tip.riskFactors && tip.riskFactors.length > 0 && (
                            <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-3 space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                                Risk & Contradiction Factors
                              </span>
                              <ul className="space-y-1 text-zinc-300">
                                {tip.riskFactors.map((rf, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-amber-500 font-bold">•</span>
                                    <span>{rf}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
