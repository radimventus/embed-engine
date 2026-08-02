# CONIS Web 1.0

Manifest site with partner qualification and lead capture.

## Requirements

- Node.js 18+ (local preview only)
- Production host: GitHub Pages (`docs/` → `https://conis.cz`)

## Start (local)

### Monorepo host (DEV-014 — recommended)

Serves the production Pages tree (`docs/` → same files as https://conis.cz):

```bash
pnpm web:dev
```

Open: [http://127.0.0.1:4190/](http://127.0.0.1:4190/)

### Legacy Node server (qualification / lead APIs)

```bash
cd conis-web-1.0
npm start
```

Open: [http://127.0.0.1:3000](http://127.0.0.1:3000)

## Production lead capture (CAP-WEB-01)

On GitHub Pages there is **no Node server**. The contact form posts to a **Google Apps Script** Web App, which:

1. Appends one row to Google Sheets (columns = real quiz question titles)
2. Sends a notification e-mail (Gmail / MailApp)

Setup guide: [`apps-script/README.md`](./apps-script/README.md)

Required production config in `docs/index.html` (and source `index.html`):

```html
<meta name="conis-lead-endpoint" content="https://script.google.com/macros/s/AKfycbzQ2-YW9DputxDhBVLGRK8byxhLfoju1Obo5OneqAABWK6KuQubzDwM8zLz2z_yDKTj3g/exec">
```

```text
Quiz → Lead Form → Apps Script → Google Sheets + Gmail
```

Frontend never calls the Google Sheets API directly.

## Local APIs (npm start)

### `POST /qualification`

Body: qualification answers JSON.  
Response: `{ status: "A" | "B" | "C", calendlyUrl?: string }`

### `POST /lead`

Accepts the same payload shape as Apps Script (contact + `answersByTitle` + evaluation + UTM).  
`leadService` validates, archives locally, then fans out to e-mail / Sheets webhook when configured.

See `.env.example`.

## Sync to Pages

After changing web assets, copy into the Pages tree:

```bash
cp conis-web-1.0/js/lead.js docs/js/lead.js
cp conis-web-1.0/index.html docs/index.html
# keep docs/conis-web-1.0 in sync if used as mirror
```

Then commit + push the Pages branch.
