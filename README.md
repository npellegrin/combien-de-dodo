# combien-de-dodo 🌙

A tiny static site that counts how many *dodos* (nights) are left before an event. The site itself is in French.

- `/noel`, `/week-end`, `/paques`, `/halloween`…: configured events (listed on the home page)
- `/2027`: before January 1st of a given year
- `/2027-05-12`: before any date (`YYYY-MM-DD`)

Plain HTML, CSS and JavaScript. No dependencies, no build.

## Structure

```
website/
  index.html   single page for every URL
  style.css    styles
  app.js       all the logic (event dates, routing, rendering)
```

## Run locally

```sh
npx wrangler pages dev website
```

`python3 -m http.server -d website` also works, but only for `/`: other paths rely on Cloudflare Pages' SPA fallback.

## Deploy on Cloudflare Pages

- Build command: none
- Output directory: `website`

With no `404.html`, Cloudflare Pages serves `index.html` for every path; `app.js` reads the URL and shows the right count.

## Add an event

Add an entry to `EVENTS` in `website/app.js`, and optionally a `[data-dodo="<slug>"]` theme in `website/style.css`.
