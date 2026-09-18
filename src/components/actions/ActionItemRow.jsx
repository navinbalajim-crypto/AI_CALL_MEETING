import React from 'react';
import { Badge } from '../common/Badge';
import { User, Calendar, ShieldCheck, Quote, ChevronRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const STATUS_CONFIGS = {
  'Pending': { label: 'Pending', variant: 'indigo', icon: Clock },
  'In Progress': { label: 'In Progress', variant: 'ai', icon: Clock },
  'Completed': { label: 'Completed', variant: 'emerald', icon: CheckCircle2 },
  'Overdue': { label: 'Overdue', variant: 'rose', icon: AlertCircle },
  'Needs Clarification': { label: 'Needs Clarification', variant: 'amber', icon: AlertCircle },
};

export const ActionItemRow = ({
  action,
  onStatusChange,
  onViewEvidence,
  className = ''
}) => {
  const isUnresolved = action.owner === 'Needs Clarification' || action.deadline === 'Not specified';
  const statusConfig = STATUS_CONFIGS[action.status] || STATUS_CONFIGS['Pending'];
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 glass-panel-interactive flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        action.status === 'Completed'
          ? 'opacity-80 border-emerald-500/20'
          : action.isContradiction
          ? 'border-amber-500/30'
          : 'border-white/8'
      } ${className}`}
    >
      {/* Left: Task description & meeting origin */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
            {action.category || 'Engineering'}
          </span>
          {action.isContradiction && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              REVISED DEADLINE
            </span>
          )}
          {action.confidence && (
            <span className="text-[11px] text-ai font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {action.confidence}
            </span>
          )}
        </div>

        <h4 className={`text-sm font-semibold leading-snug ${
          action.status === 'Completed' ? 'line-through text-slate-400' : 'text-white'
        }`}>
          {action.task}
        </h4>

        {action.meetingTitle && (
          <p className="text-[11px] text-slate-500 truncate">
            Origin: {action.meetingTitle}
          </p>
        )}
      </div>

      {/* Middle: Owner & Deadline Meta */}
      <div className="flex items-center gap-6 text-xs shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5 min-w-[120px]">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <div>
            <div className="text-[10px] text-slate-500">Owner</div>
            <div
              className={`font-semibold ${
                action.owner === 'Needs Clarification' ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {action.owner || 'Needs Clarification'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 min-w-[140px]">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <div>
            <div className="text-[10px] text-slate-500">Target Deadline</div>
            <div
              className={`font-semibold ${
                action.deadline === 'Not specified' ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {action.deadline || 'Not specified'}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Status Dropdown & View Evidence */}
      <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-white/5">
        <select
          value={action.status}
          onChange={(e) => onStatusChange && onStatusChange(action.id, e.target.value)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
            action.status === 'Completed'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : action.status === 'In Progress'
              ? 'bg-ai/10 border-ai/40 text-ai'
              : action.status === 'Needs Clarification'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : 'bg-surface-elevated border-white/10 text-slate-200'
          }`}
        >
          <option value="Pending" className="bg-[#101526] text-white">Pending</option>
          <option value="In Progress" className="bg-[#101526] text-white">In Progress</option>
          <option value="Completed" className="bg-[#101526] text-white">Completed</option>
          <option value="Overdue" className="bg-[#101526] text-white">Overdue</option>
          <option value="Needs Clarification" className="bg-[#101526] text-white">Needs Clarification</option>
        </select>

        {action.evidence && (
          <button
            onClick={() => onViewEvidence && onViewEvidence(action)}
            className="p-2 rounded-lg bg-surface-elevated hover:bg-surface-highlight text-ai hover:text-white border border-white/10 text-xs flex items-center gap-1 transition-colors"
            title="Inspect transcript evidence"
          >
            <Quote className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Evidence</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionItemRow;
