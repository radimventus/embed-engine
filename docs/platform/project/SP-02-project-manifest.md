# SP-02 --- Project Manifest

**Status:** Draft → SSOT po schválení

# Purpose

Project Manifest je jediný vstupní bod pro načtení Projectu.

# Principle

-   Manifest popisuje Project.
-   Manifest je deklarativní.
-   Manifest neobsahuje implementační logiku.

# Responsibilities

Manifest určuje: - identitu Projectu - umístění jednotlivých částí -
aktivní konfiguraci - build konfiguraci Package - publikační nastavení -
verzi Projectu

# Canonical Structure

``` text
Project
├── manifest
├── identity
├── branding
├── objects
├── assets
├── knowledge
├── presentation
├── build
├── publish
├── analytics
└── settings
```

# Build Section

Sekce **build** deklaruje, jak se z Projectu vytváří Package. Neobsahuje
implementaci buildu, pouze jeho konfiguraci.

# Architectural Rules

1.  Manifest je jediný vstupní bod.
2.  Runtime načítá pouze Manifest.
3.  Build konfigurace je deklarativní.
4.  Runtime nikdy neobsahuje build logiku Projectu.

> Každý Project začíná Manifestem. Každý Package vzniká z Manifestu.
