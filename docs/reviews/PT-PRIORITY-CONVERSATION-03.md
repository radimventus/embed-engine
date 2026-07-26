# PT-PRIORITY-CONVERSATION-03 — Od UX k rozhodovacímu rozhovoru

Date: 2026-07-26

## Verdict

**Local PASS** — Priority Experience presentation now behaves as a decision conversation that builds trust and completion motivation. Runtime / Decision Engine / Decision Flow / data model unchanged.

---

## Mentální model produktu

Conis je kouč: pomáhá člověku pochopit vlastní způsob rozhodování. Priority a kvíz nejsou cíl — jsou prostředek k důvěře a kompetenci. „Audit“ je interní název; uživateli nabízíme tři hodnoty (ověření pozemku / pomoc s hledáním / Decision Report). Decision Report je odměna, hmatatelná hodnota i důvod pro kontakt.

Každá změna byla posuzována otázkou: *Zvýší chuť pokračovat?*

---

## Checklist → implementation

| Úkol | Implementace |
|------|----------------|
| 1 Quiz flow (BLOCKER) | Jeden dialog shell; odpověď → `thinking` → `interpretation` → Continue; answer commit až po thinking — bez skoku na další otázku |
| 2 Thinking ••• | `ConisThinkingDots`, `CONIS_THINKING_MS = 850` |
| 3 Adaptive panel | `PRIORITY_ENGINE_CONVERSATION_PANEL_CLASS` — `h-auto`, `overflow-visible`, bez `maxHeight` |
| 4 Hierarchy | Prep title + bridge H2 „Už rozumím…“ jako titulky |
| 5 Full-width bridge | `PriorityChapterBridge` — Co už vím / Co získáte (Decision Report) / Co bude následovat (A/B/C) |
| 6 No Audit copy | CTA value language; scroll stále na conversion section id (interní) |
| 7 AI Chat | Odstavce: shrnutí → interpretace → lidská věta → výzva |
| 8 FAQ | Priority questions, bez „Audit“, zvýrazněné názvy |

---

## Odchylky od doslovného zadání (a proč)

1. **Pořadí Thinking vs Interpretace** — v bodě 1 je interpretace před přemýšlením; v bodě 2 výslovně „před interpretací“. Implementováno podle bodu 2 (thinking → interpretation), protože to odpovídá koučovacímu pocitu.
2. **Pravý panel po complete** — těžký obsah přesunut do full-width bridge; panel jen krátce uzavírá kapitolu + FAQ/Chat. Doslovné „vše v panelu“ by znovu zmenšovalo Decision Report na poznámku.
3. **Interní id `audit`** — ponecháno pro navigaci/Runtime continuity; uživatelský copy ho nepoužívá. Změna id by zasáhla mimo Presentation scope.

---

## Co nejvíce zvýší dokončení Experience

1. Opravený kvíz bez blikání + thinking beat (důvěra, že Conis přemýšlí).
2. Decision Report jako hlavní hodnota v bridge (odměna / důvod pokračovat).
3. Nabídka A/B/C bez interního „Auditu“ (srozumitelný důvod jít dál).

---

## Doporučení pro další iteraci

1. Propojit CTA mostu s konkrétní předvolbou commercial CTA (plot / find / report) v conversion sekci.
2. Doladit vizuál thinking dots (vlastní keyframes místo `animate-pulse`).
3. V conversion sekci sjednotit user-facing copy se stejným value jazykem (tam ještě může zůstat interní slovník).
4. Decision Report preview snippet v bridge (1–2 řádky „ukázky“ PDF).

---

## Validation

| Check | Status |
|-------|--------|
| Thinking before interpretation | PASS |
| No flash / stable dialog shell | PASS |
| User-paced Continue | PASS |
| Adaptive panel | PASS |
| Chapter bridge + Decision Report | PASS |
| No Audit in user copy | PASS |
| Chat paragraphs | PASS |
| FAQ from priorities | PASS |
| Unit tests | PASS |
| Runtime / Flow / model untouched | PASS |

Assets: `docs/reviews/assets/pt-priority-conversation-03/`
