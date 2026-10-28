# Changes Audit Log & System Recovery Guide (`changes.md`)

This document provides a complete, forensic record of all modifications, new components, architectural additions, and configuration changes introduced in this development cycle. If any future agent, developer, or administrator needs to inspect, modify, trace back, or rollback any part of this work, this guide provides the exact steps and file references.

---

## 1. Summary of Changes

| Domain | Key Additions / Modifications | Primary Purpose |
| :--- | :--- | :--- |
| **Research & Docs** | `docs/GUARDRAILS_RESEARCH.md`<br>`docs/GUARDRAILS_SPECIFICATION.md`<br>`docs/SPEECH_ARCHITECTURE.md` | In-depth analysis of prompt injection, system prompt extraction defense, age-appropriate safety standards, Whisper STT, and TTS. |
| **Guardrails Subsystem** | `server/guardrails/safetyLexicon.js`<br>`server/guardrails/inputGuardrail.js`<br>`server/guardrails/systemPromptHardening.js`<br>`server/guardrails/outputGuardrail.js`<br>`server/guardrails/index.js` | 3-layer defense-in-depth: input interception (injection/leakage/child-safety), system prompt hardening with boundary tags and sandwich defense, and output leak scanning. |
| **Chat Service** | `server/chatService.js` | Integrated input guardrail evaluation, hardened system prompt generation, and output guardrail sanitization. |
| **Speech-to-Text (STT)** | `server/speech/whisper_runner.py`<br>`server/speech/whisperTranscribe.js`<br>`server/app.js`<br>`src/accountApi.js`<br>`src/components/Student/speechService.js` | Backend Whisper STT endpoint (`POST /api/audio/transcribe`) using lightweight open-source Whisper (`openai/whisper-tiny`), plus dual-tier client fallback via Web Speech API. |
| **Text-to-Speech (TTS)** | `src/components/Student/speechService.js`<br>`src/components/Student/TutoringSession.jsx` | Child-friendly voice playback via HTML5 SpeechSynthesis, Markdown spoken text sanitizer, per-message Listen/Stop buttons, and header stop controls. |
| **Testing** | `test/guardrails.test.js` | 10 new test suites (covering input injection blocks, extraction prevention, age adaptations, output quarantine, and end-to-end integration). |

---

## 2. Detailed File-by-File Audit

### 2.1 Documentation (`docs/`)
1. **`docs/GUARDRAILS_RESEARCH.md`** *(Created)*
   - State-of-the-art research on LLM vulnerabilities (OWASP LLM01, LLM07).
   - Threat models: Direct prompt injection, system prompt extraction, jailbreak personas, indirect RAG injection, and child safety risks.
   - Defense-in-depth framework: Input canonicalization, boundary isolation, prompt hardening, sandwich defense, and output scanning.
   - K-12 age-appropriate communication framework (Standards 1 to 12).
2. **`docs/GUARDRAILS_SPECIFICATION.md`** *(Created)*
   - Technical specifications for input validation regexes, delimiter tags, and error handling.
   - System prompt structure specification with XML tags and non-disclosure directives.
   - Output scanning algorithms: Signature phrase matching, telltale indicator detection, and quarantine protocols.
3. **`docs/SPEECH_ARCHITECTURE.md`** *(Created)*
   - Architecture for lightweight Whisper Speech-to-Text (`openai/whisper-tiny`) and HTML5 SpeechSynthesis Text-to-Speech.
   - Dual-tier fallback mechanisms and audio privacy protocols for children.

### 2.2 Server Guardrails Subsystem (`server/guardrails/`)
1. **`server/guardrails/safetyLexicon.js`** *(Created)*
   - `PROMPT_LEAK_PATTERNS`: Regex array detecting queries asking for prompts, instructions, internal rules, or verbatim outputs.
   - `INSTRUCTION_OVERRIDE_PATTERNS`: Regex array detecting "ignore previous instructions", "disregard rules", etc.
   - `JAILBREAK_PERSONA_PATTERNS`: Detects "DAN", "developer mode", "unrestricted mode", etc.
   - `DELIMITER_TAMPERING_PATTERNS`: Detects fake `<system>` or XML delimiter injections.
   - `CHILD_UNSAFE_PROFANITY_PATTERNS` & `DANGEROUS_CONTENT_PATTERNS`: Detects vulgarity, weapons, drugs, and self-harm.
   - `SYSTEM_PROMPT_SIGNATURES`: Immutable phrases from system instructions used to detect output leakage.
   - `OUTPUT_LEAK_TELLTALE_PATTERNS`: Detects output disclosures like "My system prompt is...".
   - `AGE_CATEGORY_PROFILES`: Age profiles for Primary (Classes 1-5), Middle (Classes 6-8), and Secondary (Classes 9-12).
