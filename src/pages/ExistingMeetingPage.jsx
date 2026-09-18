import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProcessingTimeline } from '../components/intelligence/ProcessingTimeline';
import {
  Upload,
  FileAudio,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export const ExistingMeetingPage = ({ onNavigate }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sampleName) => {
    setFile({
      name: sampleName,
      size: 14200000, // ~14.2 MB
      type: 'audio/mp3'
    });
  };

  const handleStartProcessing = () => {
    if (!file) return;
    setIsProcessing(true);
  };

  const handleProcessingComplete = () => {
    setTimeout(() => {
      onNavigate('report');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#080B16] text-white p-4 sm:p-8 max-w-4xl mx-auto flex flex-col justify-center space-y-8">
      <div className="text-center space-y-3">
        <Badge variant="ai" dot size="sm">
          INPUT MODE 2 • AUDIO & TRANSCRIPT INTAKE
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Upload Existing Meeting Audio or Transcript
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          G13 runs offline Whisper speech-to-text, PyAnnote diarization, and LLM commitment validation on your recorded sessions.
        </p>
      </div>

      {!isProcessing ? (
        <div className="space-y-6">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all duration-200 text-center space-y-4 cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/10 shadow-glow-md'
                : 'border-white/15 bg-surface-elevated/40 hover:border-white/30 hover:bg-surface-elevated/60'
            }`}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".mp3,.wav,.m4a,.vtt,.srt,.txt,.json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            />

            <div className="w-16 h-16 rounded-2xl bg-ai/15 border border-ai/30 text-ai flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {file ? file.name : "Drag & Drop meeting file here, or browse"}
              </h3>
              <p className="text-xs text-slate-400">
                Supports Audio (.mp3, .wav, .m4a), Transcripts (.vtt, .srt, .txt) or JSON dumps
              </p>
            </div>

            {file && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready for parsing: {(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            )}
          </div>

          {/* Quick Select Preset Sample */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Or pick an instant sample recording for demo:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleSelectSample('FinEdge_Stripe_Sync_Sept18.mp3')}
                className="px-3 py-2 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-xs text-slate-200 flex items-center gap-2 transition-colors"
              >
                <FileAudio className="w-4 h-4 text-ai" />
                <span>FinEdge_Stripe_Sync_Sept18.mp3 (42 min)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample('Acme_Disaster_Recovery_Audit.wav')}
                className="px-3 py-2 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-xs text-slate-200 flex items-center gap-2 transition-colors"
              >
                <FileAudio className="w-4 h-4 text-accent" />
                <span>Acme_Disaster_Recovery_Audit.wav (35 min)</span>
              </button>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between pt-4 border-t border-white/8">
            <Button variant="ghost" onClick={() => onNavigate('dashboard')}>
              Cancel
            </Button>
            <Button
              variant="ai"
              size="lg"
              disabled={!file}
              icon={Sparkles}
              onClick={handleStartProcessing}
              className="px-8 shadow-glow-ai"
            >
              Analyze & Extract Commitments
            </Button>
          </div>
        </div>
      ) : (
        /* Processing Timeline Visualizer */
        <div className="py-6 space-y-6">
          <ProcessingTimeline
            onComplete={handleProcessingComplete}
            active={isProcessing}
            speed={750}
          />
        </div>
      )}
    </div>
  );
};

export default ExistingMeetingPage;
