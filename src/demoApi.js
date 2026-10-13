export const demoApiService = {
  async ingestContent(file, type) {
    return {
      status: 'demo',
      message: `Prototype only: ${file.name} was selected for the ${type} lane. The file was not uploaded or processed.`
    };
  },

  async startCpmAssessment() {
    return { status: 'demo', totalQuestions: 25 };
  },

  async submitCpmAnswers() {
    return {
      status: 'demo',
      cognitiveProfile: {
        reasoningSkill: { pattern: 4.2, analogicalMapping: 3.8 },
        state: { conceptMastery: {} }
      }
    };
  },

  async getLearningAnalytics() {
    return {
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
    };
  }
};
