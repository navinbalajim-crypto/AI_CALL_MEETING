import React from 'react';
import { Badge } from '../common/Badge';
import { History, ArrowRight, Calendar, AlertTriangle, ExternalLink } from 'lucide-react';

export const HistoricalContextCard = ({
  item,
  onOpenMeeting,
  className = ''
}) => {
  return (
    <div className={`p-5 rounded-xl border border-amber-500/30 bg-gradient-to-b from-[#101526] to-[#0A0D18] shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="amber" dot>
            HISTORICAL CONTEXT (RAG)
          </Badge>
          <span className="text-xs text-amber-400/90 font-medium">
            Cross-Meeting Memory Link
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">96% Semantic Overlap</span>
      </div>

      <h4 className="text-sm font-semibold text-white mb-2">
        {item.topic || "Production Sign-off & Delivery Timeline Revision"}
      </h4>
      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
        {item.differenceSummary || "G13 detected a direct revision between this session's agreement and commitments logged in previous organizational records."}
      </p>

      {/* Comparison Grid: Previous vs Current */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Previous Meeting Record */}
        <div className="p-3.5 rounded-lg bg-surface-elevated/80 border border-white/8 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-mono text-slate-300">
              <History className="w-3 h-3 text-slate-400" />
              Previous: Sept 12 Sync
            </span>
            <span className="text-slate-500">G13-B4M81</span>
          </div>
          <div className="text-xs text-slate-300 font-medium italic">
            "{item.historicalStatement || "Raj Patel: 'We will push the full release to production on Friday, Sept 19.'"}"
          </div>
          <div className="text-[11px] text-rose-300 font-mono flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Previous Target: Friday, Sept 19
          </div>
        </div>

        {/* Current Meeting Record */}
        <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-amber-400">
            <span className="flex items-center gap-1 font-mono font-semibold">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Current Session: Today
            </span>
            <span className="text-amber-500 font-bold">REVISED</span>
          </div>
          <div className="text-xs text-slate-200 font-medium italic">
            "{item.currentStatement || "Raj Patel: 'Staging deployment on Friday, production sign-off moved to Monday morning.'"}"
          </div>
          <div className="text-[11px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            New Target: Monday morning, Sept 22
          </div>
        </div>
      </div>

      {/* Reason & Past Meeting Link */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5 flex-wrap gap-2">
        <span className="text-[11px] text-slate-400">
          Reason: Weekend soak testing under load
        </span>
        {onOpenMeeting && (
          <button
            onClick={() => onOpenMeeting('meet-102')}
            className="text-xs text-ai hover:underline flex items-center gap-1 font-medium"
          >
            <span>Inspect Sept 12 Meeting Archive</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default HistoricalContextCard;
