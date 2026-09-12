# Referenční Bungalov 4KK — XLSX 04

Authoritative workbook: `bungalov-4kk-v04.xlsx`, sheet `List 1`.
Author correction 2026-09-12: usable area 112.9 m²; built-up area 129 m².
Rows 65, 66 and 71 agree. The source column records this confirmation.

Regenerate with `python3 scripts/import-bungalov-knowledge.py`; verify drift with
`python3 scripts/import-bungalov-knowledge.py --check`.
The importer accepts 540 nonempty OK answers, excludes 122 blanks and never
promotes the 16 alternative answers. Generated IDs preserve spreadsheet rows.
100 curated FAQ entries point to those same answers. Original priority columns
are empty: topic routing is explicit by chapter in the importer, not spreadsheet
metadata claimed as authored tags.

Reference-project technical evidence remains labelled and is available only in
the reference House context. Old general information-gap claims are superseded.
Existing visual and payoff identities are retained; payoff facts use current
spreadsheet statements. Energy class follows the workbook (A).

Chat searches the entire current House source independently of selected
priorities, then sends at most 12 complete records and 14,000 knowledge characters.
Each record includes question, answer, provenance and local constraints. Short
follow-ups also search the previous user question. This is lexical retrieval,
not a guarantee of semantic recall for every possible paraphrase.

Quality controls: all 540 source questions retrieve their answer; paraphrases
cover areas, plot size, family/workspace, HVAC, fire evidence, energy class and
storage. Unknown-house isolation and all-priority payoff checks remain covered.
Live delivery checks compare old vs new areas/plot answers and cover family,
HVAC, fire, energy cost and class. Observed answers improve from unavailable
area/plot information to explicit source facts. Costs remain unquoted where not
documented. Model outputs remain probabilistic.

Known source qualifications: row 643's 50% has no denominator/unit; rows 652,
656–658 do not constitute a complete cost/service plan or a lifetime guarantee.
Their exact source answers are preserved, with explicit interpretation limits.

Release both Studio and Embed with the existing publishers. Publishing the
workbook alone does not update runtime knowledge. No AI edge change is needed:
the client sends the assembled context and system prompt via the existing edge.
