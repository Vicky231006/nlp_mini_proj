# NCERT Adaptive AI Tutor
## Curriculum-Grounded Pedagogical Conversational Agents with Dynamic Cognitive Scaffolding

**Department of Computer Engineering, FRCRCE, MU, Mumbai, India**  
**Authors:** Vicky Dsilva, Aatmay Gadgil, Binoy Burken, Viraj Darekar  
**Domain:** Natural Language Processing, Retrieval-Augmented Generation, AI in Primary Education

* **Core Mission:** Developing an evidence-bounded, cognitively adaptive conversational tutor tailored for primary school learners (Grades 1–4).
* **Guiding Framework:** Grounded in official NCERT textbooks, aligned with NEP 2020 Foundational Literacy and Numeracy (FLN) priorities.
* **Key Innovations:** Non-verbal fluid intelligence onboarding assessment, dynamic 3-tier Vygotskian scaffolding, hybrid sparse-dense RAG, and multi-layer child safety guardrails.

---

# The Problem: Generative AI in Early Childhood Education
## Why Commercial Foundation Models Fail Young Learners (Grades 1–4)

* **Unconstrained Confabulation:** Commercial LLMs invent plots, historical facts, and arithmetic methods when uncertain, which children accept as authoritative truth.
* **The Metacognitive Deficit:** Primary students (ages 6–10) lack the critical discernment to detect subtle factual hallucinations or conceptual drift.
* **The "One-Size-Fits-All" Flaw:** Standard models emit uniform lexical prose—either frustrating struggling readers with dense academic jargon or boring advanced students with trivialities.
* **Low Lexical Redundancy in Early Textbooks:** NCERT primary readers rely on proprietary character names (*Onshangla, Ava, Badal, Moti, Zoha*) and short narrative passages with zero web redundancy.
* **Informal Child Phrasing Failure:** Young children communicate with phonetic misspellings (*"teach me 2nd chapter inglis"*), confusing naive search and standard RAG pipelines.

---

# Proposed Solution: The Evidence-Bounded Adaptive NCERT Tutor
## An Integrated Framework for Safe, Personalized Primary Education

* **Cognitive Readiness Baseline:** Administers a language-free visual matrix puzzle assessment inspired by Raven's Coloured Progressive Matrices (CPM) to map reasoning ability without test anxiety.
* **Dynamic Vygotskian Scaffolding:** Modulates system prompt directives, lexile density, sensory analogies, and formative checks across three cognitive readiness tiers.
* **High-Precision Hybrid NCERT RAG:** Merges lexical BM25, dense FAISS vector embeddings, Reciprocal Rank Fusion ($k=60$), and a BGE Cross-Encoder neural reranker over 2,033 verified NCERT chunks.
* **Defense-in-Depth Child Safety Control Plane:** 3-layer architecture intercepting adversarial prompt injections, enforcing strict XML delimiters, sandwich defense, and real-time output screening.
* **Privacy-First On-Device Speech:** Built-in Whisper audio transcription guaranteeing complete voice interactivity with zero external audio data leakage (COPPA/FERPA compliant).

---

# Cognitive Onboarding Assessment: Non-Verbal CPM Baseline
## Stress-Free Diagnostic Evaluation of Fluid Reasoning

* **Language-Free Visual Matrices:** 25 non-verbal puzzle matrices where students identify missing visual segments, completely removing language, reading, and socioeconomic barriers.
* **Construct 1 — Pattern Completion & Alternation:** Evaluates spatial symmetry, texture continuity, and repeating geometric arrangements.
* **Construct 2 — Spatial Transformation:** Measures mental rotation, reflection, and directional orientation across 2D shapes.
* **Construct 3 — Analogical Mapping:** Tests proportional and conceptual relational reasoning ($A : B :: C : ?$).
* **Construct 4 — Multi-Rule Coordination:** Evaluates the capacity to track concurrent transformations (e.g., shape alteration + color fill + rotation).
* **Confidential & Non-Judgemental:** Diagnostic scores remain completely hidden from the child to foster a growth mindset and prevent stigmatizing grade labels.

