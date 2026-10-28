from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / 'docs' / 'NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.pdf'
DOCX = ROOT / 'docs' / 'NCERT_Adaptive_Tutor_Comprehensive_IEEE_Report.docx'
ARCH = ROOT / 'archi_diag.jpeg'

TITLE = 'A Safety Guarded NCERT Grounded Adaptive AI Tutor'
SUBTITLE = 'Retrieval Evaluation Prototype Architecture and Guardrail Design'
AUTHORS = 'Vicky Dsilva, Aatmay Gadgil, Binoy Burken, Viraj Darekar'

sections = [
('I. INTRODUCTION', [
'Large language models can make tutoring interfaces more conversational, but a child facing system needs stronger constraints than a generic chat interface. It must retrieve curriculum evidence when it is available, distinguish evidence from instructions, respond in age appropriate language, and avoid transforming a short practice exercise into a judgement about a child. This project investigates that engineering problem for NCERT material and a local tutoring prototype.',
'The work combines three layers. The first is a retrieval layer over NCERT textbook chunks. The second is an application layer with accounts, a low stakes visual practice flow, stored conversation history, and optional speech entry. The third is a safety layer that screens adversarial and unsafe requests before generation, isolates untrusted evidence within the prompt, and screens model output before it reaches a learner. The central question is not whether an LLM can answer a textbook question, but whether the whole pipeline can provide traceable, safe, curriculum aware assistance.',
'This report is deliberately evidence bounded. It documents completed retrieval comparisons, saved benchmark artifacts, source provenance diagnostics, an implemented reranking service, and recently added guardrails. It does not claim measured learning gains, a validated psychometric profile, reliable abstention, multilingual evaluation, or a production ready child deployment. Those distinctions are essential for an honest account of the prototype.'
]),
('II. RESEARCH QUESTIONS AND CONTRIBUTIONS', [
'The report addresses five research questions. RQ1 asks how lexical, dense, and fixed rank fusion retrieval compare on a matched English only NCERT benchmark. RQ2 asks what failure modes occur on multi page and hard distractor questions. RQ3 asks how source and page provenance affect the validity of a retrieval benchmark. RQ4 asks what can be established about evidence grounded generation and abstention. RQ5 asks how a layered guardrail design changes the application control flow for a child oriented tutor.',
'The defensible contributions are an auditable English only retrieval artifact set, a comparison that records a negative result for dense retrieval, a local BM25 plus dense plus RRF plus cross encoder serving path, a provenance oriented pilot validation workflow, and an integrated three layer guardrail subsystem. BM25, FAISS, MiniLM, Reciprocal Rank Fusion, and cross encoder reranking are established methods; the contribution is their measured and safety constrained integration in this project context.',
'The accompanying notebook adds useful audit evidence. It validates a ten question V2 pilot against 3,584 page records, finds seven passing questions before page provenance correction, and reports nine passes with one hard distractor review after authoritative PDF page mapping. This is a meaningful benchmark engineering result: page numbering must be made explicit before retrieval effectiveness is interpreted.'
]),
('III. CORPUS BENCHMARK AND METHODS', [
'The controlled English only artifact set contains 2,033 chunks produced from fixed windows of 200 words with 50 word overlap. It contains 77 benchmark questions: 65 answerable and 12 unanswerable. The saved evaluation configuration specifies that unanswerable analysis is descriptive only, so no rejection accuracy is reported here. Answerable relevance requires both the expected source file and an overlap with the gold PDF pages.',
'BM25 uses lowercase whitespace tokenization and BM25Okapi. Dense retrieval uses sentence-transformers/all-MiniLM-L6-v2 embeddings with 384 dimensions, L2 normalization, and FAISS IndexFlatIP; under normalized vectors, inner product is cosine equivalent. Fixed reciprocal rank fusion uses k equal to 60 and evaluates candidates through rank ten. The artifact manifest records aligned chunk metadata, embeddings, BM25 documents, and FAISS vectors, which is necessary for a meaningful comparison.',
'The notebook extends the analysis with source grounding and printed page to PDF page mapping. In the V2 pilot, the initial validation found that apparent failures partly reflected a page convention mismatch. The authoritative mapping preserves the original page field and adds a retrieval compatible PDF page field rather than overwriting the benchmark. This preserves auditability and prevents a false improvement caused by changing the target after the result is known.'
]),
('IV. RETRIEVAL RESULTS', [
'On the 65 answerable questions, BM25 is the strongest recorded baseline at early ranks. Its Hit at 1 is 0.446, Hit at 5 is 0.600, Hit at 10 is 0.631, MRR is 0.509, and nDCG at 10 is 0.525. Dense MiniLM retrieval reaches 0.169, 0.262, 0.338, 0.210, and 0.234 for the same metrics. Fixed RRF improves on dense retrieval at most reported cutoffs, with Hit at 5 of 0.508 and Hit at 10 of 0.631, but it does not exceed BM25 in MRR or nDCG.',
'The result is useful precisely because it is not the expected narrative that a semantic retriever must win. Textbook questions often reuse distinctive words from the source material. A lexical system can therefore be strong when the query vocabulary overlaps the curriculum language, while a dense model may retrieve broadly related content from another grade, subject, or page. Fixed fusion helps, but a fixed parameterization is not a substitute for careful candidate analysis and metadata constraints.',
'Multi page questions remain a major limitation. In the saved question type summary, BM25 Hit at 10 for thirteen multi page questions is 0.077, while direct or paraphrase and hard distractor questions reach 0.757 and 0.800. This gap shows why source match alone is insufficient. A tutoring answer can be topically plausible after retrieving one page yet remain incomplete when the target requires evidence from more than one page.'
]),
('V. ARCHITECTURE AND DEPLOYMENT PATH', [
'Figure 1 separates the long term product architecture from components already evaluated. The diagram includes offline text, table, and image lanes; normalization and curriculum metadata; lexical, dense, and multimodal indexes; learner onboarding; and response feedback. The current repository materially implements the English only text retrieval path, a local cross encoder reranker, account and practice flows, a Whisper integration route, and the guardrail subsystem. Multimodal indexing, reliable evidence verification, uncertainty aware abstention, and learner state adaptation remain planned or partially explored rather than completed evaluations.',
'The running retrieval service loads the persisted chunk table, metadata, BM25 index, embedding matrix, and FAISS index. At startup it asserts chunk count, metadata order, embedding shape, FAISS vector count, and tokenized BM25 document count. At query time it produces 50 dense and 50 lexical candidates, combines their ranks using RRF, then reranks the merged candidates with cross-encoder/ms-marco-MiniLM-L-6-v2 and returns at most five passages. The Node bridge uses a bounded timeout, validates response shape, filters low reranker scores, and prefers passages matching the learner class when such evidence survives.',
'The reranking route is an implementation contribution, not a performance claim. The repository contains a smoke test and local service configuration, but no controlled aggregate comparison proving cross encoder gains. This report therefore positions reranking as an operational component that should be evaluated next on a frozen benchmark with page aware relevance and a human review protocol.'
]),
('VI. EVIDENCE GROUNDED GENERATION AND ABSTENTION', [
'The notebook records a fifty question human reviewed generation study. The saved output reports strict correctness of 0.694, strict evidence faithfulness of 0.680, and unsupported claims in 0.320 of reviewed answers. These values are diagnostic rather than a claim of general performance because the sample, model configuration, and annotation workflow require further replication. Still, the result establishes that retrieval quality and answer support are separate problems.',
'The same study found weak abstention behavior. Human review labelled seven cases as should have abstained and two as appropriate abstentions, while the model abstained only twice. The recorded abstention precision and recall were both 0.0 under the stated evaluation. A subsequent NLI based sufficiency probe was inaccurate at the diagnostic threshold, achieving 0.32 accuracy against a human evidence sufficiency annotation. This is an important negative result: a generic entailment score cannot be treated as a reliable evidence gate without calibration and validation.',
'For the deployed tutor, the safest present policy is transparent limitation. When evidence is missing, insufficient, or contradictory, the response should say so plainly, avoid invented page claims, and invite clarification or additional context. A future evidence gate should be evaluated separately for answerability, evidence sufficiency, false abstention, and child appropriate fallback quality.'
]),
('VII. GUARDRAIL DESIGN', [
'The guardrail subsystem implements defense in depth around the model call. The input layer applies NFKD normalization, removes zero width characters, replaces control characters, collapses whitespace, and checks prompt leak requests, instruction overrides, jailbreak personas, delimiter tampering, child unsafe profanity, and dangerous content. Unsafe input returns an age appropriate fallback without calling either the retriever or the model provider.',
'The second layer builds a hardened system instruction. It states the tutoring role, confines retrieved evidence and conversation history to untrusted data, prohibits instruction following from those sources, supplies age appropriate pedagogy guidance, and repeats the most important confidentiality and safety constraints after the untrusted context. The third layer inspects generated text for prompt leak signatures, disclosure patterns, unsafe language, and dangerous content before returning a safe replacement when needed.',
'Automated tests cover the intended control flow: prompt extraction, instruction override, delimiter injection, unsafe content, age adaptive fallback, hardened prompt construction, output interception, and end to end short circuiting. The tests passed in the current workspace. The design does not establish immunity to all attacks. Pattern based rules can miss novel attacks and may overblock benign text; they should be accompanied by monitoring, red teaming, privacy controls, and careful incident review in any real deployment.'
]),
('VIII. ETHICS LIMITATIONS AND FUTURE WORK', [
'The practice flow samples 25 puzzles from a 64 item bank and saves raw category counts. The repository correctly treats these counts as design labels for supportive explanation choices rather than validated skills, intelligence, diagnosis, or placement. Any use with children requires guardian consent, data minimization, secure account management, accessible interaction design, and a clear pathway for adult support.',
'Future research should prioritize source aware and multi page evaluation, human adjudication of retrieval relevance, a calibrated evidence sufficiency gate, benchmarked reranking, and a documented abstention policy. Structure aware chunking and curriculum filtering should be compared against the fixed 200 and 50 baseline using the same frozen relevance protocol. Speech, multilingual use, visual question answering, and learner state updates should be evaluated as separate workstreams rather than inferred from architecture diagrams.',
'The project is strongest when it remains precise about this boundary. It is a reproducible prototype and evaluation pipeline that surfaces useful negative findings, not yet a validated educational intervention. That framing makes the next technical decisions clearer and protects against overclaiming in a child focused domain.'
]),
('IX. CONCLUSION', [
'This comprehensive report documents a safety guarded NCERT grounded tutoring prototype. On the recorded English only benchmark, lexical BM25 outperformed dense MiniLM retrieval and fixed RRF on the most informative ranking metrics. The notebook confirms that source and page provenance materially affect benchmark validity, while generation review shows that retrieval alone does not guarantee supported answers. The implemented guardrails add input screening, prompt isolation, and output screening to the application path. The most responsible next step is targeted evaluation of evidence sufficiency, abstention, and cross encoder reranking, followed by child safety and privacy review before any broader deployment.'
])]

