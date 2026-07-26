# CONIS Web 1.0

Manifest site with partner qualification and optional lead capture.

## Requirements

- Node.js 18+

## Start

```bash
cd conis-web-1.0
npm start
```

Open: [http://127.0.0.1:3000](http://127.0.0.1:3000)

```bash
PORT=8080 npm start
```

Stop: `Ctrl+C`

## Architecture

```text
Web UI
  → POST /qualification   (decision A/B/C)
  → POST /lead            (voluntary contact)

HTTP (server/index.js)
  → services/leadService  (orchestration)

Destinations (pluggable)
  → localArchive
  → email
  → googleSheets
  → (future: CRM, database, …)
```

UI never talks to e-mail or Sheets directly.

## APIs

### `POST /qualification`

Body: qualification answers JSON.  
Response: `{ status: "A" | "B" | "C", calendlyUrl?: string }`

### `POST /lead`

Body:

```json
{
  "name": "",
  "company": "",
  "email": "",
  "phone": "",
  "status": "B",
  "answers": {},
  "userAgent": ""
}
```

`leadService` validates, archives locally, then fans out to configured destinations.

Configure via `.env` (see `.env.example`).

### Google Sheets webhook

Apps Script web app accepting JSON POST and appending:

`timestamp | name | company | email | phone | answers | status | userAgent | ip`

Set `GOOGLE_SHEETS_WEBHOOK_URL`.

## Production notes

- Copy `.env.example` → `.env` for SMTP + Sheets.
- Update absolute URLs in `robots.txt`, `sitemap.xml`, and Open Graph tags.
- Serve over HTTPS.
