import { createChatService } from '../server/chatService.js';
import { createOpenAICompatibleProvider } from '../server/providers/openaiCompatible.js';
import { getServerConfig } from '../server/config.js';
import fs from 'node:fs';

const config = getServerConfig();
const provider = createOpenAICompatibleProvider(config.openAICompatible);
const chatService = createChatService({ provider });

// Profiles representing the 3 Cognitive Adaptation Tiers
const PROFILES = {
  foundational: {
    name: 'Foundational Tier (High Scaffolding)',
    cpmScore: '6/25 (24%)',
    description: 'Struggling with spatial & multi-rule reasoning; needs high concreteness, short sentences, and binary checks.',
    data: {
      overall: { correct: 6, total: 25, answered: 25 },
      dimensions: {
        pattern_completion: { correct: 2, total: 6 },
        spatial_transformation: { correct: 1, total: 6 },
        analogical_mapping: { correct: 1, total: 6 },
        multi_rule_reasoning: { correct: 2, total: 7 }
      }
    }
  },
  intermediate: {
    name: 'Intermediate Tier (Guided Exploration)',
    cpmScore: '14/25 (56%)',
    description: 'Average baseline; understands single/double rules; benefits from cause-and-effect analogies and reflection checks.',
    data: {
      overall: { correct: 14, total: 25, answered: 25 },
      dimensions: {
        pattern_completion: { correct: 4, total: 6 },
        spatial_transformation: { correct: 3, total: 6 },
        analogical_mapping: { correct: 3, total: 6 },
        multi_rule_reasoning: { correct: 4, total: 7 }
      }
    }
  },
  advanced: {
    name: 'Advanced Tier (Cognitive Challenge & Extension)',
    cpmScore: '24/25 (96%)',
    description: 'High fluid intelligence & pattern completion; ready for deeper causal mechanisms, rich vocabulary, and Socratic challenges.',
    data: {
      overall: { correct: 24, total: 25, answered: 25 },
      dimensions: {
        pattern_completion: { correct: 6, total: 6 },
        spatial_transformation: { correct: 6, total: 6 },
        analogical_mapping: { correct: 6, total: 6 },
        multi_rule_reasoning: { correct: 6, total: 7 }
      }
    }
  }
};

const QUESTIONS = [
  {
    id: 'Q1_SCIENCE',
    domain: 'Science / EVS (Astronomy & Earth Mechanics)',
    grade: 3,
    prompt: 'Why does the sun rise in the east and set in the west?'
  },
  {
    id: 'Q2_LITERATURE',
    domain: 'English Reading Comprehension (NCERT Mridang Ch. 2)',
    grade: 2,
    prompt: 'Why was Onshangla quiet in Chapter 2 of Mridang and what did her mother teach her?'
  },
  {
    id: 'Q3_MATHEMATICS',
    domain: 'Mathematics (Division & Equal Sharing)',
    grade: 3,
    prompt: 'If I have 12 chocolates and want to share them equally with 3 friends, how do I do it?'
  },
  {
    id: 'Q4_GRAMMAR',
    domain: 'Language & Grammar (Verbs & Action Words)',
    grade: 2,
    prompt: 'What is an action word (verb) and how do I spot one in a sentence?'
  }
];

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word || word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

function computeReadability(text) {
  // Clean markdown syntax for fair readability stats
  const clean = text
    .replace(/[*#_`~>\[\]\(\)]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = clean.split(/\s+/).filter(w => w.length > 0);
  const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 0);

  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);
  const totalSyllables = words.reduce((acc, w) => acc + countSyllables(w), 0);

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = totalSyllables / Math.max(1, wordCount);

  // Flesch-Kincaid Grade Level
  const fkGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  // Flesch Reading Ease (higher = easier)
  const fre = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;

  return {
    wordCount,
    sentenceCount,
    avgSentenceLength: Number(wordsPerSentence.toFixed(1)),
    syllablesPerWord: Number(syllablesPerWord.toFixed(2)),
    fleschKincaidGrade: Number(Math.max(1, fkGrade).toFixed(1)),
    fleschReadingEase: Number(Math.min(100, Math.max(0, fre)).toFixed(1))
  };
}

async function runMatrix() {
  console.log('======================================================================');
  console.log('  Running Comprehensive Onboarding Cognitive Adaptation Matrix Test   ');
  console.log('======================================================================\n');

  const results = [];

  for (const q of QUESTIONS) {
    console.log(`\n======================================================================`);
    console.log(`Evaluating Question: [${q.id}] ${q.domain}`);
    console.log(`Query: "${q.prompt}" (Grade: ${q.grade})\n`);

    const qResult = {
      id: q.id,
      domain: q.domain,
      grade: q.grade,
      prompt: q.prompt,
      tiers: {}
    };

    for (const [tierKey, profileObj] of Object.entries(PROFILES)) {
      console.log(`  -> Running Tier: ${profileObj.name} (${profileObj.cpmScore})...`);

      let replyText = '';
      let citations = [];

      try {
        const response = await chatService.reply(
          [{ role: 'user', content: q.prompt }],
          profileObj.data,
          { classStandard: q.grade }
        );
        replyText = response.text;
        citations = response.citations || [];
      } catch (err) {
        console.error(`     Error on ${tierKey}:`, err.message);
        replyText = `Error generating response: ${err.message}`;
      }

      const metrics = computeReadability(replyText);

      // Extract closing check-in question
      const lines = replyText.split('\n').filter(l => l.trim().length > 0);
      const lastLine = lines.slice(-2).join(' ').trim();

      qResult.tiers[tierKey] = {
        tierName: profileObj.name,
        cpmScore: profileObj.cpmScore,
        text: replyText,
        citations,
        metrics,
        closingPrompt: lastLine
      };

      console.log(`     Words: ${metrics.wordCount} | Sentences: ${metrics.sentenceCount} | Avg Words/Sent: ${metrics.avgSentenceLength} | FK Grade: ${metrics.fleschKincaidGrade} | FRE: ${metrics.fleschReadingEase}`);

      // Pacing for API rate limit
      await new Promise(r => setTimeout(r, 4000));
    }

    results.push(qResult);
  }

  const outputPath = 'tmp/adaptation_matrix_results.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n======================================================================`);
  console.log(`Matrix evaluation complete! Full dataset saved to: ${outputPath}`);
  console.log(`======================================================================\n`);
}

runMatrix().catch(console.error);

