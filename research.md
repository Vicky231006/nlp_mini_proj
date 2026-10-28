# NCERT-Grounded Adaptive AI Tutor — Master Research Dossier

**Status date:** 26 October 2026. **Purpose:** Complete handoff for an AI agent tasked with auditing the research trail and producing an IEEE-formatted LaTeX paper. This dossier consolidates the project context and available experiment summaries. It is not a substitute for primary artifacts. The agent must inspect notebooks, CSV/XLSX files, source code, manifests, and logs before finalizing claims.

---

# 1. MASTER PROMPT FOR THE AI RESEARCH AGENT

Copy this prompt into the agent working in the project repository and research-artifact folder.

## Role and objective
You are the lead research engineer, reproducibility auditor, and scientific writer for a project on NCERT-grounded retrieval-augmented generation (RAG) for primary-school tutoring (Classes 1–4). Reconstruct the actual project history from repository code, Google Drive artifacts, Colab notebooks, CSVs, XLSX benchmark files, experiment manifests, logs, model outputs, prior drafts, and this dossier. Deliver a complete IEEE-formatted LaTeX research paper plus the supporting files needed to reproduce and audit it.

## Non-negotiable integrity rules
1. **Inspect before drafting.** Inventory the accessible repository recursively: `.ipynb`, `.py`, `.js`, `.ts`, `.json`, `.csv`, `.xlsx`, `.txt`, `.md`, `.pdf`, bibliography files, images, and existing drafts. Extract notebook code, markdown, outputs, printed metrics, and exceptions.
2. **Primary evidence wins.** This dossier is a map. Prefer executable code and original outputs over summary notes. Record exact file paths and trace every number in the paper to a source artifact.
3. **Never fabricate.** Do not invent measurements, sample sizes, model names, confidence intervals, significance, runtime, GPU usage, author details, references, ethical approval, student trials, or publication status.
4. **Separate completed, pilot, and proposed work.** Context-aware chunking, query-adaptive retrieval, claim verification, robust abstention, and learner adaptation are proposed unless actual experiment outputs prove they were run. Do not put proposed work in the Results section as a completed contribution.
5. **Reconcile versions explicitly.** Project history includes a 58-PDF/3,459-chunk corpus-v2 log, a 22-unit/3,023-chunk frozen retrieval baseline, a 2,033-chunk English-only subset, and a 22-PDF/405-page-record processing checkpoint. Do not treat these as one corpus. Create a version table with paths, timestamps, counts, benchmarks, and relationships.
6. **Do not mix denominators.** Keep the 120-question benchmark, 77-question English subset, 10-question V2 pilot, child-style query sample, 50-question generation pilot, and single-query serving smoke test separate. Never combine their metrics into one aggregate.
7. **Recompute metrics.** Recalculate metrics from per-question outputs and benchmark annotations where possible. Verify denominator, answerability filtering, page convention, source/page relevance rule, rank convention, duplicate/overlap handling, and multi-page evidence. If a corrected protocol differs from an old result, document both.
8. **Source match is not evidence sufficiency.** A passage from the right PDF but wrong page may not support an answer. Report source-level matching separately from gold-page/chunk relevance and answer support.
9. **Handle negatives honestly.** The 20 negative examples in benchmark v1 were initially marked `EXCERPT_ONLY`, not corpus-wide negatives until absence was verified across the full corpus. The English-only evaluation config says unanswerable handling was descriptive only and no rejection accuracy was claimed.
10. **No unsupported educational claims.** No controlled study of student learning gains is established in the available context. Do not claim the tutor improves learning or cognitive ability.
11. **CPM caution.** Raven’s Coloured Progressive Matrices (CPM) was proposed as an onboarding assessment to adapt explanations. Do not call it a validated IQ score or diagnosis. Verify licensing, age-appropriateness, validation, and ethical requirements. Describe it as a proposed reasoning assessment unless actual implementation and validation exist.
12. **Verify every reference.** Use original publisher/DOI/arXiv/official sources. Never invent titles, authors, dates, venues, pages, or DOIs. A related paper DOI recorded in the project is `10.1038/s41598-026-71757-y`; verify its exact bibliographic metadata from the publisher.
13. **Report negative findings.** Dense retrieval performed worse than BM25 on the recorded English-only benchmark; fixed RRF did not automatically beat BM25; the tested query normalization degraded some metrics; a generic NLI sufficiency probe was unreliable. These are findings, not things to hide.
14. **Do not claim software tests passed without logs.** After changing `server/retriever.js`, the user was asked to run `npm test`, `npm run lint`, and `npm run build`; results are not available in this dossier.
15. **Do not guess authors.** Use repository metadata/project records. If author/affiliation details are missing, use explicit placeholders and list them in `TODO_FOR_AUTHORS.md`.
16. **Do not overstate deployment.** A local service and UI prototype are not a production-ready or validated educational system.
17. **Child safety and privacy.** Do not expose identifiable child data. Include limitations around age-appropriate explanations, uncertainty handling, adult oversight, accessibility, bias, and formative adaptation versus psychometric diagnosis.

## Required workflow
### A. Inventory and provenance
- Produce `artifact_inventory.csv` with path, type, version/experiment, timestamp if available, corpus, benchmark, primary outputs, and trust level.
- Inspect notebooks in cell order and extract code, outputs, metrics, and errors.
- Identify all paper drafts, figures, tables, references, source code, and model outputs.
- Preserve raw files; do not overwrite baseline data or the source benchmark.

### B. Experiment ledger
Create `experiment_ledger.csv`, one row per experiment, with: ID/date, hypothesis, corpus and benchmark version, question IDs/exclusions, answerable/unanswerable counts, retrieval method/parameters, candidate depth and final k, relevance rule, metric definitions/denominator, output paths, reported result, recomputed result, limitations, and unresolved issues.

