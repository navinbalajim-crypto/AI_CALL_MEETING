import React from 'react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import { useMeeting } from '../context/MeetingContext';
import {
  Zap,
  Plus,
  LogIn,
  Upload,
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Radio,
  Users,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Mic,
  Quote
} from 'lucide-react';

export const DashboardPage = ({
  onNavigate,
  onOpenCreate,
  onOpenJoin,
  onOpenEvidence
}) => {
  const { user, hasVoiceProfile } = useAuth();
  const { meetings, actions } = useMeeting();

  // Greeting based on hour
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const pendingActions = actions.filter((a) => a.status === 'Pending' || a.status === 'In Progress');
  const upcomingDeadlines = actions.slice(0, 3);
  const recentMeetings = meetings.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#080B16] text-white p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Welcome Header & Agent Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {greeting}, {user?.name?.split(' ')[0] || 'Alex'}
            </h1>
            <Badge variant="indigo" size="xs">Host Lead</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {user?.organization || 'Core Platform Team'} • Organizational Memory & Commitment Tracker
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Agent Readiness Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-ai/30 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-ai animate-pulse" />
            <span className="text-slate-400">G13 Agent:</span>
            <span className="text-ai font-bold">Ready</span>
          </div>

          {/* Voice Profile Status */}
          <button
            onClick={() => onNavigate('voice-onboarding')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-emerald-500/30 text-xs font-mono hover:bg-surface-highlight transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Voice Profile:</span>
            <span className="text-emerald-400 font-bold">Active</span>
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS BAR (Four Core Entrypoints) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={onOpenCreate}
          className="p-4 rounded-2xl glass-panel-interactive border border-primary/40 flex items-center gap-3.5 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-soft flex items-center justify-center group-hover:scale-105 transition-transform shadow-glow-sm">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Create Meeting</h3>
            <p className="text-[11px] text-slate-400">New room & code</p>
          </div>
        </button>

        <button
          onClick={onOpenJoin}
          className="p-4 rounded-2xl glass-panel-interactive border border-white/10 flex items-center gap-3.5 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-ai/20 text-ai flex items-center justify-center group-hover:scale-105 transition-transform">
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Join Meeting</h3>
            <p className="text-[11px] text-slate-400">Enter session code</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('upload')}
          className="p-4 rounded-2xl glass-panel-interactive border border-white/10 flex items-center gap-3.5 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Upload Audio / Notes</h3>
            <p className="text-[11px] text-slate-400">6-stage AI parser</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('manual')}
          className="p-4 rounded-2xl glass-panel-interactive border border-white/10 flex items-center gap-3.5 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Manual Dialog</h3>
            <p className="text-[11px] text-slate-400">Interactive chat turns</p>
          </div>
        </button>
      </div>

      {/* MAIN VISUAL: ACTIVE / HIGHLIGHTED SESSION BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary-950/40 via-surface-elevated to-surface border border-primary/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-ai/10 blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="emerald" dot size="sm">
                PRIMARY SESSION • G13-X7K92
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                FinEdge Technologies • Core Architecture
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
              Q3 Stripe Billing & Latency Architecture Sync
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Consensus reached on PostgreSQL 16 read replicas. Raj committed to delivery by Friday with production sign-off on Monday. Elena finalized SOC2 audit deliverables.
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 flex-wrap">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-ai" /> 42 min duration
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Users className="w-3.5 h-3.5 text-slate-400" /> 5 Diarized attendees
              </span>
              <span className="flex items-center gap-1 font-mono text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> 3 Commitments extracted
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Button
              variant="ai"
              icon={Radio}
              onClick={() => onNavigate('live')}
              className="shadow-glow-ai"
            >
              Open Live Workspace
            </Button>
            <Button
              variant="outline"
              icon={FileText}
              onClick={() => onNavigate('report')}
            >
              Inspect Final Report
            </Button>
          </div>
        </div>
      </div>

      {/* METRICS & INSIGHTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Pending Commitments & Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-display">
                Accountable Commitments ({pendingActions.length})
              </h3>
              <Badge variant="emerald" size="xs">Grounded</Badge>
            </div>
            <button
              onClick={() => onNavigate('actions')}
              className="text-xs font-semibold text-ai hover:underline flex items-center gap-1"
            >
              <span>View All Tasks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingActions.slice(0, 3).map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-xl glass-panel-interactive border border-white/8 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={act.status === 'In Progress' ? 'ai' : 'indigo'} size="xs">
                      {act.status}
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Due: {act.deadline}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate">
                    {act.task}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Owner: <strong className="text-slate-200">{act.owner}</strong> ({act.ownerRole || 'Engineering'})
                  </p>
                </div>

                <button
                  onClick={() => onOpenEvidence(act)}
                  className="p-2 rounded-lg bg-surface-elevated hover:bg-surface-highlight text-ai hover:text-white border border-white/10 text-xs flex items-center gap-1 shrink-0 transition-colors"
                  title="View verbatim audio proof"
                >
                  <Quote className="w-3 h-3" />
                  <span className="hidden sm:inline">Evidence</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Recent Organizational Memory Archive */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display">
              Meeting Memory
            </h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-ai hover:underline"
            >
              Browse
            </button>
          </div>

          <div className="space-y-3">
            {recentMeetings.map((m) => (
              <div
                key={m.id}
                onClick={() => onNavigate('report')}
                className="p-4 rounded-xl glass-panel-interactive border border-white/8 cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{m.code}</span>
                  <span>{m.date}</span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">
                  {m.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  <span>{m.client}</span>
                  <span className="text-emerald-400 font-medium">
                    {m.stats?.commitmentsCount || 2} commitments
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
