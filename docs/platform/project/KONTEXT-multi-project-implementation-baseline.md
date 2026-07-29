# KONTEXT --- Multi-project Architecture & Implementation Baseline

**Status:** Připomenutí před zahájením implementace

## Kde jsme skončili

Byla dokončena architektura víceprojektové platformy CONIS a uzavřena
implementační roadmapa.

Architektura je považována za připravenou pro implementaci (Architecture
Freeze).

------------------------------------------------------------------------

# Klíčové principy

## Architektura

Platform ↓ Project ↓ Object ↘ Package ↓ Publish

-   Platform existuje pouze jednou.
-   Runtime existuje pouze jednou.
-   Každý zákazník je jeden **Project**.
-   Project obsahuje více **Objectů**.
-   Publikuje se **Package**, nikoli Project.
-   Runtime interpretuje Project prostřednictvím Manifestu.

------------------------------------------------------------------------

# SSOT dokumentace

-   SP-01 Project Architecture
-   SP-02 Project Manifest
-   SP-03 Project Runtime
-   SP-04 Project Registry
-   SP-05 Project Lifecycle
-   SP-06 Project Workspace
-   SP-07 Builder MVP
-   SP-08 Migration Strategy
-   (doplnit) SP-09 Package Architecture

Implementační plán:

-   PIP-01 Project Implementation Plan

------------------------------------------------------------------------

# Implementační roadmapa

1.  SPR-01 Runtime Foundation
2.  SPR-02 Project Registry
3.  SPR-03 Project Workspace
4.  SPR-04 Builder Home
5.  SPR-05 New Project
6.  SPR-06 Package Builder & Publish
7.  SPR-07 Migration
8.  SPR-08 Validation & Smoke Test

Odhad implementace:

-   přibližně 30 slices
-   cca 10--15 intenzivních pracovních dnů

------------------------------------------------------------------------

# Architecture Guardrails

-   Runtime existuje pouze jednou.
-   Manifest je jediný vstupní bod Projectu.
-   Runtime interpretuje pouze Manifest.
-   Project nikdy neupravuje Platformu.
-   Builder spravuje Projecty.
-   Publikuje se pouze Package.
-   Nový Project nikdy nevyžaduje fork Runtime.
-   Pokud implementace vyžaduje porušení těchto pravidel, implementace
    se zastaví a konflikt se vyhodnotí.

------------------------------------------------------------------------

# Jak pokračovat

Při návratu k implementaci:

1.  Otevřít tento dokument.
2.  Ověřit, že platí všechny guardrails.
3.  Dokončit SP-09 Package Architecture.
4.  Připravit implementační prompt pro SPR-01.
5.  Zahájit implementaci podle PIP-01.

## Cíl

Vybudovat jednu sdílenou Platformu CONIS, nad kterou lze opakovaně
vytvářet a publikovat Projecty bez změn Runtime.
