import { INITIAL_MEETINGS } from '../data/demoMeetings';

export const ragService = {
  // Search organizational memory without exposing raw vector embeddings to users
  searchHistoricalContext(queryText, currentMeetingId = null) {
    const term = queryText.toLowerCase();
    const results = [];

    INITIAL_MEETINGS.forEach(meeting => {
      if (meeting.id === currentMeetingId) return;

      // Match against titles or summaries
      if (meeting.title.toLowerCase().includes('stripe') || term.includes('payment') || term.includes('api') || term.includes('deadline')) {
        if (meeting.id === 'meet-102') {
          results.push({
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            meetingDate: meeting.date,
            client: meeting.client,
            relevanceScore: 0.96,
            insightType: "CONTRADICTION_DETECTED",
            topic: "Payment API Delivery Timeline",
            historicalStatement: "Raj Patel: 'We will push the full release to production on Friday, Sept 19.'",
            currentStatement: "Raj Patel: 'Staging deployment on Friday, production sign-off moved to Monday morning.'",
            differenceSummary: "Deadline shifted +3 days (Friday → Monday) to allow weekend soak testing.",
            sourceQuote: "Raj Patel (08:52, Sept 12): 'Full release to production on Friday.'",
            badge: "Deadline Changed"
          });
        }
      }
    });

    return results;
  },

  getRelatedPastMeeting(meetingId) {
    return INITIAL_MEETINGS.find(m => m.id === meetingId) || null;
  }
};

export default ragService;