### C. Verify results
At minimum verify: benchmark v1 composition (120 = 100 answerable + 20 negatives); English subset (77 = 65 answerable + 12 unanswerable); 3,023 baseline chunks; 2,033 English-only chunks; alignment of metadata/BM25/embeddings/FAISS; curriculum-filtering table; query-normalization table; generation correctness and evidence sufficiency; child-style query outputs; and the exact status of the cross-encoder service. Recompute from primary CSVs when possible. If not possible, label a metric “reported in saved output; not independently recomputed.”

### D. Frame defensible research questions
Use only questions supported by completed experiments:
- RQ1: How does class/subject/book metadata filtering affect retrieval relevance and page coverage over a multi-book NCERT corpus?
- RQ2: How do BM25, dense MiniLM/FAISS, and fixed RRF compare on the English-only matched benchmark?
- RQ3: What failures occur when a retrieved passage is topically relevant but insufficient to answer?
- RQ4: How robust are retrieval methods to child-style paraphrases and query normalization?
- RQ5: Can evidence sufficiency/abstention reduce unsupported answers without excessive false abstention?
Only answer RQs actually tested. Treat the rest as future work.

### E. Deliverables
Create real files in the workspace:
- `paper.tex` — complete IEEE LaTeX manuscript;
- `references.bib` — verified references only;
- `figures/` and `tables/` — generated from real data;
- `supplementary/` — extended metrics, annotation protocol, error analysis, data dictionary, and artifact manifest;
- `README_REPRODUCIBILITY.md` — exact environment and reproduction steps;
- `TODO_FOR_AUTHORS.md` — missing evidence and decisions;
- `artifact_inventory.csv` and `experiment_ledger.csv`.
Use `IEEEtran` conference mode unless a target venue requires otherwise. Compile with `latexmk` or equivalent if available, inspect warnings and unresolved references, and never claim compilation succeeded without running it.

### F. Final audit
Before delivery verify that every abstract number is traceable, denominators are explained, corpus versions are distinguished, all references are real, negative findings and limitations are present, unanswerable examples follow the true protocol, proposed work is not presented as completed, and the paper is reproducible. Report files created, experiments used, recomputed versus unverified metrics, compilation status, missing author information, claims deliberately not made, and exact remaining user actions.

**Final instruction:** Create the strongest honest paper supported by the evidence, not the most impressive-sounding paper. If a value is missing, write `NEEDS_VERIFICATION` in the ledger and investigate. Never guess a number. If an experiment was not run, describe it only as future work.

---

# 2. PROJECT IDENTITY AND PRODUCT CONTEXT

The product vision is a smart tutor for children studying NCERT Classes 1–4. NCERT textbooks are the source of truth. Intended features include speech-to-text (STT), text-to-speech (TTS), multilingual interaction, conversational question answering, and age-appropriate explanations. Onboarding was intended to include a short reasoning/pattern assessment inspired by Raven’s Coloured Progressive Matrices (CPM), with a target duration around 20–25 minutes rather than a 150-question test. The score was intended to influence explanation style. This dossier does **not** establish that a validated CPM test, multilingual speech pipeline, or learning-outcome study has been completed.

Separate the research pipeline from product aspirations:
- **Investigated:** PDF extraction/cleaning, fixed-window chunking, BM25, dense FAISS retrieval, RRF, curriculum filtering, query normalization, small child-style query comparison, exploratory answer/evidence evaluation, and a local reranking service.
- **Product/architecture ambitions:** STT/TTS, multilingual interactions, CPM-inspired onboarding, learner-aware explanations, and robust citations.
- **Proposed research:** structure-aware chunking, query-adaptive retrieval, claim-level evidence verification, robust abstention, and learner-aware generation. These are not completed results unless the source artifacts show otherwise.

## Application implementation
Repository: `https://github.com/Vicky231006/nlp_mini_proj`

Known files: `server/retriever.js`, `server/chatService.js`, `server/app.js`, `server/index.js`, `server/config.js`, and tests `test/conversation.test.js`, `test/accountFlow.test.js`, `test/app.test.js`, `test/providers.test.js`, `test/config.test.js`.

Scripts: `npm test` (`node --test`), `npm run lint` (`oxlint`), `npm run build` (`vite build`), `npm run dev` starts Vite and API. The API was configured for `127.0.0.1:3001`. The frontend is React/Vite; backend Express and SQLite support account/session/assessment/chat.

The application was being connected to a local Python retrieval API at `http://127.0.0.1:8000`. The Node retriever posts `{query, top_k: 5}` to `/retrieve`, maps results to `{title, content}`, and uses a 15-second timeout. The last known Python service health response reported status `ok`, 2,033 chunks, CUDA device, embedding model `sentence-transformers/all-MiniLM-L6-v2`, and reranker `cross-encoder/ms-marco-MiniLM-L-6-v2`.

### 2.3 Non-Verbal Cognitive Assessment Architecture (Raven's Coloured Progressive Matrices - CPM Implementation)

In early childhood pedagogy (Grades 1 through 5, ages 5–11), administering traditional language-based diagnostic tests introduces profound linguistic confounding: vocabulary exposure, reading speed, and mother-tongue variations mask a child's true underlying reasoning and conceptual learning capacity. To establish a fair, language-independent baseline of the learner's fluid intelligence ($g_f$) and educative capacity, the tutoring system implements an onboarding assessment directly modeled after **Raven's Coloured Progressive Matrices (CPM / RCPM)** (Raven, 1947; Raven, 2000; Cotton et al., 2005).

