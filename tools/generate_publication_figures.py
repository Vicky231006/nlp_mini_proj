#!/usr/bin/env python3
"""
generate_publication_figures.py
Generates comprehensive IEEE publication-grade charts from empirical NCERT benchmark data:
1. Fig 2: Sparse (BM25) vs. Dense (MiniLM) vs. Hybrid RRF Ranking Progression (Hit@k & MRR)
2. Fig 3: Progressive Curriculum Filtering Ablation (Candidate Reduction vs. MRR & Hit@10)
3. Fig 4: Query Complexity Breakdown & The Multi-Page Synthesized Degradation Cliff
4. Fig 5: Two-Stage Child-Perspective Retrieval (BM25 vs. Dense vs. Cross-Encoder ms-marco-MiniLM)
5. Fig 6: LLM Evidence Grounding, Unsupported Claims, and Abstention Collapse Profile
6. Fig 7: Three-Tier Safety Control Plane Interception Matrix (33 Regression Tests)

Outputs:
  figures/*.pdf (Vector format for LaTeX)
  figures/*.png (High-resolution 300 DPI for rendering)
"""

import os
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
FIG_DIR = ROOT / "figures"
FIG_DIR.mkdir(parents=True, exist_ok=True)

# Set IEEE Publication Style
plt.rcParams.update({
    "font.family": "serif",
    "font.size": 10,
    "axes.labelsize": 10,
    "axes.titlesize": 11,
    "xtick.labelsize": 9,
    "ytick.labelsize": 9,
    "legend.fontsize": 8.5,
    "figure.titlesize": 12,
    "lines.linewidth": 1.8,
    "lines.markersize": 6,
    "grid.alpha": 0.35,
    "grid.linestyle": "--",
    "axes.grid": True,
    "savefig.dpi": 300,
    "savefig.bbox": "tight",
})

# ==============================================================================
# Figure 2: BM25 vs Dense vs Hybrid RRF Progression
# ==============================================================================
def plot_retrieval_comparison():
    fig, ax = plt.subplots(figsize=(5.5, 3.6))
    k_vals = [1, 3, 5, 10]
    
    # Empirical Benchmark Data (65 Answerable English-Only Questions)
    bm25_hits = [0.4462, 0.5538, 0.6000, 0.6308]
    dense_hits = [0.1692, 0.2308, 0.2615, 0.3385]
    rrf_hits = [0.2308, 0.4154, 0.5077, 0.6308]
    
    ax.plot(k_vals, bm25_hits, marker="o", color="#1f77b4", label="BM25 (Sparse Okapi, MRR: 0.5094)")
    ax.plot(k_vals, rrf_hits, marker="s", color="#2ca02c", linestyle="-.", label="Fixed RRF (k=60, MRR: 0.3472)")
    ax.plot(k_vals, dense_hits, marker="^", color="#d62728", linestyle="--", label="Dense (all-MiniLM-L6-v2, MRR: 0.2104)")
    
    # Annotate Key Finding
    ax.annotate("+163.7% BM25 over Dense",
                xy=(1, 0.4462), xytext=(1.8, 0.38),
                arrowprops=dict(arrowstyle="->", color="#1f77b4", lw=1.2),
                fontsize=8.5, fontweight="bold", color="#1f77b4")
    
    ax.set_title("Empirical Retrieval Comparison (65 Answerable Questions, 2,033 Chunks)", pad=10)
    ax.set_xlabel("Cutoff Rank (k)")
    ax.set_ylabel("Hit@k (Relevance Rate)")
    ax.set_xticks(k_vals)
    ax.set_ylim(0.10, 0.70)
    ax.legend(loc="lower right", framealpha=0.92)
    
    fig.tight_layout()
    fig.savefig(FIG_DIR / "fig_retrieval_comparison.pdf")
    fig.savefig(FIG_DIR / "fig_retrieval_comparison.png")
    plt.close(fig)
    print("Saved fig_retrieval_comparison")

