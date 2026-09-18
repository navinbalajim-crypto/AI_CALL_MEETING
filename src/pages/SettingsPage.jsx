import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { voiceProfileService } from '../services/voiceProfileService';
import {
  Mic,
  Settings,
  ShieldCheck,
  RotateCcw,
  Trash2,
  Server,
  Database,
  Radio,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export const SettingsPage = ({ onNavigate }) => {
  const { user, markVoiceProfileActive } = useAuth();
  const [profileData, setProfileData] = useState(() => voiceProfileService.getProfileStatus(user?.id || 'current'));
  const [recalibrating, setRecalibrating] = useState(false);

  const handleRecalibrate = () => {
    setRecalibrating(true);
    setTimeout(() => {
      setRecalibrating(false);
      onNavigate('voice-onboarding');
    }, 400);
  };

  const handleDisableProfile = async () => {
    if (window.confirm("Are you sure you want to disable and delete your stored acoustic voice profile?")) {
      await voiceProfileService.disableVoiceProfile(user?.id || 'current');
      setProfileData({ status: 'unregistered', profile: null });
    }
  };

  return (
    <div className="min-h-screen bg-[#080B16] text-white p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      <div className="pb-6 border-b border-white/8">
        <div className="flex items-center gap-2">
          <Badge variant="indigo" dot size="sm">
            PREFERENCES & CALIBRATION
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
          System & Voice Intelligence Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your personal acoustic signature, diarization models, and organizational connections
        </p>
      </div>

      {/* SECTION 1: VOICE MEMORY PROFILE */}
      <div className="p-6 rounded-3xl glass-panel-elevated border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Personal Voice Memory Profile
              </h2>
              <p className="text-xs text-slate-400">
                Acoustic embedding used to distinguish your voice from clients and other speakers
              </p>
            </div>
          </div>

          <Badge variant={profileData.status === 'active' ? 'emerald' : 'amber'} dot>
            {profileData.status === 'active' ? 'ACTIVE & ENROLLED' : 'NOT ENROLLED'}
          </Badge>
        </div>

        {profileData.status === 'active' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-black/40 border border-white/5 text-xs">
              <div>
                <span className="text-slate-500 block">Diarization Role:</span>
                <strong className="text-slate-200">Host / Team Lead</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Separation Confidence:</span>
                <strong className="text-emerald-400 font-mono">94% Accuracy</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Distinction Protocol:</span>
                <strong className="text-ai font-mono">User vs Client</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={handleRecalibrate}
                loading={recalibrating}
              >
                Re-record Voice Calibration
              </Button>

              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={handleDisableProfile}
              >
                Disable Profile
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-3">
            <p className="text-amber-300">
              No voice profile found for this account. Future meetings will rely on standard blind diarization clusters.
            </p>
            <Button
              variant="ai"
              size="sm"
              icon={Mic}
              onClick={() => onNavigate('voice-onboarding')}
            >
              Enroll Voice Profile Now
            </Button>
          </div>
        )}
      </div>

      {/* SECTION 2: AI BACKEND CONNECTION HEALTH */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-ai" />
          AI & Backend Infrastructure Readiness
        </h2>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="font-semibold text-slate-300">Whisper Speech-to-Text STT</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Operational (v3-large)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="font-semibold text-slate-300">PyAnnote Speaker Diarization</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Calibrated (Dual-Channel)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="font-semibold text-slate-300">Groq LLM Commitment Parser</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active (Llama-3.3-70b-versatile)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="font-semibold text-slate-300">PostgreSQL / pgvector RAG Memory</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected (Cross-Meeting Sync)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
