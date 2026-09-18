import React, { createContext, useContext, useState, useEffect } from 'react';
import { meetingService } from '../services/meetingService';
import { INITIAL_ACTIONS, INITIAL_MEETINGS } from '../data/demoMeetings';
import { LIVE_DEMO_TRANSCRIPT } from '../data/demoTranscripts';
import { socketService } from '../services/socketService';
import { intelligenceService } from '../services/intelligenceService';
import confetti from 'canvas-confetti';

const MeetingContext = createContext(null);

const STORAGE_MEETINGS_KEY = 'g13_user_meetings';
const STORAGE_ACTIONS_KEY = 'g13_user_actions';

export const MeetingProvider = ({ children }) => {
  // Initialize from persistent user storage, or clean empty state by default
  const [meetings, setMeetings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MEETINGS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeMeeting, setActiveMeeting] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MEETINGS_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.length > 0 ? parsed[0] : null;
    } catch (e) {
      return null;
    }
  });

  const [actions, setActions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [transcriptTurns, setTranscriptTurns] = useState([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [socketStatus, setSocketStatus] = useState('Ready');
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveCommitments, setLiveCommitments] = useState([]);

  // Evidence Modal state
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  // RAG / Contradiction Drawer state
  const [ragDrawerOpen, setRagDrawerOpen] = useState(false);
  const [selectedContradiction, setSelectedContradiction] = useState(null);

  useEffect(() => {
    // Listen to socket status changes
    const unsubStatus = socketService.on('status_change', (status) => {
      setSocketStatus(status);
    });

    const unsubSpeaker = socketService.on('speaker_active', (data) => {
      setActiveSpeakerId(data.speakerId);
    });

    return () => {
      unsubStatus();
      unsubSpeaker();
    };
  }, []);

  const openEvidence = (evidenceData) => {
    setSelectedEvidence(evidenceData);
    setEvidenceModalOpen(true);
  };

  const closeEvidence = () => {
    setEvidenceModalOpen(false);
    setSelectedEvidence(null);
  };

  const openContradiction = (contradictionData) => {
    setSelectedContradiction(contradictionData);
    setRagDrawerOpen(true);
  };

  const closeContradiction = () => {
    setRagDrawerOpen(false);
    setSelectedContradiction(null);
  };

  const createMeeting = async (data) => {
    const newMeet = await meetingService.createMeeting(data);
    setMeetings((prev) => [newMeet, ...prev]);
    setActiveMeeting(newMeet);
    socketService.connect(newMeet.code);
    return newMeet;
  };

  const joinMeetingByCode = async (code) => {
    const found = await meetingService.getMeetingByCode(code);
    if (found) {
      setActiveMeeting(found);
      socketService.connect(found.code);
      return { success: true, meeting: found };
    }
    return { success: false, error: 'Meeting code not found or session has expired.' };
  };

  const updateActionStatus = (actionId, newStatus) => {
    setActions((prev) =>
      prev.map((act) => {
        if (act.id === actionId) {
          if (newStatus === 'Completed') {
            // Trigger celebratory confetti on commitment fulfillment!
            try {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 },
                colors: ['#10B981', '#5B6CFF', '#4FD1FF']
              });
            } catch (e) {
              // ignore
            }
          }
          return { ...act, status: newStatus };
        }
        return act;
      })
    );
  };

  const registerCompletedMeeting = (newMeeting) => {
    if (!newMeeting) return;

    setMeetings((prev) => {
      const exists = prev.some(m => m.id === newMeeting.id || m.code === newMeeting.code);
      if (exists) {
        return prev.map(m => (m.id === newMeeting.id || m.code === newMeeting.code) ? newMeeting : m);
      }
      return [newMeeting, ...prev];
    });

    setActiveMeeting(newMeeting);

    if (newMeeting.transcript && Array.isArray(newMeeting.transcript)) {
      setTranscriptTurns(newMeeting.transcript);
    }

    // Auto-sync extracted actions to Action Tracker
    if (newMeeting.report?.actionItems && Array.isArray(newMeeting.report.actionItems)) {
      const formattedActions = newMeeting.report.actionItems.map((item, idx) => ({
        id: item.id || `act-upload-${Date.now()}-${idx}`,
        task: item.task,
        owner: item.owner || 'Needs Clarification',
        deadline: item.deadline || 'Not specified',
        status: item.status || 'Committed',
        confidence: item.confidence || 'High',
        speaker: item.speaker || 'Identified Speaker',
        timestamp: item.timestamp || '00:00',
        evidence: item.evidence || {
          quote: item.evidence?.quote || item.task,
          speaker: item.evidence?.speaker || item.speaker,
          timestamp: item.evidence?.timestamp || item.timestamp
        },
        meetingTitle: newMeeting.title || 'Uploaded Meeting',
        meetingDate: newMeeting.date || 'Today'
      }));

      setActions((prev) => {
        const existingTasks = new Set(prev.map(a => a.task.toLowerCase().trim()));
        const uniqueNew = formattedActions.filter(a => !existingTasks.has(a.task.toLowerCase().trim()));
        return [...uniqueNew, ...prev];
      });
    }
  };

  // Auto-sync meetings & actions to persistent storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MEETINGS_KEY, JSON.stringify(meetings));
    } catch (e) {}
  }, [meetings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIONS_KEY, JSON.stringify(actions));
    } catch (e) {}
  }, [actions]);

  const loadDemoMeeting = () => {
    const demoMeet = { ...INITIAL_MEETINGS[0], isDemo: true };
    setMeetings([demoMeet]);
    setActiveMeeting(demoMeet);
    setActions(INITIAL_ACTIONS.map(a => ({ ...a, isDemo: true })));
  };

  const clearAllMeetings = () => {
    setMeetings([]);
    setActiveMeeting(null);
    setActions([]);
    setTranscriptTurns([]);
    try {
      localStorage.removeItem(STORAGE_MEETINGS_KEY);
      localStorage.removeItem(STORAGE_ACTIONS_KEY);
    } catch (e) {}
  };

  const startLiveSimulation = (onCommitment) => {
    setIsLiveActive(true);
    setTranscriptTurns([]);
    setLiveCommitments([]);

    socketService.startDemoSimulation(
      (turn) => {
        setTranscriptTurns((prev) => [...prev, turn]);
      },
      (commitment, turn) => {
        setLiveCommitments((prev) => [
          {
            ...commitment,
            id: `comm-live-${Date.now()}`,
            turnId: turn.id,
            timestamp: turn.timestamp,
            evidence: {
              quote: turn.text,
              speaker: turn.speakerName,
              timestamp: turn.timestamp
            }
          },
          ...prev
        ]);
        if (onCommitment) onCommitment(commitment, turn);
      },
      () => {
        setIsLiveActive(false);
        setActiveSpeakerId(null);
      }
    );
  };

  const stopLiveSimulation = () => {
    socketService.stopSimulation();
    setIsLiveActive(false);
    setActiveSpeakerId(null);
  };

  return (
    <MeetingContext.Provider
      value={{
        meetings,
        activeMeeting,
        setActiveMeeting,
        actions,
        setActions,
        transcriptTurns,
        setTranscriptTurns,
        activeSpeakerId,
        socketStatus,
        isLiveActive,
        liveCommitments,
        evidenceModalOpen,
        selectedEvidence,
        openEvidence,
        closeEvidence,
        ragDrawerOpen,
        selectedContradiction,
        openContradiction,
        closeContradiction,
        createMeeting,
        joinMeetingByCode,
        registerCompletedMeeting,
        updateActionStatus,
        loadDemoMeeting,
        clearAllMeetings,
        startLiveSimulation,
        stopLiveSimulation
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (!context) throw new Error('useMeeting must be used within MeetingProvider');
  return context;
};
