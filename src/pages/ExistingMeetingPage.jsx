import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProcessingTimeline, PIPELINE_STAGES } from '../components/intelligence/ProcessingTimeline';
import { audioService } from '../services/audioService';
import { voiceProfileService } from '../services/voiceProfileService';
import { socketService } from '../services/socketService';
import { useMeeting } from '../context/MeetingContext';
import { createWavAudioBlob } from '../utils/audioGenerator';
import {
  Upload,
  FileAudio,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Volume2,
  Clock,
  HardDrive,
  FileX,
  Play,
  Pause,
  Layers,
  XCircle,
  Radio
} from 'lucide-react';

const STORAGE_ACTIVE_JOB_KEY = 'g13_active_audio_job_id';

export const ExistingMeetingPage = ({ onNavigate }) => {
  const { registerCompletedMeeting } = useMeeting();

  const [file, setFile] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Audio Preview
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const audioPreviewRef = useRef(null);

  // Job and Pipeline State
  const [jobId, setJobId] = useState(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState('PROCESSING');
  const [pipelineError, setPipelineError] = useState(null);
  const [vadResult, setVadResult] = useState(null);

  const pollingIntervalRef = useRef(null);

  // Resume active job if browser was refreshed
  useEffect(() => {
    const savedJobId = sessionStorage.getItem(STORAGE_ACTIVE_JOB_KEY);
    if (savedJobId) {
      setJobId(savedJobId);
      setIsProcessing(true);
      startPollingJob(savedJobId);
    }

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  // Setup Socket.io listeners
  useEffect(() => {
    const socket = socketService.socket;
    if (!socket) return;

    const handleStageUpdate = (data) => {
      if (data.jobId === jobId) {
        setCurrentStageIndex(data.stageIndex);
        setCompletedStages(data.completedStages || []);
        if (data.payload?.vadResult) {
          setVadResult(data.payload.vadResult);
        }
      }
    };

    const handleJobFailed = (data) => {
      if (data.jobId === jobId) {
        setPipelineStatus('FAILED');
        setPipelineError(data.error);
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        sessionStorage.removeItem(STORAGE_ACTIVE_JOB_KEY);
      }
    };

    const handleJobCompleted = async (data) => {
      if (data.jobId === jobId) {
        setPipelineStatus('COMPLETED');
        setCurrentStageIndex(PIPELINE_STAGES.length - 1);
        setCompletedStages(PIPELINE_STAGES.map(s => s.key));
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        sessionStorage.removeItem(STORAGE_ACTIVE_JOB_KEY);

        // Fetch registered meeting details from backend
        try {
          const res = await fetch(`/api/audio/jobs/${jobId}`);
          if (res.ok) {
            const fullJob = await res.json();
            const meetingObj = {
              id: fullJob.meetingId || `meet-${Date.now()}`,
              code: fullJob.meetingCode || 'G13-UPLOAD',
              title: fullJob.report?.overview?.title || 'Uploaded Meeting Analysis',
              client: fullJob.report?.overview?.client || 'Enterprise Client',
              organization: fullJob.report?.overview?.organization || 'Core Team',
              date: fullJob.report?.overview?.date || 'Today',
              duration: fullJob.report?.overview?.duration || 'Recorded Audio',
              status: 'completed',
              audioUrl: `/uploads/audio/${fullJob.filePath?.split(/[\\/]/).pop()}`,
              report: fullJob.report,
              audioMetrics: fullJob.report?.audioMetrics || fullJob.vadResult?.audioMetrics || null,
              summary: fullJob.report?.executiveSummary || '',
              transcript: fullJob.transcript,
              participants: fullJob.speakers?.map(s => ({
                id: s.speakerId,
                name: s.possibleIdentity || s.label,
                role: s.isUserMatch ? 'Host (User)' : 'Participant',
                isUser: s.isUserMatch,
                avatar: s.label.slice(0, 2).toUpperCase(),
                color: s.isUserMatch ? '#5B6CFF' : '#10B981'
              })) || []
            };

            registerCompletedMeeting(meetingObj);
            setTimeout(() => {
              onNavigate('report');
            }, 1200);
          }
        } catch (e) {
          console.error('[Completed Meeting Fetch Error]', e);
          setTimeout(() => onNavigate('report'), 1200);
        }
      }
    };

    socket.on('job_stage_update', handleStageUpdate);
    socket.on('job_failed', handleJobFailed);
    socket.on('job_completed', handleJobCompleted);

    return () => {
      socket.off('job_stage_update', handleStageUpdate);
      socket.off('job_failed', handleJobFailed);
      socket.off('job_completed', handleJobCompleted);
    };
  }, [jobId, onNavigate, registerCompletedMeeting]);

  const startPollingJob = (targetJobId) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const job = await audioService.getJobStatus(targetJobId);
        if (!job) return;

        setCurrentStageIndex(job.currentStageIndex || 0);
        setCompletedStages(job.completedStages || []);
        if (job.vadResult) setVadResult(job.vadResult);

        if (job.status === 'FAILED') {
          clearInterval(pollingIntervalRef.current);
          setPipelineStatus('FAILED');
          setPipelineError(job.error);
          sessionStorage.removeItem(STORAGE_ACTIVE_JOB_KEY);
        } else if (job.status === 'COMPLETED') {
          clearInterval(pollingIntervalRef.current);
          setPipelineStatus('COMPLETED');
          setCurrentStageIndex(PIPELINE_STAGES.length - 1);
          setCompletedStages(PIPELINE_STAGES.map(s => s.key));
          sessionStorage.removeItem(STORAGE_ACTIVE_JOB_KEY);

          const meetingObj = {
            id: job.meetingId || `meet-${Date.now()}`,
            code: job.meetingCode || 'G13-UPLOAD',
            title: job.report?.overview?.title || 'Uploaded Meeting Analysis',
            client: job.report?.overview?.client || 'Enterprise Client',
            organization: job.report?.overview?.organization || 'Core Team',
            date: job.report?.overview?.date || 'Today',
            duration: job.report?.overview?.duration || 'Recorded Audio',
            status: 'completed',
            audioUrl: `/uploads/audio/${job.filePath?.split(/[\\/]/).pop()}`,
            report: job.report,
            transcript: job.transcript,
            participants: job.speakers?.map(s => ({
              id: s.speakerId,
              name: s.possibleIdentity || s.label,
              role: s.isUserMatch ? 'Host (User)' : 'Participant',
              isUser: s.isUserMatch,
              avatar: s.label.slice(0, 2).toUpperCase(),
              color: s.isUserMatch ? '#5B6CFF' : '#10B981'
            })) || []
          };

          registerCompletedMeeting(meetingObj);
          setTimeout(() => {
            onNavigate('report');
          }, 1200);
        }
      } catch (e) {
        console.warn('[Polling Notice]', e.message);
      }
    }, 800);
  };

  const handleSelectFile = async (selectedFile) => {
    setValidationError(null);
    if (!selectedFile) return;

    // Validate size (zero bytes)
    if (selectedFile.size === 0) {
      setValidationError({
        title: 'Empty Audio File',
        message: 'The selected audio file is empty (0 bytes). Please upload a valid recording.'
      });
      return;
    }

    // Validate format
    const allowed = ['.mp3', '.wav', '.m4a', '.webm', '.ogg'];
    const ext = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      setValidationError({
        title: 'Unsupported Audio Format',
        message: `File format "${ext}" is not supported. Please choose an MP3, WAV, M4A, WEBM, or OGG file.`
      });
      return;
    }

    setFile(selectedFile);

    // Create preview URL
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    const url = URL.createObjectURL(selectedFile);
    setAudioPreviewUrl(url);

    // Inspect duration in browser
    const inspection = await audioService.inspectAudioInBrowser(selectedFile);
    setFileMetadata({
      durationSec: inspection.durationSec,
      formattedDuration: inspection.formattedDuration,
      format: inspection.format,
      sizeFormatted: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB'
    });

    if (inspection.durationSec > 0 && inspection.durationSec < 2) {
      setValidationError({
        title: 'Audio Too Short',
        message: 'The audio file is under 2 seconds. Reliable meeting intelligence requires at least a short dialogue.'
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  // Generate synthetic sample presets for testing
  const handleSelectPreset = (presetType) => {
    if (presetType === 'finedge') {
      const blob = createWavAudioBlob({
        durationSec: 15,
        isSilent: false,
        name: 'FinEdge_Stripe_Sync_Sept18.wav'
      });
      handleSelectFile(blob);
    } else if (presetType === 'acme') {
      const blob = createWavAudioBlob({
        durationSec: 12,
        isSilent: false,
        name: 'Acme_Disaster_Recovery_Audit.wav'
      });
      handleSelectFile(blob);
    } else if (presetType === 'silent') {
      const blob = createWavAudioBlob({
        durationSec: 8,
        isSilent: true,
        name: 'Test_No_Speech_Silent.wav'
      });
      handleSelectFile(blob);
    }
  };

  const handleStartProcessing = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setPipelineError(null);
    setPipelineStatus('PROCESSING');
    setCurrentStageIndex(0);
    setCompletedStages([]);

    try {
      const userProfileStatus = voiceProfileService.getProfileStatus();
      const userProfile = userProfileStatus.status === 'active' ? userProfileStatus.profile : null;

      const uploadResult = await audioService.uploadAudioFile(file, (progress) => {
        setUploadProgress(progress);
      }, userProfile);

      setIsUploading(false);
      setIsProcessing(true);
      setJobId(uploadResult.jobId);
      sessionStorage.setItem(STORAGE_ACTIVE_JOB_KEY, uploadResult.jobId);

      // Start polling status
      startPollingJob(uploadResult.jobId);
    } catch (err) {
      setIsUploading(false);
      setValidationError({
        title: 'Upload Failed',
        message: err.message || 'Could not communicate with audio processing backend.'
      });
    }
  };

  const handleReset = () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    sessionStorage.removeItem(STORAGE_ACTIVE_JOB_KEY);
    setFile(null);
    setFileMetadata(null);
    setIsProcessing(false);
    setIsUploading(false);
    setUploadProgress(0);
    setJobId(null);
    setPipelineError(null);
    setPipelineStatus('PROCESSING');
    setCurrentStageIndex(0);
    setCompletedStages([]);
    setVadResult(null);
  };

  const togglePlayPreview = () => {
    if (!audioPreviewRef.current) return;
    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B16] text-white p-4 sm:p-8 max-w-4xl mx-auto flex flex-col justify-center space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="ai" dot size="sm">
          INPUT MODE 2 • AUDIO UPLOAD & INTELLIGENCE PIPELINE
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Upload Meeting Audio for G13 Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Transforms uploaded recordings into a speaker-aware, evidence-grounded meeting intelligence report using Whisper, PyAnnote Diarization, ECAPA-TDNN, and Groq LLM.
        </p>
      </div>

      {/* ERROR STATE: NO SPEECH DETECTED (Strictly mandated) */}
      {pipelineStatus === 'FAILED' && pipelineError?.code === 'NO_SPEECH_DETECTED' && (
        <div className="p-8 sm:p-10 rounded-3xl glass-panel-elevated border border-amber-500/30 shadow-2xl text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-glow-amber">
            <Volume2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="amber" size="md">
              VAD VALIDATION FAILED
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              NO SPEECH DETECTED
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              No meaningful speech was detected in this audio. Downstream AI transcription and analysis were halted to prevent fake transcripts or hallucinations.
            </p>
          </div>

          {/* Measured VAD Metrics Card */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 text-xs font-mono text-left">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Speech detected:</span>
              <span className="text-rose-400 font-bold">No</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Usable speech:</span>
              <span className="text-rose-400 font-bold">0 seconds</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Measured silence:</span>
              <span className="text-slate-200">{pipelineError?.totalDurationSec || 0} seconds</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-white/5">
              <span className="text-slate-400">Integrity Protection:</span>
              <span className="text-emerald-400">Zero Fabricated Data</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              icon={RotateCcw}
              onClick={handleReset}
              className="px-8 shadow-glow-md"
            >
              Upload Another Audio
            </Button>
          </div>
        </div>
      )}

      {/* ERROR STATE: OTHER PIPELINE OR VALIDATION FAILURE */}
      {((pipelineStatus === 'FAILED' && pipelineError?.code !== 'NO_SPEECH_DETECTED') || validationError) && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel-elevated border border-rose-500/30 shadow-2xl text-center space-y-5 animate-scale-in">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
            <FileX className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white font-display">
              {validationError?.title || pipelineError?.title || 'Processing Error'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              {validationError?.message || pipelineError?.message || 'An error occurred during audio processing.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" onClick={handleReset} icon={RotateCcw}>
              Try Different File
            </Button>
            {file && !validationError && (
              <Button variant="primary" onClick={handleStartProcessing}>
                Retry Processing
              </Button>
            )}
          </div>
        </div>
      )}

      {/* STATE 1: UPLOAD ZONE (When not processing or failed) */}
      {!isProcessing && !isUploading && pipelineStatus !== 'FAILED' && (
        <div className="space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
            className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all duration-200 text-center space-y-4 cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/10 shadow-glow-md'
                : 'border-white/15 bg-surface-elevated/40 hover:border-white/30 hover:bg-surface-elevated/60'
            }`}
          >
            <input
              id="file-input"
              type="file"
              accept=".mp3,.wav,.m4a,.webm,.ogg"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleSelectFile(e.target.files[0])}
            />

            <div className="w-16 h-16 rounded-2xl bg-ai/15 border border-ai/30 text-ai flex items-center justify-center mx-auto shadow-glow-ai">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {file ? file.name : "Drag & drop meeting audio here, or click to browse"}
              </h3>
              <p className="text-xs text-slate-400">
                Supports MP3, WAV, M4A, WEBM, and OGG up to 100 MB
              </p>
            </div>

            {/* Audio Metadata Chips */}
            {file && fileMetadata && (
              <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Valid {fileMetadata.format}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface text-slate-300 text-xs font-mono border border-white/5">
                  <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                  <span>{fileMetadata.sizeFormatted}</span>
                </div>
                {fileMetadata.durationSec > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface text-slate-300 text-xs font-mono border border-white/5">
                    <Clock className="w-3.5 h-3.5 text-ai" />
                    <span>Duration: {fileMetadata.formattedDuration}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Audio Preview Player */}
          {file && audioPreviewUrl && (
            <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-white/10 flex items-center justify-between gap-4">
              <audio
                ref={audioPreviewRef}
                src={audioPreviewUrl}
                onEnded={() => setIsPlayingPreview(false)}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlayPreview}
                  className="w-10 h-10 rounded-xl bg-ai/20 border border-ai/40 text-ai flex items-center justify-center hover:bg-ai/30 transition-colors"
                >
                  {isPlayingPreview ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div>
                  <div className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Audio Preview {isPlayingPreview ? '• Playing...' : '• Click to listen'}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={handleReset}
              >
                Clear
              </Button>
            </div>
          )}

          {/* Quick Presets for Demo & Testing */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                Or pick a verified test recording:
              </span>
              <span className="text-[10px] font-mono text-ai">Instant Testing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectPreset('finedge')}
                className="p-3 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-white">
                  <span>FinEdge Stripe Sync</span>
                  <FileAudio className="w-4 h-4 text-ai" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Multi-Speaker • Architecture
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('acme')}
                className="p-3 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-white">
                  <span>Acme Disaster Audit</span>
                  <FileAudio className="w-4 h-4 text-accent" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Client Review • Commitments
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('silent')}
                className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                  <span>Silent Recording (VAD Test)</span>
                  <Volume2 className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-[10px] text-amber-400/80 font-mono mt-1">
                  Tests No-Speech Rejection
                </div>
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
              disabled={!file || !!validationError}
              icon={Sparkles}
              onClick={handleStartProcessing}
              className="px-8 shadow-glow-ai"
            >
              Run G13 Intelligence Pipeline
            </Button>
          </div>
        </div>
      )}

      {/* STATE 2: UPLOADING STATE (Real percentage progress) */}
      {isUploading && (
        <div className="p-8 sm:p-12 rounded-3xl glass-panel-elevated border border-ai/30 text-center space-y-6 max-w-lg mx-auto animate-fade-in shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-ai/20 border border-ai/40 text-ai flex items-center justify-center mx-auto shadow-glow-ai animate-pulse">
            <Upload className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white font-display">
              Uploading Audio to G13 Engine
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Transferring: {file?.name}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 max-w-sm mx-auto">
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary via-ai to-accent h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Transmitting raw audio</span>
              <span className="text-ai font-bold">{uploadProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: LIVE BACKEND PROCESSING TIMELINE */}
      {isProcessing && pipelineStatus !== 'FAILED' && (
        <div className="space-y-6">
          <ProcessingTimeline
            currentStageIndex={currentStageIndex}
            completedStages={completedStages}
            status={pipelineStatus}
            error={pipelineError}
            vadResult={vadResult}
          />

          <div className="text-center">
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Cancel and upload different audio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExistingMeetingPage;
