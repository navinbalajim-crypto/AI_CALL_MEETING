import React, { useState } from 'react';
import { ActionItemRow } from '../components/actions/ActionItemRow';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useMeeting } from '../context/MeetingContext';
import {
  ListTodo,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  User,
  Plus
} from 'lucide-react';

export const ActionTrackerPage = ({ onOpenEvidence }) => {
  const { actions, updateActionStatus } = useMeeting();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');

  const uniqueOwners = Array.from(new Set(actions.map((a) => a.owner)));

  const filteredActions = actions.filter((act) => {
    const matchesSearch =
      act.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || act.status === statusFilter;
    const matchesOwner = ownerFilter === 'All' || act.owner === ownerFilter;

    return matchesSearch && matchesStatus && matchesOwner;
  });

  const completedCount = actions.filter((a) => a.status === 'Completed').length;
  const inProgressCount = actions.filter((a) => a.status === 'In Progress').length;
  const pendingCount = actions.filter((a) => a.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#080B16] text-white p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="emerald" dot size="sm">
              ACCOUNTABILITY SYSTEM
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              Evidence-Backed Tasks
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            Organizational Action Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real commitments extracted from verbal agreements across all team sessions
          </p>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-white/10 text-xs font-mono">
            <span className="text-slate-400">Pending:</span>{" "}
            <span className="text-white font-bold">{pendingCount}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-ai/10 border border-ai/30 text-xs font-mono">
            <span className="text-slate-400">In Progress:</span>{" "}
            <span className="text-ai font-bold">{inProgressCount}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono">
            <span className="text-slate-400">Fulfilled:</span>{" "}
            <span className="text-emerald-400 font-bold">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl glass-panel border border-white/8">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action items or owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-ai"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-ai"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Needs Clarification">Needs Clarification</option>
          </select>
        </div>

        {/* Owner Filter */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-ai"
          >
            <option value="All">All Owners</option>
            {uniqueOwners.map((owner, idx) => (
              <option key={idx} value={owner}>{owner}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {filteredActions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 glass-panel rounded-2xl">
            <ListTodo className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm text-slate-300">No matching action items found.</p>
          </div>
        ) : (
          filteredActions.map((action) => (
            <ActionItemRow
              key={action.id}
              action={action}
              onStatusChange={updateActionStatus}
              onViewEvidence={onOpenEvidence}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ActionTrackerPage;
