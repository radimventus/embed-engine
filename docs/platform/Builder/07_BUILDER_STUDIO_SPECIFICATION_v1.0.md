# 07 --- BUILDER STUDIO SPECIFICATION v1.0

**Status:** Referenční dokument (SSOT)

## Účel

Builder Studio je autorské prostředí platformy CONIS. Slouží k tvorbě,
správě, validaci a publikaci Decision Experience.

## 1. Primární uživatel

-   Partner
-   Implementátor
-   Content Author
-   Experience Designer

## 2. Mise Studia

Převádět znalosti partnera do Runtime prostřednictvím řízeného
autorského procesu.

## 3. Hlavní otázka

**Jak připravím kvalitní Decision Experience, kterou Runtime správně
interpretuje?**

## 4. Odpovědnosti

Builder Studio odpovídá za: - správu projektů, - správu objektů, -
správu médií, - správu znalostí, - validaci, - build, - publish.

Neodpovídá za Runtime interpretaci ani obchodní řízení.

## 5. Architektura Studia

Builder Studio → Builder Terminal → Workspace → Project → Decision
Package → Build → Publish

## 6. Builder Terminal

Hlavní pracovní plocha obsahuje: - Workspace - Project Registry -
Project Explorer - Editor - Validation - Publish

## 7. Workspace Architecture

-   Workspace
-   Registry
-   Projects
-   Assets
-   Build
-   Publish

## 8. Build Pipeline

Validate → Package → Build → Publish → Release

## 9. Runtime vstupy

-   Decision Package
-   Assets
-   Metadata
-   Rules

## 10. Runtime výstupy

-   Validation
-   Preview
-   Build Status
-   Publish Status

## 11. Navigace

Primární navigace organizuje autorskou práci podle projektu a životního
cyklu publikace.

## 12. Design principy

-   Author first.
-   Progressive disclosure.
-   Publish je explicitní akce.
-   Runtime zůstává jedinou autoritou významu.

## 13. Architektonická pravidla

-   Builder vytváří znalosti.
-   Runtime vytváří význam.
-   Projection skládá pohled.
-   Terminal prezentuje.
-   Builder nikdy nevytváří Runtime interpretaci.

## 14. Mimo rozsah

-   Identity & Access
-   Shared Platform Services
-   Runtime internals
-   Studio Integration Architecture

## Závěrečné ustanovení

Builder Studio Specification definuje účel, odpovědnosti a
architektonické hranice Builder Studia. Detailní integrace platformních
služeb je předmětem dokumentu Studio Integration Architecture.
