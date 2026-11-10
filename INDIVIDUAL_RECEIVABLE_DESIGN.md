# Individual Receivable Ledger — Data Design & Implementation Review

**Status:** Proposed architecture for owner review; no application implementation  
**Date:** 2026-11-10  
**Related product specification:** LEARNING_PLAN_SPEC.md  
**Related owner decision:** Convert All + Option A (Paid and Unpaid lessons both convert)

## 1. Problem found in current source

The current accounting path is:

- An ordinary completed Individual Lesson is valued by `income(lesson)` and, when unpaid, included by `unpaidAmt(lesson)`.
- `isCourseLesson(lesson)` becomes true after the lesson is linked to a Course.
- `unpaidAmt()` deliberately returns zero for a Course-linked lesson because its value is otherwise accounted for through the Course.
- The existing `courseTransferPaid` / `courseTransferDate` fields preserve a Paid Individual Lesson's old receipt when it is converted. They do not preserve an unpaid debt.
- The Edit Record save handler constructs a fresh lesson object and explicitly carries only selected historical fields. A new receivable field embedded on the lesson could be lost by a later edit unless every edit path preserves it.
- Cloud Sync uses an explicit snapshot plus three-way, ID-based list merging. New top-level data must be added to the snapshot, restore, validation and merge paths; otherwise it can be lost during sync or restore.

Therefore, simply linking an Unpaid Individual Lesson to a Course is unsafe: the old individual outstanding amount disappears from `unpaidAmt()`.

## 2. Recommended storage model

Add two optional top-level arrays to the existing app state. Keep the current localStorage key unchanged.

### 2.1 `state.individualReceivables`

One immutable principal record for each converted Unpaid Individual Lesson with an amount above zero:

```js
{
  id: "unique-receivable-id",
  sourceLessonId: "original-lesson-id",
  conversionId: "unique-conversion-batch-id",
  student: "Student name snapshot",
  sourceDate: "YYYY-MM-DD",
  sourceHours: 1.5,
  sourceRate: 25,
  amount: 37.50,
  createdAt: "ISO timestamp"
}
```

Rules:
- `sourceLessonId` is unique across active receivables: a lesson can create no more than one principal receivable.
- `amount` is a two-decimal snapshot of the original Individual Lesson value, calculated **before** the lesson receives its Course link (equivalent to `round2(income(oldLesson))` for an eligible Unpaid lesson).
- Store source hours/rate and original date for audit; do not recalculate principal from the lesson later.
- Keep a student-name snapshot so the debt remains attributable if the source lesson or student profile is later changed. Normal rename/merge operations must update this snapshot to the canonical student name.
- Do not store a Course ID here. The debt belongs to the original Individual Lesson, not to the Course or its payment ledger.
- A zero-value Unpaid lesson creates no receivable row; it still follows the conversion/hour rules.

### 2.2 `state.individualReceivableTransactions`

Append-only collection/correction ledger:

```js
{
  id: "unique-transaction-id",
  receivableId: "unique-receivable-id",
  kind: "payment", // or "reversal"
  date: "YYYY-MM-DD",
  amount: 10.00,
  createdAt: "ISO timestamp",
  reversesTransactionId: null // required for a reversal
}
```

Rules:
- A payment is a positive amount collected against one receivable. Partial payments are supported.
- A payment cannot exceed the current outstanding amount (allow only a one-cent floating-point tolerance after cent rounding).
- Transactions are immutable and never silently edited/deleted. To correct an incorrectly recorded payment, append a reversal that references the original payment, then enter the corrected payment if appropriate.
- A reversal must reference a payment on the same receivable and cumulative reversals must not exceed the original payment amount.
- Do not allow reversal of a reversal.
- All money values are rounded to cents. Dates are validated as real local calendar dates in YYYY-MM-DD format.

### 2.3 Derived balances

Never store a mutable `paidAmount` or `outstanding` total. Derive them from the transaction ledger:

- Collected = sum(payment transactions) − sum(reversal transactions).
- Outstanding = max(0, principal amount − collected).
- Reject any transaction sequence that would make collected negative or exceed principal.

This avoids stale running balances after sync, restore or partial-payment corrections.

## 3. Why two independent arrays

- Do not put unpaid debt in `state.coursePayments`: that ledger means money paid towards a Course price. Mixing the two would corrupt Course Due and course-payment history.
- Do not rely on a nested field on a lesson as the sole source of truth: the Edit Record handler rebuilds lesson objects and the existing Cloud Sync merges whole records by ID. A separate receivable row survives ordinary lesson edits and can still be displayed if the source lesson is deleted.
- Do not store mutable arrays of payments inside one receivable object. Two devices collecting separate payments could overwrite each other's nested changes. Separate transaction rows with unique IDs allow the existing ID-based list merge to union independently-added transactions.
- Keep both arrays optional for old data. No existing student or lesson receives a receivable automatically; rows are created only by the instructor's explicit Convert All action.

## 4. Convert All transaction sequence

1. Recompute the eligible completed Individual Lessons from current state at confirmation time; do not trust a stale preview.
2. Exclude upcoming lessons, `e.course` lessons, legacy `e.pkg` lessons, Legacy Archive records and lessons already represented by a receivable/conversion.
3. For every eligible Unpaid lesson, snapshot its original amount, date, hours and rate **before** assigning Course allocation.
4. Preserve Paid lesson receipts using the existing `courseTransferPaid` / `courseTransferDate` compatibility behavior. Do not create an individual receivable for a Paid lesson.
5. Validate the complete hour allocation and every receivable before mutating live state.
6. Build a staged copy of the relevant state. Add all receivable rows and Course links to that staged copy; if any validation or persistence step fails, do not partially convert.
7. Save once. Only after a successful save, show the conversion result and refresh Student Profile, Payments and reports.

The insufficient-hours policy remains a proposed guardrail from LEARNING_PLAN_SPEC.md, not a separately confirmed owner decision. The implementation PR must either obtain confirmation or clearly preserve the existing course-allocation behavior.

## 5. Accounting formulas and UI integration

### Student Profile

- Individual Outstanding = sum of open receivable balances for the student + current unpaid individual lessons + legacy package dues + Course Due.
- Total collected includes the net amount collected through receivable transactions. This is cash collection, not a new revenue event.
- Payments history shows the original transferred Individual Lesson debt (principal, collected, remaining) and each collection transaction with its actual collection date.
- Add a dedicated action to collect part or all of one receivable. Prefill the amount with its current outstanding balance; allow a smaller positive amount.

### Course accounting

- Do not add receivable principal or transactions to `coursePayments`.
- Do not change `courseDue()`, `coursePaid()`, `courseBalance()`, `courseRate()`, `income()`'s Course branch, or FIFO hour allocation as part of this ledger.
- The Course price, Course payments and Course Due remain unchanged by collecting an old Individual receivable.

### Reports and reminders

The implementation must trace and update every relevant current aggregation path, including:
- `studentStats()` (profile, Students tab, payment chart and WhatsApp payment amount);
- `dueInPeriod()`, Reports dashboard outstanding, and PDF Outstanding;
- `dashCollected()` so receivable payments/reversals are counted by transaction date;
- Log's today's outstanding KPI and quick-booking WhatsApp due calculation;
- any outstanding sort/filter that currently relies only on `unpaidAmt(lesson)`.

Outstanding should be attributed to the original lesson's `sourceDate`; cash collected should be attributed to the transaction's `date`. Do not count a receivable collection as revenue a second time. Preserve the existing `income()` revenue definition unless the owner separately approves a revenue-accounting change.

## 6. Backup, restore and Cloud Sync compatibility

The current app's sync snapshot explicitly lists its top-level data. The implementation must update all of these together:

