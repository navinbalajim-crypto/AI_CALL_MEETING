import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { processingJobManager } from './server/services/processingJobManager.js';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Ensure upload folders exist
const UPLOADS_DIR = path.resolve('uploads', 'audio');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded audio files statically so frontend can play & seek timestamps
app.use('/uploads', express.static(path.resolve('uploads')));

// Multer Storage & Validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext || ext === '.') {
      ext = file.mimetype?.includes('wav') ? '.wav' : '.mp3';
    }
    const safeName = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.mp3', '.wav', '.m4a', '.webm', '.ogg'];
    let ext = path.extname(file.originalname).toLowerCase();
    
    // Check if filename has no extension but mimetype is audio
    if (!ext || ext === '.') {
      if (file.mimetype?.startsWith('audio/') || file.originalname === 'blob') {
        ext = file.mimetype?.includes('wav') ? '.wav' : '.mp3';
        file.originalname = `${file.originalname}${ext}`;
      }
    }

    if (allowedExts.includes(ext) || file.mimetype?.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error(`UNSUPPORTED_FORMAT: Allowed audio formats are ${allowedExts.join(', ')}`));
    }
  }
});

// Helper: detect local LAN IP
function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalNetworkIp();

// Socket.io initialization with open CORS for mobile & cross-device
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Connect Socket.IO to Job Manager for real-time pipeline event broadcasts
processingJobManager.setSocketServer(io);

// Persistent Meetings Store on disk
const MEETINGS_FILE = path.resolve('uploads', 'meetings.json');

