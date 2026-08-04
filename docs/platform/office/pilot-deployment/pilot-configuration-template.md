# Pilot Configuration Template

Repeatable production configuration for one pilot partner.  
Reference seed: **Domy s energií** (`p-dse`) — replace values per partner; keep field names stable.

## 1. Partner identity

| Field | Example (reference) | Notes |
| --- | --- | --- |
| `partnerId` | `p-dse` | Stable Office partner id |
| `partnerName` | `Domy s energií` | Display name |
| `legalName` | `Domy s energií s.r.o.` | Company legal name |
| `ico` | `06123456` | Czech IČO |
| `city` / `country` | `Praha` / `Česko` | Address projection |
| `contactName` | `Jana Energetická` | Primary commercial contact |
| `contactEmail` | `partner@domysenergii.cz` | Must match Offer + Mail recipients |
| `contactPhone` | `+420 777 200 300` | Optional for pilot |
| `contactRole` | `Jednatelka` | Role label |

## 2. Platform / project identity

| Field | Example | Notes |
| --- | --- | --- |
| `companyId` | `company-domy-s-energi` | Platform company |
| `tenantId` | `tenant-domy-s-energi` | Tenant |
| `workspaceId` | `workspace-domy-s-energi` | Workspace |
| `projectId` | `project-domy-s-energi-01` | Active commercial project |
| `projectLabel` | `Reference House` | Operator-facing label |
| `objectId` | `house-modern-01` / partner object | Embed object binding |

## 3. Mailbox

| Field | Example | Notes |
| --- | --- | --- |
| `mailboxId` | `mbx-conis-contact` | Conversation mailbox id |
| `mailboxEmail` | `kontakt@conis.cz` | SYSTEM / OFFICE From |
| `smtpHost` / `smtpPort` / `smtpSecure` | env `SMTP_*` | Live transport only |
| `imapHost` / `imapPort` / `imapSecure` | env `IMAP_*` | Live sync only |
| `smtpUser` / `imapUser` | mailbox address | Must match DNS/SPF |

Operational mail uses env vars (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `IMAP_*`).  
Office UI never embeds credentials.

## 4. Branding

| Field | Example | Notes |
| --- | --- | --- |
| `logoLabel` | `Domy s energií Logo` | Partner Environment branding |
| `heroLabel` | `Domy s energií · Reference House Hero` | Hero projection |
| `brandPrimary` | partner brand token | Optional visual token |
| `locale` | `cs-CZ` | Pilot locale |

## 5. Default workflow

Commercial status path (do not invent parallel states):

```text
offer → checkout → waiting_payment → paid → pilot_ready
```

Workflow steps (Office projection):

`Nabídka → Objednávka → Proforma → QR Platba → Pilot Ready → Builder → Active Partner`

| Field | Value |
| --- | --- |
| `initialStatus` | `offer` |
| `automationSource` | Business Automation (Offer / Office hosts) |
| `documentTriggerEvents` | `OrderConfirmed`, `ProformaGenerated` |
| `taskKinds` | `waiting_review`, `waiting_send`, `waiting_payment`, `waiting_builder` |

## 6. Documents

Deal package root: `docs/platform/office/deal/`

| Document | Registry type |
| --- | --- |
| Elektronická objednávka | `electronic_order` |
| Rámcová smlouva | `framework` |
| Implementační standard | `implementation_standard` |
| DPA | `dpa` |
| VOP | `vop` |
| Proforma faktura | `proforma` |

Confirm templates exist before go-live. Document Runtime issues PDFs — Office only Preview / Send / Download / History / Status.

## 7. Commercial packages

| Field | Example |
| --- | --- |
| `defaultPackageId` | `starter` |
| `defaultPackageName` | `Starter` |
| `defaultAmountCzk` | `14970` |
| `licenseLabel` | partner-specific license string |
| `availablePackages` | Starter · Pilot · Studio Partner (as sold) |

## 8. Machine-readable template

See [`pilot-configuration.template.json`](./pilot-configuration.template.json).  
Copy per partner; never commit live SMTP/IMAP passwords into the repo.
