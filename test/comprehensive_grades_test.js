import { createChatService } from '../server/chatService.js';
import { createOpenAICompatibleProvider } from '../server/providers/openAICompatible.js';
import { getServerConfig } from '../server/config.js';
import { createRetriever } from '../server/retriever.js';

const config = getServerConfig();
console.log('==============================================================');
console.log('Starting Comprehensive Multi-Grade Evaluation');
console.log(`LLM Model: ${config.openAICompatible.model} (${config.openAICompatible.baseUrl})`);
console.log(`NCERT Retrieval: ${config.retrieval.baseUrl}`);
console.log('==============================================================');

const chatService = createChatService({
  provider: createOpenAICompatibleProvider(config.openAICompatible),
  retrieve: createRetriever(config.retrieval)
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const testCases = [
  // Grade 1 Tests
  {
    grade: 1,
    subject: 'English',
    expectedBook: 'Mridang',
    query: 'teach me 1st chapter in inglis',
    description: 'Grade 1 English Chapter 1 (Phonetic spelling test)'
  },
  {
    grade: 1,
    subject: 'Mathematics',
    expectedBook: 'Joyful-Mathematics',
    query: 'explain shapes in maths',
    description: 'Grade 1 Mathematics Shapes & Space'
  },

  // Grade 2 Tests
  {
    grade: 2,
    subject: 'English',
    expectedBook: 'Mridang',
    query: 'teach me 2nd chapter inglis',
    description: 'Grade 2 English Chapter 2 Seeing without Seeing'
  },
  {
    grade: 2,
    subject: 'Mathematics',
    expectedBook: 'Joyful-Mathematics',
    query: 'teach me counting diyas in maths',
    description: 'Grade 2 Mathematics Counting Diyas'
  },

  // Grade 3 Tests
  {
    grade: 3,
    subject: 'English',
    expectedBook: 'Santoor',
    query: 'teach me first chapter in english',
    description: 'Grade 3 English Santoor Chapter 1'
  },
  {
    grade: 3,
    subject: 'Mathematics',
    expectedBook: 'Maths_Mela',
    query: 'help me with shapes and patterns in math',
    description: 'Grade 3 Mathematics Maths Mela'
  },
  {
    grade: 3,
    subject: 'The World Around Us (EVS)',
    expectedBook: 'Our_Wondrous_World',
    query: 'tell me about our family and home in evs',
    description: 'Grade 3 Science/EVS Our Wondrous World'
  },

  // Grade 4 Tests
  {
    grade: 4,
    subject: 'English',
    expectedBook: 'Santoor',
    query: 'teach me chapter 1 in english',
    description: 'Grade 4 English Santoor Chapter 1'
  },
  {
    grade: 4,
    subject: 'Mathematics',
    expectedBook: 'Math-Mela',
    query: 'teach me numbers and patterns in maths',
    description: 'Grade 4 Mathematics Math-Mela'
  },
  {
    grade: 4,
    subject: 'The World Around Us (EVS)',
    expectedBook: 'Our_Wonderous_World',
    query: 'explain plants and animals in science',
    description: 'Grade 4 Science/EVS Our Wonderous World'
  }
];

const results = [];
let passedCount = 0;

for (let i = 0; i < testCases.length; i++) {
  const tc = testCases[i];
  console.log(`\n--------------------------------------------------------------`);
  console.log(`[Test ${i + 1}/${testCases.length}] Grade ${tc.grade} - ${tc.subject}`);
  console.log(`Description: ${tc.description}`);
  console.log(`User Query:  "${tc.query}"`);
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
        simplifiedTitle.includes(simplifiedExpected.slice(0, 6));
    });

    const passed = hasCitations && (matchesExpectedGrade || matchesExpectedBook);
    if (passed) passedCount++;

    console.log(`Latency:     ${latency}ms`);
    console.log(`Citations:   ${res.citations.length} document(s) verified`);
    citationTitles.forEach((title) => console.log(`  - ${title}`));
    console.log(`AI Excerpt:  "${res.text.slice(0, 180).replace(/\n/g, ' ')}..."`);
    console.log(`Result:      ${passed ? 'PASSED [OK]' : 'FAILED [X]'}`);

    results.push({
      test: tc.description,
      grade: tc.grade,
      subject: tc.subject,
      query: tc.query,
      expectedBook: tc.expectedBook,
      latencyMs: latency,
      citationCount: res.citations.length,
      citations: citationTitles,
      passed,
      preview: res.text.slice(0, 150)
    });
  } catch (err) {
    console.error(`Error in test ${i + 1}:`, err.message);
    results.push({
      test: tc.description,
      grade: tc.grade,
      subject: tc.subject,
      query: tc.query,
      passed: false,
      error: err.message
    });
  }

  // Inter-test cooldown to respect Groq free tier rate limits
  if (i < testCases.length - 1) {
    console.log('Pacing request (7.5s cooldown for rate limit safety)...');
    await sleep(7500);
  }
}

console.log(`\n==============================================================`);
console.log(`TEST SUMMARY: ${passedCount}/${testCases.length} Passed (${Math.round((passedCount / testCases.length) * 100)}%)`);
console.log(`==============================================================`);

// Write detailed JSON report
import { writeFileSync } from 'node:fs';
writeFileSync('tmp/grades_test_report.json', JSON.stringify({
  timestamp: new Date().toISOString(),
  total: testCases.length,
  passed: passedCount,
  results
}, null, 2));
console.log('Detailed report written to tmp/grades_test_report.json');
