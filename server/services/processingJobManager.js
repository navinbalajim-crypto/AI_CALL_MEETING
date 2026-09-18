import fs from 'fs';
import path from 'path';
import vadService from './vadService.js';
import transcriptionService from './transcriptionService.js';
import diarizationService from './diarizationService.js';
import speakerEmbeddingService from './speakerEmbeddingService.js';
import acousticEmotionService from './acousticEmotionService.js';
import contextService from './contextService.js';
import meetingIntelligenceService from './meetingIntelligenceService.js';

const JOBS_DIR = path.resolve('uploads', 'jobs');
if (!fs.existsSync(JOBS_DIR)) {
  fs.mkdirSync(JOBS_DIR, { recursive: true });
}

export const STAGES = [
  { id: 1, key: 'VALIDATING', label: 'Audio Upload & Format Validation' },
  { id: 2, key: 'VAD', label: 'Voice Activity Detection (Speech vs Silence)' },
  { id: 3, key: 'WHISPER', label: 'Whisper Automatic Speech Recognition (Timestamped)' },
  { id: 4, key: 'DIARIZATION', label: 'Speaker Diarization & Audio Segmentation' },
  { id: 5, key: 'EMBEDDINGS', label: 'ECAPA-TDNN Speaker Embedding Extraction' },
  { id: 6, key: 'VOICE_MATCH', label: 'User Enrolled Voice Profile Comparison' },
  { id: 7, key: 'CONTEXT', label: 'Long-Context Chunking & Memory Preservation' },
  { id: 8, key: 'INTELLIGENCE', label: 'Meeting Intelligence (Decisions, Commitments, Actions)' },
  { id: 9, key: 'EVIDENCE', label: 'Evidence Grounding & Confidence Derivation' },
  { id: 10, key: 'REPORT', label: 'Final 16-Domain Report Compilation' },
];

class ProcessingJobManager {
  constructor() {
    this.jobs = new Map();
    this.io = null;
  }

  setSocketServer(ioInstance) {
    this.io = ioInstance;
  }

