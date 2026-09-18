import React, { useState } from 'react';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Sparkles,
  Users,
  Zap,
  Quote,
  Database,
  AlertTriangle,
  ShieldCheck,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const DEMO_STEPS = [
  {
    step: 1,
    title: "1. Speaker Attribution & Voice Distinction",
    badge: "Voice Memory Engine",
    description: "G13 distinguishes the Host/User voice from external client voices. This ensures promises made by the team are immediately separated from client demands or exploratory suggestions.",
    targetView: "voice-onboarding",
    actionLabel: "View Voice Onboarding UX"
  },
  {
    step: 2,
    title: "2. Real-Time Commitment vs Casual Chat",
    badge: "NLP Classification",
    description: "Casual chatter like 'Maybe we could check Redis' is classified as a Suggestion, while 'I will complete the API refactor by Friday' triggers a binding Commitment with owner and strict deadline.",
    targetView: "live",
    actionLabel: "Jump to Live Meeting Workspace"
  },
  {
    step: 3,
    title: "3. Evidence Grounding & Provenance",
    badge: "Zero Hallucination",
    description: "Every single extracted action contains an animated link to its exact verbatim quote in the audio transcript, complete with speaker identity, timestamp, and surrounding context turns.",
    targetView: "report",
    actionLabel: "Inspect Grounding Evidence"
  },
  {
    step: 4,
    title: "4. RAG Historical Context & Cross-Meeting Memory",
    badge: "Organizational Brain",
    description: "G13 searches past meeting records without exposing raw vector embeddings. It correlates prior commitments with current discussion to keep organizational memory alive.",
    targetView: "history",
    actionLabel: "Explore Meeting Archive"
  },
  {
    step: 5,
    title: "5. Contradiction & Deadline Revision Flag",
    badge: "Contradiction Detection",
    description: "When Raj previously promised delivery on Friday (Sept 12 sync) and then adjusts sign-off to Monday, G13 flags the revision explicitly with dual-meeting proof side by side.",
    targetView: "report",
    actionLabel: "View Deadline Revision Card"
  },
  {
    step: 6,
    title: "6. Missing Ownership & Clarification Alerts",
    badge: "Integrity Gate",
    description: "If an action has no owner or deadline (e.g. 'Who will setup Datadog?'), G13 marks it 'Needs Clarification' and 'Not specified' rather than inventing fictional data.",
    targetView: "actions",
    actionLabel: "Inspect Clarification Flags"
  },
  {
    step: 7,
    title: "7. Follow-up Accountability & Action Tracker",
    badge: "Execution Loop",
    description: "Commitments sync automatically into an enterprise action tracker. Team members filter by owner or deadline and celebrate verified completions with celebratory confetti.",
    targetView: "actions",
    actionLabel: "Open Action Tracker"
  }
];

export const DemoTourModal = ({ isOpen, onClose, onNavigate }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const current = DEMO_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === DEMO_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleGoToView = () => {
    onNavigate(current.targetView);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      title="Guided Product Tour for Hackathon Judges"
      subtitle="7 Core Pillars of G13 Meeting-to-Action Intelligence"
    >
      <div className="space-y-6">
        {/* Step Header */}
        <div className="flex items-center justify-between">
          <Badge variant="ai" dot size="sm">
            {current.badge}
          </Badge>
          <span className="text-xs font-mono text-slate-400">
            Pillar {current.step} of {DEMO_STEPS.length}
          </span>
        </div>

        {/* Pillar Content */}
        <div className="p-6 rounded-2xl bg-surface-elevated/70 border border-ai/30 space-y-3">
          <h3 className="text-lg font-bold text-white font-display">
            {current.title}
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed font-light">
            {current.description}
          </p>

          <div className="pt-2">
            <button
              onClick={handleGoToView}
              className="text-xs font-semibold text-ai hover:underline flex items-center gap-1.5"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-ai h-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / DEMO_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={isFirst}
            onClick={handlePrev}
            icon={ArrowLeft}
          >
            Previous Pillar
          </Button>

          <Button
            variant={isLast ? "ai" : "primary"}
            size="sm"
            onClick={handleNext}
            icon={ArrowRight}
          >
            {isLast ? "Finish Tour" : "Next Pillar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DemoTourModal;
