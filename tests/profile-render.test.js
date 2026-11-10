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
