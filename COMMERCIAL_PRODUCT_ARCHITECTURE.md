# Commercial Product Architecture — Readiness & Migration Plan

**Status:** Architecture proposal for owner review; documentation only  
**Date:** 2026-11-10  
**Product:** Driving Log Pro  
**Current source reviewed:** `main` at `ced0b7e93c808bccd676ee69142911855e97ea58`  
**Related specifications:** `LEARNING_PLAN_SPEC.md`, `INDIVIDUAL_RECEIVABLE_DESIGN.md`

## 1. Purpose

Driving Log Pro is being prepared as a product that can be sold to independent driving schools/instructors. The product must not be designed around one owner's existing student list or business history.

Every customer must receive an independent business workspace that starts empty, has its own settings and financial records, and cannot see or overwrite another customer's information. At the same time, the current owner's live workspace must remain intact throughout development and any eventual migration.

This document describes the current architecture, the commercial gaps, a recommended target architecture, a safe path for the existing app, and the product decisions that must be made before implementation.

**Scope:** planning only. This document does not authorize changes to authentication, data shape, storage, backup/restore, cloud sync, accounting, payments, bookings, licensing or deployment.

## 2. What the current app actually does

The current source is a single-user PWA, not yet a multi-customer account product:

- `app.js` starts with one global state object containing `entries` and `students`; the main localStorage key is the fixed `driving-log-pro-v1`.
- Records are saved in the browser's localStorage. There is no sign-in, account switcher, business/workspace identity or first-run business setup.
- The app currently formats money as EUR using `pt-PT` locale and has a default lesson rate of 20. These are code defaults, not per-business settings.
- Cloud Sync is configured by entering a private GitHub repository and a GitHub token. The token/configuration is saved in browser localStorage; the app then reads/writes `driving-log.json` and dated backups in that repository.
- Manual JSON backup/restore exists. The Full-Time Students register is stored separately from the main app state.
- The PWA shell is statically hosted. The current source has no application backend that authenticates customers or enforces access to each school's data.

### What this means for a new customer today

A first-time customer on a browser profile with no existing app data will see an empty app. That is not the same as a secure customer account: the app cannot identify who is signed in, separate two schools sharing the same browser profile, or guarantee that one customer's cloud data is isolated from another's.

The current GitHub-token sync setup is an owner-operated mechanism, not an appropriate customer-facing commercial cloud service. Customers should not be asked to create GitHub repositories or paste personal access tokens into the app.

## 3. Commercial product principles

These principles apply regardless of the final sales model:

1. **One school = one isolated workspace.** Students, lessons, bookings, courses, payments, receivables, expenses, settings, backups and notifications belong to exactly one workspace.
2. **Empty by default.** A new workspace starts with zero students, lessons, payments, courses and expenses. Demo data, if ever offered, must be clearly labelled and removable without touching real records.
3. **Isolation is enforced at the data boundary.** Hiding another school's records in the UI is not enough. Any shared backend must authorize every read, write, export, restore and notification against the authenticated workspace on the server.
4. **No shared owner data.** The owner's existing records are not sample data, seed data or a template for customers.
5. **Business settings are configurable.** Currency, locale, timezone, school name/contact details and default lesson rate must not be hard-coded globally.
6. **History is durable.** Editing a student or lesson must not silently rewrite financial history. The Learning Plan and Individual Receivable rules remain part of the shared product specification.
7. **Offline use remains a product requirement.** The PWA should continue to support lesson-day workflows when temporarily offline, with explicit sync status and conflict handling when connectivity returns.
8. **Customer data is private.** Never put real customer data, credentials, cloud tokens or backups in the public code repository, test fixtures, issue descriptions or screenshots.

## 4. Two possible sales models

A major architecture choice remains open. Both models can give each school an empty start, but they require different infrastructure.

### Option A — Hosted SaaS, one shared app with separate customer accounts

Each school signs in to the same Driving Log Pro website and owns a separate workspace.

**Required architecture**
- Authentication service for customer accounts.
- A workspace/tenant record for each driving school.
- Server-side authorization that verifies workspace membership on every request.
- A managed database and API. Every business-owned record is scoped to a workspace; cross-workspace access is denied by default.
- Cloud backups and restore are workspace-scoped.
- Subscription/licence entitlement is checked by the service, not by a client-side flag alone.
- The PWA keeps a local offline cache/queue, but the authenticated backend becomes the source of truth for cross-device sync.

**Advantages:** one app to maintain, customers can use multiple devices, updates are centrally delivered, and subscriptions/licences can be managed consistently.

