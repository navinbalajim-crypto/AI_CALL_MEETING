import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SAMPLE_MANUAL_CONVERSATIONS } from '../data/demoTranscripts';
import { intelligenceService } from '../services/intelligenceService';
import { useMeeting } from '../context/MeetingContext';
import {
  MessageSquare,
  Sparkles,
  Send,
  Plus,
  Trash2,
  Users,
  Building,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const ManualConversationPage = ({ onNavigate }) => {
  const { setActiveMeeting } = useMeeting();

  const [metadata, setMetadata] = useState({
    title: 'Enterprise SLA & Multi-AZ Failover Sync',
    client: 'Acme Global Corp',
    organization: 'Cloud Infrastructure SRE'
  });

  const [turns, setTurns] = useState([
    { id: 1, speaker: 'Alex Rivera', role: 'Host & Lead', isUser: true, text: 'Good morning team. We need to finalize the database failover architecture and SLA guarantees for Acme.' },
    { id: 2, speaker: 'David Kim', role: 'VP of Infrastructure, Acme (Customer)', isUser: false, text: 'Our main requirement is zero data loss (RPO = 0) and under 60 seconds failover (RTO < 60s).' },
    { id: 3, speaker: 'Raj Patel', role: 'Senior Architect', isUser: false, text: "I'll provision the multi-AZ synchronous replication cluster on AWS by Thursday 4 PM." },
    { id: 4, speaker: 'Alex Rivera', role: 'Host & Lead', isUser: true, text: 'Decision agreed: We will standardize on Aurora PostgreSQL with automated Route53 DNS failover.' },
    { id: 5, speaker: 'Elena Rostova', role: 'SecOps', isUser: false, text: 'I commit to delivering the verified DR runbook to David by Friday noon.' }
  ]);

  const [newSpeaker, setNewSpeaker] = useState('Alex Rivera');
  const [newText, setNewText] = useState('');

  const handleAddTurn = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const isUser = newSpeaker.includes('Alex');
    setTurns((prev) => [
      ...prev,
      {
        id: Date.now(),
        speaker: newSpeaker,
        role: isUser ? 'Host & Lead' : 'Collaborator',
        isUser,
        text: newText.trim()
      }
    ]);
    setNewText('');
  };

  const handleRemoveTurn = (id) => {
    setTurns((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLoadSample = (sample) => {
    setMetadata({
      title: sample.name,
      client: sample.client,
      organization: 'Architecture Group'
    });
    setTurns(
      sample.turns.map((t, idx) => ({
        id: idx + 1,
        speaker: t.speaker.split('(')[0].trim(),
        role: t.speaker.includes('Host') ? 'Host & Lead' : 'Client Representative',
        isUser: t.speaker.includes('Host'),
        text: t.text
      }))
    );
  };

  const handleGenerateReport = () => {
    const formattedTurns = turns.map((t, idx) => ({
      id: `turn-${t.id || idx}`,
      speakerName: t.speaker,
      speakerRole: t.role,
      isUser: t.isUser,
      timestamp: `0${idx}:30`,
      text: t.text,
      type: intelligenceService.classifyTurn(t.text).toLowerCase()
    }));

    const report = intelligenceService.generateReportFromTranscript(formattedTurns, {
      title: metadata.title,
      client: metadata.client,
      organization: metadata.organization
    });

    onNavigate('report');
  };

  return (
    <div className="min-h-screen bg-[#080B16] text-white p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="emerald" dot size="sm">
              INPUT MODE 3 • MANUAL DIALOG
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            Interactive Conversation Input
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Paste or compose meeting dialogue to feed directly into the unified commitment engine
          </p>
        </div>

        <Button
          variant="ai"
          icon={Sparkles}
          onClick={handleGenerateReport}
          className="shadow-glow-ai"
        >
          Generate Meeting Intelligence
        </Button>
      </div>

      {/* Meeting Metadata Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl glass-panel border border-white/8">
        <div>
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Meeting Title
          </label>
          <input
            type="text"
            value={metadata.title}
            onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-ai"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Customer / Client
          </label>
          <input
            type="text"
            value={metadata.client}
            onChange={(e) => setMetadata({ ...metadata, client: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-ai"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Organization / Dept
          </label>
          <input
            type="text"
            value={metadata.organization}
            onChange={(e) => setMetadata({ ...metadata, organization: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-ai"
          />
        </div>
      </div>

      {/* Preset Samples */}
      <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
        <span className="font-mono text-[11px]">Load preset dialog:</span>
        {SAMPLE_MANUAL_CONVERSATIONS.map((sample, i) => (
          <button
            key={i}
            onClick={() => handleLoadSample(sample)}
            className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-slate-300 text-xs hover:text-white transition-colors"
          >
            {sample.name} ({sample.client})
          </button>
        ))}
      </div>

      {/* Message Bubbles Container */}
      <div className="rounded-2xl glass-panel border border-white/8 p-4 sm:p-6 space-y-4 max-h-[460px] overflow-y-auto">
        {turns.map((t) => {
          const type = intelligenceService.classifyTurn(t.text);
          const isCommitment = type === 'COMMITMENT';

          return (
            <div
              key={t.id}
              className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 group transition-colors ${
                isCommitment
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-surface-elevated/60 border-white/5'
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {t.speaker}
                  </span>
                  {t.isUser ? (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-primary/20 text-primary-soft font-mono font-bold">
                      YOU (HOST)
                    </span>
                  ) : (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-white/5 text-slate-400 font-mono">
                      {t.role}
                    </span>
                  )}
                  {isCommitment && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Commitment Trigger
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  "{t.text}"
                </p>
              </div>

              <button
                onClick={() => handleRemoveTurn(t.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded transition-opacity"
                title="Delete turn"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add New Turn Form */}
      <form onSubmit={handleAddTurn} className="p-4 rounded-2xl glass-panel border border-white/8 flex flex-col sm:flex-row items-center gap-3">
        <select
          value={newSpeaker}
          onChange={(e) => setNewSpeaker(e.target.value)}
          className="w-full sm:w-48 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-ai font-semibold"
        >
          <option value="Alex Rivera">Alex Rivera (You/Host)</option>
          <option value="David Kim">David Kim (Customer VP)</option>
          <option value="Raj Patel">Raj Patel (Architect)</option>
          <option value="Elena Rostova">Elena Rostova (Compliance)</option>
        </select>

        <input
          type="text"
          placeholder="Type or paste conversational speech here..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="flex-1 w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-ai"
        />

        <Button type="submit" variant="primary" size="sm" icon={Send} className="w-full sm:w-auto">
          Add Line
        </Button>
      </form>
    </div>
  );
};

export default ManualConversationPage;
