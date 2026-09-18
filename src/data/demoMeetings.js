export const INITIAL_MEETINGS = [
  {
    id: "meet-101",
    code: "G13-X7K92",
    title: "Q3 Stripe Billing & Latency Architecture Sync",
    client: "FinEdge Technologies",
    organization: "Core Platform Team",
    date: "Today, 10:00 AM",
    duration: "42 min",
    status: "completed",
    type: "Architecture & Client Review",
    participants: [
      { id: "user-1", name: "Alex Rivera", role: "Host & Engineering Lead", isUser: true, avatar: "AR", color: "#5B6CFF" },
      { id: "cust-1", name: "Sarah Chen", role: "VP of Product, FinEdge (Customer)", isUser: false, avatar: "SC", color: "#EC4899" },
      { id: "user-2", name: "Raj Patel", role: "Senior Backend Architect", isUser: false, avatar: "RP", color: "#8B5CF6" },
      { id: "cust-2", name: "Marcus Vance", role: "Customer CTO", isUser: false, avatar: "MV", color: "#F59E0B" },
      { id: "user-3", name: "Elena Rostova", role: "Security & Compliance Lead", isUser: false, avatar: "ER", color: "#10B981" }
    ],
    summary: "Addressed webhook retry contention under peak concurrency. Reached consensus to migrate to PostgreSQL 16 read replicas and Redis distributed locks. Raj committed to delivery by Friday with production sign-off on Monday. Elena finalized SOC2 audit deliverables for the client.",
    stats: {
      commitmentsCount: 3,
      decisionsCount: 2,
      actionsCount: 4,
      contradictionsCount: 1,
      unresolvedCount: 1
    }
  },
  {
    id: "meet-102",
    code: "G13-B4M81",
    title: "Stripe Webhook Architecture Kickoff",
    client: "FinEdge Technologies",
    organization: "Core Platform Team",
    date: "Sept 12, 2026",
    duration: "35 min",
    status: "archived",
    type: "Discovery & Planning",
    participants: [
      { id: "user-1", name: "Alex Rivera", role: "Host & Engineering Lead", isUser: true, avatar: "AR", color: "#5B6CFF" },
      { id: "cust-1", name: "Sarah Chen", role: "VP of Product, FinEdge", isUser: false, avatar: "SC", color: "#EC4899" },
      { id: "user-2", name: "Raj Patel", role: "Senior Backend Architect", isUser: false, avatar: "RP", color: "#8B5CF6" }
    ],
    summary: "Initial scoping of Stripe billing integration. Raj Patel committed to production deployment on Friday, Sept 19. Client specified requirement for sub-200ms webhook processing.",
    stats: {
      commitmentsCount: 2,
      decisionsCount: 1,
      actionsCount: 2,
      contradictionsCount: 0,
      unresolvedCount: 0
    }
  },
  {
    id: "meet-103",
    code: "G13-R9L34",
    title: "Multi-Region Disaster Recovery & SLA Review",
    client: "Acme Global Corp",
    organization: "Infrastructure SRE",
    date: "Sept 08, 2026",
    duration: "50 min",
    status: "archived",
    type: "Executive Technical Sync",
    participants: [
      { id: "user-1", name: "Alex Rivera", role: "Host & Engineering Lead", isUser: true, avatar: "AR", color: "#5B6CFF" },
      { id: "cust-3", name: "David Kim", role: "VP of Infrastructure, Acme", isUser: false, avatar: "DK", color: "#06B6D4" },
      { id: "user-3", name: "Elena Rostova", role: "Security & Compliance Lead", isUser: false, avatar: "ER", color: "#10B981" }
    ],
    summary: "Reviewed AWS Aurora multi-region global database failover SLA. Decided on automated Route53 health check DNS failover. Elena committed to delivering DR drill protocol by Sept 25.",
    stats: {
      commitmentsCount: 2,
      decisionsCount: 3,
      actionsCount: 3,
      contradictionsCount: 0,
      unresolvedCount: 0
    }
  }
];

export const INITIAL_ACTIONS = [
  {
    id: "act-1",
    meetingId: "meet-101",
    meetingTitle: "Q3 Stripe Billing & Latency Architecture Sync",
    task: "Complete Payment API Refactor & Idempotency Fixes",
    owner: "Raj Patel",
    ownerRole: "Senior Backend Architect",
    deadline: "Friday at 5:00 PM EST",
    status: "In Progress",
    confidence: "High",
    category: "Engineering",
    evidence: {
      quote: "Yes, I will complete the payment API refactor and push the idempotency fixes to staging by Friday at 5 PM EST.",
      speaker: "Raj Patel",
      timestamp: "02:28",
      turnId: "turn-5"
    }
  },
  {
    id: "act-2",
    meetingId: "meet-101",
    meetingTitle: "Q3 Stripe Billing & Latency Architecture Sync",
    task: "Finalize & Send SOC2 Type II Audit Package to Sarah",
    owner: "Elena Rostova",
    ownerRole: "Security & Compliance Lead",
    deadline: "Tomorrow afternoon",
    status: "Pending",
    confidence: "High",
    category: "Compliance",
    evidence: {
      quote: "I have the audit logs parsed. I'll finalize and email the signed SOC2 Type II audit package directly to Sarah by tomorrow afternoon.",
      speaker: "Elena Rostova",
      timestamp: "03:45",
      turnId: "turn-7"
    }
  },
  {
    id: "act-3",
    meetingId: "meet-101",
    meetingTitle: "Q3 Stripe Billing & Latency Architecture Sync",
    task: "Production Deployment & Client Pilot Sign-off",
    owner: "Raj Patel",
    ownerRole: "Senior Backend Architect",
    deadline: "Monday morning, Sept 22",
    status: "Pending",
    confidence: "High",
    category: "Engineering",
    isContradiction: true,
    contradictionNote: "Deadline moved from Friday (Sept 12 sync) to Monday for weekend soak testing.",
    evidence: {
      quote: "Staging deployment on Friday, production sign-off moved to Monday morning.",
      speaker: "Raj Patel",
      timestamp: "05:52",
      turnId: "turn-10"
    }
  },
  {
    id: "act-4",
    meetingId: "meet-101",
    meetingTitle: "Q3 Stripe Billing & Latency Architecture Sync",
    task: "Setup Datadog APM Latency & p99 Dashboard",
    owner: "Needs Clarification",
    ownerRole: "Unassigned",
    deadline: "Not specified",
    status: "Needs Clarification",
    confidence: "Low",
    category: "Observability",
    isUnresolved: true,
    evidence: {
      quote: "Who is responsible for setting up the Datadog APM dashboard for latency monitoring?",
      speaker: "Alex Rivera",
      timestamp: "06:30",
      turnId: "turn-11"
    }
  },
  {
    id: "act-5",
    meetingId: "meet-103",
    meetingTitle: "Multi-Region Disaster Recovery & SLA Review",
    task: "Deliver Verified DR Drill Runbook & Failover Protocols",
    owner: "Elena Rostova",
    ownerRole: "Security & Compliance Lead",
    deadline: "Sept 25, 2026",
    status: "In Progress",
    confidence: "High",
    category: "Infrastructure",
    evidence: {
      quote: "I commit to delivering the verified DR runbook to David by Friday noon.",
      speaker: "Elena Rostova",
      timestamp: "18:40",
      turnId: "turn-x"
    }
  }
];
