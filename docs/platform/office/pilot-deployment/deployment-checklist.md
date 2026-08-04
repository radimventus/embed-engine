# Deployment Checklist

Reusable for **every** pilot partner. Mark each row before go-live.  
Do not skip. Do not invent ad-hoc steps outside this list.  
A second operator must be able to execute this list **without oral briefing**.

Partner id: ____________ Date: ____________ Operator: ____________

## A. Environment

- [ ] Release commit matches approved Commercial Readiness (PT-17 PASS · score 100/100)
- [ ] Target host is HTTPS-only (no mixed content)
- [ ] Office Studio reachable for operators
- [ ] Offer Experience reachable for partner checkout
- [ ] Partner Environment provisioned (`companyId` / `tenantId` / `workspaceId` / `projectId`)
- [ ] Pilot configuration JSON filled from template (no placeholder emails)

## B. DNS

- [ ] Partner / CONIS mail domain DNS present
- [ ] SPF includes sending host
- [ ] DKIM configured for mailbox domain (if provider requires)
- [ ] DMARC policy reviewed (at least monitor for first pilot)
- [ ] Offer / Office hostnames resolve to intended deployment

## C. SSL

- [ ] Valid TLS certificate on Offer URL
- [ ] Valid TLS certificate on Office / operator URL
- [ ] No certificate warnings on operator laptop and partner device smoke

## D. SMTP

- [ ] `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` set in deployment env
- [ ] `SMTP_USER` / `SMTP_PASSWORD` set (secrets store — not git)
- [ ] Test SYSTEM mail send succeeds to operator inbox
- [ ] From address matches configured mailbox (`kontakt@…`)
- [ ] Failure path journals `mailFailures` without desyncing Workflow

## E. IMAP

- [ ] `IMAP_HOST` / `IMAP_PORT` / `IMAP_SECURE` set
- [ ] `IMAP_USER` / `IMAP_PASSWORD` set
- [ ] Mailbox sync (`syncMailbox`) returns without transport error
- [ ] Incoming test message appears in Conversation / Inbox projection

## F. Document Runtime

- [ ] Deal package present under `docs/platform/office/deal/`
- [ ] All six commercial document types registered in Document Runtime
- [ ] `OrderConfirmed` issues electronic-order package (5 docs) for smoke `projectId`
- [ ] Proforma path available for `ProformaGenerated`
- [ ] Office Document Viewer shows History / Status (no create UI)

## G. Automation Runtime

- [ ] Business Automation host wired in Office
- [ ] Offer commercial events map into Automation catalog
- [ ] `OfferAccepted` → mail intent + Office Task
- [ ] `OrderConfirmed` → GenerateDocument + NotifyOffice
- [ ] `PaymentConfirmed` / `PilotReady` advance workflow status
- [ ] Duplicate event does not duplicate open Office Tasks of same kind

## H. Office configuration

- [ ] Active project selectable in global project navigation
- [ ] Detail shows synced status without manual refresh
- [ ] Office Tasks list bound to project
- [ ] Timeline shows document / workflow / task events
- [ ] Mail Composer bound to active project contacts

## I. Offer configuration

- [ ] Partner branding labels visible
- [ ] Package / amount match configuration
- [ ] Checkout publishes commercial timeline → Automation
- [ ] Contact email matches configuration `contactEmail`
- [ ] First smoke: Offer Accepted → Order Confirmed observed in Office

## Sign-off

| Role | Name | Signature / date |
| --- | --- | --- |
| Operator | | |
| Technical | | |
| Partner contact (informed) | | |

**Go / No-Go:** ____________
