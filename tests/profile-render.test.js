"use strict";
// Regression guard: PR #107 (v1.41) deleted `const row=...` but the Attendance tab still called row(), so renderProfile()
// threw a ReferenceError and no student profile could be opened. This static check keeps that class of mistake out.
const fs=require("node:fs"),path=require("node:path"),test=require("node:test"),assert=require("node:assert/strict");
const source=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8");
const start=source.indexOf("function renderProfile(){"),end=source.indexOf("\nfunction openProfile",start);
assert.ok(start>=0&&end>start,"renderProfile must stay before openProfile");
const body=source.slice(start,end);
test("renderProfile defines every local helper it calls (row)",()=>{
 if(/[^\w.$]row\(/.test(body))assert.match(body,/const row\s*=/,"renderProfile calls row() but does not define it");
});
test("renderProfile builds the Lessons, Course, Payments and Attendance tabs",()=>{
 for(const id of ["ptab-lessons","ptab-course","ptab-payments","ptab-attendance"])assert.ok(body.includes(`$("${id}")`),`${id} must be rendered`);
});
test("student profile tab strip has one grid column per tab (v1.77: Attendance wrapped alone when 4 columns served 5 tabs)",()=>{
 const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8"),css=fs.readFileSync(path.join(__dirname,"..","styles.css"),"utf8");
 const tabs=(html.match(/data-ptab="/g)||[]).length,last=[...css.matchAll(/#profileDialog \.ptabs\{[^}]*grid-template-columns:repeat\((\d+),/g)].pop();
 assert.ok(last,"a final repeat(N) rule for #profileDialog .ptabs must exist");assert.equal(Number(last[1]),tabs);
});
test("retained individual receipts can be removed only with a confirmation and a safety copy (v1.78)",()=>{
 const app=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8"),i=app.indexOf("function removeRetainedReceipt(id){"),body=app.slice(i,app.indexOf("function editCoursePaymentDate",i));
 assert.ok(i>0);assert.ok(body.includes("confirm("));assert.ok(body.includes('keepCopy("receipt-remove")'));
 assert.ok(body.includes("delete e.courseTransferPaid")&&body.includes("delete e.courseTransferDate"));
 assert.ok(!/courseAlloc|coursePayments|\.hours|\.price|\.course\b/.test(body),"must not touch course allocation, course payments, hours or price");
 assert.ok(app.includes('data-delreceipt="${esc(e.id)}"')&&app.includes('["before-receipt-remove"'));
});
test("Add student shows existing matches (name or phone) so the same person is not added twice (v1.79)",()=>{
 const app=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8"),html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
 assert.ok(html.includes('id="studentDups"'));assert.ok(app.includes("function showStudentDups()"));
 assert.ok(app.includes('["sName","sPhone"].forEach(id=>{const el=$(id);if(el)el.addEventListener("input",showStudentDups);});'));
 assert.ok(/function showStudentDups\(\)\{[\s\S]*?filter\(s=>s\.id!==editing\)/.test(app),"must not list the student being edited");
});
test("choosing Course hours hides the hourly-rate field and shows the course rate (v1.80)",()=>{
 const app=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8"),html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8"),css=fs.readFileSync(path.join(__dirname,"..","styles.css"),"utf8");
 assert.ok(html.includes('id="courseRateNote"'));assert.ok(app.includes('rateField.classList.toggle("hidden",courseSelected||!lesson)'));
 assert.ok(css.includes("#recordDialog .rate-field.hidden{display:none!important}"),"a closed rate field must really be hidden");
 assert.ok(app.includes("(from the course)"));
});
test("a long student name stays on one line in the profile header (v1.81)",()=>{
 const css=fs.readFileSync(path.join(__dirname,"..","styles.css"),"utf8"),app=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8");
 assert.ok(css.includes("#profileDialog #profileName{white-space:nowrap;overflow:hidden;text-overflow:ellipsis"));assert.ok(app.includes('$("profileName").title=s.name;'));
});
test("Students tab 'Recently joined' lists newest students first without a 3-lessons condition (v1.82)",()=>{
 const app=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8");
 assert.ok(!/3 or more lessons/i.test(app),"the 3-or-more-lessons grouping must be gone");
 assert.ok(app.includes('<p class="listhead">Recently joined</p>'));assert.ok(!app.includes('"All other students"')&&!app.includes("All other students"));
});
test("the Outstanding tile of the Business dashboard hero is hidden but its id is kept (v1.83)",()=>{
 const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8"),css=fs.readFileSync(path.join(__dirname,"..","styles.css"),"utf8");
 assert.ok(html.includes('<div class="hero-hidden" hidden><span>Outstanding</span><b id="rUnpaid"'));assert.ok(css.includes("#reports .herogrid .hero-hidden{display:none!important}"));
});
test("WhatsApp several-lessons message: editable wording and period, older saved settings stay valid (v1.85)",()=>{
 const app=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8"),html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
 assert.ok(app.includes("const upcomingLessonsFor=e=>")&&app.includes("Number(waTemplates.days||0)"),"the period comes from the saved setting");
 assert.ok(/const lessonMsg=e=>\{const list=upcomingLessonsFor\(e\);if\(list\.length<2/.test(app),"a single lesson must keep the normal template");
 assert.ok(app.includes("fillWaTemplate(waTemplates.lesson,{day:dayName(e.date),time:timeText(e)})"));
 assert.ok(html.includes('id="waMultiTemplate"')&&html.includes('id="waMultiDays"')&&html.includes('id="waMultiPreview"'));
 assert.ok(/typeof x\.multi==="string"&&x\.multi\.trim\(\)\?x\.multi:WA_DEFAULTS\.multi/.test(app)&&/WA_DAYS_ALLOWED\.includes\(Number\(x\.days\)\)/.test(app),"old saved objects without the new fields must fall back to defaults");
});
test("manual prayer times override the automatic ones for every day and stay backward compatible (v1.86)",()=>{
 const app=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8"),html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
 for(const id of ["pManualOn","pmFajr","pmDhuhr","pmAsr","pmMaghrib","pmIsha","prayerEdit"])assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(app.includes("man=p.manual&&p.manual.on?p.manual:null")&&app.includes("man.fajr||base.fajr"),"a blank manual time falls back to the automatic time");
 assert.ok(/p\.manual=\{on:m\.on===true/.test(app),"settings saved before v1.86 (no manual key) must read as manual off");
 assert.ok(app.includes("manual:{on:$(\"pManualOn\").checked"),"manual times are saved inside the existing prayer settings (synced with the app data)");
});
test("the header car has a fixed width and height so Safari cannot flatten it (v1.87)",()=>{
 const css=fs.readFileSync(path.join(__dirname,"..","styles.css"),"utf8");
 assert.ok(css.includes(".brand .brandcar{width:96px;height:60px;aspect-ratio:480/298;object-fit:contain"));assert.ok(css.includes("@media(max-width:720px){.brand .brandcar{width:80px;height:50px}}"));
});
test("a calendar day without lessons shows one short line instead of the empty hour timeline (v1.88)",()=>{
 const app=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8");
 assert.ok(app.includes('lessonsOn(cal.day).length?dayTimeline(cal.day):\'<p class="tl-empty">No lessons on this day.</p>\''));
});