**Costs/risks:** requires a secure backend, authentication, database operations, tenant-isolation testing, monitoring, privacy/security processes and ongoing hosting costs. This is a larger architectural step than adding a first-run form.

### Option B — Separate installation or deployment for each school

Each customer receives a separately hosted/installed copy and a separate data store.

**Required architecture**
- A unique deployment/origin and isolated storage/sync destination for each customer.
- A safe provisioning and update process.
- A customer-friendly backup/sync mechanism; do not expose the developer's GitHub credentials.
- A licence/activation mechanism if the product is sold under a licence.

**Advantages:** simpler data boundary than a shared multi-tenant database; each customer can be isolated operationally.

**Costs/risks:** every customer copy needs provisioning, updates, support and backup monitoring. A separate browser localStorage area alone is not a complete multi-device backup/sync solution.

### Recommendation

If the intention is to sell access to one common hosted website to many driving schools, **Option A (hosted SaaS with one isolated workspace per school)** is the recommended long-term architecture.

If the intention is to sell a standalone copy that each school operates independently, Option B may be more suitable. Do not start building account, database or licensing code until this sales model is confirmed.

## 5. Recommended SaaS target model (if Option A is selected)

### 5.1 Identity and workspace

Keep the concepts separate:

- **User account:** the person who signs in.
- **Workspace:** the driving school/business that owns the data.
- **Membership:** the user's permission to access a workspace.
- **Subscription/licence:** the commercial entitlement for that workspace.

For the first commercial release, the simplest permission model can be one owner account per workspace. Staff accounts, instructor-specific permissions and multi-branch management can be added later; they should not be silently assumed.

### 5.2 Workspace-scoped data

The following must all be owned by a workspace, not by a global browser state:

- Business profile and settings.
- Students and contact details.
- Calendar bookings and lesson records.
- Individual lesson payment history and expenses.
- Courses, course payments, pooled-hour allocations and Individual Receivables.
- Legacy Archive and Full-Time register data, where supported.
- Reports, exports, backups, restore points and notification subscriptions.

A record must never be loaded, changed, merged, restored or deleted solely because its student name matches another record. Stable IDs and workspace ownership are required.

### 5.3 Business setup and first run

After successful sign-up, guide the customer through a short setup:

1. Create the driving-school workspace and choose its business name.
2. Choose country/region, display language, currency and timezone.
3. Set the default individual lesson rate and basic working preferences.
4. Review the business profile and finish setup.

Then open the normal app with empty Calendar, Students, Lessons, Courses, Payments and Reports.

Settings should be editable later. Changing the display currency must not silently convert historical monetary values or alter lesson/course rates. Any actual currency conversion would require a separate, explicit and auditable workflow.

### 5.4 Currency, locale and time

Replace global formatting assumptions with workspace settings:
- Currency code (for example EUR), locale and timezone are stored per workspace.
- All money display uses the workspace's currency and locale.
- Existing records keep their numeric values and meaning during migration; no automatic exchange-rate conversion is performed.
- Date/time display follows the workspace locale/timezone, while stored timestamps/dates use a documented consistent format.
- Default lesson rate is a workspace setting; historical lesson/course rates remain attached to their original records.

The exact list of supported currencies/locales and the policy for changing currency after the first transaction need owner approval before implementation.

### 5.5 Cloud sync and offline behaviour

For SaaS, replace the customer-facing GitHub repository/token workflow with an authenticated application API:

- The server determines the workspace from the authenticated session; the client must not be trusted to choose an arbitrary workspace ID.
- Every API operation checks workspace membership and ownership.
- Device-local data is a cache/offline queue, not an independent authority that can overwrite another workspace.
- Sync uses explicit revisions/versions and conflict handling. Financial transactions must be append-only or otherwise protected against silent overwrites.
- A device signed out of one workspace must not expose that workspace's cached records to the next user of the same browser/device.
- Backups, restore, import/export and notification delivery must remain within the same workspace boundary.

Do not reuse the current browser-held GitHub token design as the SaaS security model.

## 6. Protecting the current owner's app and records

The existing app is a live single-workspace installation. Commercial development must not reset it or treat its records as disposable.

Recommended compatibility path:

