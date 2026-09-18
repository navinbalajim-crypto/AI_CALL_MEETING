import React, { useState, useEffect } from 'react';
import { ParticipantList } from '../components/meeting/ParticipantList';
import { TranscriptStream } from '../components/meeting/TranscriptStream';
import { CommitmentCard } from '../components/intelligence/CommitmentCard';
import { HistoricalContextCard } from '../components/intelligence/HistoricalContextCard';
import { MeetingControls } from '../components/meeting/MeetingControls';
import { Badge } from '../components/common/Badge';
import { useMeeting } from '../context/MeetingContext';
import { useToast } from '../context/ToastContext';
import { ragService } from '../services/ragService';
import { Sparkles, Radio, ShieldCheck, Database, Zap, Quote, AlertTriangle } from 'lucide-react';

export const LiveMeetingPage = ({ onNavigate }) => {
  const {
    activeMeeting,
    transcriptTurns,
    activeSpeakerId,
    socketStatus,
    isLiveActive,
    liveCommitments,
    startLiveSimulation,
    stopLiveSimulation,
    openEvidence,
    openContradiction
  } = useMeeting();

  const { addToast } = useToast();
  const [historicalMatches, setHistoricalMatches] = useState([]);

  // Auto-search historical context when terms appear
  useEffect(() => {
    if (transcriptTurns.length > 0) {
      const lastTurn = transcriptTurns[transcriptTurns.length - 1];
      const matches = ragService.searchHistoricalContext(lastTurn.text, activeMeeting?.id);
      if (matches.length > 0) {
        setHistoricalMatches(matches);
      }
    }
  }, [transcriptTurns.length, activeMeeting?.id]);

  const handleStartSim = () => {
    startLiveSimulation((commitment, turn) => {
      addToast({
        title: 'Commitment Detected',
        message: `${commitment.owner}: "${commitment.action}" (Due ${commitment.deadline})`,
        type: 'commitment',
        action: {
          label: 'Inspect Provenance',
          onClick: () => {
            openEvidence({
              task: commitment.action,
              owner: commitment.owner,
              deadline: commitment.deadline,
              confidence: commitment.confidence,
              evidence: {
                quote: turn.text,
                speaker: turn.speakerName,
                timestamp: turn.timestamp
              }
            });
          }
        }
      });
    });
  };

  const handleEndMeeting = () => {
    stopLiveSimulation();
    onNavigate('report');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#080B16] text-white p-3 sm:p-6 max-w-[1700px] mx-auto flex flex-col gap-4">
      {/* Session Title Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/8 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-soft">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-display">
                {activeMeeting?.title || "Q3 Stripe Billing & Latency Architecture Sync"}
              </h2>
              <Badge variant="indigo" size="xs">
                {activeMeeting?.code || "G13-X7K92"}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              {activeMeeting?.client || "FinEdge Technologies"} • {activeMeeting?.organization || "Core Platform Team"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="emerald" dot size="sm">
            AI DIARIZATION ACTIVE
          </Badge>
          <span className="text-[11px] font-mono text-slate-400">
            Socket: {socketStatus}
          </span>
        </div>
      </div>

      {/* 3-COLUMN WORKSPACE (Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[580px]">
        {/* Left Column: Attendees & Diarization States (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl glass-panel border border-white/8 p-4 overflow-y-auto">
          <ParticipantList
            participants={activeMeeting?.participants || []}
            activeSpeakerId={activeSpeakerId}
          />
        </div>

        {/* Center Column: Live Transcript Stream (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[580px]">
          <TranscriptStream
            turns={transcriptTurns}
            activeSpeakerId={activeSpeakerId}
            onViewEvidence={openEvidence}
          />
        </div>

        {/* Right Column: AI Intelligence Live Feed (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl glass-panel border border-white/8 p-4 flex flex-col gap-4 overflow-y-auto h-[580px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-ai animate-pulse" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Extracted Intelligence Feed
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              {liveCommitments.length} Commitments
            </span>
          </div>

          {/* RAG Cross-Meeting Contradiction Card if detected */}
          {historicalMatches.length > 0 && (
            <HistoricalContextCard
              item={historicalMatches[0]}
              onOpenMeeting={() => onNavigate('history')}
            />
          )}

          {/* List of Detected Commitments & Actions */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            {liveCommitments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Zap className="w-8 h-8 mb-2 text-slate-600" />
                <p className="text-xs font-medium text-slate-300">
                  Awaiting explicit commitments...
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  The AI parser will highlight commitments, owners, and deadlines here as attendees speak.
                </p>
              </div>
            ) : (
              liveCommitments.map((item, idx) => (
                <CommitmentCard
                  key={item.id || idx}
                  item={{
                    ...item,
                    category: item.category || 'Engineering',
                    owner: item.owner || 'Raj Patel',
                    deadline: item.deadline || 'Friday at 5:00 PM EST',
                    confidence: item.confidence || 'High (98%)'
                  }}
                  onViewEvidence={openEvidence}
                  onViewContradiction={openContradiction}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Meeting Control Bar */}
      <MeetingControls
        isLiveActive={isLiveActive}
        onStartSimulation={handleStartSim}
        onStopSimulation={stopLiveSimulation}
        onEndMeeting={handleEndMeeting}
        socketStatus={socketStatus}
      />
    </div>
  );
};

export default LiveMeetingPage;
