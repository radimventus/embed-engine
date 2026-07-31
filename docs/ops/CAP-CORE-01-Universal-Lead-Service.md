# CAP-CORE-01 — Universal Lead Service

**Status:** Implemented  
**Package:** [`@embed-engine/lead`](../../packages/lead)

## Model

`LeadPayload` is the only input. Hosts map their UI into `fields[{ id, label, value }]`.

Lead Service does **not** know Quiz, Priority, AI, House Navigator, Client Studio, or Embed.

## Flow

```text
CONIS_WEB / CLIENT_STUDIO / EMBED / (future)
              │
              ▼
         LeadPayload
              │
              ▼
     LeadService.submitLead()
              │
              ├─ GoogleSheetsAdapter  (label → column)
              └─ EmailAdapter         (fields → mail)
                        │
                        ▼
              Apps Script transport
```

## Sources

`LEAD_SOURCES.CONIS_WEB | CLIENT_STUDIO | EMBED` — identification only.  
Any new string source works without changing LeadService.

## Production Web App

1. Paste updated [`LeadCapture.gs`](../../conis-web-1.0/apps-script/LeadCapture.gs) into the Apps Script project and **redeploy** the Web App (new version) to enable dynamic sheet columns from `sheetColumns`.
2. Until redeploy, the dual payload still works against the CAP-WEB-01 legacy script (flat `name` / `email` / `answersByTitle`).
3. CONIS web loads `js/lead.iife.js` then `js/lead.js`.

## Client Studio / Embed

```ts
import { createLeadService, LEAD_SOURCES } from "@embed-engine/lead";

const service = createLeadService({ endpoint: "…" });
await service.submitLead({
  source: LEAD_SOURCES.CLIENT_STUDIO, // or EMBED
  contact: { name: "…", email: "…" },
  fields: [{ id: "x", label: "Vybraná dispozice", value: "4+kk" }],
  metadata: {},
});
```

No LeadService changes are required for a new source id.
