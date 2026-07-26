# MS-01 — Operations Home
## Implementační specifikace (SSOT)
### Sprint 01

Cíl:
Operátor musí během prvních 30 sekund pochopit aktuální stav systému a vědět, kde má začít.

Hlavní otázka:
Co vyžaduje mou pozornost právě teď?

Business hodnota:
- Rychlá orientace
- Identifikace kritických událostí
- Okamžitá další akce

UX scénář:
1. Přihlášení
2. Zobrazení Operations Home
3. Přehled Runtime
4. Fronta pozornosti
5. AI doporučení
6. Otevření detailu

Rozložení:
- Horní lišta (Runtime, Journey, Události, Profil)
- Přehled Runtime
- Fronta pozornosti
- Aktivní Decision Journey
- Pravý panel (AI, Doporučení, Alerty)

Komponenty:
- RuntimeStatusCard
- AttentionQueue
- ActiveJourneys
- AISummaryPanel
- RecommendedActions
- AlertPanel

Napojení na Runtime:
Čtení:
- Runtime Status
- Active Journeys
- Runtime Events
- AI Summary

Zápis:
- Otevření Journey
- Přijetí doporučení
- Označení položky

Akceptační kritéria:
- Jedna obrazovka
- Kritické položky nahoře
- AI doporučení dostupná
- Všechny akce zapisují do Runtime

Implementační checklist:
[ ] Layout
[ ] Runtime status
[ ] Attention Queue
[ ] Active Journeys
[ ] AI panel
[ ] Recommended Actions
[ ] Runtime integrace
