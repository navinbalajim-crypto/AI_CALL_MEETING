import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LogIn, AlertCircle, CheckCircle2, Users, Calendar, ArrowRight } from 'lucide-react';
import { useMeeting } from '../../context/MeetingContext';

export const JoinMeetingModal = ({ isOpen, onClose, onJoined }) => {
  const { joinMeetingByCode, meetings } = useMeeting();
  const [code, setCode] = useState('');
  const [previewMeeting, setPreviewMeeting] = useState(null);
  const [error, setError] = useState('');

  const handleLookup = (enteredCode) => {
    setCode(enteredCode);
    setError('');
    const clean = enteredCode.trim().toUpperCase();
    if (clean.length >= 6) {
      const match = meetings.find((m) => m.code.toUpperCase() === clean);
      if (match) {
        setPreviewMeeting(match);
      } else {
        setPreviewMeeting(null);
        if (clean.length >= 8) {
          setError('No active session found with this code. Check the format (e.g. G13-X7K92).');
        }
      }
    } else {
      setPreviewMeeting(null);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const result = joinMeetingByCode(code);
    if (result.success) {
      onClose();
      if (onJoined) onJoined(result.meeting);
    } else {
      setError(result.error);
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
          <input
            type="text"
            required
            placeholder="e.g. G13-X7K92"
            value={code}
            onChange={(e) => handleLookup(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#080B16] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-ai text-center text-lg font-mono tracking-wider uppercase font-bold"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-1">
            <span>Example: G13-X7K92</span>
            <button
              type="button"
              onClick={() => handleLookup('G13-X7K92')}
              className="text-ai hover:underline"
            >
              Paste Demo Code
            </button>
          </div>
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
                SESSION READY
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
                {previewMeeting.participants?.length || 3} Attendees
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {previewMeeting.date}
              </span>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 text-sm"
            disabled={!previewMeeting}
            icon={ArrowRight}
          >
            Enter Meeting Room
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default JoinMeetingModal;
