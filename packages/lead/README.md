# @embed-engine/lead — Universal Lead Service (CAP-CORE-01)

Source-agnostic lead capture. The service never knows Quiz, Client Studio, Embed, or Google Sheets.

```text
Source (CONIS_WEB | CLIENT_STUDIO | EMBED | …)
        │
        ▼
   LeadPayload
        │
        ▼
   LeadService.submitLead()
        │
        ▼
 Integration adapters
   · GoogleSheetsAdapter  (Field.label → column)
   · EmailAdapter         (fields → mail body)
        │
        ▼
 Apps Script transport (optional production backend)
```

## Public API

```ts
import {
  LEAD_SOURCES,
  createLeadService,
  type LeadPayload,
} from "@embed-engine/lead";

const service = createLeadService({
  endpoint: "https://script.google.com/macros/s/…/exec",
});

const result = await service.submitLead({
  source: LEAD_SOURCES.CONIS_WEB,
  contact: { name: "Ada", email: "ada@example.com", company: "Co" },
  fields: [
    { id: "q1", label: "Kolik domů ročně prodáváte?", value: "20–100" },
  ],
  summary: { score: 2, segment: "B", recommendation: "Review" },
  metadata: { url: "https://conis.cz/", sessionId: "…" },
});
```

## LeadPayload

| Field | Role |
| --- | --- |
| `source` | Opaque source id (`CONIS_WEB`, `CLIENT_STUDIO`, `EMBED`, or any future string) |
| `contact` | Name / email required; company / phone optional |
| `fields` | Universal `{ id, label, value }` — labels become sheet columns in the Sheets adapter |
| `summary` | Optional score / segment / recommendation |
| `metadata` | URL, referrer, session, UTM |

## Adapters

- **GoogleSheetsAdapter** — owns label→column mapping; LeadService does not.
- **EmailAdapter** — owns mail composition from the same payload.
- **AppsScriptLeadAdapter** — one POST with both sheet columns + e-mail (production).

Adding a source never requires changing `LeadService` — only the calling host builds a `LeadPayload`.

## Browser

```html
<script src="/path/to/lead.iife.js"></script>
<script>
  const service = EmbedLead.createLeadService({ endpoint: "…" });
  await service.submitLead({ … });
</script>
```
