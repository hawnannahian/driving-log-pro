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
- এই সংস্করণে online database, login, automatic cloud sync নেই।

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
