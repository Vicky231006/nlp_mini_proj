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
    .replace(/\bfifth\s+chapter\b/gi, 'Chapter 5');

  const parsedClass = normalizeClass(classStandard);
  if (parsedClass && !/\b(class|standard|grade)\s*\d+\b/i.test(normalized)) {
    const isEnglish = /\benglish\b/i.test(normalized);
    const isMath = /\bmathematics\b/i.test(normalized);
    const isEvs = /\bthe world around us\b/i.test(normalized);
    const isArts = /\b(arts|drawing|craft|bansuri)\b/i.test(normalized);
    const isPE = /\b(khel|yoga|physical)\b/i.test(normalized);
    let bookHint = '';
    let chapterExtra = '';

    const chapterMatch = normalized.match(/\bchapter\s+(\d+)\b/i);
    const chNum = chapterMatch ? parseInt(chapterMatch[1], 10) : null;

    if (parsedClass <= 2) {
      if (isEnglish) {
        bookHint = 'Mridang';
        if (chNum === 1) chapterExtra = parsedClass === 1 ? 'Two Little Hands Unit 1' : 'My Bicycle Unit 1';
        else if (chNum === 2) chapterExtra = parsedClass === 1 ? 'Greetings' : 'Seeing without Seeing It is Fun Unit 2';
        else if (chNum === 3) chapterExtra = parsedClass === 1 ? 'Picture Time Life Around Us' : 'Going Places Come Back Soon';
      } else if (isMath) {
        bookHint = 'Joyful-Mathematics';
        if (chNum === 1) chapterExtra = parsedClass === 1 ? 'Finding the Furry Cat' : 'A Day at the Beach';
        else if (chNum === 2) chapterExtra = parsedClass === 1 ? 'What is Long What is Round Shapes' : 'Shapes Around Us';
        else if (chNum === 3) chapterExtra = parsedClass === 1 ? 'Mango Treat Numbers' : 'Fun with Numbers';
        else if (chNum === 4) chapterExtra = parsedClass === 1 ? 'Making 10' : 'Shadow Story Counting Diyas';
      }
    } else if (parsedClass <= 4) {
      if (isEnglish) {
        bookHint = 'Santoor';
        if (chNum === 1) chapterExtra = parsedClass === 3 ? 'Colours Unit 1' : 'Together We Can Unit 1';
        else if (chNum === 2) chapterExtra = parsedClass === 3 ? 'Badal and Moti' : 'The Tinkling Bells';
        else if (chNum === 3) chapterExtra = parsedClass === 3 ? 'Best Friends' : 'Be Smart Be Safe';
        else if (chNum === 4) chapterExtra = parsedClass === 3 ? 'Out in the Garden' : 'One Thing at a Time';
      } else if (isMath) {
        bookHint = parsedClass === 3 ? 'Maths_Mela' : 'Math-Mela';
        if (chNum === 1) chapterExtra = parsedClass === 3 ? 'Whats in a Name' : 'Finding Symmetry';
        else if (chNum === 2) chapterExtra = parsedClass === 3 ? 'Toy Joy' : 'Large World of Numbers';
        else if (chNum === 3) chapterExtra = parsedClass === 3 ? 'Double Century' : 'Trip to Bhopal';
      } else if (isEvs) {
        bookHint = parsedClass === 3 ? 'Our_Wondrous_World' : 'Our_Wonderous_World';
        if (chNum === 1) chapterExtra = parsedClass === 3 ? 'Family and Friends Unit 1' : 'Living Together Unit 1';
        else if (chNum === 2) chapterExtra = parsedClass === 3 ? 'Going to the Mela' : 'Exploring Our Neighbourhood';
        else if (chNum === 3) chapterExtra = parsedClass === 3 ? 'Celebrating Festivals' : 'Nature Trail';
      } else if (isArts) {
        bookHint = parsedClass === 3 ? 'Bansuri_-_I' : 'Bansuri';
      } else if (isPE) {
        bookHint = 'Khel_Yoga';
      }
    }
    normalized = `Class ${parsedClass} ${bookHint} ${normalized} ${chapterExtra}`.replace(/\s+/g, ' ').trim();
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

      // Keep only well-formed docs; drop bad rows instead of failing chat.
      // Title already carries "Class | Subject | Book | pages X" from Python.
      // Then cut everything below the reranker relevance bar, so the chat
      // shows super-relevant sources only instead of all 5 candidates.
      let documents = [];
      for (const document of payload.documents) {
        if (
          typeof document?.title !== 'string'
          || typeof document?.content !== 'string'
          || !document.title.trim()
          || !document.content.trim()
        ) {
          continue;
        }
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

      // If minScore dropped all documents, keep the best candidate matching
      // the learner's class (or the highest scoring candidate) so the tutor
      // is not starved of evidence.
      if (documents.length === 0 && payload.documents.length > 0) {
        const wellFormed = payload.documents.filter((d) =>
          typeof d?.title === 'string' && typeof d?.content === 'string' && d.title.trim() && d.content.trim()
        );
        const matchingClass = classStandard !== null
          ? wellFormed.filter((d) => normalizeClass(d.metadata?.class) === classStandard)
          : [];
        const fallbackDocs = matchingClass.length > 0 ? matchingClass : wellFormed;
        for (const doc of fallbackDocs.slice(0, 3)) {
          documents.push({
            title: doc.title.trim(),
            content: doc.content.trim(),
            classStandard: normalizeClass(doc.metadata?.class)
          });
        }
      }

      // When the learner's class is known, prefer sources written for it.
      // If nothing from that class survived, fall back to all relevant docs
      // rather than answering with no evidence at all.
      if (classStandard !== null) {
        const sameClass = documents.filter((document) =>
          document.classStandard === null || document.classStandard === classStandard);
        if (sameClass.length > 0 && sameClass.length < documents.length) {
          console.info(
            `NCERT retrieval kept ${sameClass.length}/${documents.length} Standard-${classStandard} documents.`
          );
          documents = sameClass;
        }
      }
      if (documents.length < payload.documents.length) {
        console.info(
          `NCERT retrieval kept ${documents.length}/${payload.documents.length} documents (minScore=${minScore}).`
        );
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