  createJob(filePath, originalName, userProfile = null) {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const job = {
      jobId,
      filePath,
      originalName,
      userProfile,
      status: 'PROCESSING', // PROCESSING, COMPLETED, FAILED
      currentStageIndex: 0,
      currentStageKey: 'VALIDATING',
      currentStageLabel: STAGES[0].label,
      completedStages: [],
      error: null,
      vadResult: null,
      transcript: null,
      speakers: null,
      report: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.jobs.set(jobId, job);
    this.saveJobToDisk(job);
    return job;
  }

  getJob(jobId) {
    if (this.jobs.has(jobId)) {
      return this.jobs.get(jobId);
    }
    // Attempt load from disk
    const diskPath = path.join(JOBS_DIR, `${jobId}.json`);
    if (fs.existsSync(diskPath)) {
      try {
        const raw = fs.readFileSync(diskPath, 'utf8');
        const parsed = JSON.parse(raw);
        this.jobs.set(jobId, parsed);
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  saveJobToDisk(job) {
    try {
      const diskPath = path.join(JOBS_DIR, `${job.jobId}.json`);
      fs.writeFileSync(diskPath, JSON.stringify(job, null, 2));
    } catch (e) {
      console.warn('[JobManager] Could not write job to disk:', e.message);
    }
  }

  updateStage(job, stageIndex, payload = {}) {
    const stage = STAGES[stageIndex];
    if (!stage) return;

    job.currentStageIndex = stageIndex;
    job.currentStageKey = stage.key;
    job.currentStageLabel = stage.label;
    if (stageIndex > 0 && !job.completedStages.includes(STAGES[stageIndex - 1].key)) {
      job.completedStages.push(STAGES[stageIndex - 1].key);
    }
    job.updatedAt = new Date().toISOString();

    Object.assign(job, payload);
    this.saveJobToDisk(job);

    if (this.io) {
      this.io.emit('job_stage_update', {
        jobId: job.jobId,
        stageIndex,
        stageKey: stage.key,
        stageLabel: stage.label,
        completedStages: job.completedStages,
        status: job.status,
        payload
      });
    }
  }

  /**
   * Orchestrates the complete 10-stage processing pipeline.
   */
  async runPipeline(jobId) {
    const job = this.getJob(jobId);
    if (!job) return;

    console.log(`[Pipeline] Starting execution for job ${jobId} (${job.originalName})...`);

    try {
      // Stage 1: Validation
      this.updateStage(job, 0);
      await this.sleep(400);

      // Stage 2: Voice Activity Detection (VAD)
      this.updateStage(job, 1);
      const vadResult = await vadService.analyzeVoiceActivity(job.filePath, job.originalName);

      if (!vadResult.hasSpeech) {
        // No speech detected: STOP pipeline and return genuine error!
        job.status = 'FAILED';
        job.error = {
          code: 'NO_SPEECH_DETECTED',
          title: 'NO SPEECH DETECTED',
          message: vadResult.message || 'No meaningful speech was detected in this audio.',
          totalDurationSec: vadResult.totalDurationSec,
          usableSpeechSec: 0
        };
        this.saveJobToDisk(job);
        if (this.io) this.io.emit('job_failed', { jobId, error: job.error });
        return;
      }

      job.vadResult = vadResult;
      await this.sleep(600);

      // Stage 3: Whisper Automatic Speech Recognition
      this.updateStage(job, 2, { vadResult });
      const transcription = await transcriptionService.transcribeAudio(job.filePath, { originalName: job.originalName });
      await this.sleep(700);

      // Stage 4: Speaker Diarization
      this.updateStage(job, 3, { transcriptionModel: transcription.modelUsed });
      const diarization = await diarizationService.diarizeSegments(transcription.segments, { originalName: job.originalName });
      await this.sleep(600);

      // Stage 5: ECAPA-TDNN Speaker Embeddings
      this.updateStage(job, 4);
      const speakersWithEmbeddings = diarization.speakers.map(spk => ({
        ...spk,
        embeddings: speakerEmbeddingService.generateEmbedding(spk.speakerId, spk)
      }));
      await this.sleep(500);

      // Stage 6: Voice Profile Matching
      this.updateStage(job, 5);
      const matchedSpeakers = speakerEmbeddingService.matchUserVoiceProfile(speakersWithEmbeddings, job.userProfile);
      await this.sleep(500);

      // Stage 7: Long-Context Chunking & Memory
      this.updateStage(job, 6, { matchedSpeakers });
      const contextResult = contextService.processLongMeetingContext(diarization.alignedTurns);
      await this.sleep(500);

      // Stage 8: Acoustic Emotion Analysis
      this.updateStage(job, 7);
      const emotionResult = acousticEmotionService.analyzeAcousticEmotion(matchedSpeakers, diarization.alignedTurns);
      await this.sleep(500);

      // Stage 9: Meeting Intelligence Extraction (Decisions, Actions, Commitments)
      this.updateStage(job, 8);
      const report = await meetingIntelligenceService.extractMeetingIntelligence({
        alignedTurns: diarization.alignedTurns,
        speakers: matchedSpeakers,
        vadResult,
        contextResult,
        emotionResult,
        metadata: { originalName: job.originalName }
      });
      await this.sleep(600);

      // Stage 10: Final Report Compilation
      job.completedStages = STAGES.map(s => s.key);
      job.status = 'COMPLETED';
      job.report = report;
      job.transcript = diarization.alignedTurns;
      job.speakers = matchedSpeakers;
      job.updatedAt = new Date().toISOString();

      this.saveJobToDisk(job);

      if (this.io) {
        this.io.emit('job_completed', {
          jobId: job.jobId,
          status: 'COMPLETED',
          report,
          meetingId: `meet-${Date.now()}`
        });
      }

      console.log(`[Pipeline] Completed successfully for job ${jobId}!`);
    } catch (err) {
      console.error(`[Pipeline] Fatal error on job ${jobId}:`, err);
      job.status = 'FAILED';
      job.error = {
        code: 'PROCESSING_ERROR',
        title: 'TRANSCRIPTION FAILED',
        message: err.message || 'The audio could not be transcribed.'
      };
      this.saveJobToDisk(job);
      if (this.io) this.io.emit('job_failed', { jobId, error: job.error });
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const processingJobManager = new ProcessingJobManager();
export default processingJobManager;
