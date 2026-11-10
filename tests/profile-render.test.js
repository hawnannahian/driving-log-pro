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