# ==============================================================================
# Figure 3: Progressive Curriculum Filtering Ablation
# ==============================================================================
def plot_curriculum_filtering():
    fig, ax1 = plt.subplots(figsize=(6.0, 3.6))
    
    stages = ["Unfiltered\n(Full Corpus)", "Class-Level\nFilter", "Class + Subject\nFilter", "Class + Subj +\nBook Filter"]
    candidates = [3023.0, 890.6, 154.3, 139.0]
    hit10 = [0.6300, 0.6800, 0.7300, 0.7500]
    mrr = [0.5682, 0.6054, 0.6451, 0.6568]
    
    x = np.arange(len(stages))
    width = 0.25
    
    # Left Axis: Candidate Count (Bar chart or fill)
    color1 = "#4c72b0"
    rects1 = ax1.bar(x - width/2, candidates, width=width*1.1, color=color1, alpha=0.35, label="Candidate Pool Size (Chunks)")
    ax1.set_ylabel("Mean Candidate Chunks (Search Space)", color="#1a365d")
    ax1.tick_params(axis="y", labelcolor="#1a365d")
    ax1.set_yscale("log")
    ax1.set_ylim(50, 6000)
    
    # Annotate log candidate reduction
    ax1.annotate("95.4% Search Space Reduction\n(3,023 → 139 Chunks)", xy=(3, 139.0), xytext=(1.8, 180),
                 arrowprops=dict(arrowstyle="->", color="#1a365d", lw=1.1),
                 fontsize=8, color="#1a365d", fontweight="bold")
    
    # Right Axis: Accuracy Metrics (Lines)
    ax2 = ax1.twinx()
    color2 = "#2e7d32"
    color3 = "#d95f02"
    line1 = ax2.plot(x, hit10, marker="D", color=color2, linewidth=2.0, label="Hit@10")
    line2 = ax2.plot(x, mrr, marker="s", color=color3, linewidth=2.0, linestyle="--", label="MRR")
    ax2.set_ylabel("Retrieval Metric Score", color="#1b5e20")
    ax2.tick_params(axis="y", labelcolor="#1b5e20")
    ax2.set_ylim(0.50, 0.80)
    ax2.grid(False) # avoid clutter
    
    ax1.set_xticks(x)
    ax1.set_xticklabels(stages)
    ax1.set_title("Curriculum Metadata Filtering Ablation (100 Answerable Queries)", pad=10)
    
    # Combined legend
    lines = [rects1, line1[0], line2[0]]
    labels = [l.get_label() for l in lines]
    ax1.legend(lines, labels, loc="upper right", framealpha=0.92)
    
    fig.tight_layout()
    fig.savefig(FIG_DIR / "fig_curriculum_filtering.pdf")
    fig.savefig(FIG_DIR / "fig_curriculum_filtering.png")
    plt.close(fig)
    print("Saved fig_curriculum_filtering")

