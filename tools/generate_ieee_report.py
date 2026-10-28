from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak, FrameBreak, NextPageTemplate
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'IEEE_NCERT_Grounded_Adaptive_AI_Tutor.pdf'

PAGE_W, PAGE_H = A4
LEFT = RIGHT = 14 * mm
BOTTOM = 13 * mm
TOP_NORMAL = 12 * mm
FIRST_TOP = 88 * mm
GAP = 5 * mm
COL_W = (PAGE_W - LEFT - RIGHT - GAP) / 2

styles = getSampleStyleSheet()
body = ParagraphStyle('IEEEBody', parent=styles['BodyText'], fontName='Times-Roman', fontSize=8.15, leading=10.1, alignment=TA_JUSTIFY, spaceAfter=4.1)
heading = ParagraphStyle('IEEEHeading', parent=styles['Heading2'], fontName='Times-Bold', fontSize=9.0, leading=10.5, alignment=TA_LEFT, spaceBefore=5.2, spaceAfter=3.1, keepWithNext=True)
small = ParagraphStyle('Small', parent=body, fontSize=7.3, leading=8.6)
caption = ParagraphStyle('Caption', parent=body, fontSize=7.2, leading=8.3, alignment=TA_CENTER, spaceBefore=3, spaceAfter=4)
abstract = ParagraphStyle('Abstract', parent=body, fontSize=8.0, leading=9.8, leftIndent=2, rightIndent=2, spaceAfter=5)

def P(text, style=body):
    return Paragraph(text, style)

def section(title, paragraphs):
    items = [P(title, heading)]
    items.extend(P(x) for x in paragraphs)
    return items

def draw_header(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor('#444444'))
    canvas.setLineWidth(0.25)
    canvas.line(LEFT, PAGE_H - 8 * mm, PAGE_W - RIGHT, PAGE_H - 8 * mm)
    canvas.setFont('Times-Roman', 7.2)
    canvas.setFillColor(colors.HexColor('#333333'))
    canvas.drawString(LEFT, PAGE_H - 6.1 * mm, 'NCERT-Grounded Adaptive AI Tutor')
    canvas.drawRightString(PAGE_W - RIGHT, PAGE_H - 6.1 * mm, f'Page {doc.page}')
    canvas.restoreState()

def draw_first(canvas, doc):
    draw_header(canvas, doc)
    canvas.saveState()
    canvas.setFillColor(colors.black)
    canvas.setFont('Times-Bold', 16)
    title = 'A Safety-Guarded NCERT-Grounded Adaptive AI Tutor: Retrieval Evaluation and Prototype Architecture'
    words = title.split()
    lines, line = [], ''
    for word in words:
        if stringWidth((line + ' ' + word).strip(), 'Times-Bold', 16) > PAGE_W - LEFT - RIGHT:
            lines.append(line); line = word
        else:
            line = (line + ' ' + word).strip()
    lines.append(line)
    y = PAGE_H - 19 * mm
    for line in lines:
        canvas.drawCentredString(PAGE_W / 2, y, line); y -= 6.4 * mm
    canvas.setFont('Times-Roman', 9)
    canvas.drawCentredString(PAGE_W / 2, y - 1 * mm, 'Vicky Dsilva, Aatmay Gadgil, Binoy Burken, Viraj Darekar')
    canvas.setFont('Times-Italic', 8)
    canvas.drawCentredString(PAGE_W / 2, y - 6 * mm, 'Project report | October 2026')
    canvas.restoreState()

