import React, { createContext, useContext, useState, useEffect } from 'react';
import { meetingService } from '../services/meetingService';
import { INITIAL_ACTIONS, INITIAL_MEETINGS } from '../data/demoMeetings';
import { LIVE_DEMO_TRANSCRIPT } from '../data/demoTranscripts';
import { socketService } from '../services/socketService';
import { intelligenceService } from '../services/intelligenceService';
import confetti from 'canvas-confetti';

const MeetingContext = createContext(null);

export const MeetingProvider = ({ children }) => {
  const [meetings, setMeetings] = useState(INITIAL_MEETINGS);
  const [activeMeeting, setActiveMeeting] = useState(INITIAL_MEETINGS[0]);
  const [actions, setActions] = useState(INITIAL_ACTIONS);
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
        updateActionStatus,
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
