#!/usr/bin/env python3
"""
generate_new_figures.py
Generates IEEE publication-grade charts for:
1. Fig 8: Cognitive Adaptation & Readability Modulation across Raven's CPM Tiers
2. Fig 9: Raven's CPM Construct Breakdown & Multi-Subject Cross-Grade Verification Matrix
"""

from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
FIG_DIR = ROOT / "figures"
FIG_DIR.mkdir(parents=True, exist_ok=True)

# IEEE Publication Style
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
# Figure 8: Dynamic Cognitive Adaptation Across Raven's CPM Tiers
# ==============================================================================
def plot_cognitive_adaptation():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(7.2, 3.4))
    
    tiers = ["Foundational\n(CPM 0–14)", "Intermediate\n(CPM 15–20)", "Advanced\n(CPM 21–25)"]
    x = np.arange(len(tiers))
    width = 0.32
    
    # Readability Metrics
    fk_grades = [1.1, 3.8, 5.1]
    sent_lens = [5.7, 11.2, 12.0]
    fre_scores = [94.8, 83.1, 78.6]
    
    # Panel (a): Flesch-Kincaid & Sentence Length vs Reading Ease
    b1 = ax1.bar(x - width/2, fk_grades, width=width, color="#1f77b4", label="F-K Grade Level", edgecolor="black", linewidth=0.5)
    b2 = ax1.bar(x + width/2, sent_lens, width=width, color="#2ca02c", label="Mean Sent. Length (words)", edgecolor="black", linewidth=0.5)
    
    ax1.set_ylabel("Grade Level / Sentence Length")
    ax1.set_ylim(0, 15)
    ax1.set_xticks(x)
    ax1.set_xticklabels(tiers, fontsize=8.5)
    
    # Annotate bars
    for b in b1:
        h = b.get_height()
        ax1.annotate(f"{h:.1f}", xy=(b.get_x() + b.get_width()/2, h),
                     xytext=(0, 2), textcoords="offset points", ha="center", va="bottom", fontsize=8, fontweight="bold")
    for b in b2:
        h = b.get_height()
        ax1.annotate(f"{h:.1f}", xy=(b.get_x() + b.get_width()/2, h),
                     xytext=(0, 2), textcoords="offset points", ha="center", va="bottom", fontsize=8, fontweight="bold")
    
    # Secondary axis for Flesch Reading Ease
    ax1_twin = ax1.twinx()
    ax1_twin.grid(False)
    p_fre = ax1_twin.plot(x, fre_scores, color="#d62728", marker="o", linewidth=2.0, label="Reading Ease (FRE)")
    ax1_twin.set_ylabel("Flesch Reading Ease (0-100)", color="#d62728")
    ax1_twin.set_ylim(60, 105)
    ax1_twin.tick_params(axis='y', labelcolor="#d62728")
    for xi, yi in zip(x, fre_scores):
        ax1_twin.annotate(f"{yi:.1f}", xy=(xi, yi), xytext=(0, 4), textcoords="offset points", ha="center", fontsize=8, fontweight="bold", color="#d62728")
        
    ax1.set_title("(a) Readability & Syntactic Depth", fontsize=9.5)
    
    # Combine legends
    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax1_twin.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, labels1 + labels2, loc="upper left", fontsize=7.5)
    
    # Panel (b): Pedagogical Scaffolding Directives
    scaffold_densities = [92.0, 58.0, 22.0]  # Concrete sensory cues & high scaffolding %
    socratic_checks = [15.0, 65.0, 95.0]     # Open-ended / counterfactual inquiry %
    
    b3 = ax2.bar(x - width/2, scaffold_densities, width=width, color="#ff7f0e", label="Scaffolding / Concrete Cues", edgecolor="black", linewidth=0.5)
    b4 = ax2.bar(x + width/2, socratic_checks, width=width, color="#9467bd", label="Socratic / Abstract Inquiry", edgecolor="black", linewidth=0.5)
    
    ax2.set_ylabel("Pedagogical Directive Frequency (%)")
    ax2.set_ylim(0, 115)
    ax2.set_xticks(x)
    ax2.set_xticklabels(tiers, fontsize=8.5)
    ax2.set_title("(b) Pedagogical Steering Profile", fontsize=9.5)
    ax2.legend(loc="upper center", fontsize=7.5)
    
    for b in b3:
        h = b.get_height()
        ax2.annotate(f"{h:.0f}%", xy=(b.get_x() + b.get_width()/2, h),
                     xytext=(0, 2), textcoords="offset points", ha="center", va="bottom", fontsize=8, fontweight="bold")
    for b in b4:
        h = b.get_height()
        ax2.annotate(f"{h:.0f}%", xy=(b.get_x() + b.get_width()/2, h),
                     xytext=(0, 2), textcoords="offset points", ha="center", va="bottom", fontsize=8, fontweight="bold")
    
    fig.suptitle("Dynamic Cognitive Adaptation Across Raven's CPM Assessment Tiers", y=1.02, fontsize=10.5, fontweight="bold")
    fig.tight_layout()
    fig.savefig(FIG_DIR / "fig_cognitive_adaptation.pdf")
    fig.savefig(FIG_DIR / "fig_cognitive_adaptation.png")
    plt.close(fig)
    print("Saved fig_cognitive_adaptation")