references = [
'[1] P. Lewis et al., Retrieval Augmented Generation for Knowledge Intensive NLP Tasks, Advances in Neural Information Processing Systems, 2020.',
'[2] S. Robertson and H. Zaragoza, The Probabilistic Relevance Framework BM25 and Beyond, Foundations and Trends in Information Retrieval, 2009.',
'[3] N. Reimers and I. Gurevych, Sentence BERT Sentence Embeddings using Siamese BERT Networks, EMNLP IJCNLP, 2019.',
'[4] G. V. Cormack, C. L. A. Clarke, and S. Buettcher, Reciprocal Rank Fusion Outperforms Condorcet and Individual Rank Learning Methods, SIGIR, 2009.',
'[5] J. Johnson, M. Douze, and H. Jegou, Billion scale Similarity Search with GPUs, IEEE Transactions on Big Data, 2021.',
'[6] OWASP Foundation, OWASP Top 10 for Large Language Model Applications, 2025. Available at https://genai.owasp.org/llm-top-10/.',
'[7] National Institute of Standards and Technology, Artificial Intelligence Risk Management Framework AI RMF 1.0, NIST AI 100 1, 2023.'
]

def make_pdf():
    st=getSampleStyleSheet(); title=ParagraphStyle('t', parent=st['Title'], fontName='Times-Bold', fontSize=17, leading=20, alignment=TA_CENTER, spaceAfter=4); sub=ParagraphStyle('s', parent=st['BodyText'], fontName='Times-Italic', fontSize=10, alignment=TA_CENTER, spaceAfter=13); body=ParagraphStyle('b', parent=st['BodyText'], fontName='Times-Roman', fontSize=10.2, leading=13.1, alignment=TA_JUSTIFY, spaceAfter=7); head=ParagraphStyle('h', parent=st['Heading2'], fontName='Times-Bold', fontSize=11.5, leading=14, spaceBefore=9, spaceAfter=5); cap=ParagraphStyle('c', parent=body, fontSize=8.5, leading=10, alignment=TA_CENTER, spaceBefore=2, spaceAfter=8); small=ParagraphStyle('sm', parent=body, fontSize=8.6, leading=10.5)
    def footer(c,d):
        c.saveState(); c.setStrokeColor(colors.HexColor('#808080')); c.setLineWidth(.25); c.line(16*mm,13*mm,A4[0]-16*mm,13*mm); c.setFont('Times-Roman',8); c.drawString(16*mm,8*mm,'NCERT Grounded Adaptive AI Tutor'); c.drawRightString(A4[0]-16*mm,8*mm,f'Page {d.page}'); c.restoreState()
    story=[Paragraph(TITLE,title),Paragraph(SUBTITLE,sub),Paragraph(AUTHORS,ParagraphStyle('a',parent=body,alignment=TA_CENTER,fontSize=10,spaceAfter=13)),Paragraph('<b>Abstract-</b> This report consolidates the retrieval artifacts, experimental notebook, application implementation, and recent guardrails of an NCERT grounded adaptive tutor prototype. The study evaluates BM25, dense MiniLM FAISS, and fixed Reciprocal Rank Fusion over 2,033 English only chunks and 65 answerable benchmark questions. BM25 is the strongest recorded baseline at early ranks and at Hit at 5, while multi page retrieval and evidence sufficiency remain weak. The prototype additionally implements a local RRF plus cross encoder service and a three layer guardrail system. The paper distinguishes implemented results from planned architecture and documents a research agenda for provenance, abstention, and child safety.',body),Paragraph('<b>Index Terms-</b> retrieval augmented generation, NCERT, educational AI, BM25, dense retrieval, guardrails, evidence grounding.',body)]
    for i,(name,paras) in enumerate(sections):
        story.append(Paragraph(name,head)); story += [Paragraph(x,body) for x in paras]
        if i==1:
            im=Image(str(ARCH),width=155*mm,height=199*mm); story += [Spacer(1,3),im,Paragraph('Fig. 1. Project architecture. Solid components are implemented or prototyped; several multimodal, cognitive-profile, and feedback paths remain proposed research directions.',cap)]
        if i==3:
            data=[[Paragraph('<b>Method</b>',small),Paragraph('<b>Hit@1</b>',small),Paragraph('<b>Hit@5</b>',small),Paragraph('<b>Hit@10</b>',small),Paragraph('<b>MRR</b>',small),Paragraph('<b>nDCG@10</b>',small)],['BM25','0.446','0.600','0.631','0.509','0.525'],['Dense MiniLM','0.169','0.262','0.338','0.210','0.234'],['Fixed RRF','0.231','0.508','0.631','0.347','0.410']]
            tb=Table(data,colWidths=[36*mm,24*mm,24*mm,25*mm,24*mm,27*mm]); tb.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#183B5B')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.25,colors.HexColor('#B7C3CC')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#F3F6F8')]),('ALIGN',(1,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)])); story += [Paragraph('TABLE I. RECORDED ENGLISH ONLY RETRIEVAL RESULTS',cap),tb,Spacer(1,7)]
    story.append(Paragraph('REFERENCES',head)); story += [Paragraph(x,small) for x in references]
    SimpleDocTemplate(str(PDF),pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=16*mm,bottomMargin=20*mm).build(story,onFirstPage=footer,onLaterPages=footer)

