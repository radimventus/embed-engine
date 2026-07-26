# CONIS Web 1.0

Editorial marketing site with a short partner qualification flow.

## Requirements

- Node.js 18+

## Start

```bash
cd conis-web-1.0
npm start
```

Open: [http://127.0.0.1:3000](http://127.0.0.1:3000)

Optional port:

```bash
PORT=8080 npm start
```

## Stop

In the terminal running the server press `Ctrl+C`.

## Structure

```text
conis-web-1.0/
  index.html
  css/style.css
  js/app.js
  js/quiz.js
  public/favicon.svg
  robots.txt
  sitemap.xml
  manifest.webmanifest
  server/index.js          # static host + mock POST /qualification
  package.json
  README.md
```

## Qualification API

Frontend only:

1. Renders questions
2. `POST /qualification` with JSON answers
3. Renders server response `{ status: "A" | "B" | "C", calendlyUrl?: string }`

Decision A/B/C is made on the server (`server/index.js` → `decideQualification`).

Replace the mock function with a production backend without changing the frontend contract.

## Production notes

- Update absolute URLs in `robots.txt`, `sitemap.xml`, and HTML canonical/Open Graph tags to the live domain.
- Serve over HTTPS.
- Point `/qualification` to the real backend.
