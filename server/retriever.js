// NCERT RAG bridge: queries the Python retrieval_service.py over HTTP and
// returns documents in the existing chat-service contract { title, content }.
// Fail-open by design: any retrieval problem returns [] so the tutor falls
// back to general knowledge instead of failing the whole chat request.

const DEFAULT_BASE_URL = 'http://127.0.0.1:8000';
const DEFAULT_TOP_K = 5;
const DEFAULT_TIMEOUT_MS = 15_000;

function parseTopK(value) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return DEFAULT_TOP_K;
  return Math.min(5, Math.max(1, parsed));
}

function parseTimeoutMs(value) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return DEFAULT_TIMEOUT_MS;
  return Math.min(60_000, Math.max(1_000, parsed));
}

function parseMinScore(value) {
  const parsed = Number.parseFloat(value ?? '');
  if (!Number.isFinite(parsed)) return -2;
  return Math.min(10, Math.max(-10, parsed));
}

// Follow-up questions like "why was he sad in that chapter" are meaningless
// on their own. Only then do we prepend the previous user turn for context;
// precise standalone queries are sent untouched.
const NEEDS_CONTEXT_RE = /\b(that|this|these|those|it|its|they|them|he|him|his|she|her|hers|their|theirs|above|previous|earlier|same)\b/i;

