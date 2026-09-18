import React from 'react';
import {
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  FileAudio,
  Activity,
  FileText,
  Users,
  Fingerprint,
  UserCheck,
  Brain,
  ShieldCheck,
  Award,
  AlertCircle
} from 'lucide-react';

export const PIPELINE_STAGES = [
  { id: 1, key: 'VALIDATING', label: 'Audio Upload & Format Validation', icon: FileAudio },
  { id: 2, key: 'VAD', label: 'Voice Activity Detection (Speech vs Silence)', icon: Activity },
  { id: 3, key: 'WHISPER', label: 'Whisper Speech-to-Text (Timestamped Segments)', icon: FileText },
  { id: 4, key: 'DIARIZATION', label: 'Speaker Diarization & Segmentation', icon: Users },
  { id: 5, key: 'EMBEDDINGS', label: 'ECAPA-TDNN Speaker Embedding Extraction', icon: Fingerprint },
  { id: 6, key: 'VOICE_MATCH', label: 'User Enrolled Voice Profile Comparison', icon: UserCheck },
  { id: 7, key: 'CONTEXT', label: 'Long-Context Chunking & Memory Preservation', icon: Brain },
  { id: 8, key: 'INTELLIGENCE', label: 'Meeting Intelligence (Decisions, Commitments, Actions)', icon: Sparkles },
  { id: 9, key: 'EVIDENCE', label: 'Evidence Grounding & Confidence Derivation', icon: ShieldCheck },
  { id: 10, key: 'REPORT', label: 'Final 16-Domain Report Compilation', icon: Award },
];

export const ProcessingTimeline = ({
  currentStageIndex = 0,
  completedStages = [],
  status = 'PROCESSING',
  error = null,
  vadResult = null
}) => {
  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-panel-elevated border border-primary/25 max-w-xl w-full mx-auto shadow-2xl space-y-6">
      <div className="flex items-center gap-3.5 pb-4 border-b border-white/8">
        <div className="w-10 h-10 rounded-2xl bg-ai/15 border border-ai/30 flex items-center justify-center text-ai shadow-glow-ai">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white tracking-wide font-display">
              G13 INTELLIGENCE PIPELINE
            </h4>
            <span className="text-[10px] font-mono text-ai uppercase font-semibold">
              {status === 'COMPLETED' ? 'Pipeline Complete' : status === 'FAILED' ? 'Pipeline Stopped' : 'Live Execution'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real backend execution • No simulated timers
          </p>
        </div>
      </div>

      {/* VAD Metrics Callout if available */}
      {vadResult && (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Activity className="w-4 h-4 text-ai shrink-0" />
            <span>Speech: {vadResult.speechDurationSec}s</span>
            <span className="text-slate-500">/</span>
            <span>Silence: {vadResult.silenceDurationSec}s</span>
          </div>
          <span className="text-emerald-400 font-semibold">
            {vadResult.speechRatioPercent}% Active Speech
          </span>
        </div>
      )}

      {/* Pipeline Stages */}
      <div className="space-y-3">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isDone = completedStages.includes(stage.key) || (status === 'COMPLETED');
          const isCurrent = idx === currentStageIndex && status === 'PROCESSING';
          const isFailed = idx === currentStageIndex && status === 'FAILED';
          const isPending = !isDone && !isCurrent && !isFailed;
          const Icon = stage.icon;

          return (
            <div
              key={stage.key}
              className={`flex items-center gap-3.5 transition-all duration-300 p-2 rounded-xl ${
                isCurrent
                  ? 'bg-ai/10 border border-ai/30 text-white translate-x-1'
                  : isDone
                  ? 'text-slate-200'
                  : isFailed
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  : 'text-slate-600 opacity-60'
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                ) : isFailed ? (
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5" />
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
                  <span className="text-[10px] font-mono text-ai uppercase tracking-wider animate-pulse font-bold ml-2">
                    Running...
                  </span>
                )}
                {isDone && (
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold ml-2">
                    Verified ✓
                  </span>
                )}
                {isFailed && (
                  <span className="text-[10px] font-mono text-rose-400 font-bold ml-2">
                    Halted
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
