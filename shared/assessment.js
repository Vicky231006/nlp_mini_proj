export const ASSESSMENT_QUESTION_COUNT = 25;

export const ASSESSMENT_DIMENSIONS = [
  {
    key: 'pattern_completion',
    label: 'Pattern & Alternation',
    guidance: 'noticing what changes and what repeats'
  },
  {
    key: 'spatial_transformation',
    label: 'Spatial Transformation',
    guidance: 'imagining how a shape turns or moves'
  },
  {
    key: 'analogical_mapping',
    label: 'Analogical Mapping',
    guidance: 'spotting how two sets of shapes relate'
  },
  {
    key: 'multi_rule_reasoning',
    label: 'Multi-Rule Integration',
    guidance: 'using more than one clue at a time'
  }
];

function shuffle(items, random) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function createAssessmentSession(itemBank, random = Math.random) {
  const groups = shuffle(ASSESSMENT_DIMENSIONS.map(({ key }) => {
    const items = shuffle(itemBank.filter((item) => item.construct === key), random);
    if (items.length < 7) {
      throw new Error(`The assessment needs at least seven items for ${key}.`);
    }
    return { key, items };
  }), random);

  const extraItemKey = groups[0].key;
  const selectedItems = groups.flatMap(({ key, items }) =>
    items.slice(0, 6 + Number(key === extraItemKey))
  );

  if (selectedItems.length !== ASSESSMENT_QUESTION_COUNT) {
    throw new Error(`The assessment must contain exactly ${ASSESSMENT_QUESTION_COUNT} questions.`);
  }

  const questions = shuffle(selectedItems, random);
  const correctPositions = shuffle(
    Array.from({ length: ASSESSMENT_QUESTION_COUNT }, (_, index) => index % 4),
    random
  );

  return questions.map((item, index) => {
    const correctOption = item.options.find((option) => option.correct);
    if (!correctOption) {
      throw new Error(`Assessment question ${item.id} must have a correct answer.`);
    }
    const options = shuffle(item.options.filter((option) => !option.correct), random);
    options.splice(correctPositions[index], 0, correctOption);
    return { ...item, options };
  });
}

export function calculateAssessmentResults(items, answers) {
  if (!Array.isArray(items) || !Array.isArray(answers) || items.length !== answers.length) {
    throw new Error('Assessment answers must match the questions shown.');
  }

  const dimensions = Object.fromEntries(ASSESSMENT_DIMENSIONS.map(({ key }) => [
    key,
    { correct: 0, total: 0 }
  ]));
  let correct = 0;
  let answered = 0;

  items.forEach((item, index) => {
    const score = dimensions[item.construct];
    if (!score) {
      throw new Error(`The assessment question has an unknown category: ${item.construct}.`);
    }
    score.total += 1;

    const selectedOptionId = answers[index];
    if (selectedOptionId === null) return;

    answered += 1;
    if (item.options.find((option) => option.id === selectedOptionId)?.correct) {
      correct += 1;
      score.correct += 1;
    }
  });

  return {
    correct,
    total: items.length,
    answered,
    unanswered: items.length - answered,
    dimensions
  };
}

export function createAssessmentProfile(results) {
  return {
    overall: {
      correct: results.correct,
      total: results.total,
      answered: results.answered
    },
    dimensions: Object.fromEntries(ASSESSMENT_DIMENSIONS.map(({ key }) => [
      key,
      { ...results.dimensions[key] }
    ]))
  };
}

export function validateAssessmentProfile(profile) {
  if (profile === undefined || profile === null) return null;

  const validCount = (value) => Number.isInteger(value) && value >= 0;
  if (
    typeof profile !== 'object'
    || Array.isArray(profile)
    || typeof profile.overall !== 'object'
    || profile.overall === null
    || !validCount(profile.overall.correct)
    || profile.overall.total !== ASSESSMENT_QUESTION_COUNT
    || !validCount(profile.overall.answered)
    || profile.overall.correct > profile.overall.answered
    || profile.overall.answered > profile.overall.total
    || typeof profile.dimensions !== 'object'
    || profile.dimensions === null
    || Array.isArray(profile.dimensions)
  ) {
    throw new Error('The learner assessment profile is invalid.');
  }

  const expectedKeys = ASSESSMENT_DIMENSIONS.map(({ key }) => key).sort();
  if (Object.keys(profile.dimensions).sort().join(',') !== expectedKeys.join(',')) {
    throw new Error('The learner assessment profile must include all four item categories.');
  }

  const dimensions = Object.fromEntries(ASSESSMENT_DIMENSIONS.map(({ key }) => {
    const score = profile.dimensions[key];
    if (
      typeof score !== 'object'
      || score === null
      || !validCount(score.correct)
      || !validCount(score.total)
      || score.correct > score.total
      || ![6, 7].includes(score.total)
    ) {
      throw new Error('The learner assessment profile contains an invalid category score.');
    }
    return [key, { correct: score.correct, total: score.total }];
  }));

  const dimensionCorrect = Object.values(dimensions).reduce((sum, score) => sum + score.correct, 0);
  const dimensionTotal = Object.values(dimensions).reduce((sum, score) => sum + score.total, 0);
  if (
    dimensionCorrect !== profile.overall.correct
    || dimensionTotal !== profile.overall.total
  ) {
    throw new Error('The learner assessment profile totals do not match its category scores.');
  }

  return {
    overall: {
      correct: profile.overall.correct,
      total: profile.overall.total,
      answered: profile.overall.answered
    },
    dimensions
  };
}
