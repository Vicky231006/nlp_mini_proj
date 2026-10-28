from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'Integrity_Aware_Text_Transformation_Demo.pdf'
PAGE_W, PAGE_H = A4
styles = getSampleStyleSheet()
title = ParagraphStyle('Title', parent=styles['Title'], fontName='Times-Bold', fontSize=17, leading=20, alignment=TA_CENTER, spaceAfter=8)
subtitle = ParagraphStyle('Subtitle', parent=styles['BodyText'], fontName='Times-Italic', fontSize=9, leading=11, alignment=TA_CENTER, spaceAfter=16)
body = ParagraphStyle('Body', parent=styles['BodyText'], fontName='Times-Roman', fontSize=10, leading=13, alignment=TA_JUSTIFY, spaceAfter=7)
h = ParagraphStyle('Heading', parent=styles['Heading2'], fontName='Times-Bold', fontSize=11, leading=13, spaceBefore=8, spaceAfter=5)
small = ParagraphStyle('Small', parent=body, fontSize=8.3, leading=10)

def P(text, style=body): return Paragraph(text, style)

def footer(c, doc):
    c.saveState(); c.setStrokeColor(colors.HexColor('#657786')); c.setLineWidth(.25)
    c.line(16*mm, 13*mm, PAGE_W-16*mm, 13*mm)
    c.setFont('Times-Roman', 8); c.drawString(16*mm, 8*mm, 'Integrity-Aware Text Transformation Demonstration')
    c.drawRightString(PAGE_W-16*mm, 8*mm, f'Page {doc.page}'); c.restoreState()

story = [
    P('Integrity-Aware Text Transformation Demonstration', title),
    P('A defensive analysis companion for the NCERT-Grounded Adaptive AI Tutor project', subtitle),
    P('<b>Purpose.</b> This companion document supports a presentation about text-transformation systems. It does not alter the research paper, conceal authorship, suppress citations, or attempt to evade plagiarism or AI-detection systems. Instead, it frames the public claims of such systems as a security and integrity problem: what they claim to modify, why those modifications matter, and how a child-facing educational product can defend against related risks.'),
    P('1. SYSTEM CLAIMS AND RISK SURFACE', h),
    P('The studied public repository markets rule-based transformations that it says can change lexical sequences, remove invisible Unicode characters, and strip document metadata. Whether or not individual claims are technically reliable, each capability maps to an integrity risk. Sequence-level rewriting can obscure textual provenance; invisible-character manipulation can defeat naive content comparisons; and metadata removal can eliminate useful audit information. A rigorous demonstration should therefore expose these categories and their defensive controls rather than present an altered paper as evidence of success.'),
]

rows = [
    [P('<b>Claimed transformation category</b>', small), P('<b>Integrity risk</b>', small), P('<b>Safe demonstration / defense</b>', small)],
    [P('Lexical or syntactic rewriting', small), P('Can make copied or externally produced content harder to compare against sources.', small), P('Require author review; preserve citations; compare semantic claims against the source record.', small)],
    [P('Invisible-character removal or insertion', small), P('Can cause text to render similarly while byte-level content differs.', small), P('Canonicalize Unicode; flag zero-width characters; retain the original submission hash.', small)],
    [P('Document-metadata modification', small), P('Can remove audit context or provenance fields.', small), P('Inspect metadata and embedded files; archive an immutable original before processing.', small)],
    [P('Template or layout preservation', small), P('Can make transformed content appear unchanged at a glance.', small), P('Use text-level, structural, and visual review together; do not infer provenance from layout.', small)],
]
t = Table(rows, colWidths=[55*mm, 58*mm, 57*mm])
t.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#183B5B')),('TEXTCOLOR',(0,0),(-1,0),colors.white),
    ('GRID',(0,0),(-1,-1),.3,colors.HexColor('#B7C3CC')),('VALIGN',(0,0),(-1,-1),'TOP'),
    ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white, colors.HexColor('#F4F7F9')]),
    ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5)
]))
story += [t, Spacer(1,9), P('2. SAFE DEMONSTRATION WORKFLOW', h),
          P('A suitable classroom or project presentation uses controlled sample text created specifically for the demonstration. First, show a raw sample containing a visible sentence and a deliberately inserted invisible character. Next, run a canonicalization check that normalizes text and reports the character category. Finally, show a before/after integrity record containing the sample identifier, cryptographic hash, character count, metadata summary, and reviewer decision. The output is an audit trail, not a rewritten assignment.'),
          P('This approach demonstrates the practical lesson: formatting-level anomalies and metadata changes are detectable signals, but they are not a substitute for authorship review, source checking, or transparent declaration of assistance.'),
          P('3. CONNECTION TO THE TUTOR PROJECT', h),
          P('The repository already has a defensible defensive analogue. Its input guardrail canonicalizes user input with NFKD normalization, removes zero-width characters, replaces control characters, and collapses whitespace before pattern checks. The tutor then separates user and retrieved content from system directives and screens generated output before delivery. These measures are designed to make untrusted text less able to change model behavior, not to disguise its origin.'),
          P('The relevant security property is provenance-aware handling: treat external text as data, preserve evidence boundaries, and ensure that safety decisions occur before model execution and after model generation. The tests demonstrate that an input attack can be rejected before the retriever or provider is called, while unsafe output is replaced with an age-appropriate fallback.'),
          P('4. PRESENTATION TALK TRACK', h),
          P('<b>Slide 1 - Problem:</b> Text transformation tools may target wording, invisible characters, or metadata, all of which can weaken naive integrity checks.'),
          P('<b>Slide 2 - Defensive lens:</b> The goal is not to make content undetectable. The goal is to detect canonicalization issues, preserve evidence, and maintain an auditable chain of custody.'),
          P('<b>Slide 3 - Project relevance:</b> The tutor applies the same defensive principle to prompt injection: untrusted user and retrieved text is normalized, isolated, and screened rather than given instruction authority.'),
          P('<b>Slide 4 - Responsible conclusion:</b> Technical defenses complement, but do not replace, clear authorship rules, source attribution, and human review.'),
          P('5. LIMITATIONS', h),
          P('This document is an analytical demonstration, not a detector evaluation. It does not claim that a particular detector is reliable, that a particular public tool works as advertised, or that Unicode and metadata checks establish authorship. The mechanisms are discussed only at a defensive, high level. Any research involving student work should follow the applicable institutional academic-integrity and privacy requirements.'),
          P('REFERENCES', h),
          P('[1] AhmadHassan-BTed, "Turnitout-Humanizer," GitHub repository. Public repository accessed Oct. 26, 2026. The repository describes itself as a rule-based system for text transformation and metadata handling.', small),
          P('[2] OWASP Foundation, "OWASP Top 10 for Large Language Model Applications," 2025. [Online]. Available: https://genai.owasp.org/llm-top-10/', small),
          P('[3] National Institute of Standards and Technology, "Artificial Intelligence Risk Management Framework (AI RMF 1.0)," NIST AI 100-1, Jan. 2023.', small),
]

OUT.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=18*mm, leftMargin=18*mm, topMargin=17*mm, bottomMargin=20*mm)
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