export const CURRICULUM_CHAPTERS = {
  1: {
    english: {
      book: 'Mridang',
      chapters: {
        1: 'Two Little Hands Unit 1 My Family and Me',
        2: 'Greetings Unit 1 My Family and Me Namaste',
        3: 'Picture Time Unit 2 Life Around Us Animals Birds',
        4: 'The Cap-seller and the Monkeys Unit 2 Life Around Us',
        5: 'A Farm Unit 2 Animals and Birds',
        6: 'Fun with Pictures Unit 3 Food Eating Together',
        7: 'The Food we Eat Unit 3 Food Market',
        8: 'The Four Seasons Unit 4 Seasons',
        9: "Anandi's Rainbow Unit 4 Seasons Colours"
      }
    },
    math: {
      book: 'Joyful-Mathematics',
      chapters: {
        1: 'Finding the Furry Cat Pre-number Concepts',
        2: 'What is Long What is Round Shapes',
        3: 'Mango Treat Numbers 1 to 9',
        4: 'Making 10 Numbers 10 to 20',
        5: 'How Many Addition and Subtraction Single Digit',
        6: 'Vegetable Farm Addition and Subtraction up to 20',
        7: "Lina's Family Measurement",
        8: 'Fun with Numbers Numbers 21 to 99',
        9: 'Utsav Patterns',
        10: 'How do I Spend my Day Time',
        11: 'How Many Times Multiplication',
        12: 'How Much Can We Spend Money',
        13: 'So Many Toys Data Handling'
      }
    }
  },
  2: {
    english: {
      book: 'Mridang',
      chapters: {
        1: 'My Bicycle Unit 1 Fun with Friends',
        2: 'Picture Reading Seeing without Seeing Little Onshangla Ava Unit 2 It is Fun',
        3: 'It is Fun Action Words Verbs Unit 2 Welcome to My World',
        4: 'Seeing without Seeing Little Onshangla Ava Unit 2',
        5: 'Come Back Soon Unit 3 Going Places Travel Modes of Transport',
        6: 'Between Home and School Unit 3 Going Places',
        7: 'This is My Town Unit 3 Going Places',
        8: 'A Show of Clouds Unit 4 Life Around Us',
        9: 'My Name Unit 4 Life Around Us',
        10: 'The Crow Unit 4 Life Around Us',
        11: 'The Smart Monkey Unit 4 Life Around Us',
        12: 'Little Drops of Water Unit 5 Harmony',
        13: 'We are all Indians Unit 5 Harmony'
      }
    },
    math: {
      book: 'Joyful-Mathematics',
      chapters: {
        1: 'A Day at the Beach Counting in Groups',
        2: 'Shapes Around Us 3D Shapes',
        3: 'Fun with Numbers Numbers 1 to 100',
        4: 'Shadow Story Togalu 2D Shapes',
        5: 'Playing with Lines Orientations of a line',
        6: 'Decoration for Festival Addition and Subtraction Counting Diyas Tens and Ones Flowers Garlands Blocks',
        7: "Rani's Gift Measurement",
        8: 'Grouping and Sharing Multiplication and Division',
        9: 'Which Season is it Measurement of Time',
        10: 'Fun at the Fair Money',
        11: 'Data Handling'
      }
    }
  },
  3: {
    english: {
      book: 'Santoor',
      chapters: {
        1: 'Colours Unit 1 Fun with Friends',
        2: 'Badal and Moti Unit 1 Fun with Friends',
        3: 'Best Friends Unit 1 Fun with Friends',
        4: 'Out in the Garden Unit 2 Toys and Games',
        5: 'Talking Toys Unit 2 Toys and Games',
        6: 'Paper Boats Unit 2 Toys and Games',
        7: 'The Big Laddoo Unit 3 Good Food',
        8: 'Thank God Unit 3 Good Food',
        9: "Madhu's Wish Unit 3 Good Food",
        10: 'Night Unit 4 The Sky',
        11: 'Chanda Mama Counts the Stars Unit 4 The Sky',
        12: 'Chandrayaan Unit 4 The Sky'
      }
    },
    math: {
      book: 'Maths_Mela',
      chapters: {
        1: "What's in a Name",
        2: 'Toy Joy',
        3: 'Double Century',
        4: 'Vacation with My Nani Maa',
        5: 'Fun with Shapes',
        6: 'House of Hundreds I',
        7: 'Raksha Bandhan',
        8: 'Fair Share',
        9: 'House of Hundreds II',
        10: 'Fun at Class Party',
        11: 'Filling and Lifting',
        12: 'Give and Take',
        13: 'Time Goes On',
        14: 'The Surajkund Fair'
      }
    },
    evs: {
      book: 'Our_Wondrous_World',
      chapters: {
        1: 'Family and Friends Unit 1 Our Families and Communities',
        2: 'Going to the Mela Unit 1',
        3: 'Celebrating Festivals Unit 1',
        4: 'Getting to Know Plants Unit 2 Life Around Us',
        5: 'Plants and Animals Live Together Unit 2',
        6: 'Living in Harmony Unit 2',
        7: 'Water A Precious Gift Unit 3 Gifts of Nature',
        8: 'Food We Eat Unit 3 Gifts of Nature',
        9: 'Staying Healthy and Happy Unit 3',
        10: 'This World of Things Unit 4 Things Around Us',
        11: 'Making Things Unit 4 Things Around Us',
        12: 'Taking Charge of Waste Unit 4 Things Around Us'
      }
    },
    arts: {
      book: 'Bansuri_-_I',
      chapters: {
        1: 'Objects in Art Visual Arts',
        2: 'Plants in Art',
        3: 'Animals in Art',
        4: 'People Around Us',
        5: 'Festivals Occasions and Celebrations',
        6: 'Our National Anthem Music',
        7: 'Feel the Rhythm ta ka ta ki Ta',
        8: 'Travel Around',
        9: 'Musical Instruments',
        10: 'Celebratory Notes',
        11: 'Let us Dance Movement and Dance',
        12: 'Dance for Joy',
        13: 'I Play and Dance',
        14: 'Dance with Nature',
        15: 'Explore Theatre',
        16: 'Imagine Theatre',
        17: "Let's Create Theatre",
        18: 'Look Around Theatre',
        19: 'Activities Theatre',
        20: 'Integrating All Art Forms Theatre'
      }
    },
    pe: {
      book: 'Khel_Yoga',
      chapters: {
        1: 'Throwing and Catching Basic Motor Movements',
        2: 'Kicking and Receiving Basic Motor Movements',
        3: 'Strike the Ball Basic Motor Movements',
        4: 'Little Steps Basic Motor Movements',
        5: 'Local and Traditional Games Our Games',
        6: 'Yoga for Daily Life Yoga',
        7: 'Yogic Practices Yoga Sadhana'
      }
    }
  },
  4: {
    english: {
      book: 'Santoor',
      chapters: {
        1: 'Together We Can Unit 1 My Land',
        2: 'The Tinkling Bells Unit 1 My Land',
        3: 'Be Smart Be Safe Unit 1 My Land',
        4: 'One Thing at a Time Unit 2 My Beautiful World',
        5: 'The Old Stag Unit 2 My Beautiful World',
        6: 'Braille Unit 2 My Beautiful World',
        7: 'Fit Body Fit Mind Fit Nation Unit 3 Fun with Games',
        8: 'The Lagori Champions Unit 3 Fun with Games',
        9: 'Hekko Unit 3 Fun with Games',
        10: 'The Swing Unit 4 Up High',
        11: 'A Journey to the Magical Mountains Unit 4 Up High',
        12: 'Maheshwar Unit 4 Up High'
      }
    },
    math: {
      book: 'Math-Mela',
      chapters: {
        1: 'Finding Symmetry',
        2: 'Large World of Numbers',
        3: 'Trip to Bhopal',
        4: 'Tick-Tick-Tick',
        5: 'The Way The World Looks',
        6: 'The Junk Seller',
        7: 'The Cleanest Village',
        8: 'Weigh it Pour it',
        9: 'Equal Groups',
        10: 'Elephants Tigers and Leopards',
        11: 'Fun with Symmetry',
        12: 'Ticking Clocks and Turning Calendar',
        13: 'The Transport Museum',
        14: 'Data Handling'
      }
    },
    evs: {
      book: 'Our_Wonderous_World',
      chapters: {
        1: 'Living Together Unit 1 Our Community',
        2: 'Exploring Our Neighbourhood Unit 1 Our Community',
        3: 'Nature Trail Unit 2 Life Around Us',
        4: 'Growing up with Nature Unit 2 Life Around Us',
        5: 'Food for Health Unit 3 Health and Well-being',
        6: 'Happy and Healthy Living Unit 3 Health and Well-being',
        7: 'How Things Work Unit 4 Things Around Us',
        8: 'How Things are Made Unit 4 Things Around Us',
        9: 'Different Lands Different Lives Unit 5 Our Environment',
        10: 'Our Sky Unit 5 Our Environment'
      }
    },
    arts: {
      book: 'Bansuri',
      chapters: {
        1: 'Arrangements of Objects Visual Arts',
        2: 'Textures in Nature Visual Arts',
        3: 'Aqua World Visual Arts',
        4: 'People in Action Visual Arts',
        5: 'Explore Theatre',
        6: 'Imagine Theatre',
        7: "Let's Create Theatre",
        8: 'Look Around Theatre',
        9: 'Sing and Play Music',
        10: 'Making Music',
        11: 'Songs and Stories Music',
        12: 'Think Feel Create Music',
        13: 'Sounds and Instruments Music',
        14: 'My Body in Dance Dance',
        15: 'My Dance Tells Stories Dance',
        16: 'Creating My Dance Dance',
        17: 'Emotion and Expression in Dance',
        18: 'Dances Around Me Dance'
      }
    },
    pe: {
      book: 'Khel_Yoga',
      chapters: {
        1: 'Throwing and Catching Basic Motor Movements',
        2: 'Kicking and Receiving Basic Motor Movements',
        3: 'Strike the Shuttlecock Basic Motor Movements',
        4: 'Little Steps Basic Motor Movements',
        5: 'Local and Traditional Games Our Games',
        6: 'Yoga for Daily Life Yoga',
        7: 'Yoga Sadhana Yoga'
      }
    }
  }
};

