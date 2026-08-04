# R-001 — Přepnutí projektu aktivuje pracovní prostředí

| | |
| --- | --- |
| **ID** | R-001 |
| **Stav** | Fixed |
| **Priorita** | Critical |
| **Oblast** | Office Studio |
| **Typ** | Improvement Log · Critical Barrier |
| **Datum** | 2026-08-04 |

---

## Problém

Select Project v levém railu měnil hodnotu selectu, ale **neaktivoval pracovní prostředí**.

Obchodník se nedostal „dovnitř“ projektu. Chyběl pocit:

> Teď pracuji na tomto projektu.

---

## Očekávané chování

Změna projektu synchronně přepne celý pracovní kontext:

- Working Terminal (vstup do Detail)
- Workflow
- Conversation
- Inbox (scope na aktivní projekt)
- Timeline
- Detail · Office Tasks · Documents
- navigace na work surface (`/`)

---

## Kořenová příčina

`selectCase` pouze volal `setActiveCaseId`.

Neprováděl:

1. vstup na work surface z jiných rout (Dashboard, Partneři, …),
2. synchronní re-projekci Workflow / Conversation / Timeline,
3. otevření Detail jako „vstup do projektu“,
4. scope Inboxu na aktivní case.

---

## Náprava

| Změna | Soubor |
| --- | --- |
| Pure activation plan | `pilotProjectActivation.ts` |
| `selectCase` aplikuje full activation sync | `PilotWorkspaceContext.tsx` |
| Select Project → `onNavigate('work')` | `OfficeSidebar.tsx` · `PilotProjectSelector.tsx` |
| Inbox scoped na `activeCaseId` | `PilotTerminalInbox.tsx` |
| Regression tests | `pilotProjectActivation.test.ts` |

---

## Acceptance

- [x] Select Project je hlavní akcí Office
- [x] Po změně projektu je okamžitě aktivní Detail + Workflow
- [x] Conversation / Timeline / Inbox odpovídají projektu
- [x] Z jiné routy se otevře Working Terminal
- [x] Critical Barrier uzavřen — ne odložen do GM-2

---

## Product Review — PASS

**Verdikt:** PASS · odpovídá Product Constitution.

Select Project není filtr. Je to **globální přepínač pracovního kontextu**.

Po změně projektu obchodník okamžitě cítí: *„Teď pracuji na tomto projektu.“*

Synchronně se mění Detail · Workflow · Conversation · Timeline · Inbox · Office Tasks a současně se vrací na Working Terminal jako primární pracovní plochu.

---

## UX Watch (ne bug · ne teď)

**Otázka:** Pokud je uživatel v Dokumentech, Historii nebo jiné specializované sekci a přepne projekt, je *vždy* správné vrátit ho na Working Terminal?

| Pilotní fáze | Dlouhodobě |
| --- | --- |
| **Ano** — podporuje princip *projekt = pracovní kontext* | Sledovat reálné používání |

Pokud se ukáže, že obchodníci často přepínají projekty právě kvůli dokumentům / jiné sekci, zvážit: **zachovat stejnou sekci, změnit jen projekt**.

**Rozhodnutí teď:** neměnit. Ověřit používáním. Až pak Improvement Log follow-up (např. R-00x).

---

## Poznámka k procesu

Toto je **Improvement Log**, ne bug report.

Critical Barrier se opravuje okamžitě.
