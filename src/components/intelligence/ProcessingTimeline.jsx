import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2, Sparkles, Database, FileText, Users, ShieldCheck } from 'lucide-react';

const STAGES = [
  { id: 1, label: 'Transcript processed & cleaned', icon: FileText },
  { id: 2, label: 'Speakers identified & diarized', icon: Users },
  { id: 3, label: 'Understanding context & commitments', icon: Sparkles },
  { id: 4, label: 'Retrieving historical context (RAG)', icon: Database },
  { id: 5, label: 'Validating evidence & confidence scores', icon: ShieldCheck },
  { id: 6, label: 'Compiling final intelligence report', icon: CheckCircle2 },
];

export const ProcessingTimeline = ({ onComplete, active = true, speed = 800 }) => {
  const [currentStage, setCurrentStage] = useState(1);

  useEffect(() => {
    if (!active) return;

    if (currentStage <= STAGES.length) {
      const timer = setTimeout(() => {
        if (currentStage === STAGES.length) {
          if (onComplete) onComplete();
        } else {
          setCurrentStage((prev) => prev + 1);
        }
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentStage, active, onComplete, speed]);

  return (
    <div className="p-6 rounded-2xl glass-panel-elevated border border-primary/20 max-w-lg w-full mx-auto shadow-2xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/8">
        <div className="w-9 h-9 rounded-xl bg-ai/15 border border-ai/30 flex items-center justify-center text-ai animate-pulse">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white tracking-wide">
            G13 INTELLIGENCE ENGINE PROCESSING
          </h4>
          <p className="text-xs text-slate-400">
            Converting conversational audio stream into structured organizational assets
          </p>
        </div>
      </div>

      {/* Living Progress Line & Stages */}
      <div className="space-y-4">
        {STAGES.map((stage) => {
          const isDone = currentStage > stage.id;
          const isCurrent = currentStage === stage.id;
          const isPending = currentStage < stage.id;
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3.5 transition-all duration-300 ${
                isCurrent
                  ? 'text-white translate-x-1.5'
                  : isDone
                  ? 'text-slate-300'
                  : 'text-slate-600 opacity-60'
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-6 h-6 rounded-full bg-ai/20 border border-ai/40 flex items-center justify-center text-ai animate-spin">
                    <Loader2 className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-600">
                    <Circle className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center justify-between text-xs sm:text-sm font-medium">
                <span className={isCurrent ? 'text-ai font-semibold' : ''}>
                  {stage.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-mono text-ai uppercase tracking-wider animate-pulse">
                    Processing...
                  </span>
                )}
                {isDone && (
                  <span className="text-[10px] font-mono text-emerald-400">
                    Verified
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingTimeline;
