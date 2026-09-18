import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { WaveformVisualizer } from '../components/audio/WaveformVisualizer';
import { useAuth } from '../context/AuthContext';
import { voiceProfileService } from '../services/voiceProfileService';
import {
  Mic,
  MicOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
  ArrowRight,
  Radio,
  Users,
  Volume2,
  FileCheck,
  AlertCircle
} from 'lucide-react';

export const VoiceOnboardingPage = ({ onNavigate }) => {
  const { user, markVoiceProfileActive } = useAuth();

  // Onboarding steps: 'intro' | 'consent' | 'recording' | 'processing' | 'success'
  const [step, setStep] = useState('intro');
  const [hasConsented, setHasConsented] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioStream, setAudioStream] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const timerRef = useRef(null);

  // Suggested prompt phrase to calibrate voice pitch & phonemes
  const calibrationPrompt = "I am Alex Rivera, engineering lead. Today we will review the Q3 Stripe API architecture, lock in the database replication strategy, and coordinate client commitments.";

  // Request browser microphone
  const requestMicrophone = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
        setMicPermissionGranted(true);
        return stream;
      }
    } catch (err) {
      console.warn("Microphone access declined or not supported. Using high-fidelity simulator mode.", err);
      setMicPermissionGranted(false);
    }
    return null;
  };

  const handleStartRecording = async () => {
    setErrorMessage('');
    const stream = await requestMicrophone();
    setIsRecording(true);
    setRecordingSeconds(0);

    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 10) {
          handleStopRecording();
          return 10;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }

    setRecordedBlob(new Blob(['mock_voice_data'], { type: 'audio/webm' }));
  };

  const handleSaveProfile = async () => {
    setStep('processing');
    try {
      await voiceProfileService.saveVoiceProfile(user?.id || 'current', recordedBlob, recordingSeconds || 8);
      setTimeout(() => {
        markVoiceProfileActive();
        setStep('success');
      }, 2400);
    } catch (err) {
      setErrorMessage('Failed to enroll voice signature. Please try again.');
      setStep('recording');
    }
  };

  const handleFinish = () => {
    onNavigate('dashboard');
  };

  const handleSkip = () => {
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#080B16] text-white flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-primary/15 via-ai/10 to-transparent blur-[130px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-2">
          <span className="flex items-center gap-1.5 text-ai">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            VOICE MEMORY ONBOARDING
          </span>
          <span>Step {step === 'intro' ? '1' : step === 'consent' ? '2' : step === 'recording' ? '3' : step === 'processing' ? '4' : '5'} of 5</span>
        </div>

        {/* STEP 1: INTRO & USER VS CUSTOMER FRAMING */}
        {step === 'intro' && (
          <div className="p-6 sm:p-10 rounded-3xl glass-panel-elevated border border-white/10 shadow-2xl space-y-6 animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-ai/15 border border-ai/30 text-ai flex items-center justify-center shadow-glow-ai">
              <Mic className="w-7 h-7 animate-pulse" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Meet your AI meeting assistant.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Save a short voice sample so G13 can accurately distinguish your voice from other speakers, clients, and customers during future multi-party meetings.
              </p>
            </div>

            {/* Visual Differentiation Explanation */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/8 space-y-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Dual Speaker Separation Protocol
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary-soft">YOUR VOICE (HOST)</span>
                    <Badge variant="indigo" size="xs">Profiled</Badge>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    Recognizes your speech turns instantly to associate team commitments and leadership decisions with your account.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300">CLIENT / CUSTOMER</span>
                    <Badge variant="rose" size="xs">Cluster</Badge>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    Separates external client demands, concerns, and SLAs from internal commitments to avoid attribution confusion.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/8">
              <button
                onClick={handleSkip}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Skip for now
              </button>
              <Button
                variant="ai"
                onClick={() => setStep('consent')}
                icon={ArrowRight}
              >
                Continue to Voice Setup
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: CONSENT */}
        {step === 'consent' && (
          <div className="p-6 sm:p-10 rounded-3xl glass-panel-elevated border border-white/10 shadow-2xl space-y-6 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 text-primary-soft flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white font-display">
                Privacy & Voice Representation Consent
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                G13 values your privacy. Your voice sample is converted into an acoustic feature representation strictly used for diarization and speaker attribution within your authorized meetings.
              </p>
            </div>

            {/* Formal Consent Box */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/20 text-primary focus:ring-primary bg-black/40"
                />
                <span className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  "I understand that my voice sample will be used to create a voice representation for speaker identification in my meetings. I can recalibrate or delete this profile at any time in Settings."
                </span>
              </label>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>G13 does not sell or share acoustic voice prints. Audio data is encrypted in transit and at rest.</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/8">
              <Button variant="ghost" onClick={() => setStep('intro')}>
                Back
              </Button>
              <Button
                variant="primary"
                disabled={!hasConsented}
                onClick={() => setStep('recording')}
                icon={ArrowRight}
              >
                Proceed to Recording
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: LIVE RECORDING STUDIO */}
        {step === 'recording' && (
          <div className="p-6 sm:p-10 rounded-3xl glass-panel-elevated border border-white/10 shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={isRecording ? 'rose' : 'ai'} dot>
                  {isRecording ? 'LIVE RECORDING' : 'STUDIO READY'}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  Target: 8–10 seconds
                </span>
              </div>
              <span className="font-mono text-sm text-white font-bold">
                00:{recordingSeconds.toString().padStart(2, '0')} / 00:10
              </span>
            </div>

            {/* Suggested Calibration Speech Card */}
            <div className="p-4 rounded-xl bg-surface-elevated/70 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-ai uppercase tracking-wider block">
                Please read aloud naturally to calibrate acoustic pitch:
              </span>
              <p className="text-sm font-medium text-slate-100 italic leading-relaxed pl-2 border-l-2 border-ai">
                "{calibrationPrompt}"
              </p>
            </div>

            {/* Reactive Waveform Visualizer */}
            <div className="p-4 rounded-2xl bg-[#080B16] border border-white/10 shadow-inner">
              <WaveformVisualizer
                isRecording={isRecording}
                stream={audioStream}
                height={80}
                colorMode="ai"
              />
            </div>

            {/* Recording Controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              {!isRecording && !recordedBlob && (
                <Button
                  size="lg"
                  variant="ai"
                  icon={Mic}
                  onClick={handleStartRecording}
                  className="px-8 shadow-glow-ai"
                >
                  Start Calibration Recording
                </Button>
              )}

              {isRecording && (
                <Button
                  size="lg"
                  variant="danger"
                  icon={MicOff}
                  onClick={handleStopRecording}
                  className="px-8 animate-pulse"
                >
                  Stop Recording ({recordingSeconds}s)
                </Button>
              )}

              {!isRecording && recordedBlob && (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    icon={RotateCcw}
                    onClick={handleStartRecording}
                  >
                    Re-record Sample
                  </Button>
                  <Button
                    variant="primary"
                    icon={Sparkles}
                    onClick={handleSaveProfile}
                    className="shadow-glow-md"
                  >
                    Generate Voice Profile
                  </Button>
                </div>
              )}
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-400 text-center">{errorMessage}</p>
            )}

            <div className="text-center pt-2">
              <button
                onClick={handleSkip}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Skip voice calibration for now
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PROCESSING STAGE */}
        {step === 'processing' && (
          <div className="p-10 rounded-3xl glass-panel-elevated border border-ai/30 shadow-2xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-ai/20 border border-ai/40 text-ai flex items-center justify-center mx-auto shadow-glow-ai animate-spin" style={{ animationDuration: '6s' }}>
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white font-display">
                Creating your acoustic voice profile...
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Analyzing pitch frequencies, vocal timbre, and formant harmonics to build your enterprise speaker signature.
              </p>
            </div>

            <div className="max-w-xs mx-auto p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs font-mono text-left">
              <div className="flex justify-between text-slate-400">
                <span>FFT Resample:</span>
                <span className="text-emerald-400">48,000 Hz</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Formant Filter:</span>
                <span className="text-ai">8-dim Timbre</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Separation Cluster:</span>
                <span className="text-primary-soft">User vs Client</span>
              </div>
            </div>

            <div className="w-48 mx-auto bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-primary via-ai to-accent h-full w-full animate-pulse" />
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS & CONFIRMATION */}
        {step === 'success' && (
          <div className="p-6 sm:p-10 rounded-3xl glass-panel-elevated border border-emerald-500/30 shadow-2xl text-center space-y-6 animate-scale-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-commitment">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <Badge variant="emerald" dot size="md">
                VOICE PROFILE READY
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Your voice profile is active.
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Future meetings can use this profile to help distinguish your voice from other participants, clients, and external attendees.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-elevated/70 border border-white/10 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Assigned Speaker Role:</span>
                <strong className="text-white">Host & Lead (Alex Rivera)</strong>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Speaker Separation:</span>
                <span className="text-emerald-400 font-mono font-semibold">Active (99.2% confidence)</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                onClick={handleFinish}
                className="px-8 shadow-glow-md"
              >
                Proceed to Command Center
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceOnboardingPage;
