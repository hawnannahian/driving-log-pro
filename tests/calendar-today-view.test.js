const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8"),css=fs.readFileSync(__dirname+"/../styles.css","utf8");
test("v1.103: Day is the default Calendar view and the week strip exists",()=>{
  assert.match(app,/localStorage\.getItem\(DB_KEY\+"-calview"\):"day";/);
  assert.ok(html.includes('id="calStrip"'));assert.ok(html.includes('id="calLegend"'));
  assert.match(app,/\$\("calendar"\)\.dataset\.calview=v;renderCalStrip\(days,today\);/);
});
test("v1.103: day colours - course/package blue, due orange, holiday red - and no dot markers",()=>{
  const fn=app.match(/function calDayClass\(iso,L\)\{[^\n]*\}/)[0];
  const run=new Function("isCourseLesson","unpaidAmt","holidayOn",fn+";return calDayClass;");
  const cls=run(e=>!!e.course,e=>e.due||0,i=>i==="2026-11-01"?"All Saints":"");
  assert.strictEqual(cls("2026-11-05",[{course:"c"}])," course");
  assert.strictEqual(cls("2026-11-05",[{due:22}])," due");
  assert.strictEqual(cls("2026-11-01",[])," hol");
  assert.strictEqual(cls("2026-11-05",[{course:"c",due:10}])," course due");
  assert.strictEqual(cls("2026-11-05",[]),"");
  assert.ok(css.includes("#calendar .calcount:empty{display:none}"),"empty placeholder pills are hidden");
  const strip=app.slice(app.indexOf("function renderCalStrip"),app.indexOf("function renderCalendar"));
  assert.ok(!/<i[ >]/.test(strip),"no <i> dot elements in the strip");
});
test("v1.103: in Day view the timeline comes before the student list",()=>{
  assert.match(css,/#calendar\[data-calview="day"\]>#calTimeline\{order:6\}/);
  assert.match(css,/#calendar\[data-calview="day"\]>\.cal-students-panel\{order:7\}/);
});
test("v1.103: footer and Settings version match",()=>{
  const v=html.match(/Version (v[\d.]+)</)[1];assert.ok(html.includes("manager · "+v+"</span></footer>"));
});
