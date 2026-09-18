import React from 'react';
import { Badge } from '../common/Badge';
import { User, Calendar, ShieldCheck, ChevronRight, AlertCircle, Quote } from 'lucide-react';
import { INTELLIGENCE_TYPES } from '../../services/intelligenceService';

export const CommitmentCard = ({
  item,
  onViewEvidence,
  onViewContradiction,
  className = ''
}) => {
  const isCommitment = item.type === 'COMMITMENT' || !item.type;
  const isContradiction = item.isContradiction || !!item.contradictionDetails;
  const isUnresolved = item.isUnresolved || item.status === 'Needs Clarification' || item.owner === 'Needs Clarification';

  const typeConfig = INTELLIGENCE_TYPES[item.type] || INTELLIGENCE_TYPES.COMMITMENT;

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 group ${
        isContradiction
          ? 'bg-amber-500/[0.04] border-amber-500/30 hover:border-amber-500/50'
          : isUnresolved
          ? 'bg-rose-500/[0.03] border-rose-500/30 hover:border-rose-500/50'
          : isCommitment
          ? 'bg-emerald-500/[0.04] border-emerald-500/25 hover:border-emerald-500/40 hover:shadow-glow-commitment'
          : 'bg-surface-elevated/60 border-white/8 hover:border-white/15'
      } ${className}`}
    >
      {/* Header with Type Badge & Confidence */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Badge
            variant={
              isContradiction
                ? 'amber'
                : isUnresolved
                ? 'rose'
                : isCommitment
                ? 'emerald'
                : 'indigo'
            }
            dot
          >
            {isContradiction
              ? 'DEADLINE REVISION'
              : isUnresolved
              ? 'NEEDS CLARIFICATION'
              : typeConfig.label.toUpperCase()}
          </Badge>

          {item.category && (
            <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded bg-white/5 font-mono">
              {item.category}
            </span>
          )}
        </div>

        {item.confidence && (
          <span className="text-xs text-ai font-medium flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            {item.confidence}
          </span>
        )}
      </div>

      {/* Task / Action Text */}
      <h4 className="text-sm font-semibold text-white leading-snug mb-3 group-hover:text-primary-soft transition-colors">
        {item.task || item.action || item.decision}
      </h4>

      {/* Owner & Deadline Meta Row */}
      <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-lg bg-black/20 border border-white/5 mb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400 truncate">Owner:</span>
          <span
            className={`font-semibold truncate ${
              item.owner === 'Needs Clarification' ? 'text-rose-400' : 'text-slate-200'
            }`}
          >
            {item.owner || 'Needs Clarification'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 min-w-0 justify-end">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400 truncate">Due:</span>
          <span
            className={`font-semibold truncate ${
              item.deadline === 'Not specified' ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {item.deadline || 'Not specified'}
          </span>
        </div>
      </div>

      {/* Contradiction / Revision Alert Notice */}
      {isContradiction && (
        <div className="mb-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Shifted from previous sync (Friday → Monday)</span>
          </div>
          {onViewContradiction && (
            <button
              onClick={() => onViewContradiction(item)}
              className="text-xs font-semibold text-amber-400 underline hover:text-amber-300 shrink-0"
            >
              Compare
            </button>
          )}
        </div>
      )}

      {/* Footer: View Evidence Action */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <span className="text-[11px] text-slate-500 font-mono">
          {item.evidence?.timestamp ? `@ ${item.evidence.timestamp}` : 'Acoustic verified'}
        </span>

        {onViewEvidence && item.evidence && (
          <button
            onClick={() => onViewEvidence(item)}
            className="text-xs font-medium text-ai hover:text-white flex items-center gap-1 py-1 px-2 rounded-md hover:bg-ai/10 transition-colors"
          >
            <Quote className="w-3 h-3" />
            <span>View Evidence</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CommitmentCard;