- `snapshot()`: include both arrays, including empty arrays.
- `fromSnapshot()`: restore both arrays from the merged snapshot.
- `mergeAll()`: merge each array independently by `id` using the existing ID-based merge helper. Unique, append-only transaction IDs are important for two-device collection.
- `useBackup()` and `validBackup()`: export/validate/restore both arrays. Older backups without the fields remain valid and default to empty arrays.
- `hasData()`: include these arrays so a receivable-only state cannot be mistaken for empty data.
- `backupNow()`, safety copies and daily cloud snapshots: verify that both arrays are included.
- Student rename and student cleanup/merge: update the student-name snapshot without changing principal or transactions.
- Full-Time register: do not include receivables in, or merge them with, the separate Full-Time store.

**Older app-version risk:** a build that predates these top-level arrays does not know how to round-trip them in its Cloud Sync snapshot. Before enabling Convert All in production, all active devices must be updated to a build that understands the new fields, and a two-device old/new-version compatibility test must prove that an older client cannot silently erase a newer receivable ledger. If that cannot be guaranteed, add a compatible sync-version protection or delay enabling the feature. Do not claim sync-safe based only on the new build's unit tests.

Restoring a backup created before this feature naturally has no receivable arrays. The restore UI should warn that such a backup cannot contain receivables created after its date; the existing pre-restore safety copy must remain available.

## 7. Lifecycle and deletion safeguards — owner review required

The receivable is a financial record, so it must not disappear when its source lesson is edited or deleted.

Recommended initial safeguards:
- Preserve receivable principal and transactions if the source lesson is removed from the lesson log.
- Do not allow a converted lesson with an associated receivable to be silently unlinked from its Course or deleted through the ordinary Edit/Delete flow.
- Until a separately designed and approved “Reverse conversion” workflow exists, block those destructive actions and explain why.
- Do not delete a student profile while it has any open receivable. For settled receivables, retain access to the financial history or require an explicit archive workflow.

These are safety recommendations, not additional owner-confirmed business rules. Confirm them before implementing the relevant UI restrictions.

## 8. Migration and rollout

- No migration of old data is needed merely to introduce the optional arrays.
- No automatic scan or conversion of existing Unpaid Lessons is allowed.
- Each receivable is created only during the owner's explicit Convert All confirmation.
- Before first production use: make a fresh local backup, verify Cloud Sync is current, update every active device, and test the feature with synthetic data only.
- Do not place real student records in repository fixtures or PR descriptions.

## 9. Required regression matrix

Use synthetic data only. At minimum test:

1. One Unpaid completed lesson: principal snapshot equals original Individual Lesson amount before Course linking.
2. One Paid completed lesson: existing receipt/date retained once; no receivable created.
3. Several Paid and Unpaid lessons in one Convert All batch.
4. Multiple courses and pooled FIFO hour allocation; principal debt stays independent of each Course Due.
5. Zero-price lesson; no zero-value receivable.
6. Partial payment, final payment, overpayment rejection and invalid date rejection.
7. Payment reversal, partial reversal and over-reversal rejection.
8. Duplicate Convert All attempt; no duplicate receivable.
9. Failed validation/storage write; no partial Course links, payments or receivables.
10. Lesson edit after conversion; receivable survives.
11. Lesson deletion/reversion safeguards; receivable does not disappear.
12. Student rename and cleanup/merge; ledger remains attached to the correct student.
13. Backup → restore; old backup without arrays remains valid and warns appropriately.
14. Cloud merge: two devices add different payment transactions concurrently; both survive once, with no duplicate IDs.
15. Old/new app version sync compatibility; an older build must not silently erase the ledger.
16. Reports: principal contributes to outstanding by source lesson date; collection contributes to cash collected by transaction date; neither is double-counted as revenue.
17. Existing Legacy Archive and Full-Time data remain untouched.

## 10. Scope of this design PR

Documentation only. No app code, storage, backups, cloud data, student records, accounting calculations, booking or deployment behavior is changed by this design document.