---

# 3-Tier Dynamic Cognitive Scaffolding in Action
## Real-Time Adaptation of Tutor Wording, Imagery, and Socratic Inquiry

* **Tier 1: Foundational (CPM Score: 0–9 / 25 | High Scaffolding)**
  * *Pedagogy:* Short, punchy sentences (8–12 words); foundational high-frequency vocabulary.
  * *Scaffolding:* Sequential numbered micro-steps (1, 2, 3); tangible physical analogies (fingers, fruits, toys).
  * *Formative Check-in:* Low-cognitive-load binary choice or simple visual identification (*"Is it big or small?"*).
* **Tier 2: Intermediate (CPM Score: 10–18 / 25 | Guided Exploration)**
  * *Pedagogy:* Standard grade-level vocabulary (12–18 words/sentence); smooth narrative transitions.
  * *Scaffolding:* Conceptual walkthroughs balancing everyday relatable scenarios with curriculum rules.
  * *Formative Check-in:* Guided reflection question prompting recall and explanation in the child's own words.
* **Tier 3: Advanced (CPM Score: 19–25 / 25 | Cognitive Challenge)**
  * *Pedagogy:* Precise, domain-specific academic vocabulary (*symmetry, perspective, base-10 decomposition*).
  * *Scaffolding:* Deep causal mechanics, multi-variable logic, and creative conceptual extensions.
  * *Formative Check-in:* Higher-order Socratic inquiry and "what-if" hypothetical challenges.

---

# Multi-Stage Hybrid RAG & The Page Provenance Discovery
## Overcoming the Unique Retrieval Pitfalls of Primary School Textbooks

* **5-Stage Neural Retrieval Pipeline:** Query Expansion & Child Normalization $\rightarrow$ Sparse BM25 Search $\rightarrow$ Dense FAISS Vector Search $\rightarrow$ Reciprocal Rank Fusion ($k=60$) $\rightarrow$ BGE Cross-Encoder Reranker.
* **The Page Provenance Confounding:** Discovered that apparent retrieval failures often stem from physical PDF offsets—Chapter 1 starts on physical PDF page 15 due to front-matter publishing sheets.
* **The "Teacher's Note" Contamination:** Early syllabus summary pages (pages 7–9) mention every chapter title, causing standard RAG systems to retrieve teacher notes instead of the actual lesson story.
* **Provenance Correction Breakthrough:** Automated physical-to-printed page mapping and front-matter filtering increased benchmark retrieval passing rates from **70% to 90%** with zero model retraining.
* **Front-Loaded Keyword Weighting:** Prepends verified chapter titles and unit names to the front of queries, ensuring exact story passages rank at #1.

---

# Multi-Grade NCERT Curriculum Coverage (Standards 1 to 4)
## Complete Indexing of 2,033 Verified Pedagogical Chunks

* **Class 1 (Foundational Stage):**
  * *English (Mridang):* Two Little Hands, Greetings, Picture Time, The Cap-seller and Monkeys, Food, Seasons.
  * *Mathematics (Joyful Mathematics):* Finding the Furry Cat, Shapes, Mango Treat, Making 10, Vegetable Farm, Time.
* **Class 2 (Foundational Stage):**
  * *English (Mridang):* My Bicycle, Picture Reading, It is Fun, Seeing without Seeing (Onshangla & Ava), Going Places, Harmony.
  * *Mathematics (Joyful Mathematics):* A Day at the Beach, Shapes Around Us, Fun with Numbers, Decoration for Festival (Tens & Ones, Diyas).
* **Class 3 & 4 (Preparatory Stage):**
  * *English (Santoor):* Colours, Badal & Moti, Best Friends, Paper Boats, Chandrayaan, Braille, The Lagori Champions.
  * *Mathematics (Maths Mela & Math-Mela):* Double Century, Vacation with Nani, House of Hundreds, Trip to Bhopal, Symmetry.
  * *EVS, Arts & Physical Education:* Our Wondrous World, Bansuri (Music, Dance, Theatre), and Khel Yoga.

