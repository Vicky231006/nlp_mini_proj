# Empirical Research Contributions and Comparative Literature Analysis

**Authors:** Vicky Dsilva, Aatmay Gadgil, Binoy Burken, Viraj Darekar  
**Project:** NCERT-Grounded Adaptive AI Tutor with Layered Safety Guardrails  
**Document Classification:** Academic Research Contribution & Benchmark Specification  
**Date:** October 2026  

---

## 1. Executive Context & Research Positioning

Conversational pedagogical agents powered by Large Language Models (LLMs) present immense opportunities for K-12 education. However, deploying generative conversational models in primary school environments entails significant engineering and safety hurdles. Standard generative agents exhibit three severe vulnerabilities in educational settings:
1. **Curricular Hallucination:** Generating plausible-sounding yet factually inaccurate or curriculum-deviant explanations.
2. **Adversarial & Safety Exploits:** Susceptibility to prompt extraction, instruction overriding, jailbreaks, and the emission of developmentally inappropriate language.
3. **Abstention Failure:** An acute inability to recognize when curriculum evidence is absent or insufficient, leading to spurious confabulation on out-of-scope queries.

While recent academic benchmarks (such as *NCERT-RAG-Eval*, DOI: 10.1038/s41598-026-71757-y, and broader textbook RAG initiatives) have explored retrieval over secondary-school science and mathematics curricula, primary school curricula (Grades 1–5) present unique informational dynamics: short conceptual passages, heavy reliance on illustrations, low lexical redundancy, and child-perspective query phrasing.

This repository provides an empirical, multi-stage investigation into curriculum-grounded retrieval, generation faithfulness, speech interaction, and defense-in-depth safety guardrails specifically constructed for primary-grade NCERT pedagogy.

---

## 2. Core Empirical Research Contributions

### Contribution 1: Systematic Negative Result on Dense vs. Lexical Retrieval in Early-Grade Textbooks
* **The Prevailing Assumption:** Current literature predominantly assumes that neural dense retrievers (bi-encoders such as MiniLM, Contriever, or BGE) inherently surpass classical sparse retrievers (BM25) by capturing semantic intent and paraphrastic nuance.
* **Our Empirical Finding:** On a frozen, auditable benchmark of 65 answerable primary-school NCERT questions evaluated over 2,033 chunks:
  - **BM25 achieves decisive superiority across early ranks:**
    - Hit@1: **0.4462** (BM25) vs. **0.1692** (Dense MiniLM) — a **163.7% relative advantage** for BM25.
    - Hit@5: **0.6000** (BM25) vs. **0.2615** (Dense MiniLM) — a **129.4% relative advantage**.
    - Hit@10: **0.6308** (BM25) vs. **0.3385** (Dense MiniLM).
    - Mean Reciprocal Rank (MRR): **0.5094** (BM25) vs. **0.2104** (Dense MiniLM).
    - nDCG@10: **0.5246** (BM25) vs. **0.2344** (Dense MiniLM).
  - **Fixed Reciprocal Rank Fusion (RRF, $k=60$):** While RRF elevates dense retrieval performance (Hit@5 = 0.5077, Hit@10 = 0.6308), it **fails to outperform BM25 alone** in MRR (0.3472 vs. 0.5094) and early rank precision.
* **Pedagogical Root Cause:** Primary textbook questions reuse distinctive terminology ("camel's hump", "Mister Nobody", "haldi's adventure") where exact keyword matching prevents the semantic dispersion across grades that plagues small dense embeddings.

### Contribution 2: Discovery of Page Provenance and Numbering Discrepancy as an Empirical Confounder
* **The Empirical Trap:** In benchmark evaluations, researchers frequently attribute retrieval failures to algorithm architecture or embedding capacity.
* **Our Diagnostic Discovery:** In a 10-question V2 pilot evaluated against 3,584 page records in `NCERT_exp1a.ipynb`, initial retrieval validation indicated 3 failing queries (7/10 passes). Systematic provenance tracing revealed that apparent retrieval misses were artifacts of mismatches between printed textbook page numbers (which restart per chapter or exclude front matter) and authoritative physical PDF page indices.
* **Resolution & Protocol:** Implementing an authoritative dual-key metadata schema (`source_file`, `pdf_page`, `printed_page`) restored the benchmark pass rate to **9/10 (90%)**, with the sole remaining failure being an intentional hard-distractor question. This result proves that PDF-to-print provenance alignment must be frozen prior to model benchmarking.

### Contribution 3: The Multi-Page Retrieval Horizon
* **Query Stratification Analysis:** Stratifying the 65-question benchmark by structural complexity revealed stark performance divergence:
  - Direct / Paraphrase Queries ($N=37$): Hit@10 = **0.7568**
  - Hard Distractor Queries ($N=15$): Hit@10 = **0.8000**
  - Multi-Page Synthesized Queries ($N=13$): Hit@10 = **0.0769** (a catastrophic **89.8% performance drop** relative to single-page queries).
* **Significance:** Standard single-chunk retrieval pipelines fundamentally fail when pedagogical questions require synthesizing premises dispersed across non-contiguous pages.

### Contribution 4: Negative Finding on Unsupervised Query Normalization
* **Hypothesis:** Re-writing or normalizing student queries using generative language models should reduce ambiguity and improve retrieval recall.
* **Ablation Outcome:** In `NCERT_exp1a.ipynb`, applying automated query normalization degraded retrieval performance:
  - Unnormalized Baseline MRR: **0.6492**
  - Normalized Query MRR: **0.6021** (a **7.25% degradation**)
  - Same-Source Retrieval Fraction: Dropped from **1.0000** (100% curriculum consistency) to **0.8000** (20% cross-grade intrusion).
