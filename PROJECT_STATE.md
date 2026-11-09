# PROJECT_STATE — Driving Log Pro

## Completed v1.50 — Unified New Record form (2026-11-09)
- PR #120 merged by owner; merge commit: `40fea4b2193ded124e994ebe8f027999676b9ea3`.
- One continuous New Record sheet, subtle dividers, mobile full-height bottom sheet, sticky heading/actions.
- CSS-only UI change plus footer v1.50 and Service Worker cache v112; no JS/data/schema changes.
- CI run #39 (`42553839244`) SUCCESS: JavaScript syntax checks and Multiple Booking atomic-save tests passed.
- Static checks: 312 HTML IDs / 0 duplicates; CSS braces balanced 2294/2294.
- Pending manual QA: 390×844 and 320×568 rendered screenshots, real iPhone Safari/Home Screen, and live Pages deployment check.


শেষ যাচাই: 2026-11-09 · সর্বশেষ main: `21c2625` (PR #120 merged; v1.50 unified New Record form; CI passed). Manual iPhone/browser/deployment QA remains pending.

## কাজের নিয়ম
- মালিককে উত্তর দিন বাংলায় এবং খুব সংক্ষেপে: কাজ শেষ হলে শুধু "হয়ে গেছে" + লিংক; না হলে অল্প কথায় কারণ।
- কাজ শুরুর আগে বর্তমান `main` এবং এই ফাইল পড়ুন।
- Claude/ChatGPT—কেউই পুরোনো divergent branch-এ push বা merge করবেন না। প্রতিটি নতুন কাজ `main` থেকে নতুন branch-এ শুরু করুন।
- প্রতিটি app asset পরিবর্তনের পর `sw.js` cache version বাড়ান।
- Public repository-তে কখনো student data, CSV/JSON backup, token বা private data commit করবেন না।
- Source update, Pages deployment success এবং real iPhone runtime test—তিনটি আলাদা verification status হিসেবে রিপোর্ট করুন।

## Historical verified state (main 7108022, checked 2026-11-08)

**Release:** footer `v1.37` (`index.html`), Service Worker cache `nahians-schedule-cache-v99` (`sw.js`). The v1.37/cache v99 assets were last changed at `0cd6ad143590a0450d61244facbadb8ed51a71a1`; current `main` `7108022` carries the same app assets forward in a docs-only commit.
**Latest change:** PR #99 merged at `0cd6ad1`. The existing weekly Repeat selector is visible for new Lesson records only (hidden for edits and non-lessons); `push-config.js` is included in the Service Worker precache. No storage schema, accounting, course allocation, backup/restore or sync merge logic changed.
**Deployment:** GitHub Pages workflow run #150 / #42530331667 for `0cd6ad1` completed successfully. This proves Pages workflow success only; it does not verify real iPhone behavior.
**PR #99 checks:** all eight JS files parsed; 307 HTML IDs / 0 duplicates; seven local script refs resolve; CSS braces balanced; focused Repeat visibility checks passed; synthetic pooled-repeat allocation and synthetic two-device merge checks passed. No rendered browser/Playwright, real iPhone, live two-device sync or push-delivery test was run.
**PR #98:** merged at `e6b03e2` (Pages run #149 succeeded); Legacy Archive deletion rebuilds FIFO allocations, budgets package hours from actual receipts, consumes allocations chronologically (including partial/extra-hour lessons), and only auto-marks fully funded completed lessons Paid. Existing explicit Paid status is preserved. Previously mis-marked historical Paid lessons are not automatically repaired.
**Push:** `push-config.js` is now precached, but its API URL remains empty; Cloudflare Worker backend is not deployed/configured. Precache does not activate Web Push. No Cloudflare secrets or VAPID keys were accessed.
**Open PRs:** #73 (older Log-settings follow-up) and #13 (WhatsApp pasted-number fix on a divergent branch) remain open and untouched.
**Tabs:** Overview, Calendar, Log, Students, Reports and Islamic. Student profile tabs (`PROFILE_TABS`): Overview, Lessons, Course, Payments, Legacy (only when an archive exists for the student), Attendance.
**PRs #79–#98 (merged to main; release sequence)**
| PR | What | Footer / cache at merge |
|---|---|---|
| #79 | Course Phase 1: purchased hours are an entitlement independent of payments; multiple courses per student; FIFO default; not-completed lessons release hours | v1.22 / v83 |
| #80, #81 | Claude Code guidelines; shared AGENT_SYNC handover | docs only |
| #82 | Custom Add course sheet; optional name, hours, price, date, optional first payment, rate preview; duration-aware default for "Use course hours" | v1.23 / v85 |
| #83 | Delete a course with payments but no linked lessons; confirm + safety copy; remove only its own payment rows | v1.24 / v86 |
| #84 | Add course sheet visual fix: solid card, sticky header/footer, iOS-safe date input | v1.25 / v87 |
| #85 | Professional UI/UX review rule in CLAUDE.md §7a | docs only |
| #86 | Multi-course profile summary and Add payment sheet; course name shown in Payments | v1.26 / v88 |
| #87 | Pooled course hours using additive `courseAlloc`; one lesson can draw from multiple courses | v1.27 / v89 |
| #88–#89 | Documentation handover/synchronization | docs only |
| #90 | Move Voice Announcements and Lock-screen Notifications from Overview into Log → Settings | v1.28 / v90 |
| #91 | Replace Log Settings sub-tab with compact three-dot overflow menu and Back to Records | v1.29 / v91 |
| #92 | Remove the dropdown: first tap on the three-dot control opens Settings directly | v1.30 / v92 |
| #93 | Handover documentation synchronization | docs only |
| #94 | Overview dashboard redesign; no financial metrics on Overview | v1.33 / v95 |
| #95 | Prayer-time conflict guard, timezone/Asr fixes and hard booking block | v1.32 / v94 |
| #96 | Standing GitHub handover rule documentation | docs only |
| #97 | New Record smart booking shortcuts and mobile modal scroll containment | v1.35 / v97 |
| #98 | Legacy Archive deletion payment status: actual paid-hour budget and chronological FIFO coverage | v1.36 / v98 |

**Merged PR #99:** https://github.com/hawnannahian/driving-log-pro/pull/99 — exposes the existing weekly Repeat selector for new Lesson records only and adds `push-config.js` to the Service Worker precache; released as footer v1.37/cache v99.

**Course model (current source)**
- `state.courses=[{id,student,date,hours,price,createdAt,v,name?}]` — hours and price are entered per student; there are no templates; `name` is optional/additive. UI word is "Course". Rate = price ÷ hours. Several courses per student are allowed.
- `state.coursePayments=[{id,course,date,amount}]`, counted once per id. Payments cannot exceed the outstanding amount (both Add payment sheet and first payment). Removing a payment changes money only (confirm dialog); it never affects hours.
- Hours are an entitlement: purchased hours are available regardless of how much is paid. Available = purchased − all linked lessons that are scheduled or completed (`done:false` lessons release their hours). Completed hours use the scheduled Start–End duration (`hours()`); timer elapsed minutes are informational.
- A course can be deleted only when no lesson is linked to it (including a share of a split lesson). Deleting removes the course and its own payment rows after confirm + a safety copy.

**Pooled course hours (PR #87) — `courseAlloc`**
- One lesson (still ONE record) may draw hours from several courses of the same student, oldest course first. Optional additive lesson field `courseAlloc:[{c:courseId,h:hours}]`, same idea as the legacy `alloc`. `lesson.course` stays the first course; a lesson without `courseAlloc` behaves exactly as before.
- Written only when a new/edited course lesson needs more hours than the oldest course has free; a single-course lesson stores no `courseAlloc`. An edit that keeps the same hours and student keeps the stored allocation; an edit that changes the length re-plans it (editing to a shorter time can drop the field).
- Shares are scaled to the lesson's current length (`allocParts`). Helpers: `allocParts`, `courseShareH`, `planCourseAlloc`, `pooledFreeH`, `applyAlloc`; `courseLessons/courseDoneH/courseUsedH/courseFreeH` use per-course shares. Record form default tick and "X h available across N courses" use the pooled free hours; not enough pooled hours → the save is refused with the pooled total. Quick booking uses the pool.
- Money stays per course: `income()` of a split lesson = Σ share × that course's own hourly rate; `coursePaid/courseDue/courseBalance` and payment rows are unchanged. Individual lessons stay separate. No existing lesson is migrated or rewritten.
- Weekly repeat copies allocate in turn (leftovers become individual lessons). On current `main`, the Repeat control is visible for new Lesson records only; it remains hidden for edits and non-Lesson records. This was merged in PR #99; the underlying repeat and course-allocation logic is unchanged.
- Compatibility: a device still running an older cached version counts the whole split lesson on `lesson.course` (first course) and ignores the second share until it updates; update all devices. Backup/restore carries `courseAlloc` (tested by Claude with a snapshot round trip); cloud-sync merge of it between two devices was NOT tested.

**Accounting invariants to keep** (see also CLAUDE.md §6): revenue, collected cash, outstanding, expenses and prepaid balances are different things; expenses are not income; a lesson linked to a course is never also counted as an individually paid lesson; a paid individual lesson converted to course hours keeps its original receipt separately (`courseTransferPaid/Date`), not as a course payment; the Legacy Archive and lessons linked by `e.pkg` stay read-only history.

**Known unfinished / open (verified in source or GitHub on 2026-11-08)**
1. **PR #98 is merged.** Legacy Archive deletion rebuilds FIFO allocations before conversion, budgets only money actually received per package, consumes package-funded hours chronologically (including partial/extra-hour lessons), and automatically marks only fully cash-covered completed lessons Paid. It preserves any existing explicit Paid state. Previously mis-marked Paid historical lessons are not automatically repaired.
2. On `main`, `push-config.js` is loaded by `index.html` and listed in `sw.js` `FILES` (merged PR #99, cache v99).
3. Push notification backend (`push-worker/`) is not deployed; `push-config.js` has an empty API URL. Cloudflare account access, VAPID key generation, private Worker secrets, real contact URI and deployment are still required.
4. Open PRs on GitHub: #73 (older Log-settings follow-up; likely superseded by merged #78, but verify before any action) and #13 (WhatsApp paste fix on `claude/intelligent-gates-shiyps`, based on an old main). Both remain open and were not changed in the v1.37 release.
5. A split lesson is shown like any other course lesson (no per-course breakdown) except in the profile Course card ("0.5 h of 1 h"). In an old test run the Calendar day/week blocks of a course lesson showed "Course · €value"; whether showing the value there is intended was not confirmed (that old test expected no amount).
6. Stale local test scripts (not in the repo): the older cfix2 check (4 failures that predate #82: it expects a hidden compatibility row/old calendar text), and the older delete-legacy, fresh-course and "p2" scripts fail on selectors from the replaced UI. They are known stale, not regressions of #82–#87.
7. Real iPhone testing of the Add course/Add payment sheets, default tick, pooled booking, weekly repeat, offline start and Pages behavior remains unverified. Two-device cloud sync of `courseAlloc` remains unverified; PR #99 passed only a synthetic merge test.
8. Prayer-time timetable has not been compared with a trusted Portugal timetable. The owner reported (2026-11-09) that the app times do not match the mosque's Mawaqit times: the app calculates adhan times astronomically (MWL 18°/17°, Lisbon coordinates) and has no mosque/Mawaqit data; the unused `PRAYER_YEAR` table in `prayer-times.js` is not read by `app.js`. **Resolved in v1.47** (Mawaqit snapshot file; live refresh still pending owner approval). Third-party audio/recording licences are unconfirmed (see Islamic Companion notes below).

### 2026-11-08 — v1.32 (cache v94): Prayer-time conflict guard (branch `fix/prayer-conflict-suggest`)
- **Not a false positive:** the reported case (lesson 16:30–17:30, Maghrib block 17:16–17:31) is a genuine overlap; the overlap test `a<blockEnd && blockStart<b` was already correct. The work fixed the real defects around it:
  1. **Timezone bug:** `prayerDay()` used the *device's* UTC offset, not the prayer city's. On a device outside Portugal times shifted by hours (verified on `main`: Maghrib 17:31 in Lisbon/UTC, 23:31 with a Dhaka device, 12:31 with a New York device). It now uses the city's IANA timezone (`tzOffsetHours()`, DST-aware). Identical results on every device timezone; DST steps verified (2026-03-29 about +60 min, 2026-10-25 about −60 min).
  2. **Asr was missing from autumn to spring** and wrong in summer: the code passed `90−asrAltitude` to the hour-angle function (unreachable → no Asr block between ~Sept and March; June gave 16:23). Now `hourAngle(asrAlt)` (standard shadow factor 1): Lisbon 2026-11-08 Asr 15:08, 2026-06-21 17:34. Because Asr blocks now exist in winter, some winter slots that used to be bookable are blocked; existing lessons are not touched. Timetable still not compared with a trusted Portugal timetable.
  3. **Quick booking could override a prayer block** ("Book anyway?"). Prayer overlap became a hard block there (v1.32); **v1.46 turned it back into a confirm warning at the owner's request**. The record save handler also checks prayer time *before* the lesson-clash prompt.
- New shared helpers: `lessonSpan`, `prayerConflict(date,start,end)` (overlap incl. past-midnight lessons, checks the next day's blocks, boundaries touching are allowed), `suggestLessonTimes()` (nearest valid start of the same length, snapped to 5 min, respects prayer blocks, other lessons, working hours, not in the past today; up to two: nearest before/after), `prayerMessage()`, `refreshPrayerGuard()`.
- Record form: inline amber warning `#prayerWarn` ("Your lesson overlaps with Maghrib (a–b). Suggested alternative: x–y.") with "Use x–y" buttons that keep the duration and recompute the end; **(superseded in v1.46: Save is no longer disabled, a confirm pop-up is used instead)** Save record was disabled while a new or moved lesson overlapped prayer time; revalidated on start/end/date/duration/type changes and again in the submit handler. A saved lesson whose date/start/end are unchanged is not locked out (it shows an informational note; the old "Keep existing lesson?" confirm remains). Expenses are never affected.
- Payments, rates, course/individual logic, dashboard design: unchanged. No data/schema change. At 320px time inputs lose the clock icon and get tighter padding so "PM" is not clipped.
- Not changed: CSV import (historical rows) and the Repeat-copy skip logic; the "next prayer" line still compares Lisbon clock times with the device clock (only correct on a Portugal-time device).

### 2026-11-09 — v1.46 (cache v108): Prayer-time overlap is a warning, not a block (owner-requested; branch `feature/prayer-conflict-warning-v1-46`)
- **Owner request:** booking a lesson during prayer time must show a pop-up warning and must NOT block. This supersedes the hard block from PR #95 (v1.32).
- Record form: the inline amber `#prayerWarn` box stays (with "Use x–y" suggestions) but **Save record is never disabled**; Save asks `confirm("This lesson overlaps Fajr (a–b). Book anyway?")` (wording "Save anyway?" when editing a moved lesson). Cancel keeps the form open. An unchanged saved lesson keeps its old "Keep the existing lesson?" confirm.
- Quick booking: prayer overlap now asks "Book anyway?"; the generic clash check skips prayer blocks (`conflictOn(...,skipPrayer)`) so there is one prompt, not two.
- Multiple booking (`saveMultipleBooking`): prayer overlap no longer throws; all overlapping sessions are listed in ONE confirm; declining restores state and saves nothing.
- Not changed: weekly Repeat copies still skip a copy whose slot overlaps a prayer block (`conflictOn`); free-slot search, calendar prayer shading and the "next prayer" line; prayer-time calculation (still astronomical MWL, Lisbon coordinates — NOT Mawaqit; see open item 8 above). No data/schema, accounting, course or sync change.

### 2026-11-09 — v1.47 (cache v109): Prayer times from the mosque's Mawaqit timetable (owner-requested; branch `feature/mawaqit-prayer-times-v1-47`)
- **Why:** the owner reported the app's prayer times did not match Mawaqit and said they were correct at the start. Cause: v1.0–v1.31 used a fixed mosque timetable (`PRAYER_YEAR`, jamaat times, block = jamaat..jamaat+minutes); commit `79e097a` (2026-11-08) replaced it with an astronomical MWL calculation (adhan times, block = adhan−minutes..adhan).
- **Now:** `mawaqit-times.js` (`window.MAWAQIT_TIMES`) holds the mosque's Baitul Falah Jam-E-Masjid-Reboleira adhan and iqama (jamaat) calendar plus the Friday Jumu'ah time, generated by `tools/update-mawaqit-times.mjs` from the public Mawaqit page (snapshot fetched 2026-11-09). `prayerBlocks()` uses the jamaat times: block = jamaat..jamaat+`minutes` (the existing "minutes" setting); Friday uses the mosque Jumu'ah time (13:30) instead of the app's Jumu'ah setting. Missing file/date → falls back to the previous astronomical calculation and block shape. The "Next prayer" line and the all-prayers list now show the jamaat time (`prayerAt`).
- Relative iqama entries on Mawaqit (e.g. "+15" on 29 Feb) are resolved to clock times by the generator, which fails without touching the file if any row is invalid.
- **Not live yet:** the file is a snapshot; it must be regenerated (`node tools/update-mawaqit-times.mjs`, then bump the cache) when the mosque changes its timetable. The browser cannot call Mawaqit directly (no CORS headers; the official API needs a token), so true live refresh needs a server-side step (scheduled GitHub Action or Cloudflare Worker) — owner approval pending.
- Location/Method settings only matter as a fallback while Mawaqit data exists. No storage/schema change. The unused `PRAYER_YEAR` table in `prayer-times.js` is untouched.

## Architecture
- Vanilla JavaScript PWA; build step নেই; GitHub Pages: `main`, root.
- Main files: `index.html`, `styles.css`, `app.js`, `reports-dashboard.js` (Reports dashboard, loaded after app.js), `islamic-content.js` (dua/tasbih text only) + `islamic.js` (Islamic tab), `prayer-times.js`, `full-time-students.js`, `sw.js`, `manifest.webmanifest`.
- Tabs: Overview, Calendar, Log, Students, Reports, Islamic.
- Main data localStorage key: `driving-log-pro-v1` (`entries`, `students`, `courses`, `coursePayments`, `legacy`, `islamic`, prayer/work settings; `packages` only as an input that is archived on load). Lesson records may carry the optional fields `course`, `courseAlloc`, `courseTransferPaid/Date`, `pkg`/`alloc`/`extraH` (legacy), `done`, `actualMin`.
- Full-Time historical register key: `driving-log-pro-full-time-v1`; records keyed by `legacy_student_id`, isolated from normal lesson accounting.
- Main app exposes a narrow `window.DrivingLogFullTime` bridge (getAll/replace/clear) so full-time data can participate in backup/sync without mixing into lesson accounting.
- Cloud sync stores `driving-log.json` in the user's own private GitHub data repository; token remains in that browser's localStorage.
- Historical note (superseded): this section's older cache/footer references describe earlier releases. Current `main` is footer `v1.37`, Service Worker cache `nahians-schedule-cache-v99` at `0cd6ad143590a0450d61244facbadb8ed51a71a1` (verified 2026-11-08). CSS comments may refer to feature revision, not app release.

## Fresh Course system + Legacy Archive (history; the Course bullet below is corrected for current main — see "Current verified state")
- **Legacy Archive (read-only):** old prepaid packages are moved once into `state.legacy.packages` (original objects verbatim + `archive:{at,v,lessonIds}`) by `migrateLegacy()` on load, restore and cloud merge. Idempotent: an archived id is never copied again or overwritten. A recoverable copy is kept first in `driving-log-pro-v1-before-legacy` (Reports → Safety copies); if it cannot be saved nothing is moved and `pkgs()` still reads leftover `state.packages`, so figures never change. `pkgs()` = archive + leftovers; the old engine (`recomputeAlloc`, `income`, `studentStats` legacy parts) keeps reading it, so historical revenue/hours/payments are identical (verified against `main` with a synthetic seed). Lessons keep `e.pkg` (history). Archived records are never edited; only the student label follows renames/merges.
- **Courses (current, corrected 2026-11-08):** `state.courses=[{id,student,date,hours,price,createdAt,v,name?}]` — custom hours and price per student (no fixed 17 h/€340 template any more); payments are separate rows `state.coursePayments=[{id,course,date,amount}]` (counted once per id). Lessons link with `e.course` (never `e.pkg`) and optionally `e.courseAlloc` for pooled hours (PR #87). Used/remaining/free hours are derived on every render from linked lessons. Purchased hours are an entitlement independent of payments; a lesson can be linked only if the student's pooled free hours cover it; a payment cannot exceed the outstanding amount; removing a payment changes money only; a course with no linked lessons can be deleted (with its own payments, after confirm + safety copy); several courses per student are allowed. Course lessons: income = share × that course's rate, never "unpaid", `e.paid` ignored. (The original text here described the 2026-11-06 design: single open course, 17 h/€340, linking limited by min(17, paid/20), only an empty course deletable — all superseded by #79, #82, #83, #87.)
- **Money rules:** Revenue = value of completed lessons (course lessons at the course rate); Collected = paid individual lessons + course payments (by payment date) + historical package payments; Outstanding = unpaid completed individual lessons + legacy package dues + course price − paid; Course prepaid balance = course paid − value of completed course hours. Legacy remaining hours/balances are no longer shown anywhere active.
- **Sync/backup:** snapshot adds `legacy`, `courses`, `coursePayments` and keeps `packages` (= archive, for older devices). `mergeAll`: missing keys from an older remote mean "unchanged" (never wipe), payments merge as separate rows, archive merges by union. Backup restore: old backups (top-level `packages`) are archived without duplicates; a backup without `courses` replaces courses with none (safety copy is kept first); the archive is always unioned, never dropped.
- **Delete Legacy Archive** (Reports → Backup & restore, shown only while an archive exists): two confirmations + a safety copy (`before-legacy-delete`); removes `state.legacy`/`packages`, sets `state.legacyDeletedAt` (a deletion beats copies on other devices/cloud in `mergeAll`/`fromSnapshot`/`useBackup`); lessons that used old packages become normal lessons marked Paid (unless their extra hours were unpaid) — still true on main 5bbb485, including upcoming lessons (known open issue, see Current verified state). Restoring a backup that has no deletion marker brings the archive back.
- **Known decisions to confirm:** (1) upcoming lessons that were already linked to an old package stay linked (they will use that package's remaining hours when completed); (2) legacy amounts still *due* (e.g. an unpaid old package) stay in Outstanding but cannot be paid because the archive is read-only; (3) the old "count earlier lessons in the course" feature is gone (a new course never takes old hours).
- Also fixed: `render()` threw on every call on `main` because `#logTodayDate` was removed from the HTML but app.js still set it (now guarded).

### 2026-11-08 — v1.27 (cache v89): Pooled course hours (owner-approved)
- One lesson can use hours from more than one of the student's courses, counted as one total (oldest course first). Still ONE lesson record.
- Data: optional additive field `courseAlloc:[{c:courseId,h:hours}]` on a lesson (same idea as the legacy `alloc`). `lesson.course` stays the first course, so lessons without `courseAlloc` behave exactly as before. Shares are scaled to the lesson's current length. It is written only when a new/edited lesson needs more hours than the oldest course has free; unchanged-hours edits keep the existing allocation. No migration; no existing lesson is rewritten.
- Money stays per course: a split lesson's value = Σ share × that course's own hourly rate; payments and `courseDue` are untouched.
- Functions: `allocParts`, `courseShareH`, `planCourseAlloc`, `pooledFreeH`, `applyAlloc`; `courseLessons/DoneH/UsedH` use shares. A course holding part of a split lesson cannot be deleted. Weekly repeats allocate each copy in turn; copies beyond the pool become individual lessons (existing behaviour).
- Compatibility: a device still on an older cached version counts the whole split lesson on `lesson.course` (first course) and ignores the second share until it updates; update all devices.

### 2026-11-08 — v1.26 (cache v88): Courses phase 2 (UI only)
- Profile: with 2+ active courses a compact summary (name, hours, due per course, total available, one Add payment) replaces stacked cards; one course still shows the single card.
- `prompt()` for course payments replaced by an Add payment sheet (`#payDialog`): course picker (only courses with a balance, oldest first, hidden when only one), amount pre-filled with the outstanding, payment date. Payment rows keep the shape `{id,course,date,amount}`.
- Payments tab uses the course name; one Add payment button preselects the oldest course with a balance.
- No accounting/booking change. (Pooled hours across courses was done afterwards in PR #87, v1.27.)

### 2026-11-08 — v1.25 (cache v87): Add course sheet styling
- CSS only: `.course-dialog` used an undefined `--card` variable (transparent background on iPhone). Now solid white card, sticky header/footer, iOS-safe date field (`appearance:none`, 100% width), sheet height fits content. No logic/data change.

### 2026-11-08 — v1.24 (cache v86): Delete course
- A course with no linked lessons can be deleted even if it has payment records; its own payment rows are removed with it (owner decision), after a confirm and an automatic safety copy (`before-course-delete`). Courses with linked lessons still cannot be deleted. Individual lessons and other courses are untouched. Sync deletion uses the existing three-way merge.

## Business rules
- Legacy/quick-booking and blank imported-rate fallback remains €20/hour for compatibility. Calendar → New Record individual lessons require a manually entered per-lesson rate; student profile rates are not auto-applied there.
- Income = lesson value; profit = income minus expenses; expenses are not income.
- Timer target: 55 minutes (the timer still stops at 55 min). Since 2026-11-08 (PR #76) completed hours and income use the scheduled Start–End duration only; timer elapsed minutes and old `actualMin`/`businessHours` values are informational/legacy and give no accounting credit (the 1-hour credit rule that used to be here is no longer true).
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
Lesson/expense log, student CRM, custom courses with pooled hours and per-course payments, legacy package archive (read-only), reports, CSV import/export, JSON backup/restore, safety copies, optional private GitHub cloud sync, calendar, 55-minute timer, Bengali voice announcements (device voice availability dependent), travel dua audio, and separate Full-Time Students historical register.

## Known limitations / verification still needed
1. Real iPhone Safari and Home Screen PWA testing is still required for timer audio, Bengali voice availability, screen wake, update prompt, clipboard/native paste and offline startup.
2. Cloud sync is optional and uses the user's private GitHub repository/token; it is not a managed database or guaranteed real-time service.
3. Cloud sync should be enabled only after a fresh JSON backup and confirmation that the chosen private data repository is private and token scope is limited.
4. Script order is verified in `index.html`: `prayer-times.js`, then `full-time-students.js`, then `app.js`. The Full-Time bridge is therefore defined before the main app initializes and calls `load()` / initial sync.
5. Test upgrade/restore scenarios using: current backup with Full-Time rows, legacy backup without Full-Time rows, empty Full-Time list, and simultaneous edits/deletions on two devices.
6. Never claim iPhone runtime verified solely from successful GitHub Pages deployment.

## Master scope vs current app (owner's handover document, checked 2026-11-06)
The owner's "Master Project Handover" lists the full business scope. It is a requirements list, not a description of the app. Source code on `main` (v1.20 at that time; rows below updated 2026-11-08 for v1.27 where noted) was checked against it; the app is **not** feature-complete and real iPhone testing is still pending (see Known limitations).

| Area | Status in code |
|---|---|
| Students: name, contact, lesson history, completed lessons, payment history | Done |
| Remaining lessons | Done through courses (hours left/available, paid, due; pooled across a student's courses since v1.27) |
| Lesson scheduling, duration, calendar, completed lessons | Done |
| Payments, financial records, business reports, analytics | Done |
| Search | Done (Log and Students) |
| Cloud sync, backup, offline, data export | Done (private GitHub repo sync, JSON/CSV, safety copies, PWA) |
| Cancelled / missed lessons | Partial: lessons can be "Marked not completed" (count in Attendance); no reason or cancellation history |
| Notifications | Partial: timer and voice announcements; Web Push source exists (`push-worker/`, SW push handler) but the backend is NOT deployed/configured (`push-config.js` API URL empty) |
| Multilingual | Partial: English UI with Bangla content and messages; no language switch |
| Driving progress | Partial: hours and attendance only; no skills/progress record |
| Instructor management | Not built |
| Vehicle management | Not built |
| Driving examination tracking | Not built |
| Personal documents and document expiry | Not built (sensitive data: device and private sync only, never the public repo) |
| Secure authentication, access control | Not built (single-user app, no login) |
| Error monitoring | Not built |
| GDPR compliance | Not formally addressed; data stays on the owner's devices and private data repo |

Owner's development rules (same intent as the rules above): never delete working features without permission; no unnecessary redesign; keep the current UI/UX; inspect code before changing it; avoid unnecessary data migrations; protect student and business records; test before completion; stay backward compatible with existing data and backups; keep the app stable and secure; document every significant change here; finish with a GitHub commit/PR. Never assume a listed feature exists: check the source.

Suggested next features (owner to choose): exam tracking and document expiry first, then cancellation history.

## Branch hygiene
- `origin/claude/intelligent-gates-shiyps` is permanently divergent (260 commits behind main, 1 unique commit, open PR #13, measured 2026-11-08); do not push, merge or force-push it.
- Previous feature branches may contain work already merged by PR; inspect diffs before reusing.
- Current main is the source of truth.

## Recent work
- Simplified Log and lesson flows: moved sort/payment totals behind compact disclosures; reduced quick lesson details and collapsed repeat-booking controls; Add Expense now hides Lesson/Note type choices. No accounting, package, payment, or booking calculations changed. Service-worker cache v50.
- Student form cleanup: removed optional Email, Address and Notes inputs from Add/Edit Student; existing stored values are preserved for backward compatibility and are not deleted. Contact details remain Name, Phone and WhatsApp; hourly rate remains editable.
- Reports: detailed charts, health, financial calendar, student payments and comparisons are inside a collapsible "Financial Reports" section (collapsed by default, `#finToggle`/`#finBody`); the hero KPIs, mini stats and insights stay visible. Only the layout changed; no calculation touched.
- Islamic Companion (6th tab, `islamic-content.js` + `islamic.js`): dua library with 5 categories, detail page (Arabic RTL, Bengali pronunciation, Bengali meaning, English, reference, text size, reading mode), favourites, Tasbih counter (separate counts and targets per dhikr). Data in `state.islamic` = {v,fav,tasbih,tz} — included in snapshot/JSON backup, restore (older backups keep this device's Islamic data) and cloud three-way merge. Reading prefs per device in `DB_KEY+"-islamic-prefs"`. One audio element (#duaAudio) is shared with the Overview Travel Dua player. Religious text status: prepared from well-known references, review by owner/scholar still pending; recordings: vehicle dua (travel-dua.mp3), Ayatul Kursi (ayatul-kursi.mp3, 49 s) and the Three Quls (three-quls.mp3, 60 s) — both cut from one owner-supplied video (TikTok @fro6w, source/licence not confirmed). Surah Al-Kahf 18:1–10 card with the owner's file surah-al-kahf-1-10-alafasy.mp3 (127 s, 192 kbps, unchanged; reciter as named by the owner). The other 7 duas use recordings from Hisnul Muslim (hisnmuslim.com/audio/ar/16, 207, 216, 217, 248, 53.mp3) and EveryAyah (Alafasy 017080.mp3), kept unchanged; licence not confirmed. Downloading them needs the session environment `driving-log-pro` (allows hisnmuslim.com, everyayah.com). The Overview player always switches the shared audio back to travel-dua.mp3.
- Reports dashboard (Phase 4, `reports-dashboard.js`): hero KPIs with count-up (Revenue earned, Expenses, Net, Collected, Outstanding), mini stats, factual insights vs the previous period ("so far" for the running period), revenue/expense chart with 6M/12M/All, expense donut (Fuel, Maintenance=Repair, Insurance, Other incl. refunds), 8-week activity, Business health (profit margin, collection ratio, revenue trend, schedule utilisation from working hours — "Insufficient data" when the inputs are missing), monthly financial calendar with day details, CSV/Share/Print and extra PDF section. Definitions are written at the top of `reports-dashboard.js`. The Calendar tab is unchanged.
- Overview (Phase 3): the lesson timer card now sits on Overview under the Next lesson card (same timer logic, same ids; still stops at 55 min with 1 h credit); other tabs show a small "⏱ … left" pill that opens Overview. Below Next Day: Voice announcements (on/off per device in `DB_KEY+"-voice"`, Test voice, voice status) and a Travel Dua player using the local `travel-dua.mp3` (12 s recitation of 43:13–14 supplied by the owner; cached by the service worker, range requests answered from cache for offline playback). Only one audio plays at a time; a voice announcement pauses audio. The pre-timer Travel Dua popup (full dua, remote Hisnul Muslim audio) is unchanged.
- Log (Phase 2): the floating ＋ button is removed; Log's button is "＋ Add expense" (record dialog without the Lesson type). Lessons are created from the Calendar (＋ in Calendar, tapping a day/slot) and from the student profile/quick booking. Log summary: lessons done today, hours, lesson value, collected, outstanding, expenses.
- (Superseded: profile tabs are now Overview, Lessons, Course, Payments, Legacy, Attendance.) Profile cleanup (Phase 1 of the master plan): profile tabs were Overview, Completed, Packages, Attendance. Overview shows only name + WhatsApp, the next 3 upcoming lessons and read-only notes (notes are edited in Edit student). Course payment history + Total paid moved under Packages. Lessons are marked paid with "Mark paid" in Completed. Contact fields are still stored.
- Decision (owner): the timer keeps the current rule — it stops at 55 minutes and credits 1 hour.
- (Superseded by `state.courses`/`coursePayments`; package payments below apply only to the read-only Legacy Archive.) Course payments (branch `claude/course-payments`): packages can hold `payments:[{id,date,amount}]` (partial advance payments; Due = price − paid). Old packages without `payments` keep the old Paid/Unpaid meaning. New package dialog: "Paid now (€)" and optional "Count earlier lessons" — *Hours only* stores `p.prior` (lesson ids; those lessons keep their own money, course rate = price ÷ remaining hours) or *Hours and money* links them with `e.pkg` and clears `e.paid`.
- (Superseded by the Add course sheet in #82/#86.) Student profile: "🎓 Start full course" (shown when no course is running) opens the same package dialog pre-filled (17 h, rate × 17, earlier lessons as hours only). A course card at the top of the profile shows hours done/left, paid/due and ＋ Add payment.
- PR #19: premium responsive Log screen with live KPIs and sorting.
- PR #17: clipboard paste button implementation; later the user requested removing custom Paste buttons, and the related buttons/logic were removed from main.
- Latest data-protection update: Full-Time historical register now participates in JSON backup/restore, cloud sync three-way merge, and Delete All. README updated; footer version v1.20; service-worker cache v36.

## Verification record — 2026-11-05
- Source reviewed on `main`: Full-Time bridge, JSON backup/restore validation, combined safety snapshot, Cloud Sync merge key, Delete All behavior, timer 50/55-minute announcements, service-worker registration and cache asset list.
- `index.html` script order confirmed: `prayer-times.js` → `full-time-students.js` → `app.js`.
- GitHub Pages workflow run #68 for commit `5b8db6f0a6586951fdfa8b8fb094cbaea0df477e`: build, artifact upload and deploy jobs all succeeded.
- This is source review plus Pages deployment verification, not a browser/device end-to-end test. No claim of JavaScript runtime, iPhone audio, offline, or two-device sync verification is made.

## Handover
- (Historical, 2026-11-05.) That audit was prepared on `maintenance/source-audit-2026-11-05`.
- No student data or tokens were accessed or changed during source maintenance.
- Remaining acceptance tests require a browser/device with the app's local data and, for Cloud Sync, the user's separately configured private repository.


## UI update — 2026-11-07
- Removed the Export CSV action from the Driving Log toolbar (other report exports and full backup remain available).
- Removed the Today-only filter; Driving Log now defaults to All records.
- Kept the today KPI summary and all record, payment, expense, and backup data unchanged.
- Bumped the service-worker cache to v51.
- Validation: source-level checks only; browser/iPhone runtime verification remains pending.


## Course lesson selection and payment UI — 2026-11-07
- New lesson records for a student with an active course now default to using prepaid course hours when enough prepaid hours are available.
- The course-hours choice remains optional: users can untick it to create an independent individual lesson.
- When a lesson is linked to course hours, the individual Paid checkbox is hidden and forced off; the lesson is accounted for through the course payment ledger only.
- Editing an existing individual lesson does not silently convert it to a course lesson.
- Service-worker cache bumped to v54. Static source review only; iPhone/browser runtime verification remains pending.


## Payment method selector — 2026-11-07
- Replaced the visible course-hours checkbox with mutually exclusive Individual lesson and Course hours selection cards in the Edit Record lesson form.
- Individual lesson retains the existing Paid/Unpaid checkbox; course-linked lessons hide and clear lesson-level Paid status and continue to use the separate course ledger.
- Existing lesson/course linking, prepaid-hour validation and financial calculations are preserved; the original course checkbox remains as a hidden compatibility control for the existing save logic.
- Service-worker cache bumped to v55. Source-level validation only; GitHub Pages and real iPhone runtime verification remain pending.


## Calendar New Record UX — 2026-11-07
- Started from the current `main` after verifying PR #43 was merged; isolated work on `feature/calendar-new-record-ux-2026-11-07`.
- Refined the New Record dialog for mobile: clearer category chips, horizontally scrollable recent-student and duration choices, improved input sizing/spacing, a compact completion panel, and sticky dialog header/actions with safe-area support.
- Kept the Calendar-selected date flow and existing student search/autocomplete. Student selection no longer silently fills the lesson hourly rate from the student profile.
- New Individual lessons start with a blank hourly-rate field; the instructor enters the rate per lesson. The app validates that a rate is entered before saving an individual lesson. Course-hour lessons continue to use the course's own rate and do not require a separate individual rate.
- Existing saved lesson rates and legacy accounting fallback remain unchanged; no student records, historical entries, or payment calculations are migrated.
- Service-worker cache bumped to v56.
- Validation status: source-level checks pending; GitHub Pages deployment and real iPhone runtime testing not yet performed.


## Premium Edit Record UI — 2026-11-07
- Updated the Calendar record dialog to a cleaner lesson-first mobile layout inspired by the approved visual direction.
- Removed the record-category chip bar from Edit Lesson mode; category controls remain available in the expense-entry flow so Fuel, Expense, Insurance, Maintenance, and Refund types remain selectable.
- Reorganized date, student, lesson time/duration, hourly rate/payment, completion, and comment into clearer sections; comment is now visible without a More options disclosure.
- Added a live duration summary and a sticky bottom action bar for Delete, Cancel, and Save.
- Kept existing form IDs and record save/payment/course calculations to preserve compatibility.
- Bumped service-worker cache to v57.
- Source-level checks performed after commit; live deployment and real-device testing pending.

## Hotfix — closed record dialog was visible (2026-11-07)
- `#recordDialog{display:flex}` (commit 752d094, PR #50) overrode the browser rule that hides a closed dialog, so the whole Edit Record form was drawn over every tab and swallowed taps. Added `dialog:not([open]){display:none!important}`. Rule for the future: never set `display` on a `dialog` element without `:not([open])` handling.

## iOS input zoom (2026-11-07)
- Owner screenshot: the student profile dialog looked zoomed in and cut off on the right on a real iPhone, while Chromium at the same width shows it fitting. Most likely cause (not verifiable without iOS WebKit): focusing a field with font-size < 16px makes iOS Safari zoom the page, and with body overflow hidden it stays zoomed. Touch devices now use 16px form controls and `touch-action:manipulation`. Needs confirmation on a real iPhone.


## Release versioning — 2026-11-07
- Adopt semantic app versioning in the visible footer. (Historical: v1.21 → proposed v1.22 for PR #59; footer v1.22 was on main by commit 6b040dc, v1.23 at #82, v1.27 at #87.)
- Patch increments (x.y.Z) for bug fixes, minor increments (x.Y.0) for backward-compatible features/UI updates, and major increments (X.0.0) only for breaking changes.
- Each app update must update the footer version, increment the service-worker cache name, and record release notes here. A proposed version is not released until its version PR is merged and GitHub Pages deployment succeeds.
- Proposed v1.22: premium Payments dashboard, course progress summary, payment history timeline, and All/Course/Lesson filters. This version metadata update is separate from the already-merged UI PR #59.

## Hotfix — app.js syntax error (2026-11-07)
- Commit ebc6398 (PR #59, student payments dashboard) left one extra `)` at the end of the `pays` array in `renderProfile` (app.js line ~99). A syntax error stops the whole file: no tab or button works, and islamic.js / reports-dashboard.js fail too (`$`/`DB_KEY` undefined). No data is touched in that state. Removed the extra parenthesis. Always run `node --check` on every JS file and load the page in a browser before merging.
- Also in the same commit: the payment progress bar used `style="width:..%"`, which the Content-Security-Policy (`style-src 'self'`) blocks (console error, bar not drawn). It now uses `data-w`, applied by script like every other progress bar. Rule: never write `style="..."` in generated HTML.


## Student Payments tab visual refinement — 2026-11-07
- Created isolated branch `design/payments-tab-premium-refinement-2026-11-07` from current main after PR #61 was confirmed merged.
- Refined the existing Student Profile → Payments presentation: clearer paid/outstanding hierarchy, compact course summary, more legible payment history cards and filters, improved touch targets, and narrow-screen wrapping down to 320px.
- CSS-only change to the Payments tab. No changes to payment calculations, student/course records, event handlers, storage keys, or data schema.
- Bumped service-worker cache from v67 to v68.
- Verification status: source review only. No real browser/Playwright session or real iPhone Safari session was available in this work session; do not treat the visual change as runtime-verified. PR must be tested at 390×844 and 320×568, including all six tabs, payment actions, overflow, closed dialogs, and console errors before merge.


## New Record form simplification — 2026-11-07
- At the owner's request, hid the Repeat every week control and Comment field in the Calendar New Record form for now.
- Kept both controls and their underlying IDs/logic in the markup; existing comment values and record data are not deleted or migrated. Repeat defaults and save behavior remain unchanged.
- Bumped service-worker cache from v68 to v69.
- Validation status: source-level change only; browser/Playwright and real iPhone Safari verification remain pending.


## Hotfix — repeat control hidden class — 2026-11-07
- Corrected the New Record repeat row markup: merged PR #63 accidentally left two class attributes, so the browser could ignore the `hidden` class.
- Consolidated the classes into one `class="lessonfield wide hidden"`; no repeat scheduling logic or saved data changed.
- Bumped service-worker cache to v70.
- Validation: source-level inspection only; browser/iPhone runtime verification remains pending.


## Premium New Record visual refinement — 2026-11-07
- Added a CSS-only visual refinement to the Calendar New Record form: clearer blue Lesson Time panel, green Payment panel, lavender Lesson Completion panel, refined duration chips/summary, payment selector cards, and stronger sticky Save action.
- Preserved existing HTML structure, form IDs, event handlers, validation, payment/course calculations, and data schema. Repeat and Comment remain hidden from the prior approved change.
- Bumped service-worker cache from v70 to v71.
- Verification status: source/CSS review only; no browser/Playwright or real iPhone Safari runtime test has been performed. Check at 390×844 and 320×568 before merge.


## Hide Actual length input — 2026-11-07
- At the owner's request, hid the Actual length (minutes) input row in the New Record form using the existing `hidden` utility class.
- Kept the Lesson completed checkbox visible and preserved the `fActual` input element/ID in the DOM so existing JavaScript behavior and stored data remain compatible; no data migration or calculation changes.
- Bumped service-worker cache from v71 to v72.
- Validation: source-level only; browser/Playwright and real iPhone Safari verification pending.


## Deep-check fix — Actual length remains hidden — 2026-11-07
- Deep review found `syncDoneBox()` removed the `hidden` class whenever Lesson completed was checked, which could reveal Actual length despite the markup change.
- Updated `syncDoneBox()` to keep the input row hidden in every state. Existing `fActual` value initialization and completion-duration calculation remain intact; completed lessons still default to scheduled duration when no actual value is supplied.
- Source-level review only; browser/Playwright and iPhone Safari verification pending.


## Premium New Record UI implementation — 2026-11-07
- Implemented a compact, mobile-first New Record modal presentation with a contained scroll area, compact header, clearer Lesson Time/Payment/Completion cards, compact course-hours row, and persistent bottom actions.
- Permanently hid Repeat every week in `toggleLessonFields()` as well as the markup; hidden repeat selector retains its default value of 1 (No repeat), so repeat scheduling is not triggered.
- Kept Comment and Actual length inputs hidden. `fActual` remains in the DOM for compatibility; completion uses the existing scheduled-duration fallback and existing historical actual duration data remains untouched.
- No payment, course allocation, student, lesson schema, or persistence logic changed.
- Bumped service-worker cache from v72 to v73.
- Validation: source-level review only. Browser/Playwright and real iPhone Safari checks remain pending at 390×844 and 320×568.


## Separate Use course hours option — 2026-11-07
- Per owner's clarification, moved course-hour selection back to a standalone checkbox outside the Payment card.
- The checkbox appears only for lesson records with an eligible active course and remaining prepaid hours; otherwise it remains hidden.
- Payment method tile UI is hidden. Existing checkbox-driven course allocation and paid-status behavior are retained.
- Bumped service-worker cache from v73 to v74.
- Source-level review only; browser/Playwright and real iPhone Safari verification pending.


## Revert PR #69 — restore PR #68 course-hours UI — 2026-11-07
- Owner preferred the PR #68 design. Reverted PR #69's separate standalone Use course hours checkbox presentation.
- Restored the PR #68 behavior: the Payment section contains Individual lesson and Course hours selection tiles; the separate legacy checkbox remains hidden.
- Restored course-selection checks in save and student-contact flows to use `paymentMethodRow`.
- No student/lesson/payment records or accounting calculations were modified.
- Bumped service-worker cache from v74 to v75.
- Source-level checks only; browser/Playwright and real iPhone Safari verification pending.


## Recent work — Calendar student autocomplete (2026-11-07)
- Added live autocomplete to Calendar → New Lesson student name and phone inputs. Suggestions match partial names, phone numbers and WhatsApp numbers; selecting a result fills the saved student name and phone, then refreshes the existing course/payment selection UI.
- Supports keyboard navigation (up/down, Enter, Escape), touch selection and a no-match state. Uses an in-app suggestion list rather than relying on iOS native datalist behavior.
- Existing student records, course allocation, payment/accounting calculations and save logic are unchanged. Service-worker cache bumped to v76.
- Source-level checks only; Playwright/Chromium and real iPhone Safari interaction tests remain required before claiming runtime verification.


## WhatsApp message editor on Driving Log — 2026-11-07
- Added an expandable WhatsApp Message Settings section at the bottom of the Driving Log page.
- Users can edit Lesson Reminder and Payment Reminder templates, preview dynamic values, save on the current device, or reset the editor to defaults.
- Supported placeholders: {{day}} and {{time}} in lesson reminders; {{amount}} in payment reminders. Existing quick WhatsApp actions now use the saved templates.
- Templates use a separate device-local storage key; no student, lesson, payment, backup, or cloud-sync records/schema are changed.
- Bumped service-worker cache from v76 to v77.
- Verification: source-level checks only. Browser/Playwright and real iPhone Safari interaction tests have not been run.


## Hotfix — allow completed individual lessons to switch to prepaid course hours — 2026-11-07
- Root cause: updateCourseField() only looked up an active course when the lesson was not completed, or already had a course, or was unpaid. A completed individual lesson marked Paid therefore resolved no active course, so tapping Course hours immediately reverted to Individual lesson.
- Removed that completed/paid exclusion. When editing a lesson, the app now resolves the student's own linked course or active course regardless of completion/payment state, then applies the existing prepaid-hours availability check.
- If no active course exists for the selected student, Course hours is now visibly disabled with a clear explanation instead of appearing selectable and silently reverting.
- Existing save validation remains authoritative: switching to Course hours still requires enough prepaid/free hours; on save the lesson is linked to the course and marked not individually paid. Existing completion timestamp/duration are preserved.
- No student, course, lesson, payment, or accounting records are bulk-modified. Change applies when the user edits and saves the specific lesson.
- Bumped service-worker cache from v77 to v79.
- Source-level checks only; automated browser and real iPhone Safari tests have not been run.


## Accounting safeguard — preserve individual payment history on course conversion — 2026-11-07
- When a previously paid individual lesson is reassigned to prepaid course hours, preserve its original collected amount and date as a separate historical payment marker on the lesson.
- Student paid totals and Payment History include the retained receipt. It is not added to coursePayments, does not increase prepaid course hours, and is not double-counted as a course payment.
- If the lesson is later changed back from course to individual, restore its Paid state and remove the separate transfer marker.
- No existing records are bulk-migrated; this applies only when a user edits and saves a lesson after the update.
- Source-level checks only; browser/Playwright and real iPhone Safari testing remain outstanding.


## Completed hours independent of timer — 2026-11-08
- Student completed hours, course used hours, remaining hours and lesson income now use the lesson's scheduled Start–End duration only.
- Lesson timer remains an alarm/countdown and its elapsed minutes are informational only; timer completion no longer grants a separate 1-hour accounting credit.
- Existing `actualMin` and legacy `businessHours` values are retained for compatibility/history but are ignored by hour and course accounting.
- Service-worker cache bumped to v80. Source-level verification only; browser/iPhone runtime and Pages deployment still need verification.


## iPhone lock-screen lesson notifications — 2026-11-08
- Added a separate Web Push implementation for the installed iOS Home Screen app: a visible reminder at 50 active timer minutes and a final notification at 55 active timer minutes.
- The browser client subscribes only after a direct user tap, sends a random device ID and PushSubscription to the backend, and syncs schedule/pause/resume/cancel actions.
- The Service Worker displays push payloads immediately and opens the app when a notification is tapped.
- Added `push-worker/` Cloudflare Worker + Durable Object scheduler, VAPID key generation script, deployment instructions, and `push-config.js` placeholder.
- Push backend is NOT deployed/configured yet. `push-config.js` intentionally has an empty API URL. Cloudflare account deployment, VAPID secrets, exact app origin, API URL configuration, and real iPhone lock-screen testing are still required before notifications can work.
- Push requests contain no student name or lesson/payment/course data. The backend stores only a subscription, random device ID, timer session and reminder timestamps.
- App service-worker cache bumped to v81.
- Accounting remains independent of timer elapsed duration; notifications do not alter lesson or course hours.


## Log Settings — Working Hours and Prayer Time (2026-11-08)
- Added a Records / Settings sub-navigation inside the existing Log tab; settings are not a new top-level tab.
- Working Hours remain manually configured (default 08:00–22:00). New lesson bookings outside this window are blocked; edits to existing lessons outside the window require confirmation. Existing records are not automatically changed.
- Prayer Time uses local astronomical calculation for Lisbon/Amadora by default, with Lisbon, Porto and Faro city choices and Muslim World League, ISNA and Umm al-Qura methods. Friday uses the manually configured Jum'a time (default 14:00).
- Default prayer booking protection is enabled with a 15-minute block immediately before each prayer. New bookings overlapping a prayer block are blocked; existing lessons remain stored and are not silently changed.
- Timer behavior and lesson-hour/accounting calculations are untouched. Prayer/work settings remain inside the existing main app state and therefore follow current backup/sync behavior.
- Service-worker cache bumped to v82. Source-level validation only; no browser, iPhone, Pages deployment or astronomical timetable comparison test claimed.


## Student Package Calculation — Phase 1 (2026-11-08)
- Based on the owner's decisions: fixed + custom package model planned; no expiry; partial payment must not restrict purchased-hour usage; multiple packages per student; balances shown separately with a combined total.
- Phase 1 code changes: course entitlement hours now equal purchased hours regardless of payment amount; booking capacity is purchased hours minus all linked scheduled/completed lessons; payment removal changes money due only and does not affect hour eligibility; multiple course records can be created for one student; FIFO selects the oldest course with booking capacity when a lesson is linked automatically; student profile's Course Hours Left is the combined remaining balance across courses.
- Student payment view labels purchased/remaining hours rather than paid/prepaid hours. Legacy archived packages and lessons linked by the old package ID remain read-only/historical; no migration or record mutation performed.
- (Owner later decided there are no templates — every course is custom — and all of the following except the audit log were implemented in #82/#86/#87.) Not yet included in Phase 1: package templates/custom package editor, explicit per-lesson package selector when multiple packages exist, manual hour adjustments/audit log. These are later implementation steps.
- Verification: app.js parses with new Function; source review only. No browser/Playwright, real iPhone, backup/restore, cloud-sync, Pages deployment, or live data test performed.
- Service-worker cache bumped to v83.


## Custom Course Entry Sheet — 2026-11-08
- Replaced the fixed 17-hour / €340 prompt flow with a custom Add Course sheet: optional name, 1–100 hours in 0.5-hour steps, price from €0, start date, optional first payment, and live hourly-rate preview.
- Active course UI now says “Course” and displays an optional custom course name. Existing course records remain valid; missing names use the hours-based fallback label.
- “Use course hours” now defaults on only when the selected course has enough available hours for the lesson duration; an explicit user choice is preserved while editing the form.
- No existing student, course, lesson or payment records were migrated or rewritten. New course name is an optional additive field; existing hours/price/date/payment structure remains unchanged.
- Service-worker cache bumped to v84; footer version updated to v1.23.
- Verification when written: source-level checks pending. Later (2026-11-08) Claude tested #82 in Chromium (390×844, 320×568, synthetic data): sheet, validation, rate preview, first payment, additive `name`; found and fixed the default-tick bug (see Current verified state). Real iPhone not tested.


## Overview cleanup — Voice and lock-screen controls moved to Log Settings (2026-11-08)
- Removed the Voice Announcements and Lock-screen Notifications cards from the Overview dashboard and moved them into the existing Log → Settings panel.
- Preserved the existing control IDs (voiceOn, voiceStatus, voiceTest, pushStatus, pushEnable) so the existing speech preference, Bengali voice test, Web Push permission/status flow and timer reminder behavior remain connected to the same handlers.
- Overview retains Today / Next Day lesson lists, active lesson timer, Travel Dua and existing navigation. No earnings, revenue, collected, expenses or profit metrics were added to Overview; financial reporting remains in Reports.
- No localStorage keys, record schemas, student/course/lesson/payment data, timer rules or notification backend behavior changed.
- Proposed release footer v1.28; service-worker cache v90.
- Verification for this PR: source-level checks only. Browser/Playwright at 390×844 and 320×568, real iPhone Safari/Home Screen, notification permission flow and live push delivery must be checked separately; push backend remains not deployed/configured.


## Log Settings overflow menu — proposed PR (2026-11-08)
- Replaces the full-width Records / Settings sub-tab bar with a compact vertical three-dot menu at the top-right of the Driving Log heading.
- The menu opens a small Settings dropdown. Selecting it hides Records and shows the existing Settings panel; a Back to Records control returns to the records view.
- Preserves the existing Settings cards and controls, including Voice Announcements, Lock-screen Notifications, Working Hours, Prayer Time and WhatsApp Message Settings. Existing setting IDs and their storage/notification/voice behavior remain unchanged.
- Menu closes after selection, on outside click and on Escape; the trigger exposes aria-haspopup, aria-expanded and aria-controls.
- No student, lesson, course, payment, expense, accounting, backup, sync or notification-backend data/logic changes.
- Proposed footer v1.29 and service-worker cache v91.
- Source-level checks: all seven repository JavaScript files parse. Playwright screenshots at 390×844 and 320×568, real iPhone testing and Pages deployment were not available in this workflow and are not claimed.


## Log Settings direct-open control — merged PR #92 (2026-11-08)
- The top-right vertical three-dot control on the Driving Log heading opens the existing Settings panel immediately on the first tap.
- There is no dropdown, intermediate Settings menu, or separate Settings tab. Settings remains inside the Log main tab; Back to Records returns to records.
- Existing Voice Announcements, Lock-screen Notifications, Working Hours, Prayer Time and WhatsApp Message Settings remain in place. Existing IDs, storage keys, handlers and behavior are preserved.
- No student, lesson, course, payment, expense, accounting, backup, sync or notification-backend data/logic changes.
- Footer is v1.30; service-worker cache is v92.
- PR #92 merged as `d1d9377`. Source-level checks are recorded above. Browser/Playwright screenshots at 390×844 and 320×568, real iPhone testing and Pages deployment were not verified in this handover.

### 2026-11-08 — Overview dashboard refresh (proposed v1.33 / cache v95)
- Owner-approved UI task: refresh the existing Overview screen using its real current content and interactions, not the earlier generic mockup.
- Added a clear Overview heading and an Add lesson shortcut wired to the existing `newRecord()` flow. Restyled the existing next-lesson card, Today/Next Day lesson rows, prayer line, Travel Dua card, app header and bottom navigation for a cleaner blue/white mobile-first presentation.
- No earnings, revenue, collected cash, expenses, profit or financial charts were added to Overview. Financial reporting remains on Reports.
- Voice Announcements and Lock-screen Notifications remain in Log → Settings as established by PR #90; they were deliberately NOT moved back to Overview despite appearing in the initial concept image.
- No lesson, timer, payment, course, allocation, student, storage or sync logic/data schema changed. Existing timer remains its floating compact timer; lesson rows and Travel Dua keep their existing IDs and handlers.
- Claude (at the owner's request) enlarged the Travel Dua "Open in Islamic tab" link to a 44px tap area (CSS only).
- Footer version proposed as v1.33; service-worker cache proposed as v95 (renumbered from v1.31/v93 after PR #95 merged as v1.32/v94). Main `e97cc72` was merged into this branch on 2026-11-08 at the owner's explicit direction; conflicts were only in `sw.js`, `index.html` footer and `styles.css` (both appended CSS blocks kept). The PR #95 prayer-guard code is unchanged.
- Browser screenshots at 390×844 and 320×568, all-tab interaction checks, real iPhone testing and deployment have not yet been verified. Do not claim completion until actual checks are performed.


### 2026-11-08 — v1.34 (cache v96): New Record smart booking UX
- Recent-student chips now show the six most recently completed lessons only; explicitly not-completed lessons are excluded. Ordering uses `completedAt` when available, otherwise the scheduled lesson end. Selecting a chip keeps the existing student/contact resolution path.
- Student autocomplete keeps prefix matches first, then ranks other matches by most recent completed lesson. Existing name/phone matching and selection behavior remain intact.
- Added Today and Tomorrow date shortcuts to the New Record date panel. They update the date field and re-run the existing prayer-time guard.
- Existing duplicate-lesson validation, prayer-time hard block, payment/course logic and data model were preserved. No stored data, accounting rules, backup format or sync semantics changed.
- Narrow mobile form controls retain 16px text to avoid iOS Safari focus zoom. No broader layout/scroll architecture changes.
- Source changes only. Browser screenshots, Chromium interaction tests, real iPhone tests and GitHub Pages deployment are not verified by this entry.


## New Record scroll stability — PR #97 merged update (2026-11-08)
- The New Record dialog shell is constrained to the visible viewport and does not scroll. The form is a flex column: its field grid is the only vertical scroll surface; the heading, validation message and Save/Cancel/Delete action row remain outside that scroller.
- Removed the nested-scroll arrangement in which the dialog/form could both scroll. Horizontal overflow is clipped in the modal; vertical overscroll is contained in the field grid. The page behind the native modal remains overflow-locked while it is open.
- Existing field markup, IDs, event handlers, prayer-time guard, duplicate protection, student selection, course/payment rules and stored data are unchanged.
- Footer version proposed v1.35; service-worker cache proposed v97. This supersedes the v1.34/cache v96 proposal in the earlier PR #97 entry.
- Static checks on the updated branch: V8 syntax parse passed for all eight JavaScript files (`app.js`, `reports-dashboard.js`, `islamic-content.js`, `islamic.js`, `full-time-students.js`, `prayer-times.js`, `push-config.js`, `sw.js`); 307 HTML IDs with 0 duplicates; all seven local script references resolve; CSS braces balance; cache v97 and footer v1.35 verified. These are static checks, not rendered-browser verification.


## Merged Legacy Archive deletion fix — PR #98 (2026-11-08)
- Branch: `fix/legacy-archive-delete-payment-status-2026-11-08`, based on main `b3caa4e`.
- `deleteLegacyArchive()` now calls `recomputeAlloc()` immediately before conversion, then builds a per-package paid-hour budget from money received divided by the existing package rate (capped at billable package hours).
- Completed package lessons are processed in the same chronological order as FIFO allocation. Each lesson consumes its allocated hours from each package budget even if it contains extra hours or is only partly funded; only a fully funded completed lesson with no extra hours is automatically marked Paid. Upcoming/uncovered/partly funded lessons are not auto-paid. Existing explicit Paid states are preserved.
- The existing two confirmations, safety-copy gate, archive deletion marker, and save/cloud deletion semantics are unchanged. No student records, package records, lesson records, storage keys, schema, backup format or sync rules are migrated or bulk-edited by this code change; the normal user-initiated deletion still performs its existing conversion.
- Merged release footer v1.36 / service-worker cache v98; GitHub Pages workflow run #149 / #42529356204 succeeded after merge.
- Checks run on the branch: V8 syntax parse for all eight JS files passed; six targeted helper scenarios passed (upcoming, fully funded, insufficient funds, extra-hour budget consumption, multi-package partial coverage, preservation of existing Paid status); an integration harness verified completed covered lessons become Paid while an upcoming lesson and an extra-hour lesson remain unpaid. No live student data used.
- Not run: browser/Playwright, iPhone Safari/Home Screen, two-device sync or live-data test. Pages workflow success is not proof of real-device behavior.


### 2026-11-08 — v1.37 proposal (cache v99), Draft PR #99
- Main base: `e6b03e2c2c1478a36c64f6e6b39be097d63b5f37` (v1.36/cache v98); Pages workflow #149 succeeded.
- Draft PR: https://github.com/hawnannahian/driving-log-pro/pull/99.
- `app.js`: weekly Repeat selector is visible for new Lesson records only; it remains hidden for edits and non-Lesson records. Existing repeat booking/course allocation path is reused; no allocation helper or accounting rule changed.
- `sw.js`: add `push-config.js` to `FILES`, bump cache to v99. `index.html`: footer v1.37.
- Tests: all 8 JS files parse; 307 HTML IDs, 0 duplicates; all 7 script references resolve; CSS braces balanced; visibility checks pass; synthetic repeat allocation used the oldest course first and stopped when the pool was exhausted; synthetic two-device merge preserved pooled `courseAlloc`, courses, course payments and Full-Time rows.
- Not run: rendered browser/Playwright, 390×844 / 320×568 screenshots, real iPhone, live two-device sync, push delivery, Cloudflare deployment. No live student data or credentials accessed.
- Not merged or deployed.

### 2026-11-08 — ChatGPT handover refresh after PR #99 merge
- Verified `main` at `0cd6ad143590a0450d61244facbadb8ed51a71a1`; PR #99 merged at this commit. Footer v1.37 and Service Worker cache `nahians-schedule-cache-v99` confirmed from source.
- GitHub Pages workflow run #150 / #42530331667 completed successfully for `main` commit `0cd6ad1`.
- PR #99 release: existing weekly Repeat selector shown only for new Lesson records (hidden for edits and non-Lesson records); `push-config.js` added to Service Worker precache. No accounting/course allocation/schema/sync logic changed.
- Checks recorded in merged PR: all 8 JS syntax parses; 307 HTML IDs with 0 duplicates; 7 local script references resolve; CSS braces balanced; Repeat visibility checks; synthetic pooled-repeat allocation check; synthetic two-device merge check.
- Not run: rendered browser/Playwright screenshots at 390×844 / 320×568, real iPhone Safari/Home Screen test, live two-device cloud sync, push delivery or Cloudflare deployment. Pages success is not device verification.
- Push remains inactive: `push-config.js` API URL is empty and Cloudflare Worker is not deployed/configured. Precache alone does not enable Web Push.
- Open PRs #73 and #13 remain untouched; inspect their base/overlap before any future merge. Previously mis-marked Paid historical lessons from the Legacy Archive are not automatically repaired.
- This documentation refresh changes no app code, data, cache version or footer.


## Multiple Booking v1.38 — implementation in progress (2026-11-08)
- Owner approved a separate Multiple Booking mode for new Lesson records. Single Booking remains the default; its existing submit path is preserved.
- Work branch: `feat/multiple-booking-atomic-batch-v1-38`, based on main `7108022d17710eff74a8b80fe695cdcd9b403291`. This entry describes proposed source only; it is not merged or deployed.
- One student per batch; add/remove an arbitrary number of individual session cards; each session has its own date, start/end and Individual Payment or Course Hours choice. Individual rows have their own Paid checkbox; hourly rate is shared across individual sessions in the batch.
- Atomicity: build against a JSON-cloned staged state; validate every row (date/time/duration, student overlap, instructor overlap, working hours, prayer blocks, duplicate rows and FIFO pooled Course Hours); write once only after all rows pass; restore original in-memory state on preflight or storage failure; render/schedule sync only after successful persistence.
- Each successful session is a normal Lesson record. No batch record, storage-key change, schema change, accounting-helper change, backup/restore change or sync merge change is intended. Existing course allocation helpers are reused without edits.
- Draft PR #100: https://github.com/hawnannahahian/driving-log-pro/pull/100. Proposed release: footer v1.38 / Service Worker cache v100. Not released until owner approval, merge and Pages workflow success.
- Focused synthetic Node harness: 9/9 scenarios passed (2/3/4 sessions, mixed payment, all-or-nothing late failure, insufficient hours, student/instructor overlap, duplicates, invalid date/prayer/working hours, previous-day overnight overlap, pooled FIFO course allocation, storage rollback). Full syntax parse passed for all 7 script references and the test file; 315 HTML IDs with no duplicates; CSS braces balanced 2076/2076.
- GitHub Actions workflow is present, but no workflow run was returned/confirmed yet. Not run: rendered browser/Playwright at 390×844 or 320×568, real iPhone Safari/Home Screen, live two-device sync, or deployment.

### 2026-11-08 — Multiple Booking review fixes (Claude, at the owner's explicit request; PR #100 branch, v1.38 / cache v100 unchanged — unreleased)
- Claude's browser test of PR #100 found four issues; fixed on the PR #100 branch (ChatGPT's atomic save logic and protected course helpers were NOT changed):
  1. The global "Paid" checkbox stayed visible but ignored in Multiple mode: `#recordDialog .checklabel{display:flex!important}` overrode `.hidden`. Added `#recordDialog .checklabel.hidden{display:none!important}` (also makes the existing hide-when-Course-hours behaviour effective).
  2. The Single/Multiple switch sat below the student field and jumped when the suggestion list closed (first finger tap missed). It is now the first control in the form. `newRecord()`/`openRecord()` now call `resetRecordScroll()` because `.formgrid` reopened at its old scroll position and could hide the switch.
  3. "Mark as paid" is one inline 44px row; Remove buttons >= 40px; Start/End time fields no longer lose the picker icon space at <= 360px (no clipped "AM/PM").
  4. A prayer overlap in Multiple mode now reports "Session N: Your lesson overlaps with <prayer> (a–b). Suggested alternative: x–y." using the PR #95 helpers (`prayerMessage`, `suggestLessonTimes`).
- Tests: `tests/multiple-booking.test.js` harness got `suggestLessonTimes`/`prayerMessage` mocks and a new test (10/10 pass; still a mocked harness). Real-browser checks outside the repo (Chromium 390×844 and 320×568, synthetic data): 90 checks incl. all-or-nothing failures, FIFO course allocation, one sync per batch, first-tap mode switch, Paid hidden, layout; regression suites for prayer guard, course sheet, delete course, Add payment, pooled hours, Overview all pass. Not tested: real iPhone, two-device sync, deployment.

### 2026-11-09 — v1.39 (cache v101): iOS date/time input layout hardening (CSS only)
- Owner's real-iPhone screenshot of the New record form (main v1.38): the Date field extended past the right edge of its card and the Start/End time boxes overlapped. Cause (hypothesis, not reproducible in Chromium): iOS Safari renders native date/time inputs with an intrinsic width and ignores `width`/`min-width`, so they overflow their grid cell.
- Fix (CSS only, `styles.css`): inside any `dialog` (and the Working-hours settings cards) `input[type=date|time]` now use `appearance:none; display:block; box-sizing:border-box; width:100%; min-width:0; max-width:100%; min-height:44px; overflow:hidden`; `::-webkit-date-and-time-value{min-width:0;text-align:inherit}`; the grid-cell labels get `min-width:0`. At <= 360px dialog time inputs get tighter padding and no picker-icon space so "AM/PM" is not clipped (this was also visible in the quick-booking dialog).
- Not changed: logic, data, IDs, validation, prayer guard, Multiple Booking.
- Verification: Chromium only (390×844, 375×667, 320×568, synthetic data): before/after widths identical on Chromium (no regression), Date inside the dialog, Start/End not overlapping, quick-booking and Multiple Booking date/time fields inside their cards, fonts >= 16px, no console errors; regression suites (prayer guard, course sheet, delete course, Add payment, pooled hours, Overview, Multiple Booking, 10 node tests) pass. **NOT verified on a real iPhone — the owner must confirm the overflow/overlap is gone.** WebKit is not installed in the test environment.



## 2026-11-09 — Premium Compact Student Profile v1.41 (Draft PR)
- Base `main`: `675c2f42001a92860b74dc4aaa28036ee9ffc2fd`; PR #105 is already merged (Payment Method choice chips, Design C).
- Owner-approved Student Details redesign: compact header and KPI cards; full-width primary Add lesson; secondary actions in a two-column grid; Course content moved into Course tab; only four profile tabs remain: Lessons, Course, Payments, Attendance.
- Upcoming bookings and student notes are shown in Lessons. Student name, phone/WhatsApp and join date remain in the profile header.
- Legacy Archive remains read-only and accessible as a collapsed section inside Course; no historical package records or payment data are removed.
- UI-only: no changes to storage schema, database, API, sync, booking, course allocation, payment calculations, Prayer Time calculations/integration, or student records.
- Footer version v1.41; Service Worker cache v103.
- Draft PR #107: https://github.com/hawnannahian/driving-log-pro/pull/107. Workflow #42545286024 passed (all JS syntax checks and Multiple Booking tests); static checks: 312 HTML IDs / 0 duplicates, 7 local script references resolve, CSS braces balanced. Rendered 390×844 / 320×568 screenshots and real iPhone Safari remain untested. Not deployed; owner approval is required before merge/deployment.


### 2026-11-09 — v1.42 proposal (branch `ui/boxed-section-design-v1-42`)
- Phase 1: consistent, separate card styling for the existing New Record form sections (Date, Student, Lesson time, Payment/rate, Lesson completion).
- Visual direction: preserve individual boxed sections; white surfaces, subtle blue-grey borders, blue accent, compact spacing, 44px+ touch controls and 16px+ text inputs remain governed by existing styles.
- Presentation-only CSS. No markup, JavaScript, data schema, accounting, booking, course allocation, sync, Prayer Time or integration changes.
- Footer v1.42 / Service Worker cache v104 on the feature branch only. Not merged, not deployed; browser/iPhone checks pending.


## 2026-11-09 — v1.48 Car brand header (Draft PR #117)
- Owner requested the app header to match the supplied reference: white outline car icon, `Driving Log Pro` title, `Driving Lesson Management` subtitle, deep navy background.
- Rebased cleanly by creating `ui/car-brand-header-v1-48-rebased` from latest main `e02a96d877654ac683ed2aa6e208eccd82f0e5c7`; this replaces the earlier divergent PR #115 branch.
- App changes: accessible inline outline car SVG in `index.html`; responsive navy header styling in `styles.css`; footer v1.48 and Service Worker cache v110 in `sw.js`.
- No JavaScript, data, booking, accounting, course, payment, sync, prayer-time or notification logic changed. No student data added.
- Static checks: header markup/title/subtitle present; footer v1.48; cache v110; no duplicate HTML IDs; CSS braces balanced.
- Browser screenshots/visual review at 390×844 and 320×568, real iPhone Safari, and Pages deployment remain unverified. Draft only; no merge/deploy without owner approval.


## 2026-11-09 — Settings mobile polish v1.49 (Draft PR)
- Based on latest main `3525e960845be19eade58c6e7cd8fabecf267fb4`, which includes PR #118 and the v1.48 navy car-brand header.
- Owner asked to apply the UI/UX review to the Settings screen: improve Settings heading alignment and hierarchy, keep individual white cards visually consistent, make the WhatsApp disclosure easier to identify/focus, and prevent the fixed bottom navigation from covering the lower settings content on mobile.
- Presentation-only CSS plus footer/cache versioning: `styles.css`, footer `v1.49` in `index.html`, Service Worker cache `nahians-schedule-cache-v111` in `sw.js`.
- Existing HTML structure, IDs, event handlers, WhatsApp templates/save/reset behavior, voice announcements, lock-screen notification behavior, working hours, prayer-time settings, data schema, accounting, booking, sync and student records are unchanged.
- Static source review only. Automated tests, rendered 390×844 / 320×568 screenshots, real iPhone Safari and GitHub Pages deployment are not yet verified. Draft PR; no merge/deploy without explicit owner approval.
