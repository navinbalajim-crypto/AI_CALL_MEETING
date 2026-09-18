import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LogIn, AlertCircle, CheckCircle2, Users, Calendar, ArrowRight, Smartphone, Loader2 } from 'lucide-react';
import { useMeeting } from '../../context/MeetingContext';
import { meetingService } from '../../services/meetingService';

export const JoinMeetingModal = ({ isOpen, onClose, onJoined, initialCode = '' }) => {
  const { joinMeetingByCode, meetings } = useMeeting();
  const [code, setCode] = useState(initialCode || '');
  const [participantName, setParticipantName] = useState('Mobile Attendee');
  const [previewMeeting, setPreviewMeeting] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      handleLookup(initialCode);
    }
  }, [initialCode]);

  const handleLookup = async (enteredCode) => {
    setCode(enteredCode);
    setError('');
    const clean = (enteredCode || '').trim().toUpperCase();

    if (clean.length >= 5) {
      setSearching(true);
      // 1. Check local state
      let match = meetings.find((m) => m.code.toUpperCase() === clean);

      // 2. Query backend API for cross-device sync
      if (!match) {
        try {
          match = await meetingService.getMeetingByCode(clean);
        } catch (e) {
          // ignore
        }
      }

      // 3. Check URL hash parameters for fallback metadata
      if (!match && window.location.hash.includes('join=')) {
        try {
          const hashStr = window.location.hash.replace('#', '');
          const params = new URLSearchParams(hashStr);
          if (params.get('title')) {
            match = {
              id: `meet-remote-${Date.now()}`,
              code: clean,
              title: decodeURIComponent(params.get('title')),
              client: decodeURIComponent(params.get('client') || 'External Client'),
              date: 'Live Now',
              participants: [
                { id: 'user-1', name: 'Alex Rivera', role: 'Host Lead', isUser: true, avatar: 'AR' }
              ]
            };
          }
        } catch (e) {
          // ignore
        }
      }

      setSearching(false);

      if (match) {
        setPreviewMeeting(match);
        setError('');
      } else {
        setPreviewMeeting(null);
        if (clean.length >= 8) {
          setError('No active session found with this code. Check the format (e.g. G13-X7K92).');
        }
      }
    } else {
      setPreviewMeeting(null);
      setSearching(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    const cleanCode = code.trim().toUpperCase();

    if (!previewMeeting) {
      setError('Please verify meeting code first.');
      return;
    }

    try {
      const result = await joinMeetingByCode(cleanCode);
      if (result.success) {
        // Also register participant on backend
        await meetingService.joinMeeting(cleanCode, {
          name: participantName,
          role: 'Mobile Attendee'
        });

        onClose();
        if (onJoined) onJoined(result.meeting);
      } else {
        // Fallback: If preview was matched, enter with preview data
        onClose();
        if (onJoined) onJoined(previewMeeting);
      }
    } catch (err) {
      if (previewMeeting) {
        onClose();
        if (onJoined) onJoined(previewMeeting);
      } else {
        setError(err.message || 'Failed to join meeting room.');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title="Join AI-Assisted Meeting"
      subtitle="Enter a 9-character meeting code to join the live intelligence room"
    >
      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Meeting Code
          </label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="e.g. G13-X7K92"
              value={code}
              onChange={(e) => handleLookup(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#080B16] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-ai text-center text-lg font-mono tracking-wider uppercase font-bold"
            />
            {searching && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ai">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-1">
            <span>Format: G13-XXXXX</span>
            <button
              type="button"
              onClick={() => handleLookup('G13-X7K92')}
              className="text-ai hover:underline"
            >
              Paste Demo Code (G13-X7K92)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Your Display Name (for Diarization)
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Sarah Chen (Mobile)"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B16] border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Meeting Preview Card */}
        {previewMeeting && (
          <div className="p-4 rounded-xl bg-surface-elevated border border-primary/30 space-y-2.5 animate-scale-in">
            <div className="flex items-center justify-between">
              <Badge variant="emerald" dot>
                SESSION FOUND & ACTIVE
              </Badge>
              <span className="text-[11px] font-mono text-slate-400">
                {previewMeeting.client}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white leading-snug">
              {previewMeeting.title}
            </h4>
            <div className="flex items-center gap-4 text-xs text-slate-300 pt-1 border-t border-white/5">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-ai" />
                {previewMeeting.participants?.length || 2} Attendees
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {previewMeeting.date || 'Live Session'}
              </span>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 text-sm shadow-glow-sm"
            disabled={!previewMeeting}
            icon={ArrowRight}
          >
            Enter Live Meeting Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default JoinMeetingModal;
