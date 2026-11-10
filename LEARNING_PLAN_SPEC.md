# Learning Plan — Product Specification

**Status:** Owner-confirmed product direction; implementation proposal for review  
**Date:** 2026-11-10  
**Repository:** Driving Log Pro

## 1. Product goal

Let an instructor manage a student's learning arrangement without moving away from the existing Calendar-first workflow. A student is normally created or selected while booking a lesson in Calendar. The Learning Plan should make it clear whether the student is taking individual lessons or has purchased a block of learning hours, while keeping lesson history, hours and money accurate.

Do not add a new main navigation tab. Use the existing Calendar, Student Profile, Courses and Payments surfaces.

## 2. Student learning options

The student can be handled under one of three options:

1. **Individual Lessons**
   - No course-hour entitlement is required.
   - Each lesson keeps its own hourly rate and Paid/Unpaid status.
   - This is the default for a student's first Calendar booking.

2. **Hourly Package**
   - A custom number of hours and a custom total price are entered for that student.
   - No fixed package templates.
   - Purchased hours are an entitlement independent of how much money has been paid.
   - Payment is recorded separately against the package/course ledger.

3. **Full Course**
   - Uses the same custom hours + price model and existing course-hour accounting foundation.
   - No separate parallel package ledger or fixed template catalogue.
   - Until the owner defines a distinct business rule, Full Course is a user-facing plan choice, not a different accounting engine.

Existing course rules remain in force: multiple courses per student are supported; hours are pooled oldest-first; money remains per course; no expiry is introduced. The Legacy Archive stays read-only.

## 3. Calendar-first registration and booking flow

1. Instructor opens Calendar and creates a new lesson.
2. Instructor selects an existing student or enters a new student's details; the current student autocomplete/profile resolution is reused.
3. For a new student, the learning option defaults to **Individual Lessons**.
4. The lesson is booked and saved through the existing Calendar flow.
5. When the student later buys an Hourly Package or Full Course, the instructor creates the custom plan from that student's profile. The instructor can then choose whether to convert eligible previous Individual Lessons.
6. For future bookings, the existing Individual Lesson / Course Hours choice remains available. When Course Hours is selected, the existing pooled FIFO allocation and validation rules are reused.

The normal Calendar booking must remain quick. Do not force a full plan setup form before the instructor can save the student's first lesson.

## 4. Student Profile

The existing Student Profile remains the central learning-plan dashboard. It should show:

- Lesson history and upcoming bookings.
- Current plans/courses and their names.
- Purchased hours, completed/used hours, remaining hours and available-to-book hours.
- Plan price, payments received and Course Due, per plan.
- Individual lesson payments and Individual Outstanding separately from plan payments.
- A clear action to create a custom Hourly Package or Full Course when needed.

Do not duplicate the Add payment action on course cards if payment entry already lives in the Payments tab.

## 5. Convert All — previous Individual Lessons

When a student purchases a plan, the instructor may choose **Convert All**.

### 5.1 Eligible records

Convert all lessons that, at the time of confirmation, are:
- Lesson records for this student;
- completed;
- Individual Lessons (not already linked to a course);
- not linked to the Legacy Archive;
- not previously converted.

Do not convert upcoming/scheduled lessons, lessons already linked to a course, legacy package/archive lessons, or any lesson already included in an earlier conversion.

### 5.2 Preview and confirmation

Before writing anything, show a preview with:
- number of eligible lessons;
- total hours to be applied to the new plan;
- amount already paid on those lessons;
- unpaid individual amount that will remain outstanding;
- the plan's purchased hours and resulting remaining hours.

Require explicit confirmation. Conversion must be one all-or-nothing operation; if validation or saving fails, leave all lesson and plan records unchanged. Record enough conversion metadata to prevent duplicate conversion and to support an audit trail.

### 5.3 Hours treatment

Converted completed lesson hours count as already used hours against the purchased plan. They reduce the plan's remaining hours; they do not increase purchased hours, change the plan price, create a payment, or change the original lesson date, time or duration.

Reuse the existing course allocation model where possible. Do not change courses, coursePayments or lesson.courseAlloc shapes without a reviewed compatibility plan.

### 5.4 Money treatment — owner-confirmed Option A

The owner explicitly selected **Convert All** and **Option A: convert both Paid and Unpaid completed Individual Lessons**.

- **Paid lessons:** Preserve the original individual receipt amount and payment date as historical individual payment. Do not add that amount to coursePayments, do not increase course payments, and do not double-count it in collected cash.
- **Unpaid lessons:** Preserve the original individual amount as a separately collectible Individual Outstanding balance. It must remain visible in the student's financial overview/payment history and must not be included in Course Due.
- **Course money:** The plan's price and payments continue to use the separate per-course payment ledger. Converting lessons changes hours used, not the course's price or payments.

### 5.5 Important implementation gap

Current source has a courseTransferPaid / date mechanism for retaining previously paid individual receipts. However, current unpaidAmt() returns zero for course-linked lessons, so simply linking an unpaid lesson to a course would make its outstanding amount disappear from the current calculation.

The implementation must therefore add a durable, backward-compatible representation for the transferred individual receivable and its collection/payment state, plus the corresponding Payments UI and report/stat calculations. It must not overload coursePayments or silently treat the old individual debt as Course Due. Exact field names and any migration/compatibility behavior must be specified in the implementation PR before code changes.

## 6. Conversion capacity safeguard — proposed, pending implementation review

Recommended all-or-nothing rule: if the total eligible converted hours exceed the purchased hours in the target plan, do not partially convert and do not allow negative remaining hours. Show the hour deficit and require the instructor to increase the plan hours or cancel and resolve the mismatch.

This is a proposed guardrail, not yet a separately confirmed owner decision.

## 7. Accounting and historical-data invariants

- Purchased plan hours remain independent of payments received.
- Course payments remain separate from individual lesson payments.
- Converted paid receipts remain individual historical receipts.
- Converted unpaid balances remain individual receivables.
- Course Due is only the unpaid amount on the relevant course/plan.
- No conversion of Legacy Archive records.
- No duplicate conversion.
- No automatic bulk rewrite of existing live student records outside the instructor's explicit Convert All action.
- Preserve existing lesson dates, times, durations and original payment evidence.
- Keep Full-Time historical register isolated.

## 8. Out of scope

- New main navigation tab.
- Fixed package templates or automatic package pricing.
- Plan expiry.
- Automatic conversion of upcoming bookings.
- Rewriting Legacy Archive records.
- Changing cloud sync, backup format or storage keys as part of the UI/specification work.
- Any deployment or live-data migration in this specification PR.

## 9. Implementation PR acceptance criteria

The implementation PR must include:
- a reviewed data compatibility plan for the transferred unpaid receivable;
- regression tests using synthetic data for Paid, Unpaid, partially paid/edge cases, multiple plans, pooled FIFO allocation, insufficient plan hours, repeat conversion, failed save/rollback and Legacy Archive exclusion;
- checks that paid receipts are not double-counted and unpaid individual debt never disappears or moves into Course Due;
- verification of Student Profile, Payments, Calendar booking and reports;
- all JS syntax checks and existing Node test suites;
- browser checks at 390×844 and 320×568, plus honest disclosure of real-iPhone/deployment tests not performed.

**No application code or live data is changed by this specification.**
