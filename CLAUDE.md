# Notes for Claude — Driving Log Pro

This is the mandatory working agreement for Claude Code and any other coding agent working in this repository. Read it fully before inspecting or changing code.

## 1. Product and repository

- Product: Driving Log Pro, a single-user driving-instructor business manager and installable PWA.
- Repository: `hawnannahian/driving-log-pro`.
- Production source of truth: the current `main` branch.
- Stack: vanilla JavaScript, HTML and CSS. There is no build step.
- Hosting: GitHub Pages from the repository root on `main`.
- Main app tabs: Overview, Calendar, Log, Students, Reports and Islamic.
- Main files include `index.html`, `styles.css`, `app.js`, `reports-dashboard.js`, `islamic-content.js`, `islamic.js`, `prayer-times.js`, `full-time-students.js`, `sw.js` and `manifest.webmanifest`.
- Read `PROJECT_STATE.md` as the project handover and history. It may contain older notes; verify the live source on `main` before relying on a historical statement.

## 2. Mandatory start-of-task procedure

Before every task:

1. Read this entire `CLAUDE.md`.
2. Fetch/checkout the latest `main`; inspect its current commit SHA. Do not assume a previously seen SHA is current.
3. Read the complete `PROJECT_STATE.md`.
4. Inspect relevant HTML, CSS, JavaScript, service-worker code and existing tests before proposing a change.
5. Check open pull requests and branch history for overlapping work. Do not reuse an old or divergent branch.
6. Report conflicts, unclear requirements, data risks or missing test capabilities before making a risky change.

Never treat a stale local checkout, old branch, PR branch or generated summary as more authoritative than current `main`.

## 3. Git and review workflow — strict

- Never commit, push or merge directly to `main`.
- For each independent task, create a fresh branch from the latest `main`.
- Keep each PR focused on one task. Avoid unrelated cleanup, formatting sweeps or opportunistic refactors.
- Do not force-push, rewrite shared history, delete branches, close PRs or merge PRs unless the owner explicitly asks.
- Open a PR targeting `main`; include a clear summary, changed files, data/schema impact, tests run, tests not run and deployment status.
- Prefer a draft PR until the change is ready for review.
- Do not mark work complete merely because a commit or PR exists.
- Do not modify another agent's branch or PR unless the owner explicitly directs you to do so.
- If `main` changes while you work, stop and assess whether your branch needs a safe update. Never blindly rebase or overwrite work.

## 3a. Merge authorization — standing owner instruction (2026-11-09)

The owner said: "Don't wait for me for the merge command, do it yourself." Therefore Claude may merge **its own** pull requests without waiting for a separate "Merge #N" message, only when ALL of these hold:

- The PR is Claude's own, targets `main`, is mergeable ("clean"), and the GitHub checks for its head commit are green.
- All applicable tests from §9 passed and the PR description follows §13 honestly (tests not run, e.g. real iPhone, are stated).
- The change does NOT touch the high-risk areas that need explicit approval anyway: accounting definitions, booking/course allocation rules, payment behaviour, data shape/migration, backup/restore, cloud sync, authentication, push/Cloudflare (§4, §5, §10). For those, ask first.
- Never force-push, never delete branches, never merge another agent's PR, never merge a PR the owner has asked to wait on.
- After merging, update `AGENT_SYNC.md` / `PROJECT_STATE.md` (§7b) and tell the owner in short Bangla (PR number, commit, what to check on the phone). "Deployed" is only claimed after the Pages workflow succeeded.

## 4. Owner approval and scope

The owner decides product behavior and approves production changes.

- Do only the requested task. Do not start new features or redesign adjacent screens without approval.
- Preserve the existing UI/UX unless the task explicitly requests a visual change.
- Ask before changing accounting definitions, booking rules, course/package allocation, payment behavior, data migration, backup/restore, cloud sync, authentication, push notifications or historical records.
- Merge authorization: follow §3a. Claude may merge its own PR only when every §3a condition is met; never merge another agent's PR. Do not treat merge authorization as permission to claim deployment. Verify the GitHub Pages workflow separately.
- Never claim work is deployed, live, browser-tested or iPhone-tested unless that exact verification was performed.
- Report source changes, automated test results, GitHub Pages deployment and real-device tests as separate statuses.

## 5. Data protection — highest priority

The app contains sensitive student and business information. Treat all stored data as production data.

Known storage boundaries:

- Main app localStorage key: `driving-log-pro-v1`.
- Separate historical Full-Time register key: `driving-log-pro-full-time-v1`.
- Cloud sync stores `driving-log.json` in the owner's own private GitHub data repository. The access token is held in browser localStorage.
- Legacy archive/package records and old lesson links are historical financial records.

Rules:

