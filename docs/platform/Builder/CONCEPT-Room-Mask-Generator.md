# CONCEPT --- Room Mask Generator

## Rozšíření funkcí Builderu

**Status:** Návrh (Concept)

## Cíl

Rozšířit Builder o schopnost automaticky převést **Room Map** na sadu
SVG masek připravených pro House Navigator.

Nejde o rozpoznávání stavebních výkresů pomocí AI, ale o deterministický
převod jednoduché mapy místností na produkční SVG.

## Motivace

-   Ruční tvorba SVG pro každou místnost.
-   Zachování stejného canvasu.
-   Generování manifestu.

## Vstup

`room-map.png`

Požadavky: - uzavřené oblasti, - každá oblast vlastní barvou, - bez
nábytku, - bez textů, - bez kót, - bez dveří, - rozměr obrázku = canvas
SVG.

## Workflow

Upload Room Map → Detekce oblastí → Preview → Přiřazení názvů místností
→ Generate → Download Package

## Capability

**Room Mask Generator**

## Automatická detekce

1.  Načtení PNG
2.  Detekce souvislých oblastí
3.  Polygonizace
4.  Čištění geometrie
5.  Zachování pravoúhlých hran

## Generované SVG

-   stejný canvas
-   transparentní pozadí
-   jeden uzavřený path
-   bez stroke
-   fill="#f5b9007f"

## Manifest

`house-navigator-map.json`

## Výstup

House Navigator Package: - room-map.png - house-navigator-map.json -
masks/\*.svg

## CAP

-   CAP-RM-01 Upload Room Map
-   CAP-RM-02 Detekce oblastí
-   CAP-RM-03 Polygonizace
-   CAP-RM-04 Čištění geometrie
-   CAP-RM-05 Preview regionů
-   CAP-RM-06 Přiřazení názvů
-   CAP-RM-07 Generování SVG
-   CAP-RM-08 JSON manifest
-   CAP-RM-09 Download Package

## Budoucí rozšíření

Navázání galerie, videí, hotspotů, FAQ, Priority, AI kontextu a
analytiky na identitu místnosti.

## Přínosy

-   automatizace,
-   deterministický proces,
-   jednotná geometrie,
-   okamžitá připravenost pro House Navigator.
