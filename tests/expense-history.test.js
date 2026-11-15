const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const read=f=>fs.readFileSync(__dirname+"/../"+f,"utf8");
const html=read("index.html"),app=read("app.js"),css=read("styles.css");
test("v1.106: expense dialog has an expense history section inside the form grid",()=>{
  assert.match(html,/id="expenseHistory"/);assert.match(html,/id="expenseHistoryList"/);assert.match(html,/id="expenseHistoryMore"/);
  assert.ok(html.indexOf('id="expenseHistory"')<html.indexOf('id="recordError"'));
});
test("v1.106: history lists non-lesson, non-note records newest first and is read-only",()=>{
  assert.match(app,/function renderExpenseHistory\(\)/);
  assert.match(app,/e\.type!=="Lesson"&&e\.type!=="Note"\)\.sort\(\(a,b\)=>String\(b\.date\)\.localeCompare\(String\(a\.date\)\)\)/);
  assert.match(app,/updateCourseField\(\);syncBookingModeUI\(\);renderExpenseHistory\(\);\}/);
  assert.doesNotMatch(app.match(/function renderExpenseHistory[^\n]*/)[0],/state\.entries\.(push|splice)|save\(\)/);
});
test("v1.106: no inline styles and closed-dialog safeguard kept",()=>{
  assert.doesNotMatch(html.match(/<section class="expense-history[^>]*>/)[0],/style=/);
  assert.match(css,/#recordDialog \.expense-history\.hidden\{display:none\}/);
});
test("v1.106: footer and Settings version match",()=>{
  const v=html.match(/Version (v[\d.]+)</)[1];assert.ok(html.includes("manager · "+v+"</span></footer>"));
});