export function buildRetrievalQuery({ query, messages, classStandard }) {
  let base = typeof query === 'string' ? query.trim() : '';
  if (!base) return '';

  if (NEEDS_CONTEXT_RE.test(base) && Array.isArray(messages)) {
    const userTurns = messages
      .filter((message) => message?.role === 'user' && typeof message.content === 'string')
      .map((message) => message.content.trim())
      .filter(Boolean);
    // Last turn is the base question itself; take the one before it.
    const prior = userTurns.length > 1 ? userTurns[userTurns.length - 2] : '';
    if (prior) {
      base = `${prior.slice(-500)}\n${base}`.slice(0, 1000);
    }
  }

  // Normalize common phonetic child misspellings & ordinals
  let normalized = base
    .replace(/\b(inglis|engish|englsih|englsh)\b/gi, 'English')
    .replace(/\b(maths?|mat|ganit)\b/gi, 'Mathematics')
    .replace(/\b(evs|science|nature|environment)\b/gi, 'The World Around Us')
    .replace(/\b(arts?|drawing|craft)\b/gi, 'Arts Bansuri')
    .replace(/\b(yoga|khel|physical\s+ed|pe)\b/gi, 'Khel Yoga')
    .replace(/\b(\d+)(?:st|nd|rd|th)\s+chapter\b/gi, 'Chapter $1')
    .replace(/\bchapter\s+(\d+)(?:st|nd|rd|th)\b/gi, 'Chapter $1')
    .replace(/\bfirst\s+chapter\b/gi, 'Chapter 1')
    .replace(/\bsecond\s+chapter\b/gi, 'Chapter 2')
    .replace(/\bthird\s+chapter\b/gi, 'Chapter 3')
    .replace(/\bfourth\s+chapter\b/gi, 'Chapter 4')
    .replace(/\bfifth\s+chapter\b/gi, 'Chapter 5')
    .replace(/\bsixth\s+chapter\b/gi, 'Chapter 6')
    .replace(/\bseventh\s+chapter\b/gi, 'Chapter 7')
    .replace(/\beighth\s+chapter\b/gi, 'Chapter 8')
    .replace(/\bninth\s+chapter\b/gi, 'Chapter 9')
    .replace(/\btenth\s+chapter\b/gi, 'Chapter 10')
    .replace(/\beleventh\s+chapter\b/gi, 'Chapter 11')
    .replace(/\btwelfth\s+chapter\b/gi, 'Chapter 12')
    .replace(/\bthirteenth\s+chapter\b/gi, 'Chapter 13')
    .replace(/\bfourteenth\s+chapter\b/gi, 'Chapter 14');

  let effectiveClass = normalizeClass(classStandard);
  if (!effectiveClass) {
    const classInText = normalized.match(/\b(?:class|standard|grade)\s*(\d{1,2})\b/i);
    if (classInText) {
      effectiveClass = normalizeClass(classInText[1]);
    }
  }

  if (effectiveClass) {
    const isEnglish = /\benglish\b/i.test(normalized);
    const isMath = /\bmathematics\b/i.test(normalized);
    const isEvs = /\bthe world around us\b/i.test(normalized);
    const isArts = /\b(arts|drawing|craft|bansuri)\b/i.test(normalized);
    const isPE = /\b(khel|yoga|physical)\b/i.test(normalized);

    const chapterMatch = normalized.match(/\bchapter\s+(\d+)\b/i);
    const chNum = chapterMatch ? parseInt(chapterMatch[1], 10) : null;

    let bookHint = '';
    let chapterExtra = '';

    const classInfo = CURRICULUM_CHAPTERS[effectiveClass];
    if (classInfo) {
      let subjKey = null;
      if (isEnglish) subjKey = 'english';
      else if (isMath) subjKey = 'math';
      else if (isEvs) subjKey = 'evs';
      else if (isArts) subjKey = 'arts';
      else if (isPE) subjKey = 'pe';

      if (subjKey && classInfo[subjKey]) {
        bookHint = classInfo[subjKey].book;
        if (chNum && classInfo[subjKey].chapters?.[chNum]) {
          chapterExtra = classInfo[subjKey].chapters[chNum];
        }
      }
    }

    const classPrefix = /\b(class|standard|grade)\s*\d+\b/i.test(normalized) ? '' : `Class ${effectiveClass}`;
    const chapterPrefix = chNum ? `Chapter ${chNum}` : '';
    normalized = `${classPrefix} ${bookHint} ${chapterPrefix} ${chapterExtra} ${normalized}`.replace(/\s+/g, ' ').trim();
  }

  return normalized;
}

