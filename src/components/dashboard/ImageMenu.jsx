import React from 'react';
import { Badge } from '../common/Badge';
import {
  Radio,
  Upload,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Activity,
  Layers,
  Calendar
} from 'lucide-react';

export const ImageMenu = ({ onNavigate, onOpenCreate, onOpenJoin }) => {
  const menuItems = [
    {
      id: 'live',
      title: 'Live Meeting Room',
      category: 'Real-time AI Sync',
      badgeText: 'Multi-Device Mic',
      badgeVariant: 'indigo',
      image: '/images/menu_live.jpg',
      description: 'Host or join multi-device live meetings. AI actively diarizes speakers, captures verbal commitments, and tracks consensus.',
      primaryAction: {
        label: 'Start Live Meeting',
        icon: Radio,
        onClick: () => {
          if (onOpenCreate) onOpenCreate();
          else onNavigate('live');
        }
      },
      secondaryAction: {
        label: 'Join with Code',
        onClick: () => {
          if (onOpenJoin) onOpenJoin();
          else onNavigate('live');
        }
      }
    },
    {
      id: 'upload',
      title: 'Audio File Intelligence',
      category: '10-Stage Pipeline',
      badgeText: 'VAD & DSP Audio',
      badgeVariant: 'cyan',
      image: '/images/menu_upload.jpg',
      description: 'Upload MP3 or WAV audio. Extract physical duration, RMS loudness, vocal pitch (F0), silence ratios, and Whisper transcripts.',
      primaryAction: {
        label: 'Upload Recording',
        icon: Upload,
        onClick: () => onNavigate('upload')
      }
    },
    {
      id: 'report',
      title: 'Intelligence Dossier & PDF',
      category: 'Official Reports',
      badgeText: 'Executive PDF',
      badgeVariant: 'emerald',
      image: '/images/menu_report.jpg',
      description: 'Access complete 16-domain meeting intelligence, evidence quotes, confidence grounding metrics, and download executive PDF dossier.',
      primaryAction: {
        label: 'Open Full Report',
        icon: FileText,
        onClick: () => onNavigate('report')
      }
    },
    {
      id: 'actions',
      title: 'Action & Commitment Tracker',
      category: 'Accountability',
      badgeText: 'Owners & Deadlines',
      badgeVariant: 'amber',
      image: '/images/menu_actions.jpg',
      description: 'Verify extracted deliverables, assign owners, track normalized calendar deadlines, and enforce automated verification checks.',
      primaryAction: {
        label: 'Track Commitments',
        icon: CheckCircle2,
        onClick: () => onNavigate('actions')
      }
    }
  ];

  return (
    <section className="space-y-6 pt-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Workspace Intelligence Menu
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Select Your Intelligence Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Choose a workspace module to initiate live cross-device meetings, upload conversation audio, review official reports, or track team deliverables.
          </p>
        </div>
      </div>

      {/* 4-Card Image Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item) => {
          const PrimaryIcon = item.primaryAction.icon;
          return (
            <div
              key={item.id}
              className="group relative flex flex-col rounded-2xl bg-[#0E1326]/90 border border-white/10 hover:border-primary/50 overflow-hidden shadow-xl transition-all duration-300 hover:shadow-glow-md hover:-translate-y-1"
            >
              {/* Card Image Banner */}
              <div className="relative h-44 w-full overflow-hidden bg-black/60">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1326] via-[#0E1326]/40 to-transparent" />

                {/* Floating Top Badge */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white">
                    {item.category}
                  </span>
                  <Badge variant={item.badgeVariant} size="xs">
                    {item.badgeText}
                  </Badge>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={item.primaryAction.onClick}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-accent text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-glow-sm transition-all cursor-pointer"
                  >
                    <PrimaryIcon className="w-4 h-4" />
                    <span>{item.primaryAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-70 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {item.secondaryAction && (
                    <button
                      onClick={item.secondaryAction.onClick}
                      className="w-full py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-medium transition-colors text-center cursor-pointer border border-white/5"
                    >
                      {item.secondaryAction.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ImageMenu;