- Never add student names, phone numbers, lesson records, payment records, exports, backups, tokens, credentials, private URLs or other personal/business data to this public code repository, commits, issues, PR descriptions, screenshots, fixtures or logs.
- Use synthetic, clearly fictional data in tests. Never copy production records into test fixtures.
- Do not read, request, export, print, upload or modify the owner's live student data unless the owner explicitly authorizes the exact operation.
- Never log tokens, full backups, student contact details or payment details.
- Do not change storage keys, data shapes, merge rules, backup formats or restore semantics without explicit approval and a documented migration/compatibility plan.
- Do not delete, normalize, recalculate, relink or bulk-migrate existing records as part of a UI task.
- Preserve unknown fields and backward compatibility when reading/writing existing records.
- Keep the Full-Time historical register isolated from normal lesson/course accounting. Do not merge students by name; its stable identity is `legacy_student_id`.
- Keep the legacy archive read-only. Do not silently rewrite historical package records or lessons linked to legacy package IDs.
- Never assume a missing field means zero, unpaid, deleted or safe to overwrite.

## 6. Accounting and booking invariants

These are critical business rules. Verify current implementation and tests before touching related code.

- Revenue, collected cash, outstanding balance, expenses and prepaid course balances are different concepts. Never conflate them.
- Expenses are not income.
- Individual lesson payment status and course payment ledger are distinct.
- A lesson linked to a course must not be counted again as an individually paid lesson.
- Preserve a historical individual receipt when a paid individual lesson is converted to course hours; do not double-count it as a course payment.
- Booking capacity, purchased entitlement, money received and completed lesson value are separate quantities.
- Scheduled, completed and not-completed lessons can affect course capacity differently; inspect current source and `PROJECT_STATE.md` before changing calculations.
- Lesson completion hours currently use scheduled Start–End duration. Timer elapsed minutes are informational and do not grant accounting credit.
- The lesson timer is not an accounting engine.
- Do not alter FIFO allocation, package/course selection, capacity rules, payment removal constraints, due calculations or report definitions without an explicit task and targeted regression tests.
- Never infer a business rule from a label or UI. Trace the calculation and persistence path.

## 7. UI and accessibility rules

- Mobile-first. Check at least 390×844 and 320×568 CSS viewport sizes.
- Preserve existing IDs, selectors, event handlers, keyboard/touch interactions and accessibility semantics unless the task explicitly requires a change.
- Avoid horizontal overflow, clipped dialogs, inaccessible controls and tiny touch targets.
- Native `<dialog>` elements must remain hidden when closed. Do not apply unconditional `display:flex` or `display:block` to dialogs; if needed, scope display rules to `dialog[open]` and retain a closed-dialog safeguard.
- Do not put inline `style="..."` attributes in generated markup. The app Content Security Policy blocks inline styles. Use classes/data attributes and existing script-driven styling patterns.
- iOS Safari form controls need a font size of at least 16px to avoid focus zoom.
- Do not remove or rename hidden compatibility inputs/IDs just because their controls are not currently visible.
- Preserve existing content and behavior during CSS-only work.

## 7a. Professional UI/UX review — standing owner instruction (2026-11-08)

The owner should not have to ask for polish. For every UI change, work as a senior (5+ years) UI/UX designer and developer:

- Look at the real rendered result (screenshot at 390×844 and 320×568), not only computed numbers. Ask: is this the best, most professional way to do it?
- Check: solid backgrounds (no undefined CSS variables), consistent spacing/typography, aligned fields, clear hierarchy, comfortable touch targets, no clipped or overflowing controls (especially iOS date/time inputs), sticky actions reachable, clear empty/error states, plain wording.
- Fix any unprofessional detail found in the touched screen in the same PR (within scope), and say honestly what could not be verified (e.g. real iPhone).
- After every change, run the regression tests again and report the result.

## 7b. Keep GitHub up to date for the other agent — standing owner instruction (2026-11-08)

Whenever Claude finishes work, merges something or changes anything, it must record it on GitHub so ChatGPT (and the owner) can read the current state without being told in chat:

- Add or update a dated entry in the `AGENT_SYNC.md` Message log (what changed, PR link, tests run / not run, what the other agent must know) and refresh "Latest verified project state" (main SHA, footer version, cache version, deployment evidence).
- Update `PROJECT_STATE.md` for every app release (CLAUDE.md §8) and correct statements that became untrue.
- Comment on any PR that was updated or tested with the facts (commit, conflicts resolved, test results, what is unverified).
- Documentation-only updates still go through a branch and a Draft PR (never directly to `main`); open it as part of the same piece of work and tell the owner the PR link. Never claim deployment, iPhone testing or cloud sync was verified without evidence.

## 8. Service worker and release versioning

- Every change to an app asset served/cached by the service worker must increment the cache name in `sw.js` to the next unused version.
- Keep the `FILES` cache list accurate when adding/removing app assets.
- Do not bump the cache for documentation-only changes that do not affect app assets.
- For an app release, update the visible footer version and add a dated entry to `PROJECT_STATE.md` following the repository's semantic versioning policy.
- A version number in source is not proof of release. A release is not deployed until the relevant GitHub Pages workflow succeeds.

## 9. Testing requirements

Run applicable checks and report exact outcomes:

1. Syntax-check every JavaScript file, e.g. `node --check`.
2. Check HTML for duplicate IDs and broken/missing script references.
3. Check service-worker cache version and asset list after app asset changes.
4. Run existing automated tests and add focused regression tests for changed behavior.
5. For UI changes, use a real browser/Playwright when available. Check all six tabs, the changed flow, dialogs open/closed, touch/keyboard interactions, console errors and horizontal overflow at 390×844 and 320×568.
6. For accounting/data changes, test synthetic cases for paid/unpaid, partial payments, multiple packages/courses, scheduled/completed/not-completed lessons, edits, deletion, backup/restore and sync merge as relevant.
7. Never use live student data as a test fixture.
8. If a test tool/device is unavailable, say it was not run. Do not simulate a pass or imply a browser/device check from static source inspection.

## 10. Cloud sync, backup and push boundaries

These are high-risk areas and require explicit owner approval before modification:

- Private GitHub data repository and browser-held token.
- Snapshot, three-way merge, conflict resolution and deletion semantics.
- JSON/CSV export, restore and automatic safety copies.
- Service-worker push handling and the Cloudflare Worker/Durable Object scheduler.
- VAPID keys, push subscriptions, device IDs, notification timing and backend configuration.

Do not deploy Cloudflare infrastructure, create/rotate secrets, change token scopes or configure a production endpoint without explicit approval. Push backend source may exist without being deployed/configured; verify before describing it as live.

## 11. Current known project notes — verify before relying

- **Latest verified source state (2026-11-10):** `main` is merge commit `e946f7323bb75e2e56d4646a02efbed604dea0f2` (PR #133); footer is `v1.63` and Service Worker cache is `nahians-schedule-cache-v125`. These values describe source on `main`, not proof that GitHub Pages has deployed it.
- **PR #133 — Smart lesson time + manual End override:** merged 2026-11-10. New single lessons default to 60 minutes; editing derives duration from saved Start/End; changing Start updates End by the current duration; manually editing End recalculates duration and the next Start change preserves it. Duration chips and live summary synchronize. A duration crossing midnight clears End and shows inline guidance rather than silently clamping to 23:59. Existing save-time 12-hour, prayer, overlap, working-hours, course and payment checks remain. Storage stays `HH:mm`; no schema or multi-session booking change was intended.
- **Checks for PR #133:** GitHub Actions workflow #56 passed. The workflow screenshot showed a Node.js 20 deprecation warning and an `ubuntu-latest` migration notice; these were annotations, not test failures. Dedicated Smart Lesson Time edge-case tests and real iPhone Safari QA were still pending at handoff. Verify current workflow and deployment state before making claims.
- **Current open PRs at handoff:** #73 (Calendar and WhatsApp controls in Driving Log Settings) and #13 (WhatsApp number parsing). Inspect their current status, base and diff before working; do not assume they are current or modify them without owner direction.
- **Web Push:** implementation exists in source, but the backend was previously documented as not deployed/configured and `push-config.js` had an empty API URL. Verify current configuration without exposing secrets before relying on push.
- Prayer times come from the mosque's Mawaqit timetable in `mawaqit-times.js` (a manual snapshot; regenerate with `node tools/update-mawaqit-times.mjs`); the previous local astronomical calculation (Lisbon/Amadora defaults) is only the fallback when a date is missing. Prayer overlap warns and never blocks a booking.
- Real iPhone Safari/Home Screen PWA testing remains an acceptance requirement for relevant mobile, audio, offline and notification work. Never report a real-device check unless it was actually performed.
- Read `PROJECT_STATE.md` for the release history and `AGENT_SYNC.md` for the latest cross-agent handover. Always verify both against current `main` and GitHub before acting.

## 12. Claude model and advisor workflow

- Always reply to the owner in Bangla.
- Keep owner-facing progress and completion messages short, precise and candid.
- Use Sonnet for implementation work.
- For major architecture decisions, difficult bugs or important changes, consult the configured Opus advisor tool if it is available in the environment. If it is unavailable, state that it was not consulted; do not pretend.
- Keep existing features working. Test before reporting completion.
- Priorities: quality, stability, security and performance.

## 13. Required PR handoff format

Every PR description or final task report must state:

- **Goal:** exact requested outcome.
- **Implementation:** what changed and what deliberately did not change.
- **Files:** every changed file.
- **Data impact:** whether storage, records, schema, backup, restore or sync behavior changed.
- **Service worker/release:** cache version and footer version impact, or why none was needed.
- **Tests passed:** commands and actual results.
- **Tests not run:** browser/device/deployment checks unavailable or not performed.
- **Risks/follow-up:** known limitations and owner decisions needed.
- **Deployment:** not deployed unless successful deployment is verified.

## 14. Communication

- Communicate with the owner in Bangla.
- Be concise, precise and candid. Distinguish facts, assumptions and recommendations.
- Before substantial or risky work, summarize the narrow plan.
- If requirements are ambiguous or a change could affect money, bookings or existing records, ask one focused question instead of guessing.
- Do not claim success until the relevant checks have actually passed.
- **Owner preference (2026-11-13):** send only ONE message per task, when it is finished: what changed, what was tested, what the owner should check on the phone. Do not send progress or waiting messages ("PR opened, waiting for CI", "CI is running", "will merge when green"). Do not reply to automatic background-task or monitor notifications at all (no "old event, nothing to do" messages); wait silently. Merge own PRs without asking (§3a) and report the result once.