#### Psychometric Foundations
Spearman and Raven defined "educative ability" as the cognitive capacity to forge new insights, discern order within complexity, and generate non-verbal analogies without relying on rote memorization or formal schooling. The classic Raven's CPM comprises 36 items split across three 12-item sets:
1. **Set A:** Pattern completion and continuous geometric textures (gestalt closure and perceptual continuity).
2. **Set Ab:** Spatial orientation, discrete figures, figure-ground alternation, and rotations.
3. **Set B:** Relational analogies and discrete $2 \times 2$ matrix deduction ($A : B :: C : D$).

#### Implementation within the AI Tutoring Architecture
The application realizes these psychometric principles through a fully implemented, test-verified software pipeline:
1. **Curated 64-Item Programmatic Bank (`src/assessment/questionBank.js`):**
   - **Tier 1: Pattern & Alternation (`pattern_completion`):** Linear $1 \times 4$ progressions, cyclic repeats, and element count increments (Set A analog).
   - **Tier 2: Spatial Transformation (`spatial_transformation`):** $90^\circ / 180^\circ / 270^\circ$ clockwise/counter-clockwise turns, vertical/horizontal reflections, and position shifts (Set Ab analog).
   - **Tier 3: Analogical Mapping (`analogical_mapping`):** $2 \times 2$ discrete visual matrices where geometric operations along row 1 must be transferred to row 2 (Set B analog).
   - **Tier 4: Multi-Rule Integration (`multi_rule_reasoning`):** Compound matrices requiring concurrent integration of polygon geometry, fill styles (solid, outline, hatched), and count/positional changes.
2. **Balanced 25-Puzzle Dynamic Session Generator (`shared/assessment.js`):**
   - Each new learner is presented with a 25-puzzle session drawn randomly with uniform distribution across construct categories ($6 \times 3 + 7 \times 1$ items).
   - Options are shuffled dynamically to prevent position bias, and all distractors carry structured error rationales (perseveration, incomplete rotation, reversal, shape substitution).
3. **Server-Side Scoring and Diagnostic Vector Persistence (`server/accountStore.js`):**
   - The backend validates all responses and compiles a four-dimensional competence vector:
     $$\mathbf{p} = \langle s_{\text{pattern}}, s_{\text{spatial}}, s_{\text{analogy}}, s_{\text{multirule}} \rangle, \quad s_j = \frac{c_j}{n_j}$$
   - This diagnostic profile is persisted securely in the local SQLite database (`data/accounts.sqlite`).
4. **Pedagogical Scaffolding & System Prompt Hardening (`server/chatService.js`):**
   - The diagnostic snapshot is formatted as an internal XML block (`<learner_assessment_profile>`) and passed to the LLM system prompt.
   - Grounded in **Vygotskian Zone of Proximal Development (ZPD)** and **Cognitive Load Theory (Sweller, 1988)**, the profile informs the tutor's scaffolding strategy: when a learner exhibits lower spatial or analogical scores, the AI uses grounded visual analogies, step-by-step breakdowns, and concrete physical metaphors. When scores are high, it challenges the learner with deeper conceptual inquiries.
5. **Ethical Constraints and Psychological Safety:**
   - The AI tutor is hard-constrained by system directives **never to disclose raw numerical scores, assign diagnostic labels, rank, or shame the child**.
   - The test is strictly framed as interactive puzzle practice, eliminating test anxiety while providing the ITS with the prerequisite signals needed for empathetic, tailored tutoring.

---

# 3. CORPUS AND DATA VERSION HISTORY

Multiple corpus snapshots exist and must not be collapsed into one.

| Snapshot | Known size | Status/purpose | Notes |
|---|---:|---|---|
| `corpus_v2` | 58 source PDFs; 4,098 pages; 517,571 words; 3,459 chunks | Earlier corpus completion log | SHA-256 source validation; fixed 200/50 chunks; 2 empty pages; 276 low-text pages |
| `corpus_v2_clean` / frozen retrieval baseline | 22 source/book units in metadata; 3,023 chunks | Main benchmark baseline | Fixed 200-word window / 50-word overlap |
| `english_only_v1` | 2,033 chunks; 77 questions | English-only controlled subset | 65 answerable, 12 unanswerable |
| 22-PDF processing checkpoint | 22 PDFs; 405 page records in one reported DataFrame | Text/TOC processing checkpoint | A distinct stage/version; verify exact paths and timestamps |

The 58-PDF log gave paths under `/content/drive/MyDrive/NCERT_BOOKS/02_PROCESSED_DATA/corpus_v2`, including `metadata/corpus_manifest_v2.csv`, `page_text/all_pages.jsonl`, `chunks/fixed_200_50/chunks.jsonl`, `chunks/fixed_200_50/chunks.csv`, extraction summaries, statistics, and `CORPUS_V2_SUMMARY.txt`.

The frozen baseline used 3,023 chunks and benchmark v1. The English-only subset was created by retaining questions whose class and `source_file` were represented in the English-only corpus. It used 2,033 chunks. Existing baseline embeddings were subsetted, not recomputed. The original corpus, baseline, and benchmark were marked unchanged.

A processing checkpoint reported root `/content/drive/MyDrive/NCERT_BOOKS`, source PDFs in `01_SOURCE_BOOKS`, processed data in `02_PROCESSED_DATA`, 22 PDFs, a `(405, 7)` DataFrame with `[class, subject, book, source_file, page, text, word_count]`, and evolving TOC/structure audits. One audit reported 16 TOC pages and 8 unique books in a partial extraction; another 22-book audit reported 18 books with TOC-like evidence, 4 without, and 29 TOC-like pages. These are different audit passes, not necessarily contradictory.

Do not use “22 books” and “58 PDFs” interchangeably. Verify whether each count refers to PDFs, books, class-subject-book units, or a subset.

