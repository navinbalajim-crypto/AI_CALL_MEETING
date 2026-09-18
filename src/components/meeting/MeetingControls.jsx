import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Mic, MicOff, Play, Square, FileText, Sparkles, Radio } from 'lucide-react';

export const MeetingControls = ({
  isLiveActive,
  onStartSimulation,
  onStopSimulation,
  onEndMeeting,
  socketStatus = 'Ready'
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [seconds, setSeconds] = useState(145); // default elapsed timer

  useEffect(() => {
    let interval = null;
    if (isLiveActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLiveActive]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 rounded-2xl glass-panel-elevated border border-white/10 flex items-center justify-between gap-4 flex-wrap shadow-2xl">
      {/* Left: Status & Elapsed Timer */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <span className="text-xs font-mono text-white font-bold tracking-wider">
            REC
          </span>
          <span className="text-xs font-mono text-slate-400 font-medium">
            {formatTimer(seconds)}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 pl-4 border-l border-white/10">
          <Radio className="w-3.5 h-3.5 text-ai" />
          <span className="font-mono text-[11px]">Diarization: Active</span>
        </div>
      </div>

      {/* Center: Live Action Controls */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2.5 rounded-xl border transition-colors ${
            isMuted
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'bg-surface-elevated hover:bg-surface-highlight border-white/10 text-white'
          }`}
          title={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {isLiveActive ? (
          <Button
            variant="danger"
            size="sm"
            icon={Square}
            onClick={onStopSimulation}
          >
            Pause Live Stream
          </Button>
        ) : (
          <Button
            variant="ai"
            size="sm"
            icon={Play}
            onClick={onStartSimulation}
          >
            Simulate Live Speech
          </Button>
        )}
      </div>

      {/* Right: End & Generate Report */}
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          icon={FileText}
          onClick={onEndMeeting}
          className="shadow-glow-md"
        >
          End & Generate Final Report
        </Button>
      </div>
    </div>
  );
};

export default MeetingControls;
