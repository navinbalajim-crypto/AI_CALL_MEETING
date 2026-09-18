import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { ShieldCheck, Clock, User, Quote, Sparkles, CheckCircle2 } from 'lucide-react';

export const EvidenceModal = ({ isOpen, onClose, evidence, taskTitle, owner, deadline, confidence }) => {
  if (!evidence) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title="Evidence Grounding Inspector"
      subtitle="Verifiable transcript provenance supporting this commitment"
    >
      <div className="space-y-6">
        {/* Commitment Summary Banner */}
        <div className="p-4 rounded-xl bg-surface-elevated/70 border border-emerald-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Badge variant="emerald" dot>
              VERIFIED COMMITMENT
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-ai" />
              Recorded at {evidence.timestamp || '02:28'}
            </div>
          </div>
          <h4 className="text-base font-semibold text-white mt-1">
            {taskTitle || "Complete Payment API Refactor & Idempotency Fixes"}
          </h4>
          <div className="flex items-center gap-6 text-xs text-slate-300 pt-1 border-t border-white/5 flex-wrap">
            <div>
              <span className="text-slate-500 mr-1">Owner:</span>
              <strong className="text-slate-200">{owner || evidence.speaker || 'Raj Patel'}</strong>
            </div>
            <div>
              <span className="text-slate-500 mr-1">Deadline:</span>
              <strong className="text-emerald-400">{deadline || 'Friday at 5:00 PM EST'}</strong>
            </div>
            <div>
              <span className="text-slate-500 mr-1">Confidence:</span>
              <span className="text-ai font-semibold">{confidence || 'High (98%)'}</span>
            </div>
          </div>
        </div>

        {/* Provenance Connection Line */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/50 via-ai/50 to-primary/50" />
          <span className="text-[11px] font-mono text-ai uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Grounded In Acoustic Transcript
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/50 via-ai/50 to-transparent" />
        </div>

        {/* Verbatim Transcript Context */}
        <div className="space-y-3 bg-[#080B16]/80 p-5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Quote className="w-3.5 h-3.5 text-primary-soft" />
              Surrounding Conversation Context:
            </span>
            <span className="font-mono text-[11px] text-slate-500">Audio Track #1 • Diarized</span>
          </div>

          {/* Context Turn Before */}
          {evidence.contextBefore && (
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-slate-400 opacity-70">
              <span className="font-semibold text-slate-300 mr-2">Previous turn:</span>
              "{evidence.contextBefore}"
            </div>
          )}

          {/* Target Evidence Turn */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-surface-elevated to-primary-950/20 border-2 border-emerald-500/50 shadow-glow-commitment">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold text-emerald-300">
                  {(evidence.speaker || 'RP').slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-white">{evidence.speaker || 'Raj Patel'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                  Acoustic Match
                </span>
              </div>
              <span className="font-mono text-xs text-emerald-400">{evidence.timestamp || '02:28'}</span>
            </div>
            <p className="text-sm font-medium text-slate-100 leading-relaxed pl-1 border-l-2 border-emerald-400">
              "{evidence.quote}"
            </p>
          </div>

          {/* Context Turn After */}
          {evidence.contextAfter && (
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-slate-400 opacity-70">
              <span className="font-semibold text-slate-300 mr-2">Follow-up turn:</span>
              "{evidence.contextAfter}"
            </div>
          )}
        </div>

        {/* Verification Footnote */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Distinguished from casual suggestion by NLP commitment parser
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface-elevated hover:bg-surface-highlight text-xs font-medium text-white transition-colors border border-white/10"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EvidenceModal;
