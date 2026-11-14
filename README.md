# QosTil AI — Kazakh/Russian/English Mixed-Language Detection

**Veritas AI International High School Hackathon 2026 · AI + Languages**

QosTil AI is an educational machine-learning prototype that identifies the language of individual words in mixed Kazakh, Russian and English messages. It is aimed at school staff reviewing multilingual announcements.

## Run the model

Open [QosTil_AI_Ready_for_Colab.ipynb](QosTil_AI_Ready_for_Colab.ipynb) in GitHub, then use **Open in Colab**, or download and run the notebook in any Python/Jupyter environment with the required packages installed.

The notebook contains the synthetic training/evaluation data and executable code. No API key or Google Drive access is needed to read the code on GitHub.

## Approach and evidence

- **Model:** character-level TF–IDF (2–4 character n-grams) plus logistic regression.
- **Baseline:** simple writing-system rules (Latin → English, distinctive Kazakh Cyrillic → Kazakh, other Cyrillic → Russian).
- **Evaluation:** synthetic, AI-assisted examples; not independent real-world measurements.
- **Reported held-out macro-F1:** baseline **0.828**, model **0.976** on a small synthetic test set.
- **Reported challenge-set macro-F1:** baseline **0.713**, model **0.929** on a separate synthetic stress test.

These results are *not* evidence of production accuracy. The project needs independent, consented, annotated real-school-message testing. It can confuse loanwords, shared Cyrillic spellings, names and Latinized Kazakh. Model scores are not calibrated probabilities.

## Reproduce and inspect

Run each code cell in notebook order. Review the raw examples and the measured results; do not report any figures that you cannot reproduce. The submitted write-up is a separate PDF attached to the competition form.

## Attribution and ethics

This prototype and its synthetic examples were developed with **ChatGPT assistance** during the hackathon. Core ML tooling includes **Python** and **scikit-learn**. Every team member must understand and verify the work. No external public text dataset was downloaded for the initial model. No personal information was used.

Official rules: https://highschoolhackathon.org/

**Track:** AI + Languages. 
