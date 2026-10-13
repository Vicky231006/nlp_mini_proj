// src/mockApi.js
import { GoogleGenAI } from '@google/genai';

export const mockApiService = {
  // --- OFFLINE INGESTION ---
  ingestContent: async (file, type) => {
    console.log(`Starting ingest for ${type}: ${file.name}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'success',
          jobId: `job_${Date.now()}`,
          message: `${type} processing started. (Diagram: NCERT Ingestion lane)`
        });
      }, 1500);
    });
  },

  // --- LEARNER ONBOARDING ---
  startCpmAssessment: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'ready',
          assessmentId: `cpm_${Date.now()}`,
          totalQuestions: 25
        });
      }, 800);
    });
  },

  submitCpmAnswers: async (cpmResult) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'completed',
          cognitiveProfile: {
            reasoningSkill: { pattern: 4.2, analogicalMapping: 3.8 },
            state: { conceptMastery: {} }
          }
        });
      }, 2000);
    });
  },

  // --- REAL AI ONLINE TUTORING PIPELINE (GEMINI SDK) ---
  sendStudentQuery: async (query, learnerState) => {
    console.log("Sending query to Gemini via SDK...", query);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      // Explicitly allow browser execution and pass key
      const ai = new GoogleGenAI({ 
        apiKey: apiKey,
        dangerouslyAllowBrowser: true 
      });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an adaptive curriculum tutor. Explain concepts clearly and concisely, cite relevant NCERT textbook chapters/pages, and adapt your explanation to the learner's cognitive profile: ${JSON.stringify(learnerState || {})}\n\nStudent Query: ${typeof query === 'string' ? query : 'Explain the query.'}`,
      });

      const replyText = response.text || "No response received.";

      return {
        transcribedText: null,
        status: 'success',
        response: {
          text: replyText,
          hasAudio: false,
          citations: ["NCERT Curriculum Grounding (Gemini AI)"]
        },
        safeResponse: true
      };

    } catch (err) {
      console.warn("Gemini connection error:", err);
      
      return {
        transcribedText: null,
        status: 'success',
        response: {
          text: `[System Note]: Connection error: ${err.message || err}`,
          hasAudio: false,
          citations: ["NCERT Core Reference Manual"]
        },
        safeResponse: true
      };
    }
  },

  // --- ANALYTICS ---
  getLearningAnalytics: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          performanceTracking: [],
          conceptMastery: {},
          learnerStateUpdate: {}
        });
      }, 1000);
    });
  }
};