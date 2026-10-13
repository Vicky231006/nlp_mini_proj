import React, { useState } from 'react';
import {
  ASSESSMENT_DIMENSIONS,
  ASSESSMENT_PROFILE_STORAGE_KEY,
  ASSESSMENT_QUESTION_COUNT,
  calculateAssessmentResults,
  createAssessmentProfile,
  createAssessmentSession
} from '../../../shared/assessment';
import { ITEM_BANK } from '../../assessment/questionBank';
import { QuestionVisual } from '../../assessment/QuestionVisual';

const STEPS = {
  INTRO: 'intro',
  QUESTIONS: 'questions',
  RESULTS: 'results'
};

const shapeLabels = {
  arrow: 'arrow',
  backslash: 'diagonal line',
  car: 'car',
  circle: 'circle',
  clock: 'clock',
  concentric_rings: 'concentric rings',
  crescent: 'crescent',
  cross: 'cross',
  cross_sm: 'small cross',
  dash_sm: 'short line',
  diagonal_slash: 'diagonal line',
  diamond: 'diamond',
  dot: 'dot',
  hexagon: 'hexagon',
  heptagon: 'heptagon',
  house: 'house',
  l_shape: 'L shape',
  l_shape_reflected: 'flipped L shape',
  line_horiz: 'horizontal line',
  line_vert: 'vertical line',
  lines_combo: 'crossing lines',
  pentagon: 'pentagon',
  plus_composite: 'plus sign',
  square: 'square',
  star: 'star',
  t_shape: 'T shape',
  traffic_light: 'traffic light',
  triangle: 'triangle'
};

function describeShapes(shapes) {
  return shapes.map((shape) => {
    const count = shape.count > 1 ? `${shape.count} ` : '';
    const position = shape.pos ? ` at ${shape.pos.replaceAll('_', ' ')}` : '';
    return `${count}${shapeLabels[shape.type] || 'shape'}${position}`;
  }).join(', ');
}

