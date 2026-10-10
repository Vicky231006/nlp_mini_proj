# Visual Reasoning Activity

A browser-based, low-stakes visual reasoning activity. Each session selects 25 distinct items from the 64-item bank, balanced across its four designer-assigned item tags. The activity reports answers to the items shown; it is not a standardized or validated psychological or educational test.

## Run

Open `index.html` in a modern browser. No build step or server is required.

## Files

- `index.html` — page structure and user-facing limitations.
- `styles.css` — layout, responsive styling, and accessibility states.
- `app.js` — session sampling, navigation, response handling, scoring, review, and export.
- `questions.js` — the 64-item bank, answer keys, designer-assigned tiers, and tags.

## Item design rationale and limits

The activity uses visual matrix/pattern-completion, spatial transformation, analogy, and multiple-rule puzzle formats. Research on established matrix-reasoning tests provides a rationale for studying rule induction and relational processing with visual items (Carpenter, Just, & Shell, 1990). That is a rationale for the *format*, not evidence that this activity measures a named psychological construct.

The five item tiers and the item tags in `questions.js` are design labels. They have not been calibrated against age or grade, and the proposed increase in complexity has not been empirically established. The items have not undergone expert content review, child cognitive interviews, pilot testing, or psychometric analysis. Do not describe the tags as validated subscales or the tiers as measured difficulty levels.

Research findings for other instruments do not transfer to this one. For example, Bilker et al. developed and validated abbreviated forms from the established 60-item Raven Standard Progressive Matrices (RSPM); their results do not establish the reliability or validity of a random subset of this activity's 64 original items. A random draw is not an equated short form.

## Session sampling

At session start, the app groups the 64 questions by their four designer-assigned item tags. It randomly selects six items from each tag, assigns one randomly chosen tag a seventh item, then shuffles the resulting 25 items. This is stratified sampling without replacement: every session includes each tag. With 16 items in every tag, each bank item has the same overall inclusion probability (25/64). The selected questions remain fixed for that session and are used consistently in navigation, review, scoring, and export. Answer-choice order is randomized separately, with correct-answer positions balanced across A–D within each session.

Balancing improves representation of the four tags in each session and reduces the chance that a tag is absent. It does not guarantee equal difficulty, equivalent forms, psychometric fairness, or stable subscale measurement. The tags are author-assigned rather than empirically verified.

### Bank coverage caveat

The bank contains 16 items for each tag: `pattern_completion`, `spatial_transformation`, `analogical_mapping`, and `multi_rule_reasoning`. A session contains 6 or 7 items from each tag. These counts describe the bank and sampling algorithm; they are not empirical research findings and do not make category percentages stable estimates of a subskill.

## Scoring and reported metrics

Each item contributes one point for a correct response and zero points for an incorrect or unanswered response:

```text
correct_count      = number of correctly answered items
answered_count     = number of items with a response
unanswered_count   = 25 - answered_count
incorrect_count    = answered_count - correct_count
reported score     = correct_count out of 25
optional percent   = 100 * correct_count / 25
```

The result screen emphasizes the **number correct out of 25**, and separately reports answered and unanswered counts; it does not currently display an overall percentage. If calculated, that percentage is just the same raw tally expressed on a 0–100 scale; it is not a percentile, standard score, IQ score, grade equivalent, or probability of success elsewhere. Equal point weights are a transparent implementation choice, not a validated weighting model. Because the items have not been difficulty-calibrated, the score should not be treated as a precise measurement scale.

Category summaries count correct answers among the sampled items carrying each designer-assigned tag. Their denominator is 6 or 7 in a normal session. The JSON uses `itemTagSummaries` and `itemTag` to emphasize these are design tags, not validated constructs or subscales. Even with more consistent representation, the sample is too small and uncalibrated to treat category summaries as reliable skill estimates.

The app records grade only as user-provided context in the export; grade is not used to adjust, norm, or interpret the score. Approximate first-response time is wall-clock time from first display until the first answer, accumulated across visits; it includes time when the browser tab may be inactive and is averaged only across answered questions. With no answered items, that average is reported as unavailable (`null` in JSON). It is not a validated speed metric. Neither response time nor answer correctness supports a diagnosis or individual ability claim here.

### Appropriate and inappropriate conclusions

Appropriate: “The participant answered 18 of the 25 questions shown correctly; 2 were incorrect and 5 were unanswered.”

Not supported by this activity: conclusions about IQ or general/fluid intelligence; age- or grade-level standing; percentiles, pass/fail cutoffs, or placement; diagnosis or learning needs; stable strengths/weaknesses by tag; comparisons between students or sessions; or the effectiveness of a teaching intervention. No norms, reliability estimates, measurement-error estimates, or validated cut scores exist for this item bank. Balanced item-tag counts are a content-coverage improvement, not proof of fair evaluation between candidates or groups.

Use the activity for low-stakes practice, discussion, or prototype evaluation. Do not use its score as the sole or decisive basis for an educational or clinical decision.

## Research and standards

These sources provide background on matrix reasoning, development of short forms, and the evidence needed to interpret scores. None validates this activity.

