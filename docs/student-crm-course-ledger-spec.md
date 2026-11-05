# Driving Log Pro — Student CRM & Course Ledger Specification

**Status:** Implementation specification  
**Repository:** hawnannahian/driving-log-pro  
**Scope:** Students tab, course classification, prepaid/advance balances, student ledger, filters, and legacy spreadsheet import.

## 1. Goals
Upgrade the existing Students area into a reliable Student CRM and Course Ledger without replacing the current lightweight JavaScript/PWA architecture unnecessarily.

- Separate Full Course, Advance Payment, and Individual Lesson students.
- Show course progress and financial position clearly.
- Keep lesson completion separate from payment receipt.
- Maintain an auditable transaction history.
- Calculate hours and balances from source records, not manually maintained totals.
- Preserve existing student and lesson data.
- Keep the current persistence/sync approach until a separate database migration is approved.

## 2. Students navigation
Add four filters inside the existing Students section:
1. All Students
2. Full Course
3. Advance Payment
4. Individual Lessons

All Students must include every student, including those with fewer than three completed lessons. Search and sorting must work across all categories.

Use an explicit courseType value: full_course, advance, or individual. Never infer the type from name, hours, or payment amount alone. Ask the operator to select/confirm it during creation or import. Reclassification must preserve historical transactions.

## 3. Student cards
Show name, phone/WhatsApp, course type, active package and purchased hours, completed hours, remaining package hours, package price, paid amount, outstanding amount or available credit, last lesson date, and a clear status.

Use a progress bar for package completion. Keep package hours and advance credit as separate concepts. Card actions: Profile, Call, WhatsApp.

## 4. Student profile
Sections: Overview, Upcoming Lessons, Completed Lessons, Course Packages, Payment History, Attendance, Notes.

Overview should show contact details, course type, enrolment date, completed lessons, cumulative completed driving hours, total payments received, package balance, advance credit, and outstanding amount.

All totals must be derived from underlying lesson, package, and payment records. Avoid independently editable totals that can drift out of sync.

## 5. Course package model
A package is a purchased allocation of driving time with a price. Suggested record fields:

```js
{
  id: "stable-unique-id",
  studentId: "student-id",
  name: "Full Course — 17 Hours",
  totalMinutes: 1020,
  priceCents: 34000,
  purchasedAt: "YYYY-MM-DD",
  status: "active", // active | exhausted | cancelled | refunded
  notes: "",
  createdAt: "ISO timestamp",
  updatedAt: "ISO timestamp"
}
```

