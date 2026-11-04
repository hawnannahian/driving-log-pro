# Driving Log Pro — Web App / PWA (বিনা খরচে শুরু)

## কী আছে
- iPhone ও Windows browser-এ responsive dashboard
- Lesson, Fuel, Other Expense, Note, Insurance, Repair record add/edit/delete
- Student add/edit/delete
- Calendar: মাসের ক্যালেন্ডার, দিনের বুক করা সময় ও আসন্ন লেসন
- ছাত্রের হিসাব পেজ, এক চাপে Paid, backup রিমাইন্ডার এবং Overview-তে আজকের লেসন
- সাপ্তাহিক লেসন, অগ্রিম প্যাকেজ, মাসিক চার্ট, রিপোর্ট PDF এবং প্রতি কিলোমিটারে জ্বালানি খরচ
- Income, expense, profit, unpaid এবং lesson hours report
- This month / This year / All time filter
- Log CSV ও Students CSV import (duplicate skip)
- JSON backup/restore এবং CSV export
- PWA manifest ও offline app-shell cache

## গুরুত্বপূর্ণ: ডেটা কোথায় থাকে
এই সংস্করণে ডেটা browser-এর localStorage-এ থাকে। অর্থাৎ:
- iPhone-এর Safari-তে তৈরি ডেটা Windows PC-তে নিজে থেকে আসবে না।
- Browser data clear করলে data হারাতে পারে।
- নিয়মিত Reports & data থেকে JSON backup ডাউনলোড করুন।
- Restore করার আগে এবং প্রথম Cloud sync-এর আগে অ্যাপ নিজে থেকে একটি safety copy রাখে। Reports & data → Safety copies থেকে সেটা ডাউনলোড বা ফেরত আনা যায়।
- iPhone-এ অবশ্যই Home Screen-এ যোগ করে ব্যবহার করুন। শুধু Safari-তে খুললে ৭ দিন ব্যবহার না করলে Safari ডেটা মুছে দিতে পারে।
- Cloud sync-এর জন্য fine-grained token ব্যবহার করুন, যেটা শুধু data repository-তে "Contents: Read and write" অনুমতি পায়।
- Reports & data-র Cloud sync চালু করলে ডেটার কপি আপনার private GitHub repository-তে থাকে। Token কোডে রাখবেন না, শুধু অ্যাপের ঘরে লিখবেন।

## Windows PC-তে চালানো
সাধারণভাবে `index.html` ডাবল-ক্লিক করে UI দেখা যায়, তবে PWA/offline service worker কাজ করতে HTTPS বা localhost লাগে। সহজ local test:
1. Python 3 ইনস্টল থাকলে folder-এ Command Prompt খুলুন।
2. `python -m http.server 8000` চালান।
3. Browser-এ `http://localhost:8000` খুলুন।

## বিনামূল্যে অনলাইনে প্রকাশ (GitHub Pages)
1. Public repository `driving-log-pro`-এ শুধু অ্যাপের ফাইলগুলো রাখুন: `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, `icon.svg`, PNG আইকন এবং এই README।
2. Repository → Settings → Pages → Deploy from a branch → `main` এবং `/ (root)` নির্বাচন করে Save করুন।
3. প্রকাশিত লিংক iPhone Safari-তে খুলুন।

**সতর্কতা:** এই repository সবার জন্য খোলা। ছাত্রদের নাম, ফোন নম্বর, CSV, Excel বা JSON backup এখানে কখনো আপলোড করবেন না। `migration` ফোল্ডার শুধু নিজের ডিভাইসে রাখুন। CSV import করলে ডেটা শুধু browser-এর localStorage-এ থাকে, কোথাও আপলোড হয় না।

## iPhone-এ ব্যবহার
- Safari-তে published HTTPS link খুলুন।
- Share icon → Add to Home Screen → Add।
- Home Screen-এর Driving Log Pro icon থেকে খুলুন।
- প্রথমবার online খোলার পর অ্যাপ offline-এও খুলবে। নতুন update ইন্টারনেট থাকা অবস্থায় দ্বিতীয়বার খোলার সময় দেখা যাবে।

## Workbook import
আপনার নিজের ডিভাইসে রাখা `Log_Import.csv` এবং `Students_Import.csv` আলাদাভাবে import করুন।
`Old_Log_Archive.csv` এখনই import করবেন না—পুরোনো backup-এ duplicate থাকতে পারে।
CSV import-এর Log columns: Date, Type, Student, Start, End, Hours, Rate, Income, Cost, Paid, Km, Comment।
Hours ও Income app নিজে Start/End ও Rate থেকে হিসাব করে; expense income হিসেবে গণনা হয় না।

## সতর্কতা
এটি একটি functional starter version, production-grade cloud service নয়। Multi-device sync, user authentication, server database, secure remote backup, Portuguese VAT/tax invoice, payments এবং multi-user access এখনো নেই।

## v1.19: প্যাকেজ, টাইমার ও লেসন সম্পন্ন
- **লেসন সম্পন্ন:** টাইমারে "End lesson" চাপলে আসল সময় সেভ হয়। আজকের তালিকায় "Done" চাপলে, বা লেসন ফর্মে "Lesson completed" টিক দিলেও সম্পন্ন হয়। শেষ সময় পার হলে লেসন নিজে থেকেই সম্পন্ন ধরা হয়।
- **প্রিপেইড প্যাকেজ:** Students → ছাত্র → Packages → Add package। সম্পন্ন প্রতিটা প্যাকেজ-লেসনের ঘণ্টা সবচেয়ে পুরোনো প্যাকেজ থেকে কাটা হয়। প্যাকেজের চেয়ে বেশি চালালে বাড়তি ঘণ্টা সাধারণ (বাকি) ঘণ্টা হিসেবে দেখায়।
- লেসন বদলালে বা মুছলে হিসাব নিজে থেকে ঠিক হয়ে যায়। একই লেসন কখনো দুবার কাটা হয় না।
- **WhatsApp:** লেসন সম্পন্ন হলে বাংলা বার্তা তৈরি হয়, সাথে ছাত্রের মোট সম্পন্ন ঘণ্টা। পাঠানোর আগে বার্তাটা দেখে বদলানো যায়। অ্যাপ নিজে থেকে কিছু পাঠায় না।
- v1.19 প্রথমবার খোলার আগে অ্যাপ নিজে থেকে একটা safety copy রাখে (Reports → Safety copies → "Before the v1.19 upgrade")।