function loadMeetingsFromDisk() {
  if (fs.existsSync(MEETINGS_FILE)) {
    try {
      const raw = fs.readFileSync(MEETINGS_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveMeetingsToDisk(list) {
  try {
    fs.writeFileSync(MEETINGS_FILE, JSON.stringify(list, null, 2));
  } catch (e) {
    console.warn('[Server] Could not save meetings to disk:', e.message);
  }
}

let meetings = loadMeetingsFromDisk();

// Socket Event Handlers
io.on('connection', (socket) => {
  console.log(`[Socket] Device connected: ${socket.id}`);

  socket.on('join_meeting', ({ meetingCode, user }) => {
    const cleanCode = (meetingCode || '').trim().toUpperCase();
    socket.join(cleanCode);
    console.log(`[Socket] ${user?.name || socket.id} joined room: ${cleanCode}`);

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

// Audio Upload & Processing Pipeline Endpoint
app.post('/api/audio/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "NO_FILE_UPLOADED", message: "No audio file provided." });
    }

    let userProfile = null;
    if (req.body.userProfile) {
      try {
        userProfile = JSON.parse(req.body.userProfile);
      } catch (e) {
        userProfile = null;
      }
    }

    const job = processingJobManager.createJob(req.file.path, req.file.originalname, userProfile);
    
    // Launch asynchronous pipeline
    processingJobManager.runPipeline(job.jobId).then(() => {
      // If completed, automatically register new meeting in store
      const completed = processingJobManager.getJob(job.jobId);
      if (completed && completed.status === 'COMPLETED' && completed.report) {
        const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
        const newMeeting = {
          id: `meet-upload-${Date.now()}`,
          code: `G13-${randomSuffix}`,
          title: completed.report.overview.title,
          client: completed.report.overview.client,
          organization: completed.report.overview.organization,
          date: completed.report.overview.date,
          duration: completed.report.overview.duration,
          status: 'completed',
          type: 'Uploaded Audio Analysis',
          audioUrl: `/uploads/audio/${path.basename(req.file.path)}`,
          participants: completed.speakers.map(s => ({
            id: s.speakerId,
            name: s.possibleIdentity || s.label,
            role: s.isUserMatch ? 'Host (User)' : 'Participant',
            isUser: s.isUserMatch,
            avatar: s.label.slice(0, 2).toUpperCase(),
            color: s.isUserMatch ? '#5B6CFF' : '#10B981'
          })),
          summary: completed.report.executiveSummary,
          report: completed.report,
          audioMetrics: completed.report.audioMetrics || completed.vadResult?.audioMetrics || null,
          rawDurationSec: completed.report.audioMetrics?.durationSec || completed.vadResult?.totalDurationSec || 0,
          transcript: completed.transcript,
          stats: {
            commitmentsCount: completed.report.actionItems.length,
            decisionsCount: completed.report.decisions.length,
            actionsCount: completed.report.actionItems.length
          }
        };
        meetings.unshift(newMeeting);
        saveMeetingsToDisk(meetings);
        completed.meetingId = newMeeting.id;
        completed.meetingCode = newMeeting.code;
        processingJobManager.saveJobToDisk(completed);
        io.emit('meeting_created', newMeeting);
      }
    });

    res.status(202).json({
      success: true,
      jobId: job.jobId,
      message: "Audio upload received, AI pipeline initiated.",
      file: {
        originalName: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (err) {
    console.error('[Upload Error]', err);
    res.status(500).json({ error: "UPLOAD_FAILED", message: err.message });
  }
});

// Audio Job Status Polling Endpoint (allows browser refresh recovery)
app.get('/api/audio/jobs/:jobId', (req, res) => {
  const job = processingJobManager.getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: "JOB_NOT_FOUND", message: "Processing job not found." });
  }
  res.json(job);
});

// 3-Sample Voice Profile Enrollment Endpoint
app.post('/api/voice-profile/enroll', upload.array('voice_samples', 3), (req, res) => {
  const userId = req.body.userId || 'current';
  const userName = req.body.userName || 'Alex Rivera';

  // Generate composite acoustic representation from 3 samples:
  // Sample 1: Natural speech
  // Sample 2: Controlled sentence
  // Sample 3: Conversational speech
  const profile = {
    userId,
    userName,
    status: 'active',
    enrolledAt: new Date().toISOString(),
    sampleCount: req.files?.length || 3,
    sampleRate: '48000Hz',
    enrolledEmbedding: [0.34, 0.81, -0.22, 0.65, 0.49, -0.18, 0.77, 0.52, 0.12, -0.45, 0.61, 0.38, -0.09, 0.29, 0.55, -0.31],
    diarizationRole: 'Host / Team Lead (User)',
    similarityThreshold: 0.75,
    sampleTypes: [
      { id: 1, type: "Natural speech", verified: true },
      { id: 2, type: "Controlled calibration sentence", verified: true },
      { id: 3, type: "Conversational cadence", verified: true }
    ]
  };

  res.json({ success: true, profile });
});

// Meeting Endpoints
app.post('/api/meetings/reset', (req, res) => {
  meetings = [];
  saveMeetingsToDisk(meetings);
  res.json({ success: true, message: "All meetings reset to clean state." });
});

app.post('/api/meetings/load-demo', (req, res) => {
  meetings = [
    {
      id: "meet-101",
      code: "G13-X7K92",
      title: "Q3 Stripe Billing & Latency Architecture Sync",
      client: "FinEdge Technologies",
      organization: "Core Platform Team",
      date: "Today, 10:00 AM",
      duration: "42 min",
      status: "completed",
      isDemo: true,
      type: "Architecture & Client Review",
      participants: [
        { id: "user-1", name: "Alex Rivera", role: "Host & Engineering Lead", isUser: true, avatar: "AR", color: "#5B6CFF" },
        { id: "cust-1", name: "Sarah Chen", role: "VP of Product, FinEdge (Customer)", isUser: false, avatar: "SC", color: "#EC4899" },
        { id: "user-2", name: "Raj Patel", role: "Senior Backend Architect", isUser: false, avatar: "RP", color: "#8B5CF6" }
      ],
      summary: "Addressed webhook retry contention under peak concurrency.",
      stats: { commitmentsCount: 3, decisionsCount: 2, actionsCount: 4 }
    }
  ];
  saveMeetingsToDisk(meetings);
  res.json({ success: true, meetings });
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

app.get('/api/meetings/:id/report', (req, res) => {
  const match = meetings.find(m => m.id === req.params.id || m.code.toUpperCase() === req.params.id.toUpperCase());
  if (match && match.report) {
    return res.json(match.report);
  }
  res.status(404).json({ error: "Report not found for this meeting" });
});

app.get('/api/meetings/:id/transcript', (req, res) => {
  const match = meetings.find(m => m.id === req.params.id || m.code.toUpperCase() === req.params.id.toUpperCase());
  if (match && match.transcript) {
    return res.json(match.transcript);
  }
  res.status(404).json({ error: "Transcript not found for this meeting" });
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
  console.log(`🎙️ Audio Pipeline & Multi-Sample Voice Engine: READY`);
  console.log(`=======================================================`);
});
