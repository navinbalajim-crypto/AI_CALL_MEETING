import React, { useRef, useEffect, useState } from 'react';
import { Badge } from '../common/Badge';
import { Search, Zap, AlertTriangle, HelpCircle, Check, Quote } from 'lucide-react';

export const TranscriptStream = ({
  turns = [],
  activeSpeakerId = null,
  onViewEvidence = null,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef(null);

  // Auto-scroll when new turns arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [turns.length]);

  const filteredTurns = turns.filter(
    (t) =>
      t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.speakerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex flex-col h-full rounded-2xl glass-panel border border-white/8 overflow-hidden ${className}`}>
      {/* Search Header */}
      <div className="p-3.5 border-b border-white/8 flex items-center justify-between gap-3 bg-surface-elevated/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-ai animate-pulse" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Live Diarized Transcript
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            ({turns.length} turns)
          </span>
        </div>

        <div className="relative w-44 sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dialog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-ai/50"
          />
        </div>
      </div>

      {/* Transcript List */}
      <div
        ref={scrollContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 scroll-smooth"
      >
        {turns.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
              <Quote className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-300">
              Live transcript awaiting speech...
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Start speaking or click "Simulate Conversation" to test the real-time AI diarization engine.
            </p>
          </div>
        ) : (
          filteredTurns.map((turn, idx) => {
            const hasCommitment = !!turn.commitmentDetails || turn.type === 'commitment';
            const hasContradiction = !!turn.contradictionDetails || turn.type === 'contradiction';
            const isSpeakingNow = activeSpeakerId === turn.speakerId && idx === turns.length - 1;

            return (
              <div
                key={turn.id || idx}
                className={`p-3.5 rounded-xl border transition-all duration-300 animate-fade-in ${
                  hasCommitment
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-glow-commitment'
                    : hasContradiction
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-surface-elevated/40 border-white/5 hover:border-white/10'
                }`}
              >
                {/* Speaker & Timestamp meta */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {turn.speakerName}
                    </span>
                    {turn.isUser && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-primary/20 text-primary-soft font-mono font-bold">
                        YOU
                      </span>
                    )}
                    {turn.speakerRole?.toLowerCase().includes('customer') && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                        CLIENT
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {hasCommitment && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" /> COMMITMENT
                      </span>
                    )}
                    {hasContradiction && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> REVISED
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-slate-500">
                      {turn.timestamp}
                    </span>
                  </div>
                </div>

                {/* Turn Text */}
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  hasCommitment ? 'text-white font-medium' : 'text-slate-300'
                }`}>
                  {turn.text}
                </p>

                {/* Quick inspect button for commitments */}
                {hasCommitment && onViewEvidence && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Action: {turn.commitmentDetails?.action || "Identified Commitment"}
                    </span>
                    <button
                      onClick={() => onViewEvidence({
                        task: turn.commitmentDetails?.action,
                        owner: turn.commitmentDetails?.owner || turn.speakerName,
                        deadline: turn.commitmentDetails?.deadline,
                        confidence: turn.commitmentDetails?.confidence || 'High',
                        evidence: {
                          quote: turn.text,
                          speaker: turn.speakerName,
                          timestamp: turn.timestamp,
                          contextBefore: idx > 0 ? turns[idx - 1].text : null
                        }
                      })}
                      className="text-[11px] font-medium text-ai hover:underline flex items-center gap-1"
                    >
                      Inspect Grounding Evidence →
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TranscriptStream;
