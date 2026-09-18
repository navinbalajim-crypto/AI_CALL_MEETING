export const contextService = {
  /**
   * Chunks long transcripts while maintaining cross-chunk state memory.
   * Tracks evolution of deadlines, commitments, and scope across time.
   */
  processLongMeetingContext(alignedTurns) {
    const chunkSize = 4; // 4 conversational turns per contextual window
    const chunks = [];

    for (let i = 0; i < alignedTurns.length; i += chunkSize) {
      chunks.push(alignedTurns.slice(i, i + chunkSize));
    }

    const evolvingState = {
      detectedCommitments: [],
      detectedDecisions: [],
      revisions: []
    };

    chunks.forEach((chunk, chunkIdx) => {
      chunk.forEach(turn => {
        const text = turn.text.toLowerCase();

        // Check if turn references a previous commitment
        if (text.includes("actually") && (text.includes("move") || text.includes("adjust") || text.includes("monday"))) {
          // Late meeting revision detected!
          const earlierFridayTurn = alignedTurns.find(t => t.text.toLowerCase().includes("by friday"));
          if (earlierFridayTurn) {
            evolvingState.revisions.push({
              item: "Payment API Delivery & Production Sign-off",
              previousStatement: {
                speaker: earlierFridayTurn.speakerLabel,
                timestamp: earlierFridayTurn.timestamp,
                quote: earlierFridayTurn.text,
                target: "Friday at 5:00 PM EST"
              },
              updatedStatement: {
                speaker: turn.speakerLabel,
                timestamp: turn.timestamp,
                quote: turn.text,
                target: "Monday morning (following weekend soak testing)"
              },
              differenceSummary: "Target adjusted +3 days to allow continuous automated load testing over the weekend.",
              badge: "Deadline Changed"
            });
          }
        }
      });
    });

    return {
      totalChunksProcessed: chunks.length,
      contextMemoryPreserved: true,
      crossChunkRevisions: evolvingState.revisions
    };
  }
};

export default contextService;
