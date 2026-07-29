# 09 --- PLATFORM OVERVIEW v1.0

**Status:** Kontextový dokument

## Účel

Tento dokument poskytuje rychlou orientaci v architektuře platformy
CONIS. Nenahrazuje SSOT dokumenty, ale slouží jako vstupní kontext pro
nové členy týmu, AI agenty a implementaci.

## Architektura

Knowledge → Runtime → Shared Platform Services → Client Studio / Sales
Studio / Manager Studio / Builder Studio

## Referenční dokumenty

00 Platform Constitution\
01 Platform Architecture\
02 Product Model\
03 Terminal Framework\
04 Projection Framework\
05 Manager Studio Specification\
06 Sales Studio Specification\
07 Builder Studio Specification\
08 Studio Integration Architecture

## Klíčové principy

-   Runtime je jediným autorem významu.
-   Builder vytváří znalosti.
-   Client, Sales a Manager jsou různé projekce stejného Runtime.
-   Shared Platform Services poskytují společné služby všem Studiím.
-   Publish je jediná cesta do produkčního prostředí.

## Stav platformy

Architektura platformy je uzavřena.

Další rozvoj probíhá především implementací Capability (CAP) nad
schválenou architekturou.

## Závěr

Tento dokument slouží jako rychlý kontext. Veškeré normativní definice
jsou obsaženy v jednotlivých SSOT dokumentech.
