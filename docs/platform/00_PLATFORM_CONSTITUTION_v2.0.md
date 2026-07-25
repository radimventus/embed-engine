# 00 --- PLATFORM CONSTITUTION

## Status

**Normativní dokument (SSOT)**

**Verze:** 2.0  
**Kurace:** 2026-07-23 — doplněno z historického `PLATFORM_CONSTITUTION_v1.0.md` bez změny odpovědnosti dokumentu.

## 1. Poslání

Embed Engine je platforma pro podporu rozhodování.

Jejím posláním je převádět strukturované znalosti do srozumitelných
rozhodovacích zkušeností, které lidem pomáhají činit lepší a jistější
rozhodnutí.

Platforma neslouží k zobrazování informací. Jejím cílem je
zprostředkovat jejich význam.

## 2. Vize

Každé důležité rozhodnutí může být podpořeno znalostmi, které jsou
správně interpretovány, vysvětleny a předloženy ve správný okamžik
správnému člověku.

Embed Engine vytváří prostředí, ve kterém jsou znalosti aktivním
partnerem rozhodování.

Embed Engine je Decision Platform. Nestaví stránky. Vytváří rozhodovací
zkušenosti.

## 3. Hodnoty platformy

-   Rozhodnutí před informací
-   Znalosti před rozhraním
-   Srozumitelnost před složitostí
-   Kontinuita před izolací
-   Člověk zůstává odpovědný

## 4. Architektonické principy

-   význam je jednotný
-   interpretace je konzistentní
-   doporučení jsou vysvětlitelná
-   rozhodování je kontinuální
-   znalosti mají přednost před prezentací
-   architektura podporuje porozumění

## 5. Co Embed Engine je

-   Platforma pro interpretaci znalostí a podporu rozhodování
-   Vrstvená decision platform
-   Runtime-centered architektura
-   Sémantický rozhodovací engine
-   Systém Runtime projekcí pro různé perspective

## 6. Co Embed Engine není

-   CRM
-   ERP
-   CMS
-   Business Intelligence platforma
-   marketingová automatizace
-   náhrada lidského rozhodování
-   workflow engine
-   page builder
-   soubor nezávislých aplikací

## 7. Neměnné principy

-   jednotný význam znalostí
-   vysvětlitelná doporučení
-   transparentní rozhodování
-   člověk zůstává konečným nositelem odpovědnosti
-   soulad všech změn s tímto dokumentem

## 8. Konstituční principy (normativní výklad)

Tyto principy rozvíjejí oddíly 4 a 7. Nemění Platform Architecture
(01); musí s ní zůstat v souladu.

1.  Knowledge precedes Runtime.
2.  Builder authors knowledge.
3.  Runtime is the only author of semantic meaning.
4.  Every application is a Runtime projection.
5.  Terminals author nothing. They only project Runtime.
6.  Perspectives ask different questions. Runtime answers them all.
7.  Decision Sessions are transient. Decision Journey is persistent.
8.  Identity preserves continuity. Identity never creates meaning.
9.  Meaning flows in one direction only (Knowledge → Runtime → …
    Terminal → Human). Interactions may return to Runtime; only Runtime
    may modify semantic state.
10. Every Runtime object has exactly one semantic owner.
11. No layer may create semantics owned by another layer.
12. AI operates inside Runtime semantics. It never becomes an
    independent semantic authority.

## 9. Design rules

-   Prefer projections over duplication.
-   Prefer Runtime over local interpretation.
-   Prefer composition over specialization.
-   Separate identity from perspective.
-   Separate permissions from semantics.

## 9A. Runtime & Release Principle

Delivery of Embed must never confuse the living Runtime with a published
artifact. The following rules are constitutional for development and
release:

1.  **Runtime exists only once.** There is a single live Runtime source.
    Parallel product Runtimes are forbidden.
2.  **Local Runtime and Embed Demo are development hosts** of that
    Runtime. They are not separate products and not Release surfaces.
3.  **GitHub Pages (`docs/embed`) is a Release Snapshot** — a compiled
    freeze of the Runtime at publish time.
4.  **A Release Snapshot is never Live Runtime.** It must not be used as
    the daily development or Live Runtime verification surface.
5.  **Publication happens only through the official publish workflow**
    (`pnpm embed:publish`). Ad-hoc edits or partial syncs of `docs/embed`
    are not valid releases.
6.  **Runtime problems and Release problems are different diagnostic
    categories.** A mismatch between Local Runtime and Published Embed is
    a Release question until publish, push, and remote validation are
    confirmed.

Normative detail: [ADR-019 — Runtime vs Release](../architecture/adr/ADR-019-runtime-vs-release.md),
[embed-release-workflow.md](../architecture/embed-release-workflow.md),
[troubleshooting/embed-parity.md](../architecture/troubleshooting/embed-parity.md).

## 10. Evolution rules

Každá budoucí schopnost musí odpovědět:

1.  Which layer owns it?
2.  Who is the semantic owner?
3.  Does it introduce new meaning?
4.  Can Runtime remain the single source of semantic truth?

Pokud nelze odpovědět konzistentně, návrh musí být přepracován.

## 11. Constitutional statement

Runtime creates meaning.

Builder prepares meaning.

Terminals reveal meaning.

Identity preserves continuity.

The platform grows by adding new projections — not by creating new
semantic systems.

## 12. Závěrečné ustanovení

Platform Constitution je nejvyšším referenčním dokumentem platformy
Embed Engine.

------------------------------------------------------------------------

## Provenience (kurace)

Doplněno z: `docs/platform/PLATFORM_CONSTITUTION_v1.0.md`  
Historický layer model z v1.0 (`Authoring → Runtime → Projection →
Experience`) **nebyl** převzat jako normativní — viz Open Questions v
konsolidačním reportu (rozpor s 01 Platform Architecture).

**2026-07-25 (CAP-GOV-01):** přidán oddíl **9A. Runtime & Release Principle**
(Local Runtime / Embed Demo vs Release Snapshot / Published Embed;
oficiální `pnpm embed:publish`).
