export const mockApiService = {
  // These local responses keep the prototype navigable without a backend.
  ingestContent: async (file, type) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'demo',
          jobId: `job_${Date.now()}`,
          message: `Prototype only: ${file.name} was selected for the ${type} lane. The file was not uploaded or processed.`
        });
      }, 1500);
    });
  },

  startCpmAssessment: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'demo',
          assessmentId: `cpm_${Date.now()}`,
          totalQuestions: 25
        });
      }, 800);
    });
  },

  submitCpmAnswers: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'demo',
          cognitiveProfile: {
            reasoningSkill: { pattern: 4.2, analogicalMapping: 3.8 },
            state: { conceptMastery: {} }
          }
        });
      }, 2000);
    });
  },

  sendStudentQuery: async (query, learnerState) => {
    const response = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, learnerState })
    });

    if (!response.ok) {
      throw new Error(`Tutor API returned HTTP ${response.status}. Configure the server-side /api/tutor endpoint.`);
    }

    const payload = await response.json();
    if (
      typeof payload !== 'object'
      || payload === null
      || typeof payload.text !== 'string'
      || !payload.text.trim()
      || !Array.isArray(payload.citations)
      || payload.citations.some((citation) => typeof citation !== 'string')
    ) {
      throw new Error('Tutor API returned an invalid response. Expected text and a citations array.');
    }

    return {
      status: 'success',
      response: {
        text: payload.text,
        citations: payload.citations
      }
    };
  },

  getLearningAnalytics: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          stats: [
            { title: 'Total Interactions', value: 142, unit: 'sample' },
            { title: 'Concept Mastery Flow', value: 78, unit: '%' },
            { title: 'Average Skill Level', value: '+0.6', unit: '/5.0' }
          ],
          concepts: [
            { name: 'Cellular Respiration (Ch5)', status: 'Example gap (18%)' },
            { name: 'Newtonian Mechanics (Ch12)', status: 'Example gap (34%)' }
          ],
          recentUpdates: [
            "Example only: Trainer #1045 — concept 'Mitosis' marked as mastered.",
            'Example only: Trainer #1089 — spatial reasoning practice adjusted.'
          ]
        });
      }, 1000);
    });
  }
};