# ==============================================================================
# Figure 4: Query Complexity & The Multi-Page Boundary
# ==============================================================================
def plot_query_stratification():
    fig, ax = plt.subplots(figsize=(5.8, 3.6))
    
    categories = ["Direct / Paraphrase\n(N=37)", "Hard Distractor\n(N=15)", "Multi-Page Synthesized\n(N=13)"]
    bm25_scores = [0.7568, 0.8000, 0.0769]
    dense_scores = [0.4054, 0.3333, 0.1538]
    
    x = np.arange(len(categories))
    width = 0.35
    
    rects1 = ax.bar(x - width/2, bm25_scores, width, label="BM25 (Sparse)", color="#1f77b4", edgecolor="black", linewidth=0.5)
    rects2 = ax.bar(x + width/2, dense_scores, width, label="Dense (all-MiniLM-L6-v2)", color="#ff7f0e", edgecolor="black", linewidth=0.5)
    
    # Value labels on bars
    for rect in rects1:
        h = rect.get_height()
        ax.annotate(f"{h:.3f}", xy=(rect.get_x() + rect.get_width()/2, h),
                    xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=8.5, fontweight="bold")
    for rect in rects2:
        h = rect.get_height()
        ax.annotate(f"{h:.3f}", xy=(rect.get_x() + rect.get_width()/2, h),
                    xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=8.5)
    
    # Catastrophic Collapse Annotation
    ax.annotate("Catastrophic Collapse\n(Hit@10: 0.0769)", xy=(2 - width/2, 0.0769), xytext=(1.45, 0.28),
                arrowprops=dict(arrowstyle="->", color="#b71c1c", lw=1.3),
                fontsize=8.5, color="#b71c1c", fontweight="bold")
    
    ax.set_title("Hit@10 Performance Stratified by Query Complexity", pad=10)
    ax.set_ylabel("Hit@10 Score")
    ax.set_xticks(x)
    ax.set_xticklabels(categories)
    ax.set_ylim(0, 0.95)
    ax.legend(loc="upper right", framealpha=0.92)
    
    fig.tight_layout()
    fig.savefig(FIG_DIR / "fig_query_stratification.pdf")
    fig.savefig(FIG_DIR / "fig_query_stratification.png")
    plt.close(fig)
    print("Saved fig_query_stratification")

# ==============================================================================
# Figure 5: Two-Stage Child-Perspective Retrieval & Reranker
# ==============================================================================
def plot_two_stage_reranking():
    fig, ax = plt.subplots(figsize=(5.6, 3.6))
    
    models = ["BM25\n(Baseline)", "Dense\n(MiniLM)", "Two-Stage RRF +\nCross-Encoder"]
    rel_5 = [0.8372, 0.9302, 0.9535]
    mrr = [0.7248, 0.8508, 0.9244]
    ndcg_5 = [0.8185, 0.9331, 0.9780]
    
    x = np.arange(len(models))
    width = 0.25
    
    ax.bar(x - width, rel_5, width, label="Relevant@5", color="#2b5c8f", edgecolor="black", linewidth=0.5)
    ax.bar(x, mrr, width, label="MRR", color="#388e3c", edgecolor="black", linewidth=0.5)
    ax.bar(x + width, ndcg_5, width, label="nDCG@5", color="#e65100", edgecolor="black", linewidth=0.5)
    
    # Peak Reranker Annotation
    ax.annotate("MRR: 0.9244\nnDCG@5: 0.9780", xy=(2, 0.9535), xytext=(1.25, 0.62),
                arrowprops=dict(arrowstyle="->", color="#1b5e20", lw=1.2),
                fontsize=8.5, color="#1b5e20", fontweight="bold")
    
    ax.set_title("Conversational Child Benchmark (43 Answerable Items)", pad=10)
    ax.set_ylabel("Retrieval / Ranking Metric Score")
    ax.set_xticks(x)
    ax.set_xticklabels(models)
    ax.set_ylim(0.55, 1.05)
    ax.legend(loc="lower left", framealpha=0.92)
    
    fig.tight_layout()
    fig.savefig(FIG_DIR / "fig_two_stage_reranking.pdf")
    fig.savefig(FIG_DIR / "fig_two_stage_reranking.png")
    plt.close(fig)
    print("Saved fig_two_stage_reranking")