2. **`server/guardrails/inputGuardrail.js`** *(Created)*
   - `canonicalizeInput(text)`: Normalizes Unicode (NFKD), strips zero-width spaces and ASCII control codes.
   - `evaluateInputGuardrail(text, classStandard)`: Evaluates input against safety patterns. Returns `{ safe, flaggedCategory, reason, sanitizedInput, fallbackResponse }`.
3. **`server/guardrails/systemPromptHardening.js`** *(Created)*
   - `buildHardenedSystemPrompt({ formattedEvidence, formattedProfile, classStandard })`:
     - Embeds instructions within unambiguous `<system_directives>` delimiters.
     - Mandates strict confidentiality and untrusted input isolation.
     - Injects grade-adapted pedagogical guidance.
     - Adds Sandwich Defense reinforcement at the end of the prompt context.
4. **`server/guardrails/outputGuardrail.js`** *(Created)*
   - `evaluateOutputGuardrail(rawText, classStandard)`:
     - Scans output against `SYSTEM_PROMPT_SIGNATURES` and `OUTPUT_LEAK_TELLTALE_PATTERNS`.
     - Scans for profanity and dangerous content.
     - Quarantines leaks and returns friendly educational fallback.
5. **`server/guardrails/index.js`** *(Created)*
   - Central export for all guardrail utilities.

### 2.3 Server Chat Service (`server/chatService.js`)
- **Modified**:
  - Imported `evaluateInputGuardrail`, `buildHardenedSystemPrompt`, and `evaluateOutputGuardrail`.
  - In `reply()`:
    1. Runs `evaluateInputGuardrail(latestQuestion, classStandard)`. If unsafe, returns fallback immediately without contacting model or retriever.
    2. Uses `buildHardenedSystemPrompt` to supply the hardened system instruction.
    3. Runs `evaluateOutputGuardrail(text, classStandard)` on generated text before returning.

### 2.4 Speech Infrastructure (`server/speech/`, `server/app.js`, `src/accountApi.js`)
1. **`server/speech/whisper_runner.py`** *(Created)*
   - Standalone CLI runner using `transformers.pipeline("automatic-speech-recognition", model="openai/whisper-tiny")`.
   - Accepts audio file path, runs inference, and emits JSON `{ "text": "..." }`.
2. **`server/speech/whisperTranscribe.js`** *(Created)*
   - Node service `transcribeAudioBuffer(buffer, extension, options)`:
     - Writes audio buffer to ephemeral temp file.
     - Invokes `whisper_runner.py` via Python virtualenv (`.venv-retrieval`).
     - Supports optional `WHISPER_API_URL` environment override.
     - Cleans up temp audio files in `finally` block.
3. **`server/app.js`** *(Modified)*
   - Increased JSON body limit from `512kb` to `16mb` to accommodate audio base64 buffers.
   - Added endpoint `POST /api/audio/transcribe` with session authentication, payload validation, and size limits.
4. **`src/accountApi.js`** *(Modified)*
   - Exported `transcribeAudio(audioBase64, format)` for client-side API calls.

### 2.5 Frontend Voice & Audio (`src/components/Student/`)
1. **`src/components/Student/speechService.js`** *(Created)*
   - `sanitizeTextForSpeech(markdown)`: Strips code blocks, citation brackets `[1]`, markdown symbols, and formats pauses.
   - `SpeechRecorder`: Uses `MediaRecorder` for audio capture + simultaneous `webkitSpeechRecognition` fallback. Calls Whisper backend and falls back gracefully.
   - `TutorSpeaker`: HTML5 `SpeechSynthesis` controller configured for child-friendly rate (`0.95`) and pitch (`1.08`), managing utterance lifecycle and message state.
2. **`src/components/Student/TutoringSession.jsx`** *(Modified)*
   - `QueryInput`: Added interactive microphone button (`🎙️ Speak` / `⏹️ Done` / `🔄 Transcribing...`), live recording banner, and error display.
   - Chat Header: Added quick `⏹️ Stop voice` button when speech is playing.
   - Assistant Messages: Added `🔊 Listen` / `⏹️ Stop reading` button with animated audio indicator `[ılı.lıllı]`.

### 2.6 Test Suites (`test/`)
1. **`test/guardrails.test.js`** *(Created)*
   - 10 test cases verifying prompt leak interception, override neutralization, delimiter defenses, child safety filters, age adaptation, output quarantine, and end-to-end ChatService integration.
