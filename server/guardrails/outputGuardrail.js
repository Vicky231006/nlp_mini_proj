/**
 * outputGuardrail.js
 * Post-generation output inspection to detect and block any inadvertent
 * system prompt leakage, toxic content, or age-inappropriate emissions
 * before delivery to the learner.
 */

import {
  SYSTEM_PROMPT_SIGNATURES,
  OUTPUT_LEAK_TELLTALE_PATTERNS,
  CHILD_UNSAFE_PROFANITY_PATTERNS,
  DANGEROUS_CONTENT_PATTERNS,
  getAgeCategory
} from './safetyLexicon.js';

/**
 * Evaluates the model's generated text against leak signatures,
 * meta-disclosure patterns, and child-safety boundaries.
 *
 * @param {string} rawText - The raw output emitted by the LLM.
 * @param {number|null} classStandard - The learner's class standard (1-12).
 * @returns {{
 *   safe: boolean,
 *   sanitizedText: string,
 *   flaggedCategory: string|null,
 *   reason: string|null
 * }}
 */
export function evaluateOutputGuardrail(rawText, classStandard = null) {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    return {
      safe: false,
      sanitizedText: getAgeCategory(classStandard).fallback,
      flaggedCategory: 'EMPTY_OUTPUT',
      reason: 'Model returned an empty response string.'
    };
  }

  const trimmedText = rawText.trim();
  const lowerText = trimmedText.toLowerCase();
  const ageProfile = getAgeCategory(classStandard);

  // 1. Direct System Prompt Signature Substring Match
  for (const signature of SYSTEM_PROMPT_SIGNATURES) {
    if (lowerText.includes(signature.toLowerCase())) {
      console.warn(`[GUARDRAIL OUTPUT BLOCKED] System prompt signature detected in output: "${signature}"`);
      return {
        safe: false,
        sanitizedText: ageProfile.fallback,
        flaggedCategory: 'PROMPT_LEAKAGE_SIGNATURE',
        reason: `Output contained system prompt directive signature: ${signature}`
      };
    }
  }

  // 2. Telltale Leak Indicators
  for (const pattern of OUTPUT_LEAK_TELLTALE_PATTERNS) {
    if (pattern.test(trimmedText)) {
      console.warn('[GUARDRAIL OUTPUT BLOCKED] Output leak telltale pattern matched.');
      return {
        safe: false,
        sanitizedText: ageProfile.fallback,
        flaggedCategory: 'PROMPT_LEAKAGE_TELLTALE',
        reason: 'Output contained explicit system prompt / instruction disclosure phrasing.'
      };
    }
  }

  // 3. Child Safety Profanity Check on Output
  for (const pattern of CHILD_UNSAFE_PROFANITY_PATTERNS) {
    if (pattern.test(trimmedText)) {
      console.warn('[GUARDRAIL OUTPUT BLOCKED] Inappropriate language detected in output.');
      return {
        safe: false,
        sanitizedText: "I'm here to help you learn in a safe, positive, and friendly environment! What school topic shall we explore next?",
        flaggedCategory: 'CHILD_UNSAFE_PROFANITY',
        reason: 'Output contained profane or explicit language.'
      };
    }
  }

  // 4. Dangerous Content Check on Output
  for (const pattern of DANGEROUS_CONTENT_PATTERNS) {
    if (pattern.test(trimmedText)) {
      console.warn('[GUARDRAIL OUTPUT BLOCKED] Dangerous content pattern detected in output.');
      return {
        safe: false,
        sanitizedText: "Let's focus on fun, safe, and exciting educational topics! What would you like to learn about today?",
        flaggedCategory: 'DANGEROUS_CONTENT',
        reason: 'Output contained dangerous, self-harm, or weapons content.'
      };
    }
  }

  // Output is safe and clean
  return {
    safe: true,
    sanitizedText: trimmedText,
    flaggedCategory: null,
    reason: null
  };
}
