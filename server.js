import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Helper: detect local LAN IP
function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalNetworkIp();

// In-Memory Meetings Store initialized with demo meetings
let meetings = [
  {
    id: "meet-101",
    code: "G13-X7K92",
    title: "Q3 Stripe Billing & Latency Architecture Sync",
    client: "FinEdge Technologies",
    organization: "Core Platform Team",
    date: "Today, 10:00 AM",
    duration: "42 min",
    status: "active",
    type: "Architecture & Client Review",
    participants: [
      { id: "user-1", name: "Alex Rivera", role: "Host & Engineering Lead", isUser: true, avatar: "AR", color: "#5B6CFF" },
      { id: "cust-1", name: "Sarah Chen", role: "VP of Product, FinEdge (Customer)", isUser: false, avatar: "SC", color: "#EC4899" },
      { id: "user-2", name: "Raj Patel", role: "Senior Backend Architect", isUser: false, avatar: "RP", color: "#8B5CF6" }
    ],
    summary: "Addressed webhook retry contention under peak concurrency.",
    stats: { commitmentsCount: 3, decisionsCount: 2, actionsCount: 4 }
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
      { id: "cust-1", name: "Sarah Chen", role: "VP of Product, FinEdge", isUser: false, avatar: "SC", color: "#EC4899" }
    ],
    summary: "Initial scoping of Stripe billing integration.",
    stats: { commitmentsCount: 2, decisionsCount: 1, actionsCount: 2 }
  }
];

// Socket.io initialization with open CORS for mobile & cross-device
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Realtime Rooms & Broadcasts
io.on('connection', (socket) => {
  console.log(`[Socket] Device connected: ${socket.id}`);

  socket.on('join_meeting', ({ meetingCode, user }) => {
    const cleanCode = (meetingCode || '').trim().toUpperCase();
    socket.join(cleanCode);
    console.log(`[Socket] ${user?.name || socket.id} joined room: ${cleanCode}`);

    // Notify room of new participant
    io.to(cleanCode).emit('participant_joined', {
      user: user || { id: socket.id, name: 'Guest Attendee', role: 'Participant', avatar: 'GT' }
    });
  });

  socket.on('transcript_turn', ({ meetingCode, turn }) => {
    const cleanCode = (meetingCode || '').trim().toUpperCase();
    io.to(cleanCode).emit('transcript_turn', turn);
  });

  socket.on('commitment_detected', ({ meetingCode, commitment, turn }) => {
    const cleanCode = (meetingCode || '').trim().toUpperCase();
    io.to(cleanCode).emit('commitment_detected', { commitment, turn });
  });

  socket.on('speaker_active', ({ meetingCode, speakerData }) => {
    const cleanCode = (meetingCode || '').trim().toUpperCase();
    io.to(cleanCode).emit('speaker_active', speakerData);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
  });
});

// REST Endpoints
app.get('/api/network-info', (req, res) => {
  res.json({
    localIp,
    port: 3000,
    serverPort: 5000,
    networkUrl: `http://${localIp}:3000`
  });
});

app.get('/api/meetings', (req, res) => {
  res.json(meetings);
});

app.get('/api/meetings/:code', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const match = meetings.find(m => m.code.toUpperCase() === code || m.id === req.params.code);
  if (match) {
    res.json(match);
  } else {
    res.status(404).json({ error: "Meeting code not found" });
  }
});

app.post('/api/meetings', (req, res) => {
  const data = req.body;
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const code = data.code || `G13-${randomSuffix}`;

  const newMeeting = {
    id: `meet-${Date.now()}`,
    code: code,
    title: data.title || 'Untitled AI Sync',
    client: data.client || 'Enterprise Client',
    organization: data.organization || 'Core Platform',
    date: 'Just now',
    duration: '0 min',
    status: 'active',
    type: data.type || 'Strategy & Architecture',
    description: data.description || '',
    participants: [
      { id: "user-1", name: "Alex Rivera", role: "Host & Engineering Lead", isUser: true, avatar: "AR", color: "#5B6CFF" },
      ...(data.participantsList || [
        { id: "cust-1", name: data.client ? `${data.client} Lead` : "Sarah Chen", role: "Client Representative", isUser: false, avatar: "CR", color: "#EC4899" }
      ])
    ],
    summary: "Live meeting in progress. AI Agent actively listening across all connected devices.",
    stats: { commitmentsCount: 0, decisionsCount: 0, actionsCount: 0 }
  };

  meetings.unshift(newMeeting);
  io.emit('meeting_created', newMeeting);
  console.log(`[Meeting Created] Code: ${code} - Title: ${newMeeting.title}`);
  res.status(201).json(newMeeting);
});

app.post('/api/meetings/:code/join', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const participant = req.body.participant || { name: 'Mobile Attendee', role: 'Participant' };
  const meeting = meetings.find(m => m.code.toUpperCase() === code);

  if (!meeting) {
    return res.status(404).json({ error: "Meeting not found" });
  }

  const newPart = {
    id: `p-${Date.now()}`,
    name: participant.name || 'Mobile Attendee',
    role: participant.role || 'Guest (Phone)',
    isUser: false,
    avatar: (participant.name || 'MB').substring(0, 2).toUpperCase(),
    color: '#10B981'
  };

  meeting.participants.push(newPart);
  io.to(code).emit('participant_joined', { user: newPart });
  res.json({ success: true, meeting, participant: newPart });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 G13 Backend Server running on http://localhost:${PORT}`);
  console.log(`📱 LAN Network Access: http://${localIp}:${PORT}`);
  console.log(`💻 Frontend Network Link for Mobile: http://${localIp}:3000`);
  console.log(`=======================================================`);
});
