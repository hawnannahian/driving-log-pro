# PROJECT_STATE — Driving Log Pro

শেষ যাচাই: 2026-11-05 · ভিত্তি: `main` (Full-Time data protection update)

## কাজের নিয়ম
- মালিককে উত্তর দিন বাংলায় এবং খুব সংক্ষেপে: কাজ শেষ হলে শুধু "হয়ে গেছে" + লিংক; না হলে অল্প কথায় কারণ।
- কাজ শুরুর আগে বর্তমান `main` এবং এই ফাইল পড়ুন।
- Claude/ChatGPT—কেউই পুরোনো divergent branch-এ push বা merge করবেন না। প্রতিটি নতুন কাজ `main` থেকে নতুন branch-এ শুরু করুন।
- প্রতিটি app asset পরিবর্তনের পর `sw.js` cache version বাড়ান।
- Public repository-তে কখনো student data, CSV/JSON backup, token বা private data commit করবেন না।
- Source update, Pages deployment success এবং real iPhone runtime test—তিনটি আলাদা verification status হিসেবে রিপোর্ট করুন।

## Architecture
- Vanilla JavaScript PWA; build step নেই; GitHub Pages: `main`, root.
- Main files: `index.html`, `styles.css`, `app.js`, `reports-dashboard.js` (Reports dashboard, loaded after app.js), `islamic-content.js` (dua/tasbih text only) + `islamic.js` (Islamic tab), `prayer-times.js`, `full-time-students.js`, `sw.js`, `manifest.webmanifest`.
- Tabs: Overview, Calendar, Log, Students, Reports, Islamic.
- Main data localStorage key: `driving-log-pro-v1` (`entries`, `students`, `courses`, `coursePayments`, `legacy`, `islamic`, prayer/work settings; `packages` only as an input that is archived on load).
- Full-Time historical register key: `driving-log-pro-full-time-v1`; records keyed by `legacy_student_id`, isolated from normal lesson accounting.
- Main app exposes a narrow `window.DrivingLogFullTime` bridge (getAll/replace/clear) so full-time data can participate in backup/sync without mixing into lesson accounting.
- Cloud sync stores `driving-log.json` in the user's own private GitHub data repository; token remains in that browser's localStorage.
- Current service-worker cache: `nahians-schedule-cache-v67`.
- App footer version: `v1.21`. CSS comments such as v1.26 may refer to feature revision, not app release.