* **Takeaway:** Generic query rewriters introduce extraneous vocabulary that dilutes the strict lexical specificity of primary curriculum queries.

### Contribution 5: Two-Stage Hybrid Reranking on Child-Perspective Queries
* **Child Benchmark Evaluation (50 Queries, 43 Answerable):** Evaluating a child-perspective benchmark reflecting actual linguistic queries of young learners:
  - BM25 Baseline: Relevant@5 = **0.8372**, MRR = **0.7248**, nDCG@5 = **0.8185**
  - Dense MiniLM: Relevant@5 = **0.9302**, MRR = **0.8508**, nDCG@5 = **0.9331**
  - Two-Stage Cross-Encoder Pipeline (`cross-encoder/ms-marco-MiniLM-L-6-v2` reranking top 50 RRF candidates): Relevant@5 = **0.9535**, MRR = **0.9244**, nDCG@5 = **0.9780**.
* **Takeaway:** When queries deviate from exact textbook prose to natural child speech, deep cross-attention reranking provides significant retrieval elevation (+27.5% relative MRR over BM25).

### Contribution 6: Dissection of the Generation Faithfulness and Abstention Gap
* **Empirical Annotation (Qwen 1.5B Generation Study):**
  - Strict Correctness: **69.39%** (34/49 evaluated responses).
  - Lenient Correctness (including partially correct scaffolding): **87.76%** (43/49).
  - Unsupported Claim Rate: **32.0%** of generated responses contained ungrounded assertions; **14.0%** contained major factual hallucinations.
* **Abstention Breakdown:**
  - On 7 unanswerable questions (where answers were absent from the curriculum corpus), the model hallucinated plausible answers in 4 cases (57.1% failure rate) rather than abstaining.
  - An NLI-based sufficiency probe (`cross-encoder/nli-deberta-v3-small`) tested across 40 annotated claims yielded an accuracy of only **0.320** against human sufficiency labels.
* **Conclusion:** Off-the-shelf NLI models cannot act as plug-and-play hallucination gates without domain-specific recalibration.

### Contribution 7: Three-Tier Defense-in-Depth Safety Architecture
* **Structural Safety Plane:**
  1. *Layer 1 (Input Guardrail):* NFKD Unicode normalization, zero-width stripping, control character removal, regex screening for 24 prompt-extraction signatures, 15 instruction-override patterns, 10 jailbreak personas, and delimiter injection markers (`===`, `<<<`, `[SYSTEM]`, `system:`). Unsafe queries trigger immediate age-appropriate fallbacks without consuming model or retriever resources.
  2. *Layer 2 (Instruction Hardening):* Delimited `<evidence>` encapsulation, strict role boundaries, age-stratified pedagogy rules, and post-evidence reinforcement reminding the model of safety invariants.
  3. *Layer 3 (Output Guardrail):* Heuristic interception of leaked system fragments, delimiter echoes, and inappropriate terminology.
* **Verification:** Validated via 33 automated unit tests in `test/guardrails.test.js`, demonstrating 100% interception of known adversarial probes.

### Contribution 8: Privacy-Preserving On-Device Speech Pipeline
* **Architecture:** Whisper-based Speech-to-Text running locally in a Python subprocess, coupled with client-side Web Speech API Speech-to-Text/Text-to-Speech fallbacks. This avoids transmitting child audio streams to third-party cloud transcription providers, ensuring COPPA/FERPA compliance.

---

## 3. Comparative Matrix: This Work vs. Prior Literature

| Dimension | Standard Educational LLM Chatbots | NCERT-RAG-Eval (Literature) | Our System Prototype |
| :--- | :--- | :--- | :--- |
| **Target Learner** | High School / Higher Ed | Secondary Grades (Class 9–12) | Primary School (Class 1–5) |
| **Lexical vs. Dense Finding** | Assumes dense superiority | Assumes hybrid superiority | **Proves BM25 beats Dense MiniLM** (MRR 0.509 vs 0.210) |
| **Page Provenance Tracking** | Ignored | File-level recall only | **Authoritative PDF-to-print page mapping** |
| **Multi-Page Synthesis** | Not isolated | Aggregated score | **Explicitly isolated: 0.077 Hit@10 boundary** |
| **Query Normalization** | Recommended | Unanalyzed | **Proved negative impact (-7.25% MRR)** |
| **Abstention & NLI Gate** | Assumed functional | Not benchmarked | **Empirically debunked (NLI acc = 0.32)** |
| **Safety Architecture** | Single-prompt instructions | Absent / Out of scope | **3-Tier Pre/In/Post Guardrail Subsystem** |
| **Voice Processing** | Cloud API (Whisper Cloud/Siri) | Text-only | **Local Subprocess Whisper (Privacy-first)** |

---

## 4. Methodological Transparency & Research Boundaries

To maintain research integrity, the following negative results and boundaries are explicitly affirmed:
1. **No Fabricated Benchmarks:** Every reported metric corresponds to frozen artifacts in `artifacts/english_only_v1/` and notebooks in `NCERT_exp1a.ipynb`.
2. **Prototype Boundary:** The system is an empirical prototype and evaluation testbed, not a certified clinical or educational intervention.
3. **Cognitive Profile Flow:** The practice test in the UI samples 25 puzzles to guide pedagogical tone; it does not constitute a standardized psychometric diagnostic.
4. **Abstention Remains an Open Challenge:** The system employs explicit fallback messaging when context is missing, as automated NLI gating is demonstrably uncalibrated.

---
*(End of Document)*
