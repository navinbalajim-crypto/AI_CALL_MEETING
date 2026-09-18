import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useMeeting } from '../context/MeetingContext';
import {
  History,
  Search,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  ExternalLink
} from 'lucide-react';

export const MeetingHistoryPage = ({ onNavigate, onSelectMeeting }) => {
  const { meetings } = useMeeting();
  const [search, setSearch] = useState('');

  const filtered = meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.client.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#080B16] text-white p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="indigo" dot size="sm">
              ORGANIZATIONAL MEMORY
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              RAG Knowledge Corpus
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            Meeting History & Memory Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Browse all past session transcripts, historical decisions, and commitment logs
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search past sessions, clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Meetings Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel-elevated border-2 border-dashed border-white/10 text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 text-ai flex items-center justify-center mx-auto">
            <History className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-display">No meetings analyzed yet</h3>
            <p className="text-xs text-slate-400">
              Upload a meeting recording to start generating your organizational knowledge archive.
            </p>
          </div>
          <Button
            variant="ai"
            size="sm"
            onClick={() => onNavigate('upload')}
            className="shadow-glow-ai"
          >
            Upload Meeting Audio
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                if (onSelectMeeting) onSelectMeeting(m);
                onNavigate('report');
              }}
              className="p-6 rounded-2xl glass-panel-interactive border border-white/8 cursor-pointer space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-primary-soft font-bold">
                    {m.code}
                  </span>
                  <span>{m.date}</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-primary-soft transition-colors leading-snug">
                  {m.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {m.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">{m.client}</span>
                  <span className="text-[11px] font-mono">{m.duration}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-emerald-400 font-mono flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {m.stats?.commitmentsCount || 2} Commitments
                  </span>
                  <span className="text-ai font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Inspect Report →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingHistoryPage;
