# PROJECT_STATE — Driving Log Pro

শেষ আপডেট: 2026-11-05 (Claude) · ভিত্তি: `main` @ `26a3d1c`
এই repo public: এখানে ছাত্রের নাম/ফোন, আর্থিক হিসাব, token বা Excel/CSV/backup ডেটা লিখবেন না।

## কাজের নিয়ম
- প্রতিটি session এই ফাইল পড়ে শুরু; পুরো repo নয়, দরকারি অংশ `grep`/নির্দিষ্ট লাইন দিয়ে পড়া। `app.js` ও `prayer-times.js`-এর লাইন খুব লম্বা, তাই পুরো ফাইল `cat` নয়।
- বড় ডকুমেন্ট বা tool output বারবার লোড নয়। শেষ করা কাজের ব্যাখ্যা পুনরাবৃত্তি নয়, এখানে সারাংশ।
- Session লম্বা হলে (context ~70%-এর আগে) নিচের "Handover" অংশ পূরণ করে নতুন session।
- Context কমানোর জন্য কাজ করা কোড মুছবেন/বদলাবেন না। Context-এর চেয়ে সঠিকতা ও ধারাবাহিকতা আগে।
- প্রতিটি কোড পরিবর্তনের পর `sw.js`-এর `CACHE` নম্বর বাড়াতে হবে, না হলে পুরনো ফাইল চলতে থাকবে।

## Architecture
- Vanilla JS PWA, build step নেই। GitHub Pages: `main`, `/` (root)।
- ফাইল: `index.html`, `styles.css`, `app.js` (মূল অ্যাপ), `prayer-times.js`, `full-time-students.js`, `sw.js`, `manifest.webmanifest`, icons।
- ট্যাব: Overview, Calendar, Log, Students, Reports।
- ডেটা: `localStorage` key `driving-log-pro-v1` (`state = {entries, students}`), সহায়ক key `DB_KEY-*`।
- Full-time register আলাদা: key `driving-log-pro-full-time-v1`, নিজস্ব export/import, সাধারণ লেসনের হিসাবের বাইরে।
- Cloud sync: GitHub API, private repo `driving-log-data`, ফাইল `driving-log.json`। ডিভাইসে রাখা fine-grained token ব্যবহার করে।
- Service worker: cache-first, navigate network-first; বর্তমান cache `nahians-schedule-cache-v32` (`sw.js` দেখে প্রতিবার নিশ্চিত করুন, এই সংখ্যা ঘন ঘন বদলায়)।
- Travel dua অডিও বাইরের URL (hisnmuslim.com) থেকে আসে।

## গুরুত্বপূর্ণ সিদ্ধান্ত
- Default rate €20/ঘণ্টা। Income = সময় × rate। Profit = income − expenses। Expense কখনো income নয়। Unpaid আলাদা হিসাব।
- Lesson timer নির্দিষ্ট 55 মিনিট: 1 ঘণ্টা business credit, আসল সময় আলাদা রাখা হয়।
- Lesson ফর্মে Cost/Odometer নেই; এগুলো শুধু expense type-এ। লেসনে নাম বা ফোন যেকোনো একটা যথেষ্ট।
- Sync: একই রেকর্ডে শেষে sync করা ডিভাইসের পরিবর্তন থাকে। মুছলে সব ডিভাইসে মোছে। "Delete all app data" শুধু ওই ডিভাইসে।
- Private ডেটা public repo-তে নয় (`.gitignore` দিয়ে সুরক্ষিত)। পেইড সার্ভিস নয়।
- ভবিষ্যতে native iPhone অ্যাপ চাই; Mac নেই।

