# CAP-WEB-01 — Quiz Lead Capture (Google Apps Script)

Production lead capture for **conis.cz**: quiz → contact form → Apps Script → Google Sheets + Gmail.

Frontend never talks to Google Sheets directly. Apps Script is the only integration layer.

## Architecture

```text
Quiz → Lead Form → POST (text/plain JSON)
                         │
                         ▼
              Google Apps Script Web App
                   │            │
                   ▼            ▼
            Google Sheets     Gmail
```

## 1. Spreadsheet

1. Create a Google Sheet (or reuse an existing one).
2. Copy the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`
3. First row headers are created automatically by the script (Czech question titles).

Columns:

| Group | Columns |
| --- | --- |
| ID | Lead ID, Datum a čas |
| Contact | Jméno, Firma, E-mail, Telefon |
| Quiz | one column per real question title |
| Evaluation | Skóre, Segment, Doporučení |
| Meta | URL, Referrer, UTM Source, UTM Medium, UTM Campaign, Session ID |
| Archive | JSON Payload |

## 2. Apps Script

1. Open the Sheet → **Extensions → Apps Script**.
2. Paste [`LeadCapture.gs`](./LeadCapture.gs).
3. **Project Settings → Script properties**:

| Property | Example |
| --- | --- |
| `SPREADSHEET_ID` | `1AbC…` |
| `NOTIFICATION_EMAIL` | `kontakt@conis.cz` |
| `SHEET_NAME` | `Leads` (optional, default `Leads`) |

4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the Web App URL (`https://script.google.com/macros/s/…/exec`).

## 3. Wire production frontend

Set the endpoint in both published HTML files (Pages serves `docs/`):

```html
<meta name="conis-lead-endpoint" content="https://script.google.com/macros/s/AKfycbzQ2-YW9DputxDhBVLGRK8byxhLfoju1Obo5OneqAABWK6KuQubzDwM8zLz2z_yDKTj3g/exec">
```

Files:

- `docs/index.html` (production conis.cz)
- `conis-web-1.0/index.html` (source)

Optional override without meta:

```html
<script>window.CONIS_LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbzQ2-YW9DputxDhBVLGRK8byxhLfoju1Obo5OneqAABWK6KuQubzDwM8zLz2z_yDKTj3g/exec";</script>
```

Commit + push so GitHub Pages picks up the meta value.

## 4. Local Node fallback

With empty meta, the form posts to `POST /lead` (local `npm start`).

Optional `.env`:

```bash
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbzQ2-YW9DputxDhBVLGRK8byxhLfoju1Obo5OneqAABWK6KuQubzDwM8zLz2z_yDKTj3g/exec
LEAD_EMAIL_TO=kontakt@conis.cz
```

## 5. Validation checklist

- [ ] Submit quiz + form on conis.cz
- [ ] One new row in the Sheet; quiz columns use **question titles** (not O1/O2)
- [ ] Notification e-mail arrives with contact + score + segment + answers
- [ ] Thank-you screen appears
- [ ] On forced error (wrong endpoint), form values remain and retry works

## Payload (frontend → Apps Script)

```json
{
  "leadId": "uuid",
  "timestamp": "ISO-8601",
  "name": "",
  "company": "",
  "email": "",
  "phone": "",
  "status": "A|B|C",
  "score": "",
  "segment": "",
  "recommendation": "",
  "answers": { "annual_sales": "…" },
  "answersByTitle": { "Kolik domů ročně prodáváte?": "…" },
  "url": "",
  "referrer": "",
  "utmSource": "",
  "utmMedium": "",
  "utmCampaign": "",
  "sessionId": "",
  "userAgent": ""
}
```

POST uses `Content-Type: text/plain;charset=utf-8` so browsers skip CORS preflight against Apps Script.
