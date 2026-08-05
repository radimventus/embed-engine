# S-004 — Persist pilot provision

| Field | Value |
| --- | --- |
| ID | S-004 |
| Priority | **2** |
| Oblast | Příprava partnera |
| Bariéra | `appendPilotProvision` company/workspace/project extras are process memory. Refresh can desync invite/user (localStorage) from provision. |
| Návrh řešení | Persist registry extras or rehydrate from invite binding on load. |
| Stav | Open |
| Evidence | `companyRegistry.ts`, gm debt `in-memory-provisions`; PT-COM-01 B-04 |
