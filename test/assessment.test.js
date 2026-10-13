import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ASSESSMENT_DIMENSIONS,
  ASSESSMENT_QUESTION_COUNT,
  calculateAssessmentResults,
  createAssessmentProfile,
  createAssessmentSession,
  validateAssessmentProfile
} from '../shared/assessment.js';
import { ITEM_BANK } from '../src/assessment/questionBank.js';

test('original 64-question bank produces a balanced, unique 25-puzzle practice session', () => {
  assert.equal(ITEM_BANK.length, 64);
  assert.deepEqual(
    [...new Set(ITEM_BANK.map((item) => item.construct))].sort(),
    ASSESSMENT_DIMENSIONS.map(({ key }) => key).sort()
  );

  const questions = createAssessmentSession(ITEM_BANK, () => 0.37);
  assert.equal(questions.length, ASSESSMENT_QUESTION_COUNT);
  assert.equal(new Set(questions.map((question) => question.id)).size, ASSESSMENT_QUESTION_COUNT);

  const counts = Object.fromEntries(ASSESSMENT_DIMENSIONS.map(({ key }) => [
    key,
    questions.filter((question) => question.construct === key).length
  ]));
  assert.deepEqual(Object.values(counts).sort(), [6, 6, 6, 7]);
  assert.ok(questions.every((question) =>
    question.options.length === 4 && question.options.filter((option) => option.correct).length === 1));

  const correctPositions = questions.map((question) =>
    question.options.findIndex((option) => option.correct));
  assert.deepEqual([0, 1, 2, 3].map((position) =>
    correctPositions.filter((value) => value === position).length).sort(), [6, 6, 6, 7]);
});

test('scores correct, incorrect, and skipped items as descriptive category counts', () => {
  const questions = createAssessmentSession(ITEM_BANK, () => 0.37);
  const answers = questions.map((question, index) => {
    if (index === 0) return null;
    const correctOption = question.options.find((option) => option.correct);
    if (index === 1) return question.options.find((option) => option.id !== correctOption.id).id;
    return correctOption.id;
  });

  const results = calculateAssessmentResults(questions, answers);
  assert.equal(results.total, 25);
  assert.equal(results.correct, 23);
  assert.equal(results.answered, 24);
  assert.equal(results.unanswered, 1);
  assert.equal(
    Object.values(results.dimensions).reduce((sum, score) => sum + score.total, 0),
    25
  );
  assert.equal(
    Object.values(results.dimensions).reduce((sum, score) => sum + score.correct, 0),
    23
  );
});

test('builds and validates the four-category practice profile', () => {
  const questions = createAssessmentSession(ITEM_BANK, () => 0.37);
  const results = calculateAssessmentResults(
    questions,
    questions.map((question) => question.options.find((option) => option.correct).id)
  );
  const profile = createAssessmentProfile(results);

  assert.equal(validateAssessmentProfile(profile).overall.correct, 25);
  assert.deepEqual(Object.keys(profile.dimensions).sort(), ASSESSMENT_DIMENSIONS.map(({ key }) => key).sort());
  assert.throws(() => validateAssessmentProfile({
    ...profile,
    dimensions: { ...profile.dimensions, analogical_mapping: { correct: 7, total: 6 } }
  }), /invalid category score/);
});

test('rejects a question bank missing one category', () => {
  assert.throws(
    () => createAssessmentSession(ITEM_BANK.filter((item) => item.construct !== 'pattern_completion')),
    /at least seven items/
  );
});