# ==============================================================================
# Figure 6: Generation Grounding, Hallucination & Abstention Gap
# ==============================================================================
def plot_grounding_and_abstention():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(6.8, 3.4), gridspec_kw={'width_ratios': [1.3, 1.0]})
    
    # Subplot A: Evidence Grounding (Qwen-1.5B, 50 queries)
    dims = ["Lenient\nCorrect", "Strict\nCorrect", "Unsupported\nClaims", "Major\nHallucination"]
    rates = [87.76, 69.39, 32.00, 14.00]
    colors_a = ["#2e7d32", "#1976d2", "#f57c00", "#d32f2f"]
    
    bars = ax1.bar(dims, rates, color=colors_a, width=0.55, edgecolor="black", linewidth=0.5)
    for b in bars:
        h = b.get_height()
        ax1.annotate(f"{h:.1f}%", xy=(b.get_x() + b.get_width()/2, h),
                     xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=8.5, fontweight="bold")
    
    ax1.set_ylabel("Percentage of Answers (%)")
    ax1.set_ylim(0, 105)
    ax1.set_title("(a) Student Generation Grounding (N=50)", fontsize=9.5)
    
    # Subplot B: Abstention Failure on Unanswerable Queries (N=7)
    categories_b = ["Hallucinated\nAnswer", "Correct\nAbstention"]
    rates_b = [57.14, 0.00]
    colors_b = ["#b71c1c", "#388e3c"]
    
    bars_b = ax2.bar(categories_b, rates_b, color=colors_b, width=0.45, edgecolor="black", linewidth=0.5)
    for b in bars_b:
        h = b.get_height()
        ax2.annotate(f"{h:.1f}%", xy=(b.get_x() + b.get_width()/2, h),
                     xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=8.5, fontweight="bold")
    
    ax2.set_ylabel("Rate on Unanswerables (%)")
    ax2.set_ylim(0, 105)
    ax2.set_title("(b) Abstention Breakdown (N=7)", fontsize=9.5)
    
    fig.suptitle("Factual Grounding and Abstention Pathology in Primary Tutoring", y=1.02, fontsize=10.5, fontweight="bold")
    fig.tight_layout()
    fig.savefig(FIG_DIR / "fig_grounding_abstention.pdf")
    fig.savefig(FIG_DIR / "fig_grounding_abstention.png")
    plt.close(fig)
    print("Saved fig_grounding_abstention")

# ==============================================================================
# Figure 7: Three-Tier Safety Control Plane Interception
# ==============================================================================
def plot_guardrail_mitigation():
    fig, ax = plt.subplots(figsize=(6.2, 3.4))
    
    threats = [
        "System Prompt Extraction",
        "Instruction Overrides (Jailbreak)",
        "Roleplay Personas (DAN)",
        "Delimiter Tampering (<system>)",
        "Child Safety & Vulgarity",
        "System Leak Output Quarantine"
    ]
    test_counts = [6, 5, 4, 4, 5, 5]
    block_rates = [100.0, 100.0, 100.0, 100.0, 100.0, 100.0]
    
    y = np.arange(len(threats))
    
    bars = ax.barh(y, block_rates, color="#1565c0", height=0.55, edgecolor="black", linewidth=0.5)
    
    # Annotate test counts
    for i, (b, count) in enumerate(zip(bars, test_counts)):
        ax.annotate(f"100% ({count}/{count} tests blocked)",
                    xy=(102, b.get_y() + b.get_height()/2),
                    va="center", fontsize=8.5, fontweight="bold", color="#0d47a1")
    
    ax.set_yticks(y)
    ax.set_yticklabels(threats)
    ax.invert_yaxis()
    ax.set_xlabel("Adversarial Interception Rate (%)")
    ax.set_xlim(0, 135)
    ax.set_title("3-Tier Safety Control Plane: Empirical Interception Matrix", pad=10)
    
    fig.tight_layout()
    fig.savefig(FIG_DIR / "fig_guardrail_mitigation.pdf")
    fig.savefig(FIG_DIR / "fig_guardrail_mitigation.png")
    plt.close(fig)
    print("Saved fig_guardrail_mitigation")

if __name__ == "__main__":
    plot_retrieval_comparison()
    plot_curriculum_filtering()
    plot_query_stratification()
    plot_two_stage_reranking()
    plot_grounding_and_abstention()
    plot_guardrail_mitigation()
    print("All 6 publication figures generated successfully in 'figures/'!")