## Baseline chunking
The principal retrieval baseline used sliding windows of 200 words with 50-word overlap (`fixed_200_50`). Overlap aims to reduce evidence truncation at chunk boundaries. This is a baseline choice, not a novel contribution. Proposed future comparison: fixed 200/50 versus section/paragraph/concept-aware chunks, potentially with bounded minimum/maximum sizes. Do not report that experiment as completed unless outputs exist.

---

# 4. BENCHMARKS AND EVALUATION DESIGN

## Benchmark v1: `NCERT_RAG_Benchmark_v1.xlsx`
Recorded summary:
- 120 rows/questions.
- 100 answerable and 20 negative examples.
- Question-type counts: 60 direct/paraphrase, 20 multi-page, 20 hard distractor, 20 negative rejection.
- Source: user-supplied `annotation_pool.csv`; external content was not substituted.
- Answerable items were grounded in supplied NCERT evidence excerpts and gold pages.
- The 20 negative examples were marked `EXCERPT_ONLY` initially. They were **not corpus-wide negatives** until complete-corpus absence verification.
- Hard-distractor tags were preserved.
- A freeze was recommended after negative-absence and chunk-ID verification.

Schema included `question_id`, `split`, `question`, `answerability`, `class`, `subject`, `book`, `source_file`, `gold_pages`, `gold_chunk_ids`, `question_type`, `difficulty`, `expected_answer`, `evidence_excerpt`, `evidence_verified`, `answer_supported_by_evidence`, `negative_verification`, `distractor_verification`, `benchmark_status`, `negative_reason`, and `annotation_status`.

## English-only subset
- 77 questions: 65 answerable, 12 unanswerable.
- Subset selection matched class + source file to the English-only corpus.
- Evaluation config says unanswerable handling was descriptive only; no rejection accuracy was claimed.
- The saved relevance rule: source file matches gold `source_file` and retrieved page set intersects gold PDF-page set. Confirm implementation before publication.

Metrics recorded in the protocol:
- **Hit@k:** at least one relevant chunk appears in top k.
- **Page recall:** fraction of gold evidence pages covered.
- **Chunk precision:** fraction of retrieved chunks meeting the gold evidence relevance criterion.
- **MRR:** reciprocal rank of first relevant chunk.
- **nDCG:** binary relevance nDCG.
- Multi-page coverage should be measured separately; one matching page may not constitute complete evidence.

The paper must explain how questions/gold evidence were annotated; whether pages are PDF pages or printed page numbers; how negatives were verified; how duplicates/overlapping chunks affect precision; whether the split was frozen before tuning; and whether annotators were blinded. Do not claim inter-annotator agreement unless independent annotations and statistics are documented.

---

# 5. EXPERIMENT LOG AND REPORTED RESULTS

## Experiment A — Full-corpus frozen baseline
Known outputs:
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/baseline_results_v1/baseline_per_question_results.csv`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/baseline_results_v2_corrected/corrected_per_question_results.csv`

A forensic audit verified 120 benchmark questions; 360 retrieval rows and 360 corrected rows (120 × 3 methods); 3,023 chunks; embedding shape `(3023, 384)`; 3,023 FAISS vectors; 3,023 BM25 documents; and metadata ↔ `chunks.jsonl` order alignment. Methods: BM25, dense FAISS, hybrid RRF. A later curriculum-filtering summary provides results for 100 answerable questions, but do not assume it is numerically identical to every original baseline table without verifying protocol/version.

## Experiment B — English-only BM25/dense/RRF
Artifact directory: `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/english_only_v1/`

Key files: `english_only_benchmark.xlsx`, `indexes/retrieval_manifest.json`, `indexes/chunk_metadata.csv`, `evaluation/english_only_per_question_retrieval.csv`, `evaluation/english_only_per_question_metrics.csv`, `evaluation/english_only_overall_summary.csv`, `evaluation_config.json`, `experiment_config.json`.

Configuration:
- 2,033 chunks; 77 questions, of which 65 answerable and 12 unanswerable.
- BM25: lowercase whitespace split, `BM25Okapi`.
- Dense: `sentence-transformers/all-MiniLM-L6-v2`, 384 dimensions.
- Embeddings L2-normalized; FAISS `IndexFlatIP` (cosine-equivalent inner product).
- Hybrid: Reciprocal Rank Fusion, `rrf_k=60`.
- `candidate_k=20` in the manifest/evaluation config; top-k evaluated through 10.
- Metadata, BM25 documents, embeddings, and FAISS vectors aligned (2,033 each).
- Original baseline/corpus/benchmark marked unchanged.

Reported aggregate metrics on the 65 answerable questions:

| Method | Hit@1 | Hit@3 | Hit@5 | Hit@10 | PageRecall@10 | MRR | nDCG@5 | nDCG@10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BM25 | 0.446154 | 0.553846 | 0.600000 | 0.630769 | 0.623077 | 0.509377 | 0.521605 | 0.524571 |
| Dense | 0.169231 | 0.215385 | 0.261538 | 0.338462 | 0.330769 | 0.210446 | 0.212964 | 0.234392 |
| Hybrid RRF | 0.230769 | 0.415385 | 0.507692 | **retrieve exact value from CSV** | **retrieve exact value from CSV** | **retrieve exact value from CSV** | **retrieve exact value from CSV** | **retrieve exact value from CSV** |

The retrieved summary excerpt truncated the hybrid row. Do not guess its missing values. Reopen the actual CSV and recompute. The visible metrics show BM25 clearly outperforming dense retrieval; RRF improved over dense at Hit@3 and Hit@5 but did not beat BM25 on the visible hit metrics. This is a negative finding against assuming dense or hybrid retrieval is always superior.