# ==============================================================================
# Figure 9: Raven's CPM Constructs & Multi-Subject Verification Matrix
# ==============================================================================
def plot_cpm_and_multisubject():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(7.2, 3.4))
    
    # Panel (a): Raven's CPM 4 Cognitive Constructs Distribution
    constructs = [
        "Pattern\nCompletion",
        "Reasoning\nby Analogy",
        "Spatial\nOrganization",
        "Seriation &\nVariation"
    ]
    item_counts = [6, 7, 6, 6]  # 25 total items
    colors_c = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]
    
    y = np.arange(len(constructs))
    bars = ax1.barh(y, item_counts, color=colors_c, height=0.55, edgecolor="black", linewidth=0.5)
    ax1.set_yticks(y)
    ax1.set_yticklabels(constructs, fontsize=8.5)
    ax1.invert_yaxis()
    ax1.set_xlabel("Item Bank Count (N=25 Items)")
    ax1.set_xlim(0, 9)
    ax1.set_title("(a) Raven's CPM Construct Battery", fontsize=9.5)
    
    for b in bars:
        w = b.get_width()
        ax1.annotate(f"{w} items ({w/25*100:.0f}%)", xy=(w + 0.2, b.get_y() + b.get_height()/2),
                     va="center", fontsize=8, fontweight="bold")
                     
    # Panel (b): Multi-Subject & Cross-Grade Verification Performance
    grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4"]
    subjects = ["English", "Mathematics", "Science/EVS", "Arts & Reading"]
    
    # 2D Hit@5 retrieval rate across grades and subjects
    matrix = np.array([
        [0.96, 0.94, 0.92, 0.90],  # Grade 1 (Mridang, Joyful Math)
        [0.98, 0.95, 0.94, 0.92],  # Grade 2 (Mridang, Joyful Math)
        [0.95, 0.92, 0.96, 0.88],  # Grade 3 (Santoor, Maths Mela, Our Wondrous World, Bansuri)
        [0.94, 0.91, 0.95, 0.89],  # Grade 4 (Santoor, Maths Mela, Our Wondrous World, Bansuri)
    ])
    
    im = ax2.imshow(matrix, cmap="Blues", vmin=0.80, vmax=1.0)
    ax2.set_xticks(np.arange(len(subjects)))
    ax2.set_yticks(np.arange(len(grades)))
    ax2.set_xticklabels(subjects, rotation=25, ha="right", fontsize=8)
    ax2.set_yticklabels(grades, fontsize=8.5)
    ax2.set_title("(b) Multi-Subject Hit@5 Pass Rate", fontsize=9.5)
    
    # Annotate matrix values
    for i in range(len(grades)):
        for j in range(len(subjects)):
            val = matrix[i, j]
            text_color = "white" if val > 0.93 else "black"
            ax2.text(j, i, f"{val*100:.1f}%", ha="center", va="center", color=text_color, fontsize=8, fontweight="bold")
            
    cbar = fig.colorbar(im, ax=ax2, fraction=0.046, pad=0.04)
    cbar.set_label("Pass Rate", fontsize=8)
    cbar.ax.tick_params(labelsize=7)
    
    fig.suptitle("Psychometric Battery & Cross-Curricular Generalization Matrix", y=1.02, fontsize=10.5, fontweight="bold")
    fig.tight_layout()
    fig.savefig(FIG_DIR / "fig_cpm_multisubject.pdf")
    fig.savefig(FIG_DIR / "fig_cpm_multisubject.png")
    plt.close(fig)
    print("Saved fig_cpm_multisubject")

if __name__ == "__main__":
    plot_cognitive_adaptation()
    plot_cpm_and_multisubject()
    print("New figures successfully created in 'figures/'!")

