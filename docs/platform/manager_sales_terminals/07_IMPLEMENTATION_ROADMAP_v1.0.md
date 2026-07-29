# 07_IMPLEMENTATION_ROADMAP_v1.0

**Status:** Řídicí dokument implementace

## Účel

Tento dokument převádí schválenou architekturu platformy Embed Engine do
implementační roadmapy vedoucí k prvnímu produkčnímu pilotu.

## Implementační principy

-   SSOT dokumenty jsou závazné.
-   Runtime je jediným zdrojem sémantiky.
-   Implementace probíhá po Capability (CAP).
-   Architektura se nemění bez prokázané potřeby.

## Pilot v1

Musí zahrnovat: - Builder Studio, - Client Terminal, - Sales Terminal, -
Manager Terminal, - Runtime události.

## EPIC

### EPIC 1 -- Runtime Foundation

Runtime Core, Identity, Perspective, Projection, Session

### EPIC 2 -- Client Terminal

Hero, Priority, House Navigator, FAQ, AI Advisor, Lead Capture

### EPIC 3 -- Sales Terminal

Dashboard, Decision Guidance, Opportunity, Business Journey

### EPIC 4 -- Manager Terminal

Denní briefing, Timeline, Situace vyžadující pozornost, Detail případu,
Decision Intelligence

### EPIC 5 -- Builder Studio

Experience Builder, Asset Management, Publishing, Validation

## Závislosti

Runtime → Client → Sales → Manager Builder Studio probíhá paralelně.

## CAP

Každý EPIC bude rozdělen na samostatné CAP s implementační specifikací,
sprint promptem, akceptačními kritérii a review.

## Milníky

M1 Runtime MVP M2 Client Experience M3 Sales Ready M4 Manager Ready M5
Pilot Ready

## Definition of Done

Každá CAP: - splňuje specifikaci, - prošla review, - je připravena k
merge.

Pilot Ready: - funguje end-to-end průchod.

## Governance

Roadmap → CAP → Implementační specifikace → Sprint Prompt → Implementace
→ Review → Merge
