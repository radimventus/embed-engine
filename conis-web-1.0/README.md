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

## APIs

### `POST /qualification`

Body: qualification answers JSON.  
Response: `{ status: "A" | "B" | "C", calendlyUrl?: string }`

Decision stays on the server. Qualification works without contact.

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

Pipeline:

1. Validate
2. Append `data/leads.jsonl`
3. Send e-mail (SMTP) or log to `data/outbound-mail.log`
4. Append Google Sheet via webhook or queue `data/sheets-queue.jsonl`

Configure via `.env` (see `.env.example`).

### Google Sheets webhook

Deploy an Apps Script web app that accepts JSON POST and appends a row:

`timestamp | name | company | email | phone | answers | status | userAgent | ip`

Set `GOOGLE_SHEETS_WEBHOOK_URL` to the web app URL.

## Production notes

- Copy `.env.example` → `.env` and set SMTP + Sheets webhook.
- Update absolute URLs in `robots.txt`, `sitemap.xml`, and Open Graph tags.
- Serve over HTTPS.
