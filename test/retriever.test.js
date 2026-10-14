import assert from 'node:assert/strict';
import test from 'node:test';
import { buildRetrievalQuery, createRetriever } from '../server/retriever.js';

function stubFetch(documents) {
  return async () => ({ ok: true, json: async () => ({ documents }) });
}

const CANDIDATES = [
  {
    title: 'Class_04 chapter',
    content: 'Standard 4 content.',
    metadata: { class: 'Class_04' },
    scores: { reranker: 2.1, rrf: 0.02 }
  },
  {
    title: 'Class_03 chapter',
    content: 'Standard 3 content.',
    metadata: { class: 'Class_03' },
    scores: { reranker: 1.5, rrf: 0.02 }
  },
  {
    title: 'Weak Class_04 chapter',
    content: 'Barely relevant.',
    metadata: { class: 'Class_04' },
    scores: { reranker: -5, rrf: 0.01 }
  }
];

test('keeps only sources from the learner class, falling back when none match', async () => {
  const retrieve = createRetriever({ fetchImpl: stubFetch(CANDIDATES) });

  const kept = await retrieve({ query: 'What is this chapter about?', classStandard: 4 });
  assert.deepEqual(kept, [{ title: 'Class_04 chapter', content: 'Standard 4 content.' }]);

  const fallback = await retrieve({ query: 'What is this chapter about?', classStandard: 2 });
  assert.deepEqual(fallback, [
    { title: 'Class_04 chapter', content: 'Standard 4 content.' },
    { title: 'Class_03 chapter', content: 'Standard 3 content.' }
  ]);

  const unfiltered = await retrieve({ query: 'What is this chapter about?' });
  assert.deepEqual(unfiltered, fallback);
});

test('builds context-aware queries only for follow-up questions', () => {
  const messages = [
    { role: 'user', content: 'What is Chapter 4 of Mridang about?' },
    { role: 'assistant', content: 'It covers initial sounds.' },
    { role: 'user', content: 'why was that boy sad' }
  ];

  assert.match(
    buildRetrievalQuery({ query: messages[2].content, messages }),
    /Chapter 4/
  );
  assert.equal(
    buildRetrievalQuery({ query: 'What is Chapter 4 of Mridang about?', messages }),
    'What is Chapter 4 of Mridang about?'
  );
});