class IEEEReport(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(filename, pagesize=A4, leftMargin=LEFT, rightMargin=RIGHT, topMargin=TOP_NORMAL, bottomMargin=BOTTOM)
        first_frames = [
            Frame(LEFT, BOTTOM, COL_W, PAGE_H - FIRST_TOP - BOTTOM, id='first-left', leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0),
            Frame(LEFT + COL_W + GAP, BOTTOM, COL_W, PAGE_H - FIRST_TOP - BOTTOM, id='first-right', leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0),
        ]
        normal_frames = [
            Frame(LEFT, BOTTOM, COL_W, PAGE_H - TOP_NORMAL - BOTTOM, id='left', leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0),
            Frame(LEFT + COL_W + GAP, BOTTOM, COL_W, PAGE_H - TOP_NORMAL - BOTTOM, id='right', leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0),
        ]
        self.addPageTemplates([PageTemplate(id='First', frames=first_frames, onPage=draw_first), PageTemplate(id='Normal', frames=normal_frames, onPage=draw_header)])

story = []
story += [P('<b>Abstract-</b> This paper documents a prototype adaptive tutor that grounds responses in NCERT material and adds explicit safety controls for school learners. We consolidate the repository implementation and saved English-only retrieval artifacts rather than infer results from product intent. The evaluated corpus contains 2,033 fixed-window chunks and 77 benchmark questions, of which 65 are answerable. On those questions, BM25 yields stronger retrieval than dense MiniLM/FAISS and fixed Reciprocal Rank Fusion (RRF): Hit@5 values are 0.600, 0.262, and 0.508, respectively. The deployed retrieval path combines BM25 and dense candidates by RRF, then uses a cross-encoder reranker; its cross-encoder effectiveness has not yet been benchmarked. Newly integrated guardrails enforce input screening, prompt isolation, output screening, and age-aware fallbacks. The evidence supports a careful prototype contribution: curriculum-grounded retrieval engineering plus defense in depth for a child-oriented conversational system, not a claim of validated learning gains or production readiness.', abstract),
          P('<b>Index Terms-</b> retrieval-augmented generation, NCERT, educational AI, BM25, dense retrieval, prompt injection, guardrails, child safety.', abstract)]
story += [NextPageTemplate('Normal')]

story += section('I. INTRODUCTION', [
    'Generative tutoring systems need both factual grounding and safety controls. This project targets school learners through a web application that connects a conversational model to an NCERT retrieval layer, a low-stakes puzzle-practice flow, and speech integration points. The central design requirement is narrower than unrestricted question answering: retrieve relevant curricular evidence when available, adapt the explanation to the learner context, and avoid unsafe or ungrounded behavior.',
    'The report separates completed evidence from aspirations. The inspected repository and saved artifacts support a retrieval comparison, a local reranking pipeline, and recently added defense-in-depth guardrails. They do not support claims of improved learning, validated psychometric inference, multilingual effectiveness, or a completed cross-encoder benchmark. This distinction is important for a system intended for children.'
])

story += section('II. SYSTEM AND EVALUATION SETUP', [
    'The English-only artifact set uses 2,033 chunks generated with a fixed 200-word window and 50-word overlap. It pairs BM25Okapi using lowercase whitespace tokenization with dense retrieval using sentence-transformers/all-MiniLM-L6-v2 embeddings (384 dimensions), L2 normalization, and FAISS IndexFlatIP. Fixed RRF combines the lexical and dense rank lists with k = 60. The aggregate evaluation reports Hit@k, page recall, chunk precision, MRR, and binary-relevance nDCG.',
    'The benchmark has 77 questions: 65 answerable and 12 unanswerable. The aggregate retrieval results use the 65 answerable questions. The configuration explicitly treats unanswerable performance as descriptive only; this paper therefore makes no rejection-accuracy claim. Relevance requires the expected source file and an overlap with gold PDF pages, so a same-book result on the wrong page is not treated as sufficient evidence.'
])

arch = Table([[P('<b>Request</b>', small), P('<b>Input screen</b>', small), P('<b>Prompt isolation</b>', small), P('<b>Retrieve and rank</b>', small), P('<b>Output screen</b>', small)],
              [P('Learner question', small), P('Canonicalize and detect unsafe or adversarial patterns', small), P('Treat user text and evidence as untrusted data', small), P('BM25 + MiniLM/FAISS -> RRF -> cross-encoder', small), P('Block leakage and unsafe output', small)]], colWidths=[COL_W/5]*5)
arch.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#183B5B')),('TEXTCOLOR',(0,0),(-1,0),colors.white),
    ('BACKGROUND',(0,1),(-1,1),colors.HexColor('#F3F6F8')),
    ('GRID',(0,0),(-1,-1),0.25,colors.HexColor('#AAB7C4')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('ALIGN',(0,0),(-1,-1),'CENTER'),
    ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),('LEFTPADDING',(0,0),(-1,-1),3),('RIGHTPADDING',(0,0),(-1,-1),3)
]))
story += [KeepTogether([Spacer(1,2), arch, P('Fig. 1. Implemented request path. The final retrieval and output controls are bounded by the chat-service contract.', caption)])]

story += section('III. RETRIEVAL RESULTS', [
    'Table I reports the saved aggregate metrics. BM25 is the strongest method at early ranks and at Hit@5. Fixed RRF narrows the gap relative to dense retrieval and matches BM25 at Hit@10, but it does not surpass BM25 on the reported MRR or nDCG values. The practical implication is not that semantic retrieval is intrinsically unsuitable; rather, it should be tuned and evaluated against the actual corpus and relevance rule instead of assumed to improve a lexical baseline.',
    'The difficult cases are multi-page questions. For BM25, Hit@10 is 0.077 for the 13 multi-page items, compared with 0.757 for direct/paraphrase and 0.800 for hard-distractor items. This highlights a distinction between finding one related passage and assembling complete multi-page evidence.'
])