Store duration as integer minutes and money as integer cents (or the app's established safe monetary representation). Format as EUR only in the UI.

Calculate allocated minutes, remaining minutes, effective hourly rate, consumed value, and remaining value. Example: 17 hours / €340 = €20 per hour; a 90-minute lesson consumes 1.5 hours / €30.

Support multiple packages per student. Default allocation is FIFO: oldest active package first. Never deduct below zero. If a lesson exceeds remaining package hours, allocate only the available minutes and record the excess as non-package lesson time. Editing, deleting, or reversing a completed lesson must reverse/recalculate allocations safely.

Do not silently alter package price or total hours after purchase. Use an auditable adjustment with a reason.

## 6. Advance payment / credit ledger
Advance payment is money received before the corresponding lessons are delivered. It is not the same as a full course package.

Suggested transaction fields:

```js
{
  id: "stable-unique-id",
  studentId: "student-id",
  type: "advance_received", // advance_received | credit_used | refund | adjustment
  amountCents: 10000,
  date: "YYYY-MM-DD",
  method: "cash", // cash | bank_transfer | card | other | unknown
  reference: "",
  notes: "",
  createdAt: "ISO timestamp"
}
```

Credit balance = advance received + positive adjustments − credit used − refunds. Example: €100 received − €40 used = €60 credit remaining.

Only deduct credit when a lesson is completed and the charging rule is known. Never deduct on booking, timer start, or incomplete/cancelled lesson. A payment must not be counted both as package payment and advance credit; explicitly split a payment if necessary.

## 7. Separate lesson completion from payment
Keep these concepts distinct: lesson completed, payment received, package allocation, and advance credit. An unpaid completed lesson still counts toward completed lesson count and cumulative driving hours. Show an outstanding amount only when a charge/amount due has actually been recorded.

Individual Lesson students pay per lesson unless another arrangement is explicitly recorded. Never assume every completed lesson is paid.

## 8. Lesson integration and calculations
Use actual completed duration in integer minutes: 60 minutes = 1 hour, 90 minutes = 1.5 hours, 120 minutes = 2 hours.

Cumulative completed hours = sum of actual minutes for completed lessons / 60. Scheduled, cancelled, and incomplete lessons do not count.

On completion: require a stable lesson ID; prevent duplicate completion; calculate actual duration; allocate to the applicable package/credit arrangement; update derived profile values; and preserve payment status separately.

Use one validated state update with rollback-on-error and safe backup behavior if localStorage cannot provide database transactions. Editing, deleting, or reversing a completed lesson must recalculate affected totals and allocations.

## 9. Payment history UI
Show date, description, credit/debit direction, amount, payment method, reference/notes, and related lesson/package. Filters: All, Payments Received, Credit Used, Refunds, Adjustments.

Do not silently edit historical transactions. Prefer a reversal/correction transaction with a reason.

## 10. Smart filters and alerts
Filters: Active Course, Course Completed, Advance Credit Available, Payment Due, Package Almost Finished, Package Exhausted, No Recent Lessons.

Suggested alerts: package remaining time <= 3 hours; advance credit low/exhausted; outstanding amount; course completed; no lesson for a configurable period. Alerts must be dismissible and must not duplicate on every render.

## 11. Legacy spreadsheet import
The supplied sheet has Name, Hours Done, Payment columns. Treat it as a legacy import source, not a verified financial ledger.

Import rules:
- Ignore fully blank rows.
- Normalize whitespace but preserve original display names.
- Flag possible duplicate names; never auto-merge on name alone.
- Import Hours Done as a legacy baseline/adjustment, not as fabricated dated lesson records.
- Preserve the original Payment cell text in a legacyPaymentNote field until its meaning is confirmed.
- Do not infer whether a number means paid, package price, outstanding balance, or amount due.
- Require operator review of course type and payment meaning before converting notes into transactions.
- Show a preview with row count, warnings, duplicates, and skipped rows.
- Keep a backup and provide rollback for the import batch.

If historical lesson dates/durations are unavailable, do not invent them. Label imported hours as legacy hours, distinct from hours calculated from recorded completed lessons.

## 12. Data safety, compatibility, privacy
- Inspect current app.js state shape, DB_KEY, backup/restore, merge logic, and GitHub Cloud Sync before persistence changes.
- Add versioned, idempotent migrations with a backup before migration.
- Preserve existing records and unknown fields.
- Test old backups and current sync merge behavior.
- Never commit real student personal/payment data to this public repository; use synthetic test data only.
- Do not claim server database or guaranteed cross-device sync while the current architecture does not provide it.

## 13. UI requirements
Preserve Navy Blue + Royal Blue + White identity. Match current typography, spacing, card radius, buttons, and mobile navigation. Make filters mobile-friendly. Use EUR consistently. Show readable decimal hours while storing integer minutes. Include empty, validation, and error states. Keep detailed ledger entries inside the profile to avoid crowded cards.

## 14. Acceptance tests
### Classification
- New students can be assigned all three course types.
- All Students includes every student.
- Category counts and search remain accurate.
- Reclassification does not erase historical records.

### Packages and hours
- 17 hours / €340 gives €20/hour.
- 60-minute lesson leaves 16 hours.
- 120-minute lesson leaves 14 hours.
- 90-minute lesson leaves 12.5 hours.
- Multiple packages allocate FIFO.
- Overrun never makes package balance negative.
- Incomplete/cancelled lessons consume no package time.

### Credit and payment
- €100 advance minus €40 used leaves €60.
- No payment is double-counted.
- Unpaid completed lessons count toward hours.
- Refunds/corrections preserve history.

### Integrity and import
- Duplicate completion cannot double-count hours/deductions.
- Editing/deleting/reversing lessons recalculates values.
- Backup/restore preserves new fields.
- Cloud merge does not duplicate transactions.
- Migration preserves existing data.
- Blank import rows are ignored; duplicate names are flagged.
- Ambiguous payment values remain notes until reviewed.
- Legacy hours are not converted into invented dated lessons.
- Import preview and rollback work.

### Regression
- Test mobile and desktop.
- Calendar, timer, log, reports, PDF export, and navigation continue to work.
- No real student data is committed to the public repository.

## 15. Implementation sequence
1. Audit schema, render functions, event handlers, backup/restore, and cloud merge.
2. Add schema version and safe migration.
3. Add course type and student filters.
4. Add package records and FIFO allocation.
5. Add advance credit ledger and payment history.
6. Connect lesson completion/edit/delete to recalculation.
7. Add student cards/profile UI and alerts.
8. Add legacy spreadsheet import preview and controlled commit.
9. Run acceptance and regression tests.
10. Report changed files, migration behavior, tests/results, and known limitations.

## 16. Explicit non-goals
- Do not rebuild the app in React/Vue or replace its architecture without separate approval.
- Do not migrate to a server database as part of this feature without separate approval.
- Do not change main directly.
- Do not import ambiguous spreadsheet amounts as confirmed transactions.
- Do not send WhatsApp messages automatically.
- Do not invent lesson history, payment dates, or student details.
