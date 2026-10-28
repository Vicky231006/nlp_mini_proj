/**
 * multi_subject_grades_test.js
 * Comprehensive evaluation across all 4 grades (Class 1, 2, 3, 4),
 * multiple subjects (English, Mathematics, The World Around Us / EVS, Arts, Physical Education),
 * and various chapters.
 */

import { createChatService } from '../server/chatService.js';
import { createOpenAICompatibleProvider } from '../server/providers/openAICompatible.js';
import { getServerConfig } from '../server/config.js';
import { createRetriever } from '../server/retriever.js';
import fs from 'node:fs';
import path from 'node:path';

const config = getServerConfig();
const chatService = createChatService({
  provider: createOpenAICompatibleProvider(config.openAICompatible),
  retrieve: createRetriever(config.retrieval)
});

const testCases = [
  // --- GRADE 1 ---
  {
    grade: 1,
    subject: 'English',
    chapter: 'Chapter 1 (Two Little Hands)',
    query: 'teach me 1st chapter in inglis',
    expectedBook: 'Mridang',
    description: 'Grade 1 English Chapter 1 - Two Little Hands'
  },
  {
    grade: 1,
    subject: 'English',
    chapter: 'Chapter 2 (Greetings)',
    query: 'teach me greetings chapter 2 in english',
    expectedBook: 'Mridang',
    description: 'Grade 1 English Chapter 2 - Greetings'
  },
  {
    grade: 1,
    subject: 'Mathematics',
    chapter: 'Chapter 1 (Finding the Furry Cat)',
    query: 'help me with finding the furry cat in maths',
    expectedBook: 'Joyful-Mathematics',
    description: 'Grade 1 Math Chapter 1 - Finding the Furry Cat'
  },
  {
    grade: 1,
    subject: 'Mathematics',
    chapter: 'Chapter 2 (Shapes)',
    query: 'explain shapes in maths',
    expectedBook: 'Joyful-Mathematics',
    description: 'Grade 1 Math Chapter 2 - Shapes & Space'
  },

  // --- GRADE 2 ---
  {
    grade: 2,
    subject: 'English',
    chapter: 'Chapter 1 (My Bicycle)',
    query: 'teach me chapter 1 my bicycle in english',
    expectedBook: 'Mridang',
    description: 'Grade 2 English Chapter 1 - My Bicycle'
  },
  {
    grade: 2,
    subject: 'English',
    chapter: 'Chapter 2 (Seeing without Seeing)',
    query: 'teach me 2nd chapter inglis',
    expectedBook: 'Mridang',
    description: 'Grade 2 English Chapter 2 - Seeing without Seeing'
  },
  {
    grade: 2,
    subject: 'Mathematics',
    chapter: 'Chapter 1 (Day at the Beach)',
    query: 'explain a day at the beach in maths',
    expectedBook: 'Joyful-Mathematics',
    description: 'Grade 2 Math Chapter 1 - A Day at the Beach'
  },
  {
    grade: 2,
    subject: 'Mathematics',
    chapter: 'Chapter 4 (Counting Diyas)',
    query: 'teach me counting diyas in maths',
    expectedBook: 'Joyful-Mathematics',
    description: 'Grade 2 Math Chapter 4 - Counting Diyas'
  },

  // --- GRADE 3 ---
  {
    grade: 3,
    subject: 'English',
    chapter: 'Chapter 1 (Colours)',
    query: 'teach me first chapter in english',
    expectedBook: 'Santoor',
    description: 'Grade 3 English Chapter 1 - Colours'
  },
  {
    grade: 3,
    subject: 'English',
    chapter: 'Chapter 2 (Badal and Moti)',
    query: 'teach me chapter 2 badal and moti in english',
    expectedBook: 'Santoor',
    description: 'Grade 3 English Chapter 2 - Badal and Moti'
  },
  {
    grade: 3,
    subject: 'Mathematics',
    chapter: 'Chapter 2 (Toy Joy)',
    query: 'help me with toy joy in maths',
    expectedBook: 'Maths_Mela',
    description: 'Grade 3 Math Chapter 2 - Toy Joy'
  },
  {
    grade: 3,
    subject: 'Mathematics',
    chapter: 'Chapter 5 (Shapes & Patterns)',
    query: 'help me with shapes and patterns in math',
    expectedBook: 'Maths_Mela',
    description: 'Grade 3 Math Chapter 5 - Fun with Shapes'
  },
  {
    grade: 3,
    subject: 'The World Around Us (EVS)',
    chapter: 'Chapter 1 (Family and Friends)',
    query: 'tell me about our family and home in evs',
    expectedBook: 'Our_Wondrous_World',
    description: 'Grade 3 EVS Chapter 1 - Family and Friends'
  },
  {
    grade: 3,
    subject: 'Arts',
    chapter: 'Music & Drawing',
    query: 'teach me drawing and puppet making in arts bansuri',
    expectedBook: 'Bansuri',
    description: 'Grade 3 Arts - Bansuri I'
  },
  {
    grade: 3,
    subject: 'Physical Education',
    chapter: 'Yoga & Games',
    query: 'teach me yoga poses and games in khel yoga',
    expectedBook: 'Khel_Yoga',
    description: 'Grade 3 Physical Education - Khel Yoga'
  },

  // --- GRADE 4 ---
  {
    grade: 4,
    subject: 'English',
    chapter: 'Chapter 1 (Together We Can)',
    query: 'teach me chapter 1 in english',
    expectedBook: 'Santoor',
    description: 'Grade 4 English Chapter 1 - Together We Can'
  },
  {
    grade: 4,
    subject: 'English',
    chapter: 'Chapter 6 (Braille)',
    query: 'teach me about braille in english',
    expectedBook: 'Santoor',
    description: 'Grade 4 English Chapter 6 - Braille'
  },
  {
    grade: 4,
    subject: 'Mathematics',
    chapter: 'Chapter 1 (Finding Symmetry)',
    query: 'teach me finding symmetry in math',
    expectedBook: 'Math-Mela',
    description: 'Grade 4 Math Chapter 1 - Finding Symmetry'
  },
  {
    grade: 4,
    subject: 'Mathematics',
    chapter: 'Chapter 3 (Trip to Bhopal)',
    query: 'tell me about trip to bhopal in maths',
    expectedBook: 'Math-Mela',
    description: 'Grade 4 Math Chapter 3 - Trip to Bhopal'
  },
  {
    grade: 4,
    subject: 'The World Around Us (EVS)',
    chapter: 'Chapter 1 (Living Together)',
    query: 'teach me living together in science evs',
    expectedBook: 'Our_Wonderous_World',
    description: 'Grade 4 EVS Chapter 1 - Living Together'
  },
  {
    grade: 4,
    subject: 'The World Around Us (EVS)',
    chapter: 'Chapter 3 (Nature Trail)',
    query: 'tell me about nature trail in science',
    expectedBook: 'Our_Wonderous_World',
    description: 'Grade 4 EVS Chapter 3 - Nature Trail'
  },
  {
    grade: 4,
    subject: 'Arts',
    chapter: 'Visual Art & Drama',
    query: 'teach me acting and rhythm in arts bansuri',
    expectedBook: 'Bansuri',
    description: 'Grade 4 Arts - Bansuri'
  },
  {
    grade: 4,
    subject: 'Physical Education',
    chapter: 'Yoga & Movement',
    query: 'teach me breathing and posture in khel yoga',
    expectedBook: 'Khel_Yoga',
    description: 'Grade 4 Physical Education - Khel Yoga'
  }
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log(`================================================================`);
console.log(`NCERT Multi-Subject, Multi-Standard Comprehensive Test Suite`);
console.log(`Total Test Scenarios: ${testCases.length}`);
console.log(`================================================================`);

const results = [];
let passedCount = 0;

for (let i = 0; i < testCases.length; i++) {
  const tc = testCases[i];
  console.log(`\n--------------------------------------------------------------`);
  console.log(`[Test ${i + 1}/${testCases.length}] Grade ${tc.grade} - ${tc.subject} (${tc.chapter})`);
  console.log(`Query:       "${tc.query}"`);
  console.log(`Target Book: ${tc.expectedBook}`);

  const startTime = Date.now();
  try {
    const res = await chatService.reply([
      { role: 'user', content: tc.query }
    ], null, { classStandard: tc.grade });
    const latency = Date.now() - startTime;

    const citationTitles = res.citations.map((c) => c.title);
    const hasCitations = res.citations.length > 0;
    const matchesExpectedGrade = citationTitles.some((t) => t.includes(`Class_0${tc.grade}`));
    const matchesExpectedBook = citationTitles.some((t) => {
      const simplifiedExpected = tc.expectedBook.toLowerCase().replace(/[_-]/g, '');
      const simplifiedTitle = t.toLowerCase().replace(/[_-]/g, '');
      return simplifiedTitle.includes(simplifiedExpected) ||
        simplifiedTitle.includes(simplifiedExpected.slice(0, 5));
    });

    const passed = hasCitations && (matchesExpectedGrade || matchesExpectedBook);
    if (passed) passedCount++;

    console.log(`Latency:     ${latency}ms`);
    console.log(`Citations:   ${res.citations.length} document(s) verified`);
    citationTitles.forEach((title) => console.log(`  - ${title}`));
    console.log(`AI Excerpt:  "${res.text.slice(0, 160).replace(/\n/g, ' ')}..."`);
    console.log(`Result:      ${passed ? 'PASSED [OK]' : 'FAILED [X]'}`);

    results.push({
      testId: i + 1,
      grade: tc.grade,
      subject: tc.subject,
      chapter: tc.chapter,
      query: tc.query,
      expectedBook: tc.expectedBook,
      latencyMs: latency,
      citationCount: res.citations.length,
      citations: citationTitles,
      passed,
      aiResponse: res.text
    });
  } catch (err) {
    console.error(`Error in test ${i + 1}:`, err.message);
    results.push({
      testId: i + 1,
      grade: tc.grade,
      subject: tc.subject,
      chapter: tc.chapter,
      query: tc.query,
      passed: false,
      error: err.message
    });
  }

  // Pacing cooldown to respect Groq TPM rate limits
  if (i < testCases.length - 1) {
    console.log('Cooldown (8.5s) for API rate safety...');
    await sleep(8500);
  }
}

const summary = {
  timestamp: new Date().toISOString(),
  total: testCases.length,
  passed: passedCount,
  failed: testCases.length - passedCount,
  results
};

fs.mkdirSync(path.resolve('tmp'), { recursive: true });
fs.writeFileSync(path.resolve('tmp/multi_subject_grades_report.json'), JSON.stringify(summary, null, 2), 'utf8');

console.log(`\n================================================================`);
console.log(`FINAL RESULT: ${passedCount}/${testCases.length} Tests Passed (${((passedCount / testCases.length) * 100).toFixed(1)}%)`);
console.log(`Report saved to tmp/multi_subject_grades_report.json`);
console.log(`================================================================`);