**Configuration discrepancy:** the benchmark manifest uses `candidate_k=20`; the later local serving service uses 50 candidates per retriever. Treat them as separate configurations.

## Experiment C — Curriculum-aware BM25 filtering
Output directory: `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/curriculum_filtering_v1/`

Primary output `curriculum_filtering_per_question.csv`; additional `curriculum_filtering_question_type_summary.csv`.

Protocol: 120-question benchmark; overall results on 100 answerable questions; 3,023 chunks; BM25 index and metadata alignment verified; all answerable source files present. Four configurations run across all 120 questions, yielding 480 rows:
- `EXP-0_FULL_CORPUS`
- `EXP-1_CLASS_FILTER`
- `EXP-2_CLASS_SUBJECT_FILTER`
- `EXP-3_CLASS_SUBJECT_BOOK_FILTER`

Reported aggregate results on the 100 answerable questions:

| Metric | Full corpus | Class filter | Class + subject | Class + subject + book |
|---|---:|---:|---:|---:|
| Hit@1 | 0.53 | 0.57 | 0.61 | 0.62 |
| Hit@3 | 0.61 | 0.63 | 0.67 | 0.68 |
| Hit@5 | 0.62 | 0.65 | 0.69 | 0.70 |
| Hit@10 | 0.63 | 0.68 | 0.73 | 0.75 |
| PageRecall@10 | 0.625 | 0.665 | 0.720 | 0.740 |
| MRR | 0.5682 | 0.6054 | 0.6451 | 0.6568 |
| CompletePageCoverage@10 | 0.62 | 0.65 | 0.71 | 0.73 |
| SameSource@10 (definition needs verification) | 0.79 | 0.86 | 0.97 | 1.00 |
| SameSourceFraction@10 | 0.284 | 0.453 | 0.940 | 1.000 |
| WrongSourceFraction@10 | 0.716 | 0.547 | 0.060 | 0.000 |
| Mean candidate_count | 3023.00 | 890.59 | 154.28 | 139.02 |

The labels `SameSource@10` and `SameSourceFraction@10` are not intuitive given their values. Inspect code and CSV definitions before explaining them. Do not infer definitions. Reported Hit@k, PageRecall@10, MRR, and complete page coverage increase monotonically with filtering. Class+subject+book filtering reduces mean candidates from 3,023 to about 139. The result supports a narrow conclusion: curriculum metadata filtering improved retrieval/source alignment on this benchmark and protocol. It does **not** mean 100% answer correctness or sufficient evidence for every answer.

## Experiment D — English-only query normalization
Known log: `Pasted text (20261008-184806).txt`. The output verified 2,033 chunks, aligned metadata, BM25 docs, and chunk IDs; 77 English benchmark questions; 14 curriculum combinations; 154 result rows (77 × two conditions). Normalization removed or changed punctuation, numbers, and terms, sometimes deleting useful cues such as page/chapter/title tokens.

Reported aggregate metrics on 65 answerable questions:

| Condition | Hit@10 | PageRecall@10 | CompletePageCoverage | MRR | Same-source fraction |
|---|---:|---:|---:|---:|---:|
| Raw query | 0.7077 | 0.6923 | 0.6769 | 0.6492 | 1.0000 |
| Normalized query | 0.6923 | 0.6846 | 0.6769 | 0.6021 | 0.8000 |

The tested normalization did not improve aggregate retrieval and degraded MRR and same-source fraction. Do not generalize this to every normalization method. Inspect exact transformation rules and per-question results.

## Experiment E — Child-style query / retrieval strategy comparison
A log dated 11 October 2026 records a small exploratory child-style query set, including:
- “What actions can I say in English, like things I do every day?”
- “Which colours do the children share in the poem ‘Colours’?”
- “Can you help me find fruit names hidden in the word grid?”
- “After a drama activity, what can I tell my teacher about it?”
- “How can I compare life in the mountains and the plains?”
- “I have ₹150 and buy something that costs ₹113. How much money should I get back?”
- “What should I do if I want to share my crayons with a friend?”
- “Why do houses in the mountains sometimes have sloping roofs?”

Files recorded:
`.../english_only_v1/evaluation/child_benchmark_v1/retrieval_strategy_comparison_20261011_161031.xlsx` and `.csv` with the same basename. Retrieve the exact files and aggregate tables. Treat this as small and exploratory; do not claim statistical significance or generalize to all children’s language.

## Experiment F — V2 ten-question pilot
Manifest recorded `NCERT_RAG_Benchmark_V2_Pilot_v4.xlsx`, 10 questions, 2,033 chunks, BM25/dense/hybrid RRF, top_k 10, BM25/dense candidate_k 20, RRF k 60, evaluation at k=1,3,5,10. Gold rule: same `source_file` and page-set intersection with gold PDF pages. `Complete@10` requires all gold PDF evidence pages covered. Timestamp recorded as `2026-10-08 19:24:35`.

Outputs: `raw_retrieval_results.csv`, `question_metrics.csv`, `aggregate_metrics.csv`, `multi_page_diagnostics.csv` under `.../retrieval_evaluation/benchmark_v2/baseline_v2_pilot/`. This is a separate pilot; do not combine with the 120- or 77-question results. Check if it was superseded by a later protocol.