1. Carpenter, P. A., Just, M. A., & Shell, P. (1990). “What one intelligence test measures: A theoretical account of the processing in the Raven Progressive Matrices Test.” *Psychological Review, 97*(3), 404–431. [https://doi.org/10.1037/0033-295X.97.3.404](https://doi.org/10.1037/0033-295X.97.3.404)  
   A process analysis of college students' Raven-matrix performance. It describes encoding and inducing regularities, abstract-relation induction, and management of problem-solving goals as relevant processes. This is background for plausible task demands, not validation of these items or proof that the app's tags are distinct, reliable subscales.

2. Ferrer, E. (2009). “Fluid reasoning and the developing brain.” *Frontiers in Neuroscience, 3*(1), 46–51. [https://doi.org/10.3389/neuro.01.003.2009](https://doi.org/10.3389/neuro.01.003.2009)  
   A review describing fluid reasoning, relational demands of Raven-type items, and development through childhood and adolescence. It supports age-appropriate research and cautious description of intended demands; it does not validate this activity or isolate its item tags.

3. Raven, J. (2000). “The Raven’s Progressive Matrices: Change and stability over culture and time.” *Cognitive Psychology, 41*(1), 1–48. [https://doi.org/10.1006/cogp.1999.0735](https://doi.org/10.1006/cogp.1999.0735)  
   A review of RPM norms across populations and historical periods. Its relevance is that norms depend on population and time; it does not provide norms for this activity.

4. Kazem, A. M., et al. (2007). “Psychometric properties of Raven’s Colored Progressive Matrices for Omani children aged 5 through 11 years.” *Social Behavior and Personality: An International Journal, 35*(10), 1385–1398. [https://doi.org/10.2224/sbp.2007.35.10.1385](https://doi.org/10.2224/sbp.2007.35.10.1385)  
   A psychometric study of the established Colored Progressive Matrices with 372 Omani children aged 5–11. The abstract describes validity and reliability indices as good but does not provide their numerical values. The population- and instrument-specific findings do not transfer to this app.

5. Gusniarti, U., et al. (2021). “Norming of Coloured Progressive Matrices Test in Elementary School Children Based on Classical Measurement Theory and Rasch Modeling.” *Jurnal Pengukuran Psikologi dan Pendidikan Indonesia, 10*(2), 172–183. [https://doi.org/10.15408/jp3i.v10i2.18155](https://doi.org/10.15408/jp3i.v10i2.18155)  
   A CPM norming study of 1,779 elementary-school-age children sampled across five areas in Yogyakarta, Indonesia (ages 6–12.5). It describes percentile bands for that sample. This illustrates that norms are collected from a defined population; those bands are not universal cutoffs and cannot be applied to this app.

6. Bilker, W. B., Hansen, J. A., Brensinger, C. M., Richard, J., Gur, R. E., & Gur, R. C. (2012). “Development of abbreviated nine-item forms of the Raven’s Standard Progressive Matrices Test.” *Assessment, 19*(3), 354–369. [https://doi.org/10.1177/1073191112446655](https://doi.org/10.1177/1073191112446655) · [Open full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC4410094/)  
   The authors used a predictive model to derive two fixed, non-overlapping nine-item forms from the established 60-item RSPM. Their university-laboratory sample had 180 participants aged 16–77 (90 for model construction and 90 for validation; the article reports 73 participants with schizophrenia and 60 controls). The abstract reports correlations with the full-scale score of .9836 and .9782 during form development, and .9063 and .8978 in validation data. Those are correlations with the full-test score—not child test–retest reliability or evidence that arbitrary random forms are equivalent. This adult, clinically mixed-sample study does not validate this app.

7. American Educational Research Association, American Psychological Association, & National Council on Measurement in Education. (2014). *Standards for Educational and Psychological Testing*. [Official open-access page](https://www.testingstandards.net/open-access-files.html).  
   Professional standards (not a research paper) describing expectations for evidence supporting score interpretations and uses, reliability/precision, appropriate administration, and relevant norms.

## Validation needed before stronger claims

Before presenting this as a measure of ability or using scores for decisions, the instrument would need a defined intended population and use, followed by evidence appropriate to that use. At minimum:

1. Have subject-matter and age-appropriate reviewers check each item's intended rule, answer key, wording, distractors, accessibility, and coverage.
2. Conduct cognitive interviews and usability pilots with participants from the intended age/grade range; check that they understand the task as intended.
3. Pilot a sufficiently broad sample. Examine item completion, difficulty, distractor functioning, item discrimination, and timing; revise or remove ambiguous and non-functioning items.
4. Estimate score reliability and measurement error for the intended population and use, and examine stability when repeatability is relevant. Do not adopt an arbitrary reliability threshold as proof of validity.
5. Gather construct and convergent evidence against suitable, independently validated measures. Evaluate subgroup fairness and differential item functioning where sample sizes permit.
6. If sessions or groups are to be compared, calibrate items and construct balanced forms; demonstrate form comparability on independent data. Random sampling alone does not equate forms.
7. If reporting age/grade ranks or cut scores is ever intended, collect a representative, appropriately sized norming/standard-setting sample and validate the consequences and accuracy of those decisions.
8. Validate the exact interpretation and use independently before making diagnostic, placement, or other high-stakes claims.

## Privacy and exports

The result can be downloaded as JSON. It records the selected item IDs, responses, correctness, timing, and the selected grade context. Treat exports as student data: obtain appropriate consent, store them securely, and share only when authorized. The app does not turn the export into a validated assessment record.