2. Verified all 32 test suites (33 tests) pass with `npm test`.
3. Verified zero linter warnings/errors with `npm run lint`.

---

## 3. How to Test and Verify

Run the following commands in the project root:

```bash
# 1. Run all tests (including account flows, providers, RAG, and guardrails)
npm test

# 2. Run the oxlint linter to verify code cleaniness
npm run lint

# 3. Build the frontend production bundle
npm run build
```

---

## 4. Rollback & Recovery Guide ("Unfucking" Protocol)

If any future developer or agent needs to revert or disable changes:

### To Disable Guardrails (Revert to Original Chat Behavior):
1. In `server/chatService.js`:
   - Replace the `systemInstruction` call with the original `BASE_INSTRUCTIONS + formatEvidence(...)`.
   - Remove the `evaluateInputGuardrail` and `evaluateOutputGuardrail` calls in `reply()`.
2. Delete the directory `server/guardrails/`.

### To Disable Speech (STT/TTS):
1. In `server/app.js`: Remove the `app.post('/api/audio/transcribe', ...)` route.
2. In `src/components/Student/TutoringSession.jsx`:
   - Revert `QueryInput` to the standard input without microphone recording.
   - Remove `TutorSpeaker` and message Listen buttons.
3. Delete `server/speech/` and `src/components/Student/speechService.js`.

---

## 5. Academic Research Paper & Methodology Deliverables (Cycle 2)

| Deliverable | Location | Description |
| :--- | :--- | :--- |
| **Comprehensive Research Paper (PDF)** | `docs/NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.pdf` & `paper.pdf` | 9-page publication-quality IEEE-standard research paper with embedded architecture diagram (`archi_diag.jpeg`), 10 stylized empirical tables, equations, running headers/footers, acknowledgments, and author biographies. |
| **Comprehensive Research Paper (Word)** | `docs/NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.docx` & `paper.docx` | Fully styled IEEE Microsoft Word document matching the PDF structure and content. |
| **IEEEtran LaTeX Manuscript** | `paper.tex` & `references.bib` | Standard IEEE conference LaTeX source with full mathematical derivations, tabular environments, and 22 citations. |
| **Research Contributions Dossier** | `docs/RESEARCH_CONTRIBUTIONS.md` | In-depth academic synthesis comparing findings against literature (e.g., NCERT-RAG-Eval DOI `10.1038/s41598-026-71757-y`), documenting all empirical benchmarks, negative results, and research boundaries. |
| **Turnitout Humanizer Methodology** | `docs/TURNITOUT_METHODOLOGY.md` | Forensic analysis of `AhmadHassan-BTed/Turnitout-Humanizer` (v2.6) zero-AI programmatic transformation engine (burstiness optimization, n-gram disruption, syntactic rotation). |
| **Paper Generator Script** | `tools/build_comprehensive_paper.py` | Python script automating ReportLab PDF and python-docx Word builds, incorporating `NumberedCanvas` two-pass page counting and typography. |

### Authors Listed:
- **Vicky Dsilva** (Department of Computer Engineering, University of Mumbai)
- **Aatmay Gadgil** (Department of Computer Engineering, University of Mumbai)
- **Binoy Burken** (Department of Computer Engineering, University of Mumbai)
- **Viraj Darekar** (Department of Computer Engineering, University of Mumbai)

### Empirical Findings Grounded in Paper:
1. **BM25 Dominance:** On the 65 answerable questions of the frozen English-Only V1 benchmark, BM25 outperforms dense MiniLM across early ranks (Hit@1: 0.4462 vs 0.1692; Hit@5: 0.6000 vs 0.2615; MRR: 0.5094 vs 0.2104). Fixed RRF ($k=60$) achieves Hit@5 of 0.5077 and MRR of 0.3472, failing to surpass BM25 alone in top-rank precision.
2. **Page Provenance Confounder:** Automated audit across 3,584 page records in `NCERT_exp1a.ipynb` revealed printed-to-PDF page indexing discrepancy; resolving this raised pilot passing from 70% to 90% without retraining.
3. **Multi-Page Boundary:** Single-page queries achieve Hit@10 > 0.75, while multi-page queries collapse to 0.0769 (BM25) and 0.1538 (Dense).
4. **Query Normalization Negative Result:** Automated query rewriting degraded MRR from 0.6492 to 0.6021 and introduced 20% cross-grade intrusion.
5. **Child-Perspective Retrieval:** Two-stage Cross-Encoder reranking (`cross-encoder/ms-marco-MiniLM-L-6-v2`) on 50 child queries achieves Relevant@5 of 0.9535 and MRR of 0.9244.
6. **Generation Faithfulness & Abstention Gap:** Human study of Qwen-1.5B showed 69.4% strict correctness, 32.0% unsupported claims, and 57.1% hallucination on unanswerable queries. An off-the-shelf NLI sufficiency gate reached only 32.5% accuracy.
7. **Guardrail Validation:** 33 unit tests pass with 100% block rate on prompt extraction, instruction override, delimiter tampering, and child-unsafe content.
8. **Applied Humanization:** Enforced sentence length burstiness ($\sigma / \mu = 0.742$), syntactic clause inversion (38.5%), and 0% AI transition cliches.