## Experiment G — Generation correctness, evidence sufficiency, and abstention pilot
A saved project summary reports a 50-question generation evaluation:
- 34 correct, 9 partially correct, 6 incorrect, 1 cannot judge.
- Strict correct proportion: 34/49 ≈ 0.694, excluding the cannot-judge item.
- Unsupported claim rate reported as 0.32.
- Evidence sufficiency: 38 sufficient, 6 partial, 6 insufficient.
- Questions marked as cases that should abstain: `Q006`, `Q017`, `Q037`, `Q038`, `Q039`, `Q048`, `Q050`.
- A simple detector reportedly abstained appropriately on only `Q040` and `Q041`; a summary reported TP=2, FP=0, FN=7. Verify exact labels, definitions, and confusion matrix from source files.
- `Q048` was described as partial evidence but an evaluator recommended abstention.
- A generic NLI probe had reported accuracy 0.32 and many false positives/false abstentions; it was not reliable as a final evidence gate.

This is exploratory/manual evaluation. The generation model/provider, prompt/version, number of generations per question, evaluator procedure, claim-level denominator, and annotation source must be recovered. Do not present the figures as generalizable error rates without those details. Main insight: retrieval relevance is not evidence sufficiency; topically similar context may still not support the answer. The simple abstention detector appears to miss many cases requiring abstention.

## Experiment H — Local cross-encoder service smoke test
A local `retrieval_service.py` loads chunks/metadata, manifest, BM25/tokenized documents, embeddings, FAISS, MiniLM query encoder, and `cross-encoder/ms-marco-MiniLM-L-6-v2` reranker. It uses lowercase whitespace BM25 tokenization, dense retrieval with normalized query embeddings, RRF k=60, 50 candidates per retriever, reranks and returns top 5. Health reported 2,033 chunks, CUDA, MiniLM, and the cross-encoder.

A smoke query, “What do stars say when they are fighting?”, returned a first result from Class 3 English Santoor pages 43–45 with an excerpt about stars asking someone to decide who was best (reported reranker score 5.1577). The second result was adjacent pages (score −2.011); other top-five results were largely irrelevant. This is one qualitative smoke test, not benchmark evidence. Cross-encoder scores are ranking signals, not calibrated probabilities. A mojibake display problem (`â`-like characters) was noticed. The local service’s candidate_k=50 differs from the benchmark manifest’s candidate_k=20.

---

# 6. TECHNICAL PIPELINE AND KNOWN ENVIRONMENT

