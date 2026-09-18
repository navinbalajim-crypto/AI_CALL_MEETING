import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ImageMenu } from '../components/dashboard/ImageMenu';
import { useAuth } from '../context/AuthContext';
import { useMeeting } from '../context/MeetingContext';
import {
  Upload,
  ArrowRight,
  Sparkles,
  FileAudio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Quote,
  Target,
  FileText,
  Radio,
  ChevronRight,
  RotateCcw,
  Check,
  ShieldCheck,
  HelpCircle,
  AlertTriangle,
  Flame,
  Mic,
  ListTodo
} from 'lucide-react';

// Helper: parse mm:ss to seconds
function timestampToSeconds(ts) {
  if (!ts) return 0;
  if (typeof ts === 'number') return ts;
  const parts = ts.toString().split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

// Helper: format seconds to mm:ss
function formatTime(sec) {
  if (isNaN(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const DashboardPage = ({
  onNavigate,
  onOpenCreate,
  onOpenJoin,
  onOpenEvidence
}) => {
  const { user, hasVoiceProfile } = useAuth();
  const {
    meetings,
    activeMeeting,
    setActiveMeeting,
    actions,
    updateActionStatus,
    loadDemoMeeting,
    clearAllMeetings
  } = useMeeting();

  // Persistent Audio Player State
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [highlightedTurnId, setHighlightedTurnId] = useState(null);

  const transcriptContainerRef = useRef(null);
  const turnRefs = useRef({});

  // Reset audio on meeting change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [activeMeeting?.id]);

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleJumpToTimestamp = (ts, turnId = null) => {
    const sec = timestampToSeconds(ts);
    if (audioRef.current) {
      audioRef.current.currentTime = sec;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    setCurrentTime(sec);

    if (turnId && turnRefs.current[turnId]) {
      turnRefs.current[turnId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedTurnId(turnId);
      setTimeout(() => setHighlightedTurnId(null), 3000);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackSpeed) + 1) % rates.length];
    setPlaybackSpeed(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  // Extract structured intelligence safely from activeMeeting
  const report = activeMeeting?.report;
  const overview = report?.overview || {
    title: activeMeeting?.title,
    client: activeMeeting?.client,
    date: activeMeeting?.date || 'Today',
    duration: activeMeeting?.duration || 'Recorded audio',
    speakerCount: activeMeeting?.participants?.length || 2,
    audioFileName: activeMeeting?.audioUrl?.split('/').pop() || 'meeting_recording.mp3'
  };

  const summary = report?.executiveSummary || activeMeeting?.summary || '';
  const keyTopics = report?.majorTopics || [];
  const decisions = report?.decisions || [];
  const actionItems = (actions && actions.length > 0)
    ? actions
    : (report?.actionItems || []);
  const deadlines = report?.deadlines || [];
  const risks = report?.customerConcerns || [];
  const questions = report?.unresolvedIssues || [];
  const transcriptTurns = activeMeeting?.transcript || report?.transcript || [];

  return (
    <div className="min-h-screen bg-[#080B16] text-white p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-12">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & AGENT STATUS BAR                               */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight">
              AI Meeting-to-Action Intelligence
            </h1>
            <Badge variant="indigo" size="xs">G13 Engine</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Turn conversation recordings into verified commitments, decisions & actionable follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Agent Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-ai/30 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-ai animate-pulse" />
            <span className="text-slate-400">Agent:</span>
            <span className="text-ai font-bold">Ready</span>
          </div>

          {/* Voice Profile */}
          <button
            onClick={() => onNavigate('voice-onboarding')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-emerald-500/30 text-xs font-mono hover:bg-surface-highlight transition-colors"
            title="Differentiate owner voice from attendees"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Voice Profile:</span>
            <span className="text-emerald-400 font-bold">{hasVoiceProfile ? 'Active' : 'Enrolled'}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. VISUAL WORKSPACE IMAGE MENU                                 */}
      {/* ------------------------------------------------------------- */}
      <ImageMenu
        onNavigate={onNavigate}
        onOpenCreate={onOpenCreate}
        onOpenJoin={onOpenJoin}
      />

      {/* ------------------------------------------------------------- */}
      {/* 3. HERO SECTION                                               */}
      {/* ------------------------------------------------------------- */}
      <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-primary/15 via-surface-elevated to-surface border border-primary/25 shadow-2xl overflow-hidden text-center space-y-6">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-ai/10 blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 w-80 h-80 bg-accent/10 blur-[100px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-primary-soft shadow-glow-sm">
          <Sparkles className="w-3.5 h-3.5 text-ai animate-pulse" />
          <span>Audio Recording → Speech-to-Text → Grounded Action Items</span>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight leading-[1.15]">
            Turn conversations <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-soft via-ai to-accent">
              into action.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
            Upload a meeting recording and let AI extract the decisions, commitments, action items, speakers and key insights automatically.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            variant="ai"
            icon={Upload}
            onClick={() => onNavigate('upload')}
            className="w-full sm:w-auto px-8 shadow-glow-ai font-bold"
          >
            Upload Meeting Audio
          </Button>

          <Button
            size="lg"
            variant="outline"
            icon={Clock}
            onClick={() => onNavigate('history')}
            className="w-full sm:w-auto px-6 text-slate-300 hover:text-white"
          >
            View Previous Meetings
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. HOW IT WORKS (01 Upload, 02 Understand, 03 Extract, 04 Act) */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-mono text-ai uppercase tracking-wider font-bold">
            How It Works
          </span>
          <h3 className="text-xl font-bold text-white font-display">
            The Audio-to-Intelligence Pipeline
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 01 */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2 relative group hover:border-primary/40 transition-all">
            <span className="text-2xl font-black font-mono text-primary/40 group-hover:text-primary transition-colors">
              01
            </span>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Upload</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload your meeting audio in MP3, WAV, M4A, or WebM format.
            </p>
          </div>

          {/* Step 02 */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2 relative group hover:border-ai/40 transition-all">
            <span className="text-2xl font-black font-mono text-ai/40 group-hover:text-ai transition-colors">
              02
            </span>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Understand</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI transcribes with timestamps and separates distinct speakers by voice.
            </p>
          </div>

          {/* Step 03 */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2 relative group hover:border-accent/40 transition-all">
            <span className="text-2xl font-black font-mono text-accent/40 group-hover:text-accent transition-colors">
              03
            </span>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Extract</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI finds decisions, commitments, owners, and explicit deadlines.
            </p>
          </div>

          {/* Step 04 */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2 relative group hover:border-emerald-500/40 transition-all">
            <span className="text-2xl font-black font-mono text-emerald-500/40 group-hover:text-emerald-400 transition-colors">
              04
            </span>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Act</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track deliverables with 1-click audio evidence verification.
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. RECENT MEETING / CURRENT ANALYSIS                          */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-white/8">
          <div>
            <span className="text-xs font-mono text-ai uppercase font-bold tracking-wider">
              Current Analysis
            </span>
            <h3 className="text-xl font-bold text-white font-display">
              {activeMeeting ? (activeMeeting.title || 'Extracted Meeting Intelligence') : 'Meeting Intelligence Dossier'}
            </h3>
          </div>

          {activeMeeting && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={FileText}
                onClick={() => onNavigate('report')}
                className="text-xs"
              >
                View Full PDF Report
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={clearAllMeetings}
                className="text-xs text-slate-400 hover:text-rose-400"
                title="Reset to clean state"
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------- */}
        {/* CASE A: EMPTY STATE (NO AUDIO UPLOADED YET)                 */}
        {/* ----------------------------------------------------------- */}
        {!activeMeeting ? (
          <div className="p-10 sm:p-16 rounded-3xl glass-panel-elevated border-2 border-dashed border-white/15 text-center space-y-6 max-w-3xl mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-primary/15 border border-primary/30 text-primary-soft flex items-center justify-center mx-auto shadow-glow-sm">
              <FileAudio className="w-10 h-10 text-ai" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-xl font-bold text-white font-display">
                No meeting analyzed yet
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Upload an audio recording to generate your first verified meeting intelligence report with decisions, commitments, and deadlines.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="ai"
                size="lg"
                icon={Upload}
                onClick={() => onNavigate('upload')}
                className="shadow-glow-ai px-8 font-bold text-xs"
              >
                Upload Audio Recording
              </Button>

              <button
                onClick={loadDemoMeeting}
                className="text-xs text-slate-400 hover:text-white px-4 py-2.5 rounded-xl hover:bg-white/5 font-mono flex items-center gap-1.5 transition-colors"
                title="Load Stripe architecture sample for demonstration"
              >
                <Sparkles className="w-3.5 h-3.5 text-ai" />
                <span>Load Demo Data (Preview)</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-500 pt-2">
              Supported formats: MP3, WAV, M4A, WebM (up to 100MB)
            </div>
          </div>
        ) : (
          /* ----------------------------------------------------------- */
          /* CASE B: REAL EXTRACTED MEETING INTELLIGENCE                 */
          /* ----------------------------------------------------------- */
          <div className="space-y-8">
            {/* Audio Element */}
            {activeMeeting.audioUrl && (
              <audio
                ref={audioRef}
                src={activeMeeting.audioUrl}
                onTimeUpdate={() => {
                  if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
                }}
                onLoadedMetadata={() => {
                  if (audioRef.current) setDuration(audioRef.current.duration);
                }}
                onEnded={() => setIsPlaying(false)}
              />
            )}

            {/* MEETING HEADER & PERSISTENT AUDIO PLAYER BAR */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel-elevated border border-primary/30 shadow-2xl space-y-6">
              {/* Meeting Metadata Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="emerald" dot size="xs">VERIFIED EXTRACTED AUDIO</Badge>
                    {activeMeeting.isDemo && (
                      <Badge variant="indigo" size="xs">DEMO DATA (PREVIEW)</Badge>
                    )}
                    <span className="text-xs text-slate-400 font-mono">
                      {overview.date}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                    {overview.title}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono flex items-center gap-2 flex-wrap">
                    <span>File: {overview.audioFileName}</span>
                    <span>•</span>
                    <span>Duration: {overview.duration}</span>
                    <span>•</span>
                    <span>{overview.speakerCount} Distinct Speakers</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Target}
                    onClick={() => onNavigate('actions')}
                    className="text-xs shadow-glow-sm"
                  >
                    Action Tracker ({actionItems.length})
                  </Button>
                </div>
              </div>

              {/* PERSISTENT AUDIO PLAYER CONTROLLER */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  {/* Play/Pause Button */}
                  <button
                    onClick={handleTogglePlay}
                    className="w-11 h-11 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white shadow-glow-sm hover:scale-105 active:scale-95 transition-all shrink-0"
                    title={isPlaying ? "Pause audio" : "Play audio"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  {/* Scrubber & Current Time */}
                  <div className="flex-1 space-y-1">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      step="0.1"
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-ai"
                    />
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration || timestampToSeconds(overview.duration))}</span>
                    </div>
                  </div>

                  {/* Playback Speed Pill */}
                  <button
                    onClick={cyclePlaybackRate}
                    className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-xs font-mono text-ai font-bold transition-colors shrink-0"
                    title="Change playback speed"
                  >
                    {playbackSpeed}x
                  </button>
                </div>
              </div>

              {/* AI SUMMARY BOX */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-mono text-ai uppercase font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-ai" />
                  <span>AI Executive Summary</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-light p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  {summary || 'No summary extracted.'}
                </p>
              </div>
            </div>

            {/* ------------------------------------------------------- */}
            {/* ACTIONABLE INSIGHTS GRID                                */}
            {/* ------------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. DECISIONS */}
              <div className="p-6 rounded-3xl glass-panel-elevated border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-ai" />
                    <h3 className="text-base font-bold text-white font-display">Decisions</h3>
                  </div>
                  <Badge variant="indigo" size="xs">{decisions.length} Agreed</Badge>
                </div>

                {decisions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center">
                    No explicit decisions detected in this audio recording.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {decisions.map((dec, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white leading-snug">
                            {dec.decision}
                          </h4>
                          {dec.timestamp && (
                            <button
                              onClick={() => handleJumpToTimestamp(dec.timestamp, dec.turnId)}
                              className="text-[10px] font-mono text-ai hover:underline flex items-center gap-1 shrink-0 px-2 py-0.5 rounded bg-ai/10 border border-ai/20"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" /> {dec.timestamp}
                            </button>
                          )}
                        </div>
                        {dec.context && (
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {dec.context}
                          </p>
                        )}
                        {dec.evidence && (
                          <div className="text-[11px] text-slate-400 font-mono italic pt-1 border-t border-white/5 flex items-start gap-1">
                            <Quote className="w-3 h-3 text-ai shrink-0 mt-0.5" />
                            <span>"{dec.evidence}"</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. ACTION ITEMS & COMMITMENTS */}
              <div className="p-6 rounded-3xl glass-panel-elevated border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h3 className="text-base font-bold text-white font-display">Action Items & Commitments</h3>
                  </div>
                  <Badge variant="emerald" size="xs">{actionItems.length} Extracted</Badge>
                </div>

                {actionItems.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center">
                    No action items detected in this audio recording.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {actionItems.slice(0, 4).map((act, idx) => (
                      <div key={act.id || idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => updateActionStatus(act.id, act.status === 'Completed' ? 'Pending' : 'Completed')}
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                  act.status === 'Completed'
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-white/20 hover:border-emerald-400'
                                }`}
                              >
                                {act.status === 'Completed' && <Check className="w-3 h-3" />}
                              </button>
                              <h4 className={`text-xs font-bold ${act.status === 'Completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                                {act.task}
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-400 pl-6">
                              Owner: <strong className="text-slate-200">{act.owner || 'Unassigned'}</strong> • Deadline: <span className="text-amber-400 font-medium">{act.deadline || 'Not specified'}</span>
                            </p>
                          </div>

                          {act.timestamp && (
                            <button
                              onClick={() => handleJumpToTimestamp(act.timestamp, act.turnId)}
                              className="text-[10px] font-mono text-ai hover:underline flex items-center gap-1 shrink-0 px-2 py-0.5 rounded bg-ai/10 border border-ai/20"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" /> {act.timestamp}
                            </button>
                          )}
                        </div>

                        {act.evidence && (
                          <div className="text-[11px] text-slate-400 font-mono italic pl-6 pt-1 border-t border-white/5 flex items-start gap-1">
                            <Quote className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                            <span>"{act.evidence?.quote || act.evidence}"</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. DEADLINES */}
              <div className="p-6 rounded-3xl glass-panel-elevated border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <h3 className="text-base font-bold text-white font-display">Deadlines</h3>
                  </div>
                  <Badge variant="amber" size="xs">{deadlines.length} Targets</Badge>
                </div>

                {deadlines.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center">
                    No explicit deadline statements detected in this conversation.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {deadlines.map((dl, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300 font-mono">
                            {dl.deadline || dl.originalExpression}
                          </span>
                          {dl.timestamp && (
                            <button
                              onClick={() => handleJumpToTimestamp(dl.timestamp, dl.turnId)}
                              className="text-[10px] font-mono text-ai hover:underline flex items-center gap-1"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" /> {dl.timestamp}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-200">{dl.task}</p>
                        <p className="text-[11px] text-slate-400">Assigned: {dl.owner}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. RISKS, CONCERNS & QUESTIONS */}
              <div className="p-6 rounded-3xl glass-panel-elevated border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <h3 className="text-base font-bold text-white font-display">Risks & Unresolved Questions</h3>
                  </div>
                  <Badge variant="rose" size="xs">{risks.length + questions.length} Flagged</Badge>
                </div>

                {risks.length === 0 && questions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center">
                    Zero risks or unresolved blockers identified in this audio.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {risks.map((r, idx) => (
                      <div key={`risk-${idx}`} className="p-3.5 rounded-2xl bg-rose-500/[0.05] border border-rose-500/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="rose" size="xs">Risk / Urgency: {r.urgency || 'High'}</Badge>
                          {r.timestamp && (
                            <button
                              onClick={() => handleJumpToTimestamp(r.timestamp, r.turnId)}
                              className="text-[10px] font-mono text-rose-300 hover:underline flex items-center gap-1"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" /> {r.timestamp}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-200">{r.concern}</p>
                      </div>
                    ))}

                    {questions.map((q, idx) => (
                      <div key={`q-${idx}`} className="p-3.5 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="amber" size="xs">Needs Clarification</Badge>
                          {q.timestamp && (
                            <button
                              onClick={() => handleJumpToTimestamp(q.timestamp, q.turnId)}
                              className="text-[10px] font-mono text-amber-300 hover:underline flex items-center gap-1"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" /> {q.timestamp}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-200">{q.issue}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ------------------------------------------------------- */}
            {/* 5. SPEAKER-SEPARATED TRANSCRIPT WITH JUMP-TO-AUDIO      */}
            {/* ------------------------------------------------------- */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel-elevated border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-ai" />
                  <h3 className="text-base font-bold text-white font-display">
                    Speaker-Separated Audio Transcript
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Click any timestamp to play exact audio
                </span>
              </div>

              <div
                ref={transcriptContainerRef}
                className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar"
              >
                {transcriptTurns.map((turn, idx) => {
                  const isHighlighted = highlightedTurnId === (turn.id || `turn-${idx + 1}`);
                  return (
                    <div
                      key={turn.id || idx}
                      ref={(el) => (turnRefs.current[turn.id || `turn-${idx + 1}`] = el)}
                      className={`p-3.5 rounded-2xl border transition-all text-xs ${
                        isHighlighted
                          ? 'bg-primary/25 border-primary shadow-glow-sm'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-300 font-mono text-[11px]">
                            {turn.speakerName || turn.speakerLabel || turn.speaker || `Speaker ${idx % 2 + 1}`}
                          </span>
                          {turn.speakerRole && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({turn.speakerRole})
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleJumpToTimestamp(turn.timestamp || turn.start, turn.id)}
                          className="flex items-center gap-1 font-mono text-[11px] text-ai hover:underline"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{turn.timestamp || formatTime(turn.start)}</span>
                        </button>
                      </div>

                      <p className="text-slate-200 leading-relaxed font-light">
                        "{turn.text}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