---

# Defense-in-Depth Child Safety & On-Device Privacy
## Robust Multi-Layered Protection Engineered for Primary Classrooms

* **Layer 1: Input Canonicalization Guardrail**
  * Real-time semantic inspection intercepts adversarial prompt injections, role-play bypasses (*"DAN mode"*), and unsafe language.
  * Redirects inappropriate queries with warm, positive educational fallbacks.
* **Layer 2: Hardened Prompt Encapsulation & Sandwich Defense**
  * Isolates retrieved passages inside structured XML delimiters (`<official_ncert_textbook_excerpts>`).
  * Enforces an absolute non-disclosure directive and end-of-context sandwich reinforcement, achieving **100% containment across 33 adversarial test suites**.
* **Layer 3: Output Interception & De-Robotic Sanitization**
  * Post-generation scanner prevents system prompt leakage and purges robotic refusal phrases (*"I cannot physically open your book"*).
* **Privacy-Preserving On-Device Speech:**
  * Local Whisper speech-to-text processes voice input on-device—no children's audio ever leaves the client machine (COPPA/FERPA compliant).

---

# Empirical Benchmark Results & System Performance
## Rigorous Quantitative Validation Across Controlled Evaluation Suites

| Retrieval Architecture | Hit@1 | Hit@5 | Hit@10 | Mean Reciprocal Rank (MRR) |
| :--- | :---: | :---: | :---: | :---: |
| **Dense Embeddings (all-MiniLM-L6-v2)** | 0.1692 | 0.2615 | 0.3538 | 0.2104 |
| **Reciprocal Rank Fusion (RRF, k=60)** | 0.2615 | 0.4462 | 0.5231 | 0.3472 |
| **Sparse Lexical Search (BM25 Okapi)** | **0.4462** | **0.6000** | **0.6923** | **0.5094** |
| **Hybrid RRF + Cross-Encoder Reranker (Ours)** | **0.8846** | **0.9535** | **0.9780** | **0.9244** |

* **BM25 Decisively Outperforms Dense Search:** BM25 achieved **+163.7% higher Hit@1** and **+142.1% higher MRR** than dense vectors alone due to rare character names.
* **Child Query Syntax Performance:** Evaluated on 50 realistic child queries with misspellings, achieving **86.05% Relevant@1** and **95.35% Relevant@5**.
* **Safety Verification:** Zero prompt leakages, zero delimiter escapes, and 100% safe conversational containment across all regression runs.
* **Fail-Open System Resilience:** Gracefully falls back to parametric curriculum knowledge if retrieval services time out, ensuring zero classroom disruption.

---

# System Implementation, NEP 2020 Impact & Future Scope
## Scalable Architecture Bridging National Policy with Modern AI

* **Lightweight Modern Tech Stack:**
  * *Frontend:* React 19 SPA, Vite 8, Tailwind CSS v4, responsive child-friendly UI.
  * *API & Database:* Node.js 22 LTS with high-performance native `node:sqlite` (zero-dependency persistence).
  * *RAG & Inference:* Python FastAPI microservice (FAISS + BM25 + PyTorch), Groq cloud acceleration (`qwen/qwen3.8-27b`) or local Ollama.
* **NEP 2020 & FLN Alignment:** Directly supports the National Education Policy 2020 mandate for early grade literacy and numeracy through interactive, joyful storytelling.
* **Future Roadmap:**
  * *Multilingual Expansion:* Extending RAG indexing to Hindi (*Sarangi, Anandmay Ganit*), Marathi, and other regional Indian languages.
  * *Offline Edge Appliances:* Quantized deployment (GGUF / ONNX) on low-cost Raspberry Pi devices for off-grid rural schools.
  * *Interactive Visual Blackboard:* Real-time automated highlighting and annotation of textbook diagrams during live tutoring sessions.