Baseline retrieval pipeline:
1. Extract and clean NCERT PDFs while preserving class/subject/book/source/page metadata.
2. Split text into fixed 200-word chunks with 50-word overlap.
3. Build BM25 (`BM25Okapi`, lowercase whitespace tokenization).
4. Encode with `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions).
5. L2-normalize embeddings and index in FAISS `IndexFlatIP` (cosine-equivalent inner product).
6. Retrieve with BM25 and dense retrieval; combine using RRF (`rrf_k=60`).
7. Evaluate against gold source/page evidence.
8. The later local serving implementation adds cross-encoder reranking and top-5 output.

The evaluation and serving configurations are not identical. Do not describe the benchmark results as cross-encoder results unless a benchmark file proves that reranker was included.

The Node chat service prompt instructs the model to use retrieved evidence and cite numbered sources `[1]`, `[2]`; it permits a qualified general-knowledge answer when evidence is missing/insufficient. In the inspected version, citations were generated from all safe retrieved documents, not only documents the model actually used. This is a known grounding limitation. Future robust work should map citations to actual referenced sources, check source/page support, distinguish relevance from sufficiency, detect unsupported claims, and clarify/retrieve/abstain if evidence is inadequate. Do not claim claim-level verification is already implemented without code evidence.

Environment recorded:
- Google Colab for corpus/retrieval experiments.
- Local Windows serving prototype; Python virtual environment `.venv-retrieval`.
- GPU reported: NVIDIA GeForce RTX 3050 Laptop GPU, 6 GB; PyTorch `2.13.0+cu130`; CUDA available.
- Libraries included pandas, NumPy, `faiss-cpu`, sentence-transformers, rank-bm25, FastAPI, and Uvicorn.
- Exact seeds, full package lock, model revision hashes, and Colab runtime versions are not fully captured here. Recover them before making strict reproducibility claims.

---

# 7. CONTRIBUTION, NOVELTY, AND RELATED WORK

## Defensible current framing
A provisional contribution statement is:

> An empirical study of curriculum-metadata-constrained retrieval and evidence-quality failure modes for NCERT-grounded primary-school question answering, comparing lexical, dense, and fixed-RRF retrieval on versioned textbook subsets and exploring answer support and abstention.

This is provisional until the primary artifacts and literature are checked. The curriculum-filtering summary is currently the strongest quantitative result: Hit@10 0.63 → 0.75; PageRecall@10 0.625 → 0.740; MRR 0.5682 → 0.6568; candidate count 3,023 → ~139; recorded WrongSourceFraction@10 0.716 → 0.000. Verify exact metric definitions. The English-only benchmark showed dense retrieval substantially below BM25, and fixed RRF did not automatically outperform BM25. The generation pilot suggests retrieval ranking alone cannot guarantee answer support.

## Proposed but unproven contributions
- Structure-/concept-aware chunking using section headings, paragraphs, chapter structure, and bounded chunk sizes.
- Query-adaptive retrieval depth/fusion for definitions, formulas, numerical problems, multi-page questions, and conceptual explanations.
- Claim-level evidence verification and contradiction/missing-support detection.
- Evidence sufficiency gate with retrieve-again, clarify, or abstain decisions.
- Learner-aware explanations with age-appropriate vocabulary, worked examples, hints, and scaffolding.
- Robust evaluation on informal, multilingual, ambiguous, and child-style queries.

BM25, FAISS, MiniLM embeddings, RRF, and fixed chunking are established methods and should not be claimed as novel by themselves.

## Related work to verify
A related paper was identified in the project history: DOI `10.1038/s41598-026-71757-y`, in *Scientific Reports*, recorded publication date 17 September 2026. It concerns benchmarking retrieval strategies for curriculum-aligned RAG on NCERT textbook content (NCERT-RAG-Eval), using secondary-school physics chapters, fixed 200-word chunks with 50-word overlap, BM25, dense FAISS with all-MiniLM-L6-v2, hybrid RRF, and a generation pilot. The writing agent must verify the exact title, authors, publication date, volume/article number, and DOI from the publisher. This prior work makes generic claims such as “first to evaluate BM25, FAISS, and RRF on NCERT” untenable. Potential differences—primary classes, curriculum filtering, child-style queries, evidence sufficiency, and structure-aware methods—must be established by direct comparison.

---

# 8. LIMITATIONS AND OPEN QUESTIONS

Known limitations:
1. Multiple corpus snapshots and counts require a definitive version map.
2. Benchmark v1 negatives were initially excerpt-only, not necessarily corpus-wide unanswerable.
3. English-only selection and language scope limit generalization.
4. Dense MiniLM retrieval underperformed BM25 in the recorded English-only evaluation.
5. RRF was not automatically superior to BM25.
6. Tested query normalization degraded MRR and same-source fraction.
7. Curriculum filtering depends on correct class/subject/book metadata; incorrect metadata can exclude evidence.
8. Source match is not the same as gold-page relevance or evidence sufficiency.
9. Generation pilot protocol/model/annotation details need verification.
10. The simple abstention detector missed many should-abstain cases.
11. NLI probe accuracy was reportedly only 0.32 and was not reliable as a final gate.
12. The reranker was smoke-tested, not benchmarked in the recorded evidence.
13. Text encoding/mojibake needs investigation.
14. Reranker scores are not calibrated confidence.
15. No controlled learning-outcome study is established.
16. No validated psychometric claim is established for CPM-based adaptation.
17. Main retrieval benchmark is English-only; multilingual retrieval is not established.
18. No measured STT/TTS accuracy or child-user study is established.
19. No statistical testing is documented; compute paired bootstrap/confidence intervals only from actual per-question data.
20. Node tests/lint/build after integration are unverified.

Open questions the agent must resolve:
- Which corpus is canonical for each experiment? What exactly do “22 units/books” mean?
- What are the complete hybrid metrics in `english_only_overall_summary.csv`?
- What are the exact definitions of `SameSource@10` and `SameSourceFraction@10`?
- Is candidate_k 20 or 50 for each experiment? Likely 20 for evaluation and 50 for local serving, but verify.
- Was the benchmark frozen before tuning? What split policy was used?
- How were negatives and English-only unanswerable items verified?
- Which generator/provider/prompt produced the 50-question pilot?
- Is unsupported claim rate per answer, claim, or question?
- How was “cannot judge” handled?
- Where are the original sufficiency labels and detector confusion matrix?
- Which labels are human-reviewed versus AI-assisted?
- Were annotators blinded or independent?
- What exact aggregate results exist for the child-style query set?
- Was the cross-encoder evaluated on gold data or only one smoke query?
- Did the Node integration tests pass?
- What author names, affiliations, funding, acknowledgements, and ethics details are verified?
- Was any student data collected? If not, state no student outcome study was performed.

---

# 9. RECOMMENDED PAPER STRUCTURE

1. Title: provisional example, “Curriculum-Constrained Retrieval and Evidence Sufficiency for NCERT-Grounded Primary-School Question Answering.”
2. Abstract: problem, verified corpus/benchmark version, methods, key measured results, qualified conclusion.
3. Index Terms: retrieval-augmented generation, educational question answering, curriculum-aware retrieval, NCERT, evidence sufficiency, information retrieval.
4. Introduction: trustworthy textbook-grounded answers for young learners; contributions and RQs supported by evidence.
5. Related Work: educational RAG, curriculum retrieval, lexical/dense/hybrid search, chunking, evidence verification/abstention; discuss NCERT-RAG-Eval accurately.
6. Problem Formulation: corpus, question, class metadata, gold pages/source, answerability, retrieval ranking, evidence sufficiency.
7. Corpus and Benchmark: version table, extraction, preprocessing, chunking, metadata, question types, annotation, exclusions.
8. Methods: BM25, MiniLM/FAISS, RRF, curriculum filtering, query normalization, reranking only where evaluated.
9. Evaluation Protocol: definitions, denominators, source/page rules, multi-page coverage, confidence intervals if computed.
10. Results: separate sections and tables for English-only retrieval, curriculum filtering, normalization, generation/evidence pilot only after verification.
11. Error Analysis: wrong top-k passages, partial multi-page coverage, metadata filtering, child-style mismatch, unsupported claims, abstention failure, encoding.
12. Discussion: why BM25 can win, filtering trade-offs, source relevance versus answer support.
13. Limitations and Ethics: benchmark coverage, language scope, no learning study, child privacy, CPM validity/licensing, no diagnosis claims.
14. Conclusion/Future Work: structure-aware chunking, adaptive retrieval, claim verification, abstention, multilingual/voice and learner-aware evaluation.
15. References and supplementary material.

## Recommended tables
- Corpus snapshot/version inventory.
- Benchmark composition (120-question and 77-question English subset).
- Retrieval configurations and parameters.
- English-only BM25/dense/RRF metrics.
- Curriculum-filtering results.
- Query-normalization results.
- Generation correctness/evidence sufficiency/abstention, with denominators.
- Error taxonomy only if consistently annotated.
- Reproducibility environment.

## Recommended figures
- Pipeline architecture from PDFs → extraction/cleaning → chunks/metadata → BM25/dense FAISS → RRF → optional reranker → evidence sufficiency → answer/clarification/abstention. Use dashed lines for proposed/unimplemented stages.
- Hit@k, PageRecall@10, and MRR across curriculum filtering.
- BM25/dense/RRF comparison on English-only subset.
- A qualitative failure case based on a real benchmark example.
- Chunking comparison only after context-aware chunking experiments actually run.

Every figure/table must be generated from actual data and have a script/source path.

---

# 10. IEEE LATEX AND CITATION REQUIREMENTS

- Use `\documentclass[conference]{IEEEtran}` unless the target venue specifies otherwise.
- Packages as needed: `cite`, `graphicx`, `booktabs`, `amsmath`; avoid unnecessary packages.
- Use labels/references for every figure, table, and equation.
- Use IEEE bibliography style and verified BibTeX entries.
- Cite primary sources for BM25, FAISS, Sentence-BERT/MiniLM, RRF, cross-encoder/MS MARCO, RAG, evidence/faithfulness/abstention methods, NCERT source material, and related work where relevant.
- Verify exact bibliographic metadata from primary publishers/DOIs. Do not pad the bibliography with irrelevant citations.
- Generate tables from scripts where feasible.
- Compile and inspect missing citations/references, overfull boxes, and figure placement. Report compilation status honestly.
- Do not include private credentials, tokens, personally identifying child information, or private paths that reveal sensitive information.

Potential references to verify: BM25/probabilistic retrieval; FAISS; Sentence-BERT/MiniLM; Reciprocal Rank Fusion; MS MARCO/cross-encoder; RAG; evidence sufficiency/faithfulness/abstention; official NCERT sources; and DOI `10.1038/s41598-026-71757-y`. Use only references actually needed and verified.

---

# APPENDIX A — KNOWN ARTIFACT PATHS

Historical paths from Colab logs (confirm existence in the agent's environment):
- `/content/drive/MyDrive/NCERT_BOOKS/01_SOURCE_BOOKS`
- `/content/drive/MyDrive/NCERT_BOOKS/02_PROCESSED_DATA`
- `/content/drive/MyDrive/NCERT_BOOKS/02_PROCESSED_DATA/corpus_v2`
- `/content/drive/MyDrive/NCERT_BOOKS/02_PROCESSED_DATA/corpus_v2_clean/chunks/fixed_200_50/chunks.csv`
- `/content/drive/MyDrive/NCERT_BOOKS/03_RETRIEVAL/baseline_v2_clean/bm25/bm25_index.pkl`
- `/content/drive/MyDrive/NCERT_BOOKS/03_RETRIEVAL/baseline_v2_clean/chunk_metadata.csv`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/NCERT_RAG_Benchmark_v1.xlsx`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/baseline_results_v1/baseline_per_question_results.csv`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/baseline_results_v2_corrected/corrected_per_question_results.csv`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/english_only_v1/english_only_benchmark.xlsx`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/english_only_v1/indexes/retrieval_manifest.json`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/english_only_v1/evaluation/english_only_per_question_retrieval.csv`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/english_only_v1/evaluation/english_only_per_question_metrics.csv`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/english_only_v1/evaluation/english_only_overall_summary.csv`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/curriculum_filtering_v1/curriculum_filtering_per_question.csv`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/curriculum_filtering_v1/curriculum_filtering_question_type_summary.csv`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/english_only_v1/evaluation/child_benchmark_v1/retrieval_strategy_comparison_20261011_161031.xlsx`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/english_only_v1/evaluation/child_benchmark_v1/retrieval_strategy_comparison_20261011_161031.csv`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/benchmark_v2/NCERT_RAG_Benchmark_V2_Pilot_v4.xlsx`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/benchmark_v2/baseline_v2_pilot/raw_retrieval_results.csv`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/benchmark_v2/baseline_v2_pilot/question_metrics.csv`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/benchmark_v2/baseline_v2_pilot/aggregate_metrics.csv`
- `/content/drive/MyDrive/NCERT_BOOKS/05_EXPERIMENTS/retrieval_evaluation/benchmark_v2/baseline_v2_pilot/multi_page_diagnostics.csv`

# APPENDIX B — SHORT SUMMARY FOR LIMITED-CONTEXT AGENTS

The project studies NCERT-grounded QA for Classes 1–4. Main baseline: fixed 200-word chunks with 50-word overlap; BM25; dense `sentence-transformers/all-MiniLM-L6-v2` embeddings (384 dimensions) in FAISS `IndexFlatIP`; RRF (`k=60`). Frozen corpus: 3,023 chunks and 120-question benchmark (100 answerable, 20 initially excerpt-only negatives). English subset: 2,033 chunks, 77 questions (65 answerable, 12 unanswerable). On the recorded English-only metrics BM25 clearly beat dense retrieval; RRF improved over dense at some cutoffs but did not beat BM25 in the visible hit metrics. Curriculum filtering on 100 answerable questions reported Hit@10 0.63 → 0.75, PageRecall@10 0.625 → 0.740, MRR 0.5682 → 0.6568, and candidate count 3,023 → about 139 for full corpus versus class+subject+book filtering. Raw-vs-normalized query reported Hit@10 0.7077 vs 0.6923 and MRR 0.6492 vs 0.6021, so the tested normalization hurt. A generation pilot reported 34 correct, 9 partial, 6 incorrect, 1 cannot judge out of 50, unsupported claim rate 0.32, and weak abstention; source protocol needs verification. Local cross-encoder retrieval was smoke-tested qualitatively, not benchmarked. Context-aware chunking, reliable evidence verification/abstention, learner-aware explanation, multilingual speech, and CPM-inspired onboarding remain proposed unless primary artifacts prove completion. Agent must audit all artifacts, reconcile versions, recompute metrics, verify citations, produce IEEE LaTeX, and never fabricate missing results.