metrics = [
    [P('<b>Method</b>', small), P('<b>Hit@1</b>', small), P('<b>Hit@5</b>', small), P('<b>Hit@10</b>', small), P('<b>MRR</b>', small), P('<b>nDCG@10</b>', small)],
    ['BM25', '0.446', '0.600', '0.631', '0.509', '0.525'],
    ['Dense MiniLM', '0.169', '0.262', '0.338', '0.210', '0.234'],
    ['Fixed RRF', '0.231', '0.508', '0.631', '0.347', '0.410'],
]
t = Table(metrics, colWidths=[COL_W*.25, COL_W*.15, COL_W*.15, COL_W*.16, COL_W*.14, COL_W*.15])
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#183B5B')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),0.25,colors.HexColor('#AAB7C4')),('ALIGN',(1,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('FONTNAME',(0,1),(-1,-1),'Times-Roman'),('FONTSIZE',(0,1),(-1,-1),7.1),('BACKGROUND',(0,1),(-1,-1),colors.white),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#F5F8FA')]),('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3)]))
story += [P('TABLE I. ENGLISH-ONLY RETRIEVAL RESULTS ON 65 ANSWERABLE QUESTIONS', caption), t, Spacer(1,3)]

story += section('IV. DEPLOYMENT PATH AND GUARDRAILS', [
    'The local Python service makes the evaluation artifacts operational. At startup it verifies chunk count, metadata order, embedding shape, FAISS vector count, and BM25 document count. A request generates normalized dense candidates and lexical BM25 candidates, merges their ranks with RRF (k = 60), reranks up to 50 candidates using cross-encoder/ms-marco-MiniLM-L-6-v2, and returns up to five passages. The Node bridge bounds timeouts, validates document shape, filters by reranker score, and preferentially retains class-matched evidence when it exists.',
    'Guardrails add three control points around this path. The input layer normalizes text and detects prompt-leak attempts, instruction overrides, jailbreak personas, boundary-tag manipulation, child-unsafe language, and dangerous content. The system-prompt layer treats user messages and retrieved evidence as untrusted data, separates them from system directives, and repeats the non-disclosure and age-appropriate behavior constraints after the untrusted context. The output layer scans generated text for prompt-leak signatures, telltale disclosure language, profanity, and dangerous content before returning it to the learner.',
    'These controls are deterministic safeguards, not proof of invulnerability. Pattern matching can miss novel attacks or over-block benign phrasing, and the paper does not report a benchmarked attack-success rate. The available automated tests instead establish integration behavior: blocked input short-circuits both retriever and model, while unsafe output is replaced with an age-appropriate fallback.'
])

story += section('V. DISCUSSION AND LIMITATIONS', [
    'The strongest present contribution is an engineering evidence trail: a controlled English-only retrieval comparison, an implemented bridge to a reranked retrieval service, and a visible safety boundary for a child-facing chat flow. The results argue for evidence-first system design. A topically related passage is not necessarily sufficient support for an answer, particularly on multi-page questions. Future work should evaluate evidence sufficiency, abstention, and cross-encoder reranking on a frozen benchmark with an explicit human-review protocol.',
    'The project contains a 25-item reasoning-practice check-in but explicitly avoids treating its category counts as stable skills, diagnosis, intelligence, or placement. Likewise, speech support and learner adaptation are implementation directions rather than completed outcome studies. Any external deployment for children would require privacy, consent, accessibility, moderation, and governance work beyond this prototype.'
])

story += section('VI. CONCLUSION', [
    'This report documents an NCERT-grounded tutor prototype whose retrieval results favor BM25 over the evaluated dense and fixed-RRF alternatives on the saved English-only benchmark. It also records an implemented RRF-plus-cross-encoder serving route and newly integrated input, prompt, and output guardrails. The appropriate conclusion is measured: the repository demonstrates a reproducible retrieval-and-safety prototype with clear next evaluation steps, rather than a validated learning system.'
])

refs = [
    '[1] P. Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks," in <i>Advances in Neural Information Processing Systems</i>, vol. 33, 2020.',
    '[2] S. Robertson and H. Zaragoza, "The Probabilistic Relevance Framework: BM25 and Beyond," <i>Foundations and Trends in Information Retrieval</i>, vol. 3, no. 4, pp. 333-389, 2009.',
    '[3] N. Reimers and I. Gurevych, "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks," in <i>EMNLP-IJCNLP</i>, 2019.',
    '[4] G. V. Cormack, C. L. A. Clarke, and S. Buettcher, "Reciprocal Rank Fusion Outperforms Condorcet and Individual Rank Learning Methods," in <i>SIGIR</i>, 2009.',
    '[5] J. Johnson, M. Douze, and H. Jégou, "Billion-scale Similarity Search with GPUs," <i>IEEE Transactions on Big Data</i>, vol. 7, no. 3, pp. 535-547, 2021.',
    '[6] OWASP Foundation, "OWASP Top 10 for Large Language Model Applications," 2025. [Online]. Available: https://genai.owasp.org/llm-top-10/',
    '[7] National Institute of Standards and Technology, "Artificial Intelligence Risk Management Framework (AI RMF 1.0)," NIST AI 100-1, Jan. 2023.'
]
story += [FrameBreak(), P('REFERENCES', heading)] + [P(r, small) for r in refs]

OUT.parent.mkdir(parents=True, exist_ok=True)
IEEEReport(str(OUT)).build(story)
print(OUT)
