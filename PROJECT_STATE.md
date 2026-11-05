# PROJECT_STATE — Driving Log Pro

শেষ যাচাই: 2026-11-05 · ভিত্তি: `main` (Full-Time data protection update)

## কাজের নিয়ম
- কাজ শুরুর আগে বর্তমান `main` এবং এই ফাইল পড়ুন।
- Claude/ChatGPT—কেউই পুরোনো divergent branch-এ push বা merge করবেন না। প্রতিটি নতুন কাজ `main` থেকে নতুন branch-এ শুরু করুন।
- প্রতিটি app asset পরিবর্তনের পর `sw.js` cache version বাড়ান।
- Public repository-তে কখনো student data, CSV/JSON backup, token বা private data commit করবেন না।
- Source update, Pages deployment success এবং real iPhone runtime test—তিনটি আলাদা verification status হিসেবে রিপোর্ট করুন।

## Architecture
- Vanilla JavaScript PWA; build step নেই; GitHub Pages: `main`, root.
- Main files: `index.html`, `styles.css`, `app.js`, `prayer-times.js`, `full-time-students.js`, `sw.js`, `manifest.webmanifest`.
- Tabs: Overview, Calendar, Log, Students, Reports.
- Main data localStorage key: `driving-log-pro-v1` (`entries`, `students`, packages, prayer/work settings).
- Full-Time historical register key: `driving-log-pro-full-time-v1`; records keyed by `legacy_student_id`, isolated from normal lesson accounting.
- Main app exposes a narrow `window.DrivingLogFullTime` bridge (getAll/replace/clear) so full-time data can participate in backup/sync without mixing into lesson accounting.
- Cloud sync stores `driving-log.json` in the user's own private GitHub data repository; token remains in that browser's localStorage.
- Current service-worker cache: `nahians-schedule-cache-v36`.
- App footer version: `v1.20`. CSS comments such as v1.26 may refer to feature revision, not app release.

## Business rules
- Default lesson rate €20/hour.
- Income = lesson value; profit = income minus expenses; expenses are not income.
- Timer target: 55 minutes; completed timer lesson receives 1 hour business credit, actual time is stored separately.
- Full-Time register is historical only and must not affect current lessons, packages, revenue or reports.
- Full-Time records use unique `legacy_student_id`; do not merge by name.

## Data protection — current implementation
- JSON export now includes `fullTime` alongside main app state.
- JSON restore validates optional `fullTime` records and restores them when present.
- Legacy backups without `fullTime` preserve the device's existing Full-Time register; they do not silently erase it.
- Automatic safety copies use the same combined snapshot.
- Cloud snapshot, three-way merge and restore include Full-Time records, using `legacy_student_id` as the merge key.
- Delete All explicitly clears the local Full-Time register as well as main app data; cloud copy remains untouched after this device disconnects.
- Full-Time CSV export/import remains available as an additional independent safety option.
- Public app repo contains code only; actual records and token must remain outside this repo.

## Current features
Lesson/expense log, student CRM, packages/prepaid accounting, reports, CSV import/export, JSON backup/restore, safety copies, optional private GitHub cloud sync, calendar, 55-minute timer, Bengali voice announcements (device voice availability dependent), travel dua audio, and separate Full-Time Students historical register.

## Known limitations / verification still needed
1. Real iPhone Safari and Home Screen PWA testing is still required for timer audio, Bengali voice availability, screen wake, update prompt, clipboard/native paste and offline startup.
2. Cloud sync is optional and uses the user's private GitHub repository/token; it is not a managed database or guaranteed real-time service.
3. Cloud sync should be enabled only after a fresh JSON backup and confirmation that the chosen private data repository is private and token scope is limited.
4. The Full-Time bridge assumes `full-time-students.js` is loaded before the user triggers backup/restore/sync; index.html loads it after app.js but before interaction and initial `load()`/sync.
5. Test upgrade/restore scenarios using: current backup with Full-Time rows, legacy backup without Full-Time rows, empty Full-Time list, and simultaneous edits/deletions on two devices.
6. Never claim iPhone runtime verified solely from successful GitHub Pages deployment.

## Branch hygiene
- `claude/intelligent-gates-shiyps` is permanently divergent (32 commits behind main, one unique commit); do not push, merge or force-push it.
- Previous feature branches may contain work already merged by PR; inspect diffs before reusing.
- Current main is the source of truth.

## Recent work
- PR #19: premium responsive Log screen with live KPIs and sorting.
- PR #17: clipboard paste button implementation; later the user requested removing custom Paste buttons, and the related buttons/logic were removed from main.
- Latest data-protection update: Full-Time historical register now participates in JSON backup/restore, cloud sync three-way merge, and Delete All. README updated; footer version v1.20; service-worker cache v36.

## Handover
- Current work committed directly to main in sequential commits; check latest GitHub Pages Actions run before claiming deployment.
- No student data or tokens were accessed or changed during source maintenance.
- Next task: validate latest main source, deployment and then test real iPhone behavior.
