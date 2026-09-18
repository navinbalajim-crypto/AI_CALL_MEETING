import React from 'react';
import { Badge } from '../common/Badge';
import { Mic, Volume2, UserCheck, Shield } from 'lucide-react';

export const ParticipantList = ({
  participants = [],
  activeSpeakerId = null,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
          Diarized Attendees ({participants.length})
        </h3>
        <span className="text-[10px] text-ai font-mono flex items-center gap-1">
          <Shield className="w-3 h-3" /> Voice Distinguish Active
        </span>
      </div>

      <div className="space-y-2">
        {participants.map((p) => {
          const isSpeaking = activeSpeakerId === p.id;

          return (
            <div
              key={p.id}
              className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                isSpeaking
                  ? 'bg-primary/10 border-primary/40 shadow-glow-sm'
                  : 'bg-surface-elevated/50 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar with speaking soundwave ripple */}
                <div className="relative shrink-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white border"
                    style={{
                      backgroundColor: p.color ? `${p.color}25` : '#5B6CFF25',
                      borderColor: p.color || '#5B6CFF'
                    }}
                  >
                    {p.avatar || p.name.substring(0, 2).toUpperCase()}
                  </div>

                  {isSpeaking && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  )}
                </div>

                {/* Name, Role & User vs Customer tag */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {p.name}
                    </h4>
                    {p.isUser && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary-soft font-bold uppercase font-mono">
                        You (Host)
                      </span>
                    )}
                    {p.role?.toLowerCase().includes('customer') && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300 font-bold uppercase font-mono">
                        Client
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {p.role}
                  </p>
                </div>
              </div>

              {/* Speaker Indicator */}
              <div className="shrink-0">
                {isSpeaking ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-semibold">
                    <Volume2 className="w-3 h-3 animate-pulse" />
                    Speaking
                  </div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParticipantList;
