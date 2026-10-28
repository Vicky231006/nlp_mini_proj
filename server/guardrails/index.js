/**
 * index.js
 * Central export for all guardrail subsystems: input evaluation,
 * system prompt hardening, output evaluation, and safety lexicons.
 */

export { evaluateInputGuardrail, canonicalizeInput } from './inputGuardrail.js';
export { buildHardenedSystemPrompt } from './systemPromptHardening.js';
export { evaluateOutputGuardrail } from './outputGuardrail.js';
export { getAgeCategory, AGE_CATEGORY_PROFILES } from './safetyLexicon.js';