def make_docx():
    d=Document(); s=d.sections[0]; s.top_margin=Inches(.65); s.bottom_margin=Inches(.65); s.left_margin=Inches(.72); s.right_margin=Inches(.72)
    p=d.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run(TITLE); r.bold=True; r.font.name='Times New Roman'; r.font.size=Pt(18)
    p=d.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run(SUBTITLE); r.italic=True; r.font.name='Times New Roman'; r.font.size=Pt(11)
    p=d.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run(AUTHORS); r.font.name='Times New Roman'; r.font.size=Pt(10)
    def add(text, bold=False):
        p=d.add_paragraph(); p.paragraph_format.space_after=Pt(6); p.paragraph_format.line_spacing=1.08; r=p.add_run(text); r.font.name='Times New Roman'; r.font.size=Pt(10.5); r.bold=bold
    add('Abstract. This report consolidates the retrieval artifacts, experimental notebook, application implementation, and recent guardrails of an NCERT grounded adaptive tutor prototype. It distinguishes completed retrieval and security results from proposed architecture and educational aspirations.')
    add('Index Terms. retrieval augmented generation, NCERT, educational AI, BM25, dense retrieval, guardrails, evidence grounding.')
    for i,(name,paras) in enumerate(sections):
        p=d.add_paragraph(); p.paragraph_format.space_before=Pt(9); r=p.add_run(name); r.bold=True; r.font.name='Times New Roman'; r.font.size=Pt(12)
        for x in paras: add(x)
        if i==1:
            p=d.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run().add_picture(str(ARCH),width=Inches(5.9)); p=d.add_paragraph('Figure 1. Project architecture and research boundaries.'); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
        if i==3:
            table=d.add_table(rows=1,cols=6); table.style='Table Grid'; hdr=['Method','Hit@1','Hit@5','Hit@10','MRR','nDCG@10'];
            for c,t in zip(table.rows[0].cells,hdr): c.text=t
            for row in [['BM25','0.446','0.600','0.631','0.509','0.525'],['Dense MiniLM','0.169','0.262','0.338','0.210','0.234'],['Fixed RRF','0.231','0.508','0.631','0.347','0.410']]:
                cells=table.add_row().cells
                for c,t in zip(cells,row): c.text=t
    p=d.add_paragraph(); r=p.add_run('REFERENCES'); r.bold=True; r.font.size=Pt(12); r.font.name='Times New Roman'
    for x in references: add(x)
    d.save(DOCX)

PDF.parent.mkdir(parents=True,exist_ok=True); make_pdf(); make_docx(); print(PDF); print(DOCX)
