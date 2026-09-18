import { INITIAL_MEETINGS } from '../data/demoMeetings';
import { api } from './api';

const MEETINGS_STORAGE_KEY = 'g13_meetings_store';

function getStoredMeetings() {
  const raw = localStorage.getItem(MEETINGS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(INITIAL_MEETINGS));
    return INITIAL_MEETINGS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_MEETINGS;
  }
}

export const meetingService = {
  getAllMeetings() {
    return getStoredMeetings();
  },

  getMeetingById(id) {
    const list = getStoredMeetings();
    return list.find(m => m.id === id || m.code === id) || null;
  },

  getMeetingByCode(code) {
    const formatted = code.trim().toUpperCase();
    const list = getStoredMeetings();
    return list.find(m => m.code.toUpperCase() === formatted) || null;
  },

  createMeeting(data) {
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = `G13-${randomSuffix}`;
    const newMeeting = {
      id: `meet-${Date.now()}`,
      code: code,
      title: data.title || 'Untitled AI Sync',
      client: data.client || 'Internal Team',
      organization: data.organization || 'General Engineering',
      date: 'Just now',
      duration: '0 min',
      status: 'active',
      type: data.type || 'Strategy & Architecture',
      description: data.description || '',
      participants: [
        { id: "user-1", name: "Alex Rivera", role: "Host & Engineering Lead", isUser: true, avatar: "AR", color: "#5B6CFF" },
        ...(data.participantsList || [
          { id: "cust-1", name: data.client ? `${data.client} Lead` : "Sarah Chen", role: "Client Representative", isUser: false, avatar: "CR", color: "#EC4899" },
          { id: "user-2", name: "Raj Patel", role: "Senior Backend Architect", isUser: false, avatar: "RP", color: "#8B5CF6" }
        ])
      ],
      summary: "Live meeting in progress. AI Agent actively listening and parsing speaker commitments.",
      stats: {
        commitmentsCount: 0,
        decisionsCount: 0,
        actionsCount: 0,
        contradictionsCount: 0,
        unresolvedCount: 0
      }
    };

    const current = getStoredMeetings();
    const updated = [newMeeting, ...current];
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(updated));
    return newMeeting;
  },

  updateMeeting(id, updates) {
    const list = getStoredMeetings();
    const index = list.findIndex(m => m.id === id || m.code === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(list));
      return list[index];
    }
    return null;
  }
};

export default meetingService;
