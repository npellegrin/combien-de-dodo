# AGENTS.md

"Combien de dodo" static site in `website/`, hosted on Cloudflare Pages (output directory `website`, no build).

## Rules

- Vanilla HTML, CSS, JavaScript. No dependencies, no build tools, no frameworks. Keep it simple, no bloat: 3 files (`index.html`, `style.css`, `app.js`).
- Code, comments and docs in English; user-facing text in French.
- Do not add a `404.html`: routing relies on Cloudflare Pages' SPA fallback (every path serves `index.html`).

## How it works

- `app.js` reads `location.pathname`: an `EVENTS` slug, a 4-digit year, or a `YYYY-MM-DD` date.
- New event = one entry in `EVENTS`: `{ label, emoji, next(today) -> Date }`, where `next` includes today.
- Per-event look: `app.js` sets `<body data-dodo="<slug>">`; theme it in `style.css` with `[data-dodo="<slug>"]` (override `--bg`, `--glow`, `--accent`, or anything else).
- Dates are local; `nights()` goes through `Date.UTC` to ignore DST changes.

## Check

`app.js` exports its logic under Node (`require("./website/app.js")`) to test dates without a browser.