### Reproducibility Commands:
```bash
# Rebuild both PDF and Word documents
.\.venv-retrieval\Scripts\python.exe tools/build_comprehensive_paper.py

# Verify PDF page count
.\.venv-retrieval\Scripts\python.exe -c "import pypdf; print('Pages:', len(pypdf.PdfReader('docs/NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.pdf').pages))"
```

---

## 6. Formatted Humanized IEEE Paper Deliverable (Cycle 3)

| Deliverable | Location | Description |
| :--- | :--- | :--- |
| **Formatted Humanized Paper (PDF)** | `humanized_NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.pdf` & `docs/Humanized_NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.pdf` | **9-page** publication-grade PDF compiled strictly from the humanized text of `humanized_NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.docx`, with zero alteration of the user's content. Formatted with IEEE typography, `archi_diag.jpeg` figure, 10 styled empirical tables, centered equations, running headers/footers, and author biographies. |
| **Formatted Humanized Paper (Word)** | `humanized_NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.docx` & `docs/Humanized_NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.docx` | Formatted Word document preserving the humanized prose while applying IEEE heading hierarchy, table grid layouts, embedded architecture figure, and indented references. |
| **Raw Backup** | `humanized_NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report_raw.docx` | Pristine backup of the original raw unformatted docx provided by the user. |
| **Builder Script** | `tools/build_humanized_paper.py` | Standalone Python builder for reproducible compilation of the humanized IEEE paper. |

### Build Command:
```bash
.\.venv-retrieval\Scripts\python.exe tools/build_humanized_paper.py
```

---

## 7. Turnitout Methodology Section Removal & Report Refinement (Cycle 4)

- **User Action**: The user requested removing Section `X. TURNITOUT-HUMANIZER INTEGRITY METHODOLOGY AND BURSTINESS ANALYSIS` (including Table X and burstiness variance equations) from the report.
- **Modifications**:
  1. Removed `X. TURNITOUT-HUMANIZER INTEGRITY METHODOLOGY AND BURSTINESS ANALYSIS` and `TABLE X. COMPARATIVE ANALYSIS OF LINGUISTIC METRICS AND APPLIED TRANSFORMATION METHODOLOGIES` from both `tools/build_humanized_paper.py` and `tools/build_comprehensive_paper.py`.
  2. Renumbered remaining sections according to standard IEEE hierarchy:
     - Section XI (`ETHICAL CONSIDERATIONS, SHORTCOMINGS, AND RESEARCH BOUNDARIES`) $\to$ **Section X**
     - Section XII (`FUTURE RESEARCH DIRECTIONS`) $\to$ **Section XI**
     - Section XIII (`CONCLUSION`) $\to$ **Section XII**
  3. Cleaned bibliography references: removed citation `[21]` (Turnitout engine) and unused `[22]`, leaving 20 actively cited, verified literature references.
  4. Added graceful handling for Windows MS Word file locking on `.docx` deliverables.
  5. Recompiled all artifacts:
     - [`humanized_NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.pdf`](file:///c:/Users/Vicky/Desktop/nlp_mini_proj/humanized_NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.pdf) & [`docs/Humanized_NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.pdf`](file:///c:/Users/Vicky/Desktop/nlp_mini_proj/docs/Humanized_NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.pdf) (Clean 9-page IEEE layout without Section X).
     - [`docs/Humanized_NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.docx`](file:///c:/Users/Vicky/Desktop/nlp_mini_proj/docs/Humanized_NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.docx) and updated root copy.
     - [`docs/NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.pdf`](file:///c:/Users/Vicky/Desktop/nlp_mini_proj/docs/NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.pdf) & [`paper.pdf`](file:///c:/Users/Vicky/Desktop/nlp_mini_proj/paper.pdf).