export function getRetrievalSettings(env = process.env) {
  const enabled = env.NCERT_RETRIEVAL_ENABLED !== 'false'
    && env.NCERT_RETRIEVAL_ENABLED !== '0';
  const baseUrl = (env.NCERT_RETRIEVAL_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  return {
    enabled,
    baseUrl: baseUrl || DEFAULT_BASE_URL,
    topK: parseTopK(env.NCERT_RETRIEVAL_TOP_K),
    timeoutMs: parseTimeoutMs(env.NCERT_RETRIEVAL_TIMEOUT_MS),
    minScore: parseMinScore(env.NCERT_RETRIEVAL_MIN_SCORE)
  };
}

function normalizeClass(value) {
  if (value === null || value === undefined) return null;
  const match = String(value).match(/(\d{1,2})/);
  if (!match) return null;
  const parsed = Number.parseInt(match[1], 10);
  return parsed >= 1 && parsed <= 12 ? parsed : null;
}

function isFrontMatterDoc(doc) {
  const content = doc?.content || '';
  const title = doc?.title || '';
  const pagesMatch = title.match(/pages\s+([0-9,\s]+)/i);
  let maxPage = 0;
  if (pagesMatch) {
    const nums = pagesMatch[1].split(',').map((s) => parseInt(s.trim(), 10)).filter(Number.isFinite);
    if (nums.length > 0) maxPage = Math.max(...nums);
  }
  const isEarlyPage = maxPage > 0 && maxPage <= 14;
  const hasFrontMatterKeywords = /\b(prelims|foreword|about the (?:text)?book|note (?:for|to) the teacher|publication team|all rights reserved|curricular goal|isbn \d+|national council of educational research)\b/i.test(content);
  return isEarlyPage || hasFrontMatterKeywords;
}

export function createRetriever({
  baseUrl = getRetrievalSettings().baseUrl,
  topK = getRetrievalSettings().topK,
  timeoutMs = getRetrievalSettings().timeoutMs,
  enabled = getRetrievalSettings().enabled,
  minScore = getRetrievalSettings().minScore,
  fetchImpl = fetch
} = {}) {
  return async function retrieveContext(input) {
    const classStandard = normalizeClass(input?.classStandard);
    const query = buildRetrievalQuery({ ...(input || {}), classStandard });
    if (!enabled || query.length < 2) {
      return [];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(`${baseUrl}/retrieve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: Math.min(5, Math.max(1, topK)) }),
        signal: controller.signal
      });

      if (!response.ok) {
        console.warn(`NCERT retrieval returned HTTP ${response.status}; falling back without evidence.`);
        return [];
      }

      const payload = await response.json();
      if (!Array.isArray(payload?.documents)) {
        console.warn('NCERT retrieval returned an invalid document list; falling back without evidence.');
        return [];
      }

      const wellFormed = payload.documents.filter((d) =>
        typeof d?.title === 'string' && typeof d?.content === 'string' && d.title.trim() && d.content.trim()
      );

      // Identify target class from student context or query
      const targetClass = classStandard !== null ? classStandard : normalizeClass(query);
      const classCandidates = targetClass !== null
        ? wellFormed.filter((d) => normalizeClass(d.metadata?.class) === targetClass)
        : [];

      // Prioritize candidates matching learner's class
      let pool = classCandidates.length > 0 ? classCandidates : wellFormed;

      // Filter out preliminary / front-matter pages (pages <= 14, preface, teacher notes, publication details)
      // when the user wants lesson or chapter content, provided actual lesson content is available.
      const isLessonQuery = /\b(chapter|lesson|story|poem|teach|learn|explain|read|tell me about|what is in)\b/i.test(query);
      if (isLessonQuery) {
        const nonFrontMatter = pool.filter((d) => !isFrontMatterDoc(d));
        if (nonFrontMatter.length > 0) {
          pool = nonFrontMatter;
        }
      }
      let documents = [];

      for (const document of pool) {
        const rerankerScore = document.scores?.reranker;
        if (Number.isFinite(rerankerScore) && rerankerScore < minScore) {
          continue;
        }
        documents.push({
          title: document.title.trim(),
          content: document.content.trim(),
          classStandard: normalizeClass(document.metadata?.class)
        });
      }

      // If strict minScore dropped everything, take the top candidates from the learner's class
      if (documents.length === 0 && wellFormed.length > 0) {
        const fallbackList = classCandidates.length > 0 ? classCandidates : wellFormed;
        for (const doc of fallbackList.slice(0, 3)) {
          documents.push({
            title: doc.title.trim(),
            content: doc.content.trim(),
            classStandard: normalizeClass(doc.metadata?.class)
          });
        }
      }

      if (classStandard !== null && documents.length > 0) {
        const sameClass = documents.filter((document) =>
          document.classStandard === null || document.classStandard === classStandard);
        if (sameClass.length > 0 && sameClass.length < documents.length) {
          documents = sameClass;
        }
      }

      return documents.map(({ title, content }) => ({ title, content }));
    } catch (error) {
      if (error?.name === 'AbortError') {
        console.warn(`NCERT retrieval timed out after ${timeoutMs}ms; falling back without evidence.`);
      } else {
        console.warn(`NCERT retrieval failed (${error?.message || error}); falling back without evidence.`);
      }
      return [];
    } finally {
      clearTimeout(timeout);
    }
  };
}

export const retrieveContext = createRetriever();