## Fresh Course system + Legacy Archive (branch `feature/fresh-course-management`)
- **Legacy Archive (read-only):** old prepaid packages are moved once into `state.legacy.packages` (original objects verbatim + `archive:{at,v,lessonIds}`) by `migrateLegacy()` on load, restore and cloud merge. Idempotent: an archived id is never copied again or overwritten. A recoverable copy is kept first in `driving-log-pro-v1-before-legacy` (Reports → Safety copies); if it cannot be saved nothing is moved and `pkgs()` still reads leftover `state.packages`, so figures never change. `pkgs()` = archive + leftovers; the old engine (`recomputeAlloc`, `income`, `studentStats` legacy parts) keeps reading it, so historical revenue/hours/payments are identical (verified against `main` with a synthetic seed). Lessons keep `e.pkg` (history). Archived records are never edited; only the student label follows renames/merges.
- **Courses (new):** `state.courses=[{id,student,date,hours:17,price:340,createdAt,v}]`, payments are separate rows `state.coursePayments=[{id,course,date,amount}]` (counted once per id). Lessons link explicitly with `e.course` (never `e.pkg`). Used/remaining/prepaid/free hours are derived on every render from linked lessons (done = actual hours, booked = scheduled). Rate = price/hours = 20 €/h. A lesson can only be linked if (linked hours except itself + its hours) <= min(17, paid/20); payments cannot exceed the price; a payment cannot be removed if that would leave linked lessons unpaid; only an empty course can be deleted. Course lessons: income = hours × course rate, never "unpaid", `e.paid` ignored. One open course per student.
- **Money rules:** Revenue = value of completed lessons (course lessons at the course rate); Collected = paid individual lessons + course payments (by payment date) + historical package payments; Outstanding = unpaid completed individual lessons + legacy package dues + course price − paid; Course prepaid balance = course paid − value of completed course hours. Legacy remaining hours/balances are no longer shown anywhere active.
- **Sync/backup:** snapshot adds `legacy`, `courses`, `coursePayments` and keeps `packages` (= archive, for older devices). `mergeAll`: missing keys from an older remote mean "unchanged" (never wipe), payments merge as separate rows, archive merges by union. Backup restore: old backups (top-level `packages`) are archived without duplicates; a backup without `courses` replaces courses with none (safety copy is kept first); the archive is always unioned, never dropped.
- **Delete Legacy Archive** (Reports → Backup & restore, shown only while an archive exists): two confirmations + a safety copy (`before-legacy-delete`); removes `state.legacy`/`packages`, sets `state.legacyDeletedAt` (a deletion beats copies on other devices/cloud in `mergeAll`/`fromSnapshot`/`useBackup`); lessons that used old packages become normal lessons marked Paid (unless their extra hours were unpaid). Restoring a backup that has no deletion marker brings the archive back.
- **Known decisions to confirm:** (1) upcoming lessons that were already linked to an old package stay linked (they will use that package's remaining hours when completed); (2) legacy amounts still *due* (e.g. an unpaid old package) stay in Outstanding but cannot be paid because the archive is read-only; (3) the old "count earlier lessons in the course" feature is gone (a new course never takes old hours).
- Also fixed: `render()` threw on every call on `main` because `#logTodayDate` was removed from the HTML but app.js still set it (now guarded).

### 2026-11-08 — v1.27 (cache v89): Pooled course hours (owner-approved)
- One lesson can use hours from more than one of the student's courses, counted as one total (oldest course first). Still ONE lesson record.
- Data: optional additive field `courseAlloc:[{c:courseId,h:hours}]` on a lesson (same idea as the legacy `alloc`). `lesson.course` stays the first course, so lessons without `courseAlloc` behave exactly as before. Shares are scaled to the lesson's current length. It is written only when a new/edited lesson needs more hours than the oldest course has free; unchanged-hours edits keep the existing allocation. No migration; no existing lesson is rewritten.
- Money stays per course: a split lesson's value = Σ share × that course's own hourly rate; payments and `courseDue` are untouched.
- Functions: `allocParts`, `courseShareH`, `planCourseAlloc`, `pooledFreeH`, `applyAlloc`; `courseLessons/DoneH/UsedH` use shares. A course holding part of a split lesson cannot be deleted. Weekly repeats allocate each copy in turn; copies beyond the pool become individual lessons (existing behaviour).
- Compatibility: a device still on an older cached version counts the whole split lesson on `lesson.course` (first course) and ignores the second share until it updates; update all devices.

### 2026-11-08 — v1.25 (cache v87): Add course sheet styling
- CSS only: `.course-dialog` used an undefined `--card` variable (transparent background on iPhone). Now solid white card, sticky header/footer, iOS-safe date field (`appearance:none`, 100% width), sheet height fits content. No logic/data change.

### 2026-11-08 — v1.24 (cache v86): Delete course
- A course with no linked lessons can be deleted even if it has payment records; its own payment rows are removed with it (owner decision), after a confirm and an automatic safety copy (`before-course-delete`). Courses with linked lessons still cannot be deleted. Individual lessons and other courses are untouched. Sync deletion uses the existing three-way merge.

## Business rules
- Legacy/quick-booking and blank imported-rate fallback remains €20/hour for compatibility. Calendar → New Record individual lessons require a manually entered per-lesson rate; student profile rates are not auto-applied there.
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
4. Script order is verified in `index.html`: `prayer-times.js`, then `full-time-students.js`, then `app.js`. The Full-Time bridge is therefore defined before the main app initializes and calls `load()` / initial sync.
5. Test upgrade/restore scenarios using: current backup with Full-Time rows, legacy backup without Full-Time rows, empty Full-Time list, and simultaneous edits/deletions on two devices.
6. Never claim iPhone runtime verified solely from successful GitHub Pages deployment.

## Master scope vs current app (owner's handover document, checked 2026-11-06)
The owner's "Master Project Handover" lists the full business scope. It is a requirements list, not a description of the app. Source code on `main` (v1.20) was checked against it; the app is **not** feature-complete and real iPhone testing is still pending (see Known limitations).

| Area | Status in code |
|---|---|
| Students: name, contact, lesson history, completed lessons, payment history | Done |
| Remaining lessons | Done through packages/courses (hours left, paid, due) |
| Lesson scheduling, duration, calendar, completed lessons | Done |
| Payments, financial records, business reports, analytics | Done |
| Search | Done (Log and Students) |
| Cloud sync, backup, offline, data export | Done (private GitHub repo sync, JSON/CSV, safety copies, PWA) |
| Cancelled / missed lessons | Partial: lessons can be "Marked not completed" (count in Attendance); no reason or cancellation history |
| Notifications | Partial: timer and voice announcements only; no push notifications |
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
- `claude/intelligent-gates-shiyps` is permanently divergent (32 commits behind main, one unique commit); do not push, merge or force-push it.
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
- Profile cleanup (Phase 1 of the master plan): profile tabs are Overview, Completed, Packages, Attendance. Overview shows only name + WhatsApp, the next 3 upcoming lessons and read-only notes (notes are edited in Edit student). Course payment history + Total paid moved under Packages. Lessons are marked paid with "Mark paid" in Completed. Contact fields are still stored.
- Decision (owner): the timer keeps the current rule — it stops at 55 minutes and credits 1 hour.
- Course payments (branch `claude/course-payments`): packages can hold `payments:[{id,date,amount}]` (partial advance payments; Due = price − paid). Old packages without `payments` keep the old Paid/Unpaid meaning. New package dialog: "Paid now (€)" and optional "Count earlier lessons" — *Hours only* stores `p.prior` (lesson ids; those lessons keep their own money, course rate = price ÷ remaining hours) or *Hours and money* links them with `e.pkg` and clears `e.paid`.
- Student profile: "🎓 Start full course" (shown when no course is running) opens the same package dialog pre-filled (17 h, rate × 17, earlier lessons as hours only). A course card at the top of the profile shows hours done/left, paid/due and ＋ Add payment.
- PR #19: premium responsive Log screen with live KPIs and sorting.
- PR #17: clipboard paste button implementation; later the user requested removing custom Paste buttons, and the related buttons/logic were removed from main.
- Latest data-protection update: Full-Time historical register now participates in JSON backup/restore, cloud sync three-way merge, and Delete All. README updated; footer version v1.20; service-worker cache v36.

## Verification record — 2026-11-05
- Source reviewed on `main`: Full-Time bridge, JSON backup/restore validation, combined safety snapshot, Cloud Sync merge key, Delete All behavior, timer 50/55-minute announcements, service-worker registration and cache asset list.
- `index.html` script order confirmed: `prayer-times.js` → `full-time-students.js` → `app.js`.
- GitHub Pages workflow run #68 for commit `5b8db6f0a6586951fdfa8b8fb094cbaea0df477e`: build, artifact upload and deploy jobs all succeeded.
- This is source review plus Pages deployment verification, not a browser/device end-to-end test. No claim of JavaScript runtime, iPhone audio, offline, or two-device sync verification is made.

## Handover
- This audit is being prepared on `maintenance/source-audit-2026-11-05`; merge only after reviewing the resulting pull request.
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
- Adopt semantic app versioning in the visible footer. Current release before this change: v1.21; proposed release: v1.22 for the premium Student Payments dashboard update (PR #59).
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
- Not yet included in Phase 1: package templates/custom package editor, explicit per-lesson package selector when multiple packages exist, manual hour adjustments/audit log. These are later implementation steps.
- Verification: app.js parses with new Function; source review only. No browser/Playwright, real iPhone, backup/restore, cloud-sync, Pages deployment, or live data test performed.
- Service-worker cache bumped to v83.


## Custom Course Entry Sheet — 2026-11-08
- Replaced the fixed 17-hour / €340 prompt flow with a custom Add Course sheet: optional name, 1–100 hours in 0.5-hour steps, price from €0, start date, optional first payment, and live hourly-rate preview.
- Active course UI now says “Course” and displays an optional custom course name. Existing course records remain valid; missing names use the hours-based fallback label.
- “Use course hours” now defaults on only when the selected course has enough available hours for the lesson duration; an explicit user choice is preserved while editing the form.
- No existing student, course, lesson or payment records were migrated or rewritten. New course name is an optional additive field; existing hours/price/date/payment structure remains unchanged.
- Service-worker cache bumped to v84; footer version updated to v1.23.
- Verification: source-level checks pending; browser/device and GitHub Pages deployment are not claimed.
