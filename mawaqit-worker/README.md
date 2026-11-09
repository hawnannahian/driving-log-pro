# Mawaqit timetable Worker

Serves the mosque's public Mawaqit timetable (`GET /times`) with CORS so the app can refresh prayer times.
Public data only: no secrets, no storage, no student data. The browser cannot call Mawaqit directly (no CORS headers).

## Deploy (owner, once)
1. Install Wrangler and log in to your Cloudflare account: `npx wrangler login`.
2. From this folder: `npx wrangler deploy`.
3. Open `https://driving-log-mawaqit.<your-account>.workers.dev/times` — it must return JSON with `iqama`, `adhan` and `jumua`.
4. Give that URL to Claude: it goes into `mawaqit-config.js` and the app's Content-Security-Policy (`connect-src`) in one PR.

## Behaviour
- Fetches the Mawaqit page, caches it for 6 hours at Cloudflare, parses the embedded timetable and returns it (browser cache 1 hour).
- If Mawaqit is down or the page layout changes, it answers 502 and the app keeps its last good timetable.
- `ALLOWED_ORIGINS` (comma separated) controls which sites may read it; default is the GitHub Pages site.