## বর্তমান অবস্থা
কাজ করা বৈশিষ্ট্য (কোডে আছে): লেসন/খরচ লগ, ছাত্র, রিপোর্ট, CSV import/export, JSON backup ও safety copies, cloud sync, ক্যালেন্ডার, 55-মিনিট টাইমার, Done/End lesson, prepaid package, WhatsApp বার্তা, নামাজের সময়, travel dua অডিও, Full-time register (PR #12)।

## যাচাই বাকি
1. **Version লেবেল মিলছে না:** UI দেখায় `v1.19`, CSS মন্তব্যে `v1.26`, cache `v28`।
2. **Full-time backup:** `app.js`-এ এই key-এর উল্লেখ নেই, তাই JSON backup ও cloud sync-এ সম্ভবত এই ডেটা যায় না। আচরণ পরীক্ষা করে নিশ্চিত করতে হবে।
3. **Offline precache:** `full-time-students.js` `sw.js`-এর `FILES` তালিকায় নেই। প্রথম online লোডে cache হয়, install-এ নয়।
4. **Branch:** নিচের কোনোটা merge হয়নি। এগুলো `main`-এর পুরনো ভিত্তি থেকে আলাদা হয়েছে, তাই সরাসরি merge করলে নতুন কাজ হারাতে পারে; দরকারি commit আলাদা করে দেখতে হবে।
   - `claude/intelligent-gates-shiyps`: পুরনো, আর ব্যবহার হবে না। এর কাজ (`31e566d`) squash হয়ে `main`-এ মার্জ হয়ে গেছে, কিন্তু SHA আলাদা থাকায় এই branch ref নিজে `main`-এর ancestor নয় — তাই এতে আর নতুন commit push করবেন না (সবসময় reject হবে, আর force-push নিষেধ)। নতুন কাজ সবসময় `main` থেকে একটা তাজা branch নামে শুরু করুন।
   - `feature/student-crm-course-ledger-spec`: Student CRM ও Course Ledger spec। `main`-এ নেই, এর বাস্তবায়নও নিশ্চিত নয়।
   - `feature/premium-55-minute-lesson-timer`, `feature/driving-log-pro-upgrade`, `fix/service-worker-cache-refresh`: সম্ভবত আগেই অন্যভাবে `main`-এ এসেছে, নিশ্চিত করতে হবে।
5. **আসল iPhone টেস্ট:** টাইমারের শব্দ, screen wake, swipe, বাংলা voice।
6. `README_BN.md`-এর "multi-device sync নেই" সতর্কতা পুরনো কি না মিলিয়ে দেখা।

## সাম্প্রতিক ফিক্স (Claude, 2026-11-05)
ব্যবহারকারীর রিপোর্ট: WhatsApp থেকে copy করা ফোন নম্বর (`+351 920 449 837`) paste করা যাচ্ছিল না।
- **আসল কারণ ১:** WhatsApp-এর copy নম্বরের আগে-পরে invisible Unicode bidi mark (U+202A/U+202C) জুড়ে দেয়। `isPhone()`-এর regex আর `waNumber()`-এর `startsWith("+")` চেক এই mark-এর কারণে ব্যর্থ হতো — নম্বর ঠিকই সেভ হতো, কিন্তু WhatsApp বোতাম দেখাত না। **ফিক্স (PR #13, merged):** `cleanPhone()` helper যোগ, `isPhone`/`waNumber`/`resolveStudent`/student form/CSV import-এ প্রয়োগ করা হয়েছে। আগে থেকে save হওয়া ছাত্রও নতুন করে না লিখেই ঠিক হয়ে যায় (`waNumber()`-এ read-time clean)।
- **আসল কারণ ২:** `fPhone`-এর পাশে যোগ করা "Paste" বোতাম (এই session-এর বাইরে করা) আসলে clipboard থেকে কিছুই পড়ত না — শুধু field-এ focus করে instruction দেখাত। **ফিক্স (PR #17, merged):** `pasteInto(id)` যোগ, যেটা `navigator.clipboard.readText()` দিয়ে সত্যিই paste করে; Student profile-এর Phone/WhatsApp field-েও একই বোতাম যোগ হয়েছে (existing `.phoneinputrow` CSS পুনর্ব্যবহার, নতুন CSS নেই)। Clipboard API না থাকলে আগের fallback বার্তাই দেখায়।
- দুটোই Chromium-এ real clipboard permission দিয়ে paste simulate করে, আর ৭০+ regression check চালিয়ে যাচাই করা হয়েছে। **iOS Safari-তে সরাসরি test করা যায়নি** (এই sandbox-এ শুধু Chromium আছে) — ব্যবহারকারীর ফোনে বাস্তবে কাজ করছে কি না এখনো নিশ্চিত হওয়া বাকি।

এ ছাড়া ৫টা tab navigation নিয়ে আগে যে রিপোর্ট ছিল, তার root cause verify করা হয়েছে: একটা পুরনো commit-এ literal `\n` (escape সিকোয়েন্স টেক্সট, actual newline না) ঢুকে গিয়ে `app.js`-এ SyntaxError হয়েছিল, যা পরে অন্য কেউ ঠিক করে দিয়েছে (`7a13cc9`)। `main`-এর বর্তমান কোডে এই syntax ঠিক আছে, এখন ৫টা tab-ই ঠিকভাবে কাজ করে (verified)।

## পরবর্তী কাজ
ব্যবহারকারী এখনো কোনো নতুন feature বলেননি। পরের কাজ এখানে লেখা হবে।

## Handover (নতুন session-এর জন্য)
- শেষ কাজ (Claude): WhatsApp copy-paste bug fix (উপরে "সাম্প্রতিক ফিক্স" দেখুন), PR #13 ও #17, দুটোই merged। এই ফাইলও আপডেট করা হয়েছে।
- চলমান কাজ: নেই।
- পরের ধাপ: উপরের "যাচাই বাকি" বা ব্যবহারকারীর নতুন নির্দেশ। ব্যবহারকারী ফোনে paste বোতাম বাস্তবে test করে জানাবেন কি না, সেটা এখনো বাকি।
