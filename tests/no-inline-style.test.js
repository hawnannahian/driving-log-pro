"use strict";
// CLAUDE.md section 7: the Content Security Policy (style-src 'self') blocks inline style="..." attributes, so generated markup must use classes or data attributes.
// v1.74 shipped <i style="width:${pct}%"> in the student profile overview; the browser blocked it and every course progress bar rendered full width.
const fs=require("node:fs"),path=require("node:path"),test=require("node:test"),assert=require("node:assert/strict");
for(const file of ["app.js","reports-dashboard.js","islamic.js","islamic-content.js","full-time-students.js","lesson-recovery.js","index.html"]){
 test(`${file} has no inline style attributes in markup`,()=>{
  const text=fs.readFileSync(path.join(__dirname,"..",file),"utf8");
  assert.equal(/\sstyle\s*=\s*(\\?["'`]|\$\{)/.test(text),false,`${file} must not contain style="..." (CSP blocks it)`);
 });
}
test("student profile course progress bars are sized by script from data-pct",()=>{
 const app=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8");
 assert.ok(app.includes('<i data-pct="${pct}"></i>'));assert.ok(app.includes('.profile-progress i[data-pct]'));
});
