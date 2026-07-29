# SP-08 --- Migration Strategy

**Status:** Draft → SSOT po schválení

# Migration Goal

Výsledkem migrace je: - Platforma bez zákaznických dat. - První
Project. - Funkční Registry. - Funkční Build Pipeline. - Nezměněný
Runtime.

# Migration Phases

``` text
Current Pilot
      ↓
Extract Project
      ↓
Create Manifest
      ↓
Move Assets
      ↓
Create Project Root
      ↓
Register Project
      ↓
Validate Runtime
      ↓
Build Package
      ↓
Publish Package
      ↓
Done
```

# Validation

Migrace je úspěšná pokud: - Runtime funguje beze změn. - Build vytvoří
validní Package. - Publish publikuje Package. - Builder zobrazí Project.

> Migrace odděluje Platformu od Projectu. Publikuje se Package.