1. **Keep current production storage intact.** Do not rename or clear `driving-log-pro-v1`, the separate Full-Time store, cloud configuration or existing backups as part of a UI/onboarding task.
2. **Build against synthetic workspaces.** Tests use fictional schools, students and payments only.
3. **Define a legacy workspace mapping.** If the app moves to account/workspace storage, the current owner's existing dataset must be mapped to one dedicated workspace through a one-time, reviewed migration—not copied into every new customer workspace.
4. **Back up before migration.** Require a fresh export and verify that it can be read. Keep a rollback path and do not delete the original local data until the migrated workspace is verified.
5. **Migrate only with explicit owner approval.** Show a dry-run summary (counts only, no personal data in logs), validate record totals and financial invariants, and require confirmation before applying.
6. **Preserve old backup support.** Define how old JSON backups are imported into the correct workspace. A restore must never replace another workspace's data.
7. **Keep old sync isolated during transition.** Do not point the current GitHub sync at a shared customer repository or merge data from different workspaces. Retire or replace the old sync only through a separately approved rollout plan.
8. **Test old/new versions.** If any period of mixed app versions is possible, prove that an older build cannot erase or misattribute newer workspace data. Otherwise block incompatible clients from syncing.

No migration is needed simply to review or approve this architecture.

## 7. Security, privacy and operational readiness

Before accepting real customer records commercially, the product needs:
- Secure authentication, session expiry and account recovery.
- Server-side workspace authorization and automated cross-tenant isolation tests.
- Safe handling of personal data and credentials; no secrets in frontend code or localStorage.
- Encrypted transport and an appropriately secured database and backup store.
- Backup retention, restore testing, deletion/export procedures and incident recovery.
- Audit history for sensitive financial and administrative actions.
- Clear privacy notice, terms, support contact and data-retention policy; obtain appropriate legal/privacy review for the markets served.
- A documented process for customer offboarding and account deletion that does not accidentally delete another workspace's records.
- Monitoring for sync failures, storage limits, failed backups and service availability.

A licence screen or payment button alone does not make the app commercially ready.

## 8. Suggested delivery phases

### Phase 0 — Product decision and architecture (this document)
Confirm the sales model and the initial customer/permission model. No app data changes.

### Phase 1 — Workspace and settings foundation
Design the workspace identity, business settings, first-run flow and compatibility contract. Review the impact on every existing data area before coding.

### Phase 2 — Secure customer infrastructure
If SaaS is selected, implement authentication, workspace authorization, API, database, backup and sync boundaries before enabling customer accounts with real data.

### Phase 3 — Existing-owner compatibility
Build a separate, opt-in migration path for the current owner's records, with backup, dry run, validation and rollback.

### Phase 4 — Commercial release readiness
Complete isolation/security tests, responsive and real-device QA, privacy/terms, licensing, support and operational monitoring. Verify deployment separately.

## 9. Acceptance criteria before the first customer release

- A new customer creates a workspace and sees a completely empty business.
- Two synthetic workspaces cannot read, edit, export, restore or delete each other's data, even by changing client requests.
- Switching accounts on one device cannot reveal the previous account's cached student or payment records.
- Each workspace has its own currency, locale, timezone and default rate.
- Backups and restores are scoped to the intended workspace and old backup formats have a safe import path.
- Offline edits sync without losing or duplicating bookings, payments, course allocations or receivable transactions.
- The existing owner's workspace remains unchanged unless a separate migration is explicitly approved and verified.
- No real customer data or credentials appear in the source repository or automated test output.

## 10. Owner decisions required before implementation

1. **Sales model (blocking):** will customers sign in to one shared Driving Log Pro website with separate school workspaces (SaaS), or will each customer receive a separate standalone installation/deployment?
2. **Initial users:** should the first release support only one owner login per school, or do schools need multiple staff/instructor logins from day one?
3. **Currency policy:** should each school choose its own currency at setup, and should changing currency be blocked after financial records exist unless a formal conversion is performed?
4. **Existing cloud sync:** if SaaS is selected, approve replacing the customer-facing GitHub token workflow with a managed authenticated backend before customer data is stored there.

The first decision determines the architecture. The others can be finalized in the relevant design phase.

## 11. Current status and explicit non-changes

- Current source reviewed: `main` at `ced0b7e93c808bccd676ee69142911855e97ea58`, footer v1.70, Service Worker cache v132.
- PR #147 (Individual Receivable Ledger design) is merged into main at this commit. It remains a proposal for implementation; its deletion/reversal, student-history and old/new sync safeguards are not yet owner-confirmed.
- Learning Plan requirements remain as recorded in `LEARNING_PLAN_SPEC.md`.
- This document is a commercial architecture proposal only.
- No application code, localStorage, live student data, cloud repository, backup, restore, accounting, payment, booking, authentication, licensing or deployment behaviour was changed.
- GitHub Pages deployment was not verified during this review.
