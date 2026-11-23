const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8");
test("v1.196: a student's rate pre-fills only NEW lessons and only until the owner types a rate",()=>{
  const fn=app.slice(app.indexOf("function prefillStudentRate"),app.indexOf("$(\"fRate\").addEventListener(\"input\",()=>{rateTouched=true;})"));
  assert.match(fn,/\$\("recordId"\)\.value\|\|\$\("recordDialog"\)\.dataset\.editingLesson==="true"\|\|rateTouched\)return/);
  assert.match(fn,/Number\(s\.rate\)>0/);
  assert.match(app,/function newRecord\(day,student\)\{rateTouched=false;/);
  assert.match(app,/prefillStudentRate\(\);updateCourseField\(\);\}/);
});
test("v1.196: the student form explains the rate is for new lessons only",()=>{
  assert.ok(html.includes("Starting rate for new lessons. Lessons and courses already saved keep their own rate."));
});
