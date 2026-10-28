/**
 * inputGuardrail.js
 * Pre-generation input screening to prevent prompt injection,
 * system prompt extraction, jailbreaks, and unsafe content emission.
 */

import {
  PROMPT_LEAK_PATTERNS,
  INSTRUCTION_OVERRIDE_PATTERNS,
  JAILBREAK_PERSONA_PATTERNS,
  DELIMITER_TAMPERING_PATTERNS,
  CHILD_UNSAFE_PROFANITY_PATTERNS,
  DANGEROUS_CONTENT_PATTERNS,
  getAgeCategory
} from './safetyLexicon.js';

/**
 * Normalizes input text to neutralize invisible characters,
 * Unicode homoglyphs, and delimiter trickery.
 */
export function canonicalizeInput(rawText) {
  if (typeof rawText !== 'string') return '';
  return rawText
    .normalize('NFKD')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width spaces & joiners
    // oxlint-disable-next-line eslint/no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, ' ')      // ASCII control characters
    .replace(/\s+/g, ' ')                  // Collapse multiple whitespace
    .trim();
}

/**
 * Evaluates a user input against deterministic security and child-safety rules.
 *
 * @param {string} text - The latest user prompt or message content.
 * @param {number|null} classStandard - The learner's school class standard (1-12).
 * @returns {{
 *   safe: boolean,
 *   flaggedCategory: string|null,
 *   reason: string|null,
 *   sanitizedInput: string,
 *   fallbackResponse: string|null
 * }}
 */
export function evaluateInputGuardrail(text, classStandard = null) {
  const sanitizedInput = canonicalizeInput(text);
  const ageProfile = getAgeCategory(classStandard);

  if (!sanitizedInput) {
    return {
      safe: false,
      flaggedCategory: 'EMPTY_INPUT',
      reason: 'User input was empty after normalization.',
      sanitizedInput: '',
      fallbackResponse: ageProfile.fallback
    };
  }

  // 1. System Prompt Leakage & Extraction Detection
  for (const pattern of PROMPT_LEAK_PATTERNS) {
    if (pattern.test(sanitizedInput)) {
      return {
        safe: false,
        flaggedCategory: 'PROMPT_LEAK_ATTEMPT',
        reason: 'Attempted to inspect, extract, or repeat system prompt / developer instructions.',
        sanitizedInput,
        fallbackResponse: ageProfile.fallback
      };
    }
  }

  // 2. Direct Instruction Override & Reset Detection
  for (const pattern of INSTRUCTION_OVERRIDE_PATTERNS) {
    if (pattern.test(sanitizedInput)) {
      return {
        safe: false,
        flaggedCategory: 'INSTRUCTION_OVERRIDE',
        reason: 'Attempted to override, ignore, or cancel system instructions.',
        sanitizedInput,
        fallbackResponse: ageProfile.fallback
      };
    }
  }

  // 3. Jailbreak Personas & Rogue AI Modes
  for (const pattern of JAILBREAK_PERSONA_PATTERNS) {
    if (pattern.test(sanitizedInput)) {
      return {
        safe: false,
        flaggedCategory: 'JAILBREAK_PERSONA',
        reason: 'Attempted to invoke a jailbreak persona, developer mode, or unrestricted mode.',
        sanitizedInput,
        fallbackResponse: ageProfile.fallback
      };
    }
  }

  // 4. Delimiter & Prompt Structure Tampering
  for (const pattern of DELIMITER_TAMPERING_PATTERNS) {
    if (pattern.test(sanitizedInput)) {
      return {
        safe: false,
        flaggedCategory: 'DELIMITER_TAMPERING',
        reason: 'Attempted to inject prompt boundary tags or delimiters.',
        sanitizedInput,
        fallbackResponse: ageProfile.fallback
      };
    }
  }

  // 5. Profanity & Sexually Explicit Content (Child Safety)
  for (const pattern of CHILD_UNSAFE_PROFANITY_PATTERNS) {
    if (pattern.test(sanitizedInput)) {
      return {
        safe: false,
        flaggedCategory: 'CHILD_UNSAFE_PROFANITY',
        reason: 'Input contains vulgar, sexually suggestive, or profane language.',
        sanitizedInput,
        fallbackResponse: "Let's keep our conversation kind, clean, and focused on learning! What school subject or puzzle would you like to explore today?"
      };
    }
  }

  // 6. Dangerous Content, Weapons & Self-Harm
  for (const pattern of DANGEROUS_CONTENT_PATTERNS) {
    if (pattern.test(sanitizedInput)) {
      return {
        safe: false,
        flaggedCategory: 'DANGEROUS_CONTENT',
        reason: 'Input touches on self-harm, weapons, or dangerous activities.',
        sanitizedInput,
        fallbackResponse: "Your safety and well-being are the most important things! If you are ever feeling sad, hurt, or in danger, please reach out to a parent, teacher, or trusted adult right away. I'm here to help you learn and practice fun puzzles whenever you're ready."
      };
    }
  }

  return {
    safe: true,
    flaggedCategory: null,
    reason: null,
    sanitizedInput,
    fallbackResponse: null
  };
}
