# Architecture Freeze v0.1

**Status:** FROZEN  
**Date:** 2026-07-21  
**Scope:** MVP distribution architecture — Core → Runtime → Renderer → Embed SDK  
**Not in scope:** Product philosophy, ADR history, Priority Experience content

This freeze records the first **implementačně ověřenou** end-to-end path from domain contracts through a standalone Embed on a plain HTML page ([playground/](../../playground/)).

---

## 1. Stav platformy

Platforma MVP obsahuje a běží:

| Vrstva | Stav |
| --- | --- |
| **Core** (`@embed-engine/core`) | Doménové kontrakty Priority Experience |
| **Runtime** (`@embed-engine/runtime`) | Priority Journey state engine + HTML Renderer + Garden mock fixtures |
| **Priority Experience** | Blueprint / Runtime Contract / Integration Model / Domain Model (dokumentace) + implementovaný Journey runtime |
| **HTML Renderer** | Vizualizace `PriorityJourneyRun` (čisté HTML/CSS/TS, bez Reactu) |
| **Embed SDK** (`@embed-engine/embed`) | Veřejné `Embed.mount` / `unmount` / `version` |
| **Distribuční bundle** | `embed.es.js` (ESM) + `embed.iife.js` (globální `Embed`) |

---

## 2. Ověřená architektura

```text
Object Package
        │
        ▼
Experience Composer
        │
        ▼
Runtime
        │
        ▼
Renderer
        │
        ▼
Embed SDK
        │
        ▼
Host Website
```

**MVP placeholder poznámka:** Object Package a Experience Composer nejsou produkční pipeline — Garden běží přes **Mock Experience Composer** / fixture (`createGardenJourneyRun()`). Runtime, Renderer, Embed SDK a IIFE host path byly ověřeny implementací (včetně standalone playground).

---

## 3. Stabilní veřejná API

Následující balíčky a povrchy se považují za **stabilní pro další vývoj nad MVP** (breaking change pouze přes ADR):

| Package | Stabilní role |
| --- | --- |
| `@embed-engine/core` | Doménové TypeScript kontrakty (Priority domain) |
| `@embed-engine/runtime` | Journey state engine + HTML render surface + mock fixtures |
| `@embed-engine/embed` | Distribuovatelné Embed SDK |

**Veřejné Embed API (zmrazené):**

```ts
Embed.mount(...)
Embed.unmount(...)
Embed.version
```

Žádné další veřejné metody Embed SDK nejsou součástí v0.1 freeze.

---

## 4. Zmrazené architektonické principy

Tyto principy se **bez ADR nemění**:

1. **Runtime řídí Journey** — stage, guardy, přechody a dokončení patří Runtime Engine.
2. **Renderer pouze vykresluje** — žádná business logika, žádné vlastní rozhodování o fázi.
3. **Embed pouze orchestruje** — mount/unmount, wiring Runtime ↔ Renderer, fixture/experience vstup; žádná doménová logika.
4. **Business logika nesmí být v Rendereru ani Embed SDK.**
5. **Core je jediný zdroj doménových kontraktů** pro Priority Experience typy používané Runtime/Embed.

---

## 5. Balíčky

| Package | Odpovědnost (jedna věta) |
| --- | --- |
| `@embed-engine/core` | Framework-independent doménové kontrakty a související Core artefakty. |
| `@embed-engine/runtime` | Priority Journey runtime, mock Garden data a HTML Renderer. |
| `@embed-engine/embed` | Veřejné SDK a distribuční bundly pro vložení Experience do host stránky. |

---

## 6. Co zůstává otevřené

Neřešeno v tomto freeze (další vývoj):

- Object Package Loader
- Experience Composer (produkční, ne mock)
- AI Interpretation
- React Renderer
- Client Studio integrace
- Analytics
- Cognitive Signals (mapování Journey events → Cognition)

---

## 7. Release status

Architektura **distribuční vrstvy** je ověřena: Embed SDK běží samostatně na čisté HTML stránce přes `embed.iife.js` bez Client Studia a bez interního demo runneru.

Další práce se soustředí na **obsah a Experience** (reálný Composer, Object Package, bohatší interpretace), **nikoli** na změnu základní architektury Core → Runtime → Renderer → Embed.

**Architecture Freeze v0.1 — CLOSED.**