function PuzzleQuestion({ item, questionNumber, selectedOptionId, onSelect }) {
  const columnCount = item.format === '1x4' ? 4 : item.format === '2x2' ? 2 : 3;
  return (
    <section className="rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-[3px_3px_0px_#0f172a] md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-black text-slate-900">Puzzle {questionNumber}</h3>
        <span className="rounded-full border-2 border-slate-900 bg-sky-100 px-3 py-1 text-xs font-bold text-slate-800">
          {ASSESSMENT_DIMENSIONS.find(({ key }) => key === item.construct)?.label}
        </span>
      </div>

      <p className="mb-4 text-sm font-semibold text-slate-700">
        Look for what changes or stays the same. Which tile belongs in the empty space?
      </p>
      <div
        className="mx-auto grid max-w-lg gap-2 rounded-xl bg-slate-100 p-3"
        style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
        aria-label="Puzzle pattern"
      >
        {item.stimulus.map((cell, index) => (
          <div
            key={`${item.id}-cell-${index}`}
            className={`aspect-square min-w-0 rounded-lg border-2 border-slate-700 p-1 ${
              cell ? 'bg-white' : 'flex items-center justify-center bg-amber-100 text-4xl font-black text-slate-700'
            }`}
          >
            {cell
              ? <QuestionVisual shapes={cell.shapes} label={describeShapes(cell.shapes)} />
              : <span aria-label="Missing tile">?</span>}
          </div>
        ))}
      </div>

      <fieldset className="mt-5">
        <legend className="mb-3 text-sm font-black text-slate-800">Pick the tile you think fits:</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {item.options.map((option, index) => {
            const label = String.fromCharCode(65 + index);
            const isSelected = option.id === selectedOptionId;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelect(option.id)}
                aria-pressed={isSelected}
                aria-label={`Choice ${label}: ${describeShapes(option.shapes)}`}
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-slate-900 p-2 font-black shadow-[2px_2px_0px_#0f172a] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-indigo-500 ${
                  isSelected ? 'bg-amber-200 ring-2 ring-indigo-600' : 'bg-sky-50 hover:bg-sky-100'
                }`}
              >
                <span className="text-xs">{label}</span>
                <span className="block h-4/5 w-4/5">
                  <QuestionVisual shapes={option.shapes} label={describeShapes(option.shapes)} />
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}

function ScoreCard({ label, score, color }) {
  const percent = score.total ? Math.round((score.correct / score.total) * 100) : 0;
  return (
    <div className={`rounded-xl border-2 border-slate-900 p-4 ${color}`}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-black text-slate-900">{label}</h4>
        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-sm font-black text-slate-900">
          {score.correct}/{score.total}
        </span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full border border-slate-700 bg-white">
        <div className="h-full bg-indigo-500" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-700">puzzles answered correctly in this set</p>
    </div>
  );
}

const ReasoningPractice = ({ onOpenTutor }) => {
  const [step, setStep] = useState(STEPS.INTRO);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState(null);
  const [storageWarning, setStorageWarning] = useState(false);

  const startPractice = () => {
    setQuestions(createAssessmentSession(ITEM_BANK));
    setAnswers(Array(ASSESSMENT_QUESTION_COUNT).fill(null));
    setCurrentIndex(0);
    setResults(null);
    setStorageWarning(false);
    setStep(STEPS.QUESTIONS);
  };

  const finishPractice = () => {
    const summary = calculateAssessmentResults(questions, answers);
    setResults(summary);
    try {
      localStorage.setItem(
        ASSESSMENT_PROFILE_STORAGE_KEY,
        JSON.stringify(createAssessmentProfile(summary))
      );
      setStorageWarning(false);
    } catch {
      setStorageWarning(true);
    }
    setStep(STEPS.RESULTS);
  };

  const selectOption = (optionId) => {
    setAnswers((current) => current.map((answer, index) =>
      index === currentIndex ? optionId : answer
    ));
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="border-b-2 border-slate-300 pb-4">
        <p className="text-sm font-bold text-indigo-700">Your learning adventure</p>
        <h2 className="mt-1 text-2xl font-black text-slate-900">Puzzle practice</h2>
        <p className="mt-2 text-sm text-slate-700">
          Explore patterns, shapes, and clues at your own pace.
        </p>
      </header>

      {step === STEPS.INTRO && (
        <section className="space-y-5 rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[3px_3px_0px_#0f172a] md:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-900 bg-amber-200 text-3xl" aria-hidden="true">
              🧩
            </span>
            <div>
              <h3 className="text-xl font-black text-slate-900">Ready for some brain-teasers?</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Try 25 picture puzzles. Take your time, skip any puzzle, and come back before you finish.
                There are no grades or time limits.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {ASSESSMENT_DIMENSIONS.map(({ key, label, guidance }) => (
              <div key={key} className="rounded-xl border border-slate-300 bg-sky-50 p-3">
                <p className="font-bold text-slate-900">{label}</p>
                <p className="mt-1 text-xs text-slate-700">{guidance}</p>
              </div>
            ))}
          </div>
          <p className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
            This is just for practice. Your results show how many puzzles you got right today;
            they do not measure how smart you are or decide what you can learn.
          </p>
          <button
            type="button"
            onClick={startPractice}
            className="w-full rounded-xl border-2 border-slate-900 bg-indigo-600 px-6 py-3 text-lg font-black text-white shadow-[3px_3px_0px_#0f172a] transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400 sm:w-auto"
          >
            Start puzzle practice
          </button>
        </section>
      )}

      {step === STEPS.QUESTIONS && currentQuestion && (
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2 text-sm font-bold text-slate-700">
              <span>Puzzle {currentIndex + 1} of {questions.length}</span>
              <span>{answers.filter(Boolean).length} answered</span>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full border border-slate-700 bg-white"
              role="progressbar"
              aria-label="Practice progress"
              aria-valuemin={0}
              aria-valuemax={questions.length}
              aria-valuenow={currentIndex + 1}
            >
              <div
                className="h-full bg-indigo-500 transition-all"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <PuzzleQuestion
            item={currentQuestion}
            questionNumber={currentIndex + 1}
            selectedOptionId={answers[currentIndex]}
            onSelect={selectOption}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              disabled={currentIndex === 0}
              className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-bold text-slate-900 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => currentIndex < questions.length - 1
                ? setCurrentIndex((index) => index + 1)
                : finishPractice()}
              className="rounded-xl border-2 border-slate-900 bg-indigo-600 px-5 py-2 font-black text-white shadow-[2px_2px_0px_#0f172a] hover:bg-indigo-700"
            >
              {currentIndex === questions.length - 1 ? 'See my results' : 'Next puzzle'}
            </button>
          </div>
          {answers[currentIndex] === null && (
            <p className="text-center text-xs font-semibold text-slate-600">
              You can skip this one and choose an answer later.
            </p>
          )}
        </div>
      )}

      {step === STEPS.RESULTS && results && (
        <section className="space-y-5 rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-[3px_3px_0px_#0f172a] md:p-7">
          <div className="text-center">
            <p className="text-3xl" aria-hidden="true">🌟</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">You finished your puzzles!</h3>
            <p className="mt-2 text-slate-700">
              You got <strong>{results.correct} out of {results.total}</strong> puzzles right.
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {results.answered} answered · {results.unanswered} skipped
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {ASSESSMENT_DIMENSIONS.map(({ key, label }, index) => (
              <ScoreCard
                key={key}
                label={label}
                score={results.dimensions[key]}
                color={['bg-sky-100', 'bg-amber-100', 'bg-violet-100', 'bg-emerald-100'][index]}
              />
            ))}
          </div>

          <p className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
            These are simple counts from this practice set only. Each category has just 6 or 7
            puzzles and is not a validated skill score. Your tutor uses the results only to choose
            helpful ways to explain things, never to label or rank you.
          </p>
          {storageWarning && (
            <p role="alert" className="rounded-xl bg-red-100 p-3 text-sm font-bold text-red-900">
              Your browser could not save this practice snapshot, so the tutor may not be able to
              use it to personalize explanations.
            </p>
          )}

          <details className="rounded-xl border border-slate-300 p-4">
            <summary className="cursor-pointer font-bold text-indigo-800">Review the answers</summary>
            <ol className="mt-3 space-y-3">
              {questions.map((item, index) => {
                const correctOption = item.options.find((option) => option.correct);
                const pickedOption = item.options.find((option) => option.id === answers[index]);
                return (
                  <li key={item.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                    <p className="font-bold text-slate-900">Puzzle {index + 1}</p>
                    <p className="mt-1 text-slate-700">
                      {pickedOption ? `Your choice: ${describeShapes(pickedOption.shapes)}.` : 'You skipped this puzzle.'}
                      {' '}One answer is {describeShapes(correctOption.shapes)}.
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{correctOption.rationale}</p>
                  </li>
                );
              })}
            </ol>
          </details>

          <button
            type="button"
            onClick={startPractice}
            className="w-full rounded-xl border-2 border-slate-900 bg-indigo-600 px-6 py-3 font-black text-white hover:bg-indigo-700 sm:w-auto"
          >
            Try a fresh set
          </button>
          {onOpenTutor && (
            <button
              type="button"
              onClick={onOpenTutor}
              className="ml-0 w-full rounded-xl border-2 border-indigo-700 bg-white px-6 py-3 font-black text-indigo-800 hover:bg-indigo-50 sm:ml-3 sm:w-auto"
            >
              Chat with my puzzle buddy
            </button>
          )}
        </section>
      )}
    </div>
  );
};

export default ReasoningPractice;
