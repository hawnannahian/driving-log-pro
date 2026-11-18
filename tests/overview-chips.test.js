const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8"),css=fs.readFileSync(__dirname+"/../styles.css","utf8");
test("v1.131: Next Day is one expandable row that still holds the real list (#nextDayList)",()=>{
  assert.match(html,/<details class="nextday empty" id="nextDayBox"><summary>.*<b id="nextDayTitle">.*<small id="nextDayCount">.*<\/summary><div id="nextDayList"/);
  assert.match(app,/\$\("nextDayBox"\)\.classList\.toggle\("empty",!tomorrows\.length\)/);
});
test("v1.131: status chips are colour + icon, exceptions only, and follow the timer",()=>{
  assert.match(app,/function statusChip\(e,ls,fin\)\{if\(timer&&timer\.lessonId===e\.id\)return `<span class="tstat run">/);
  assert.equal((app.match(/\$\{statusChip\(e,ls,fin\)\}/g)||[]).length,2,"Today and Next Day rows both use it");
  assert.match(css,/#overview #todayList \.tstat\.course,#overview #todayList \.tstat\.pkg/,"the default Course chip stays hidden");
  assert.match(app,/render\(\);bindRecords\(\);sessFinishing=false;/,"starting a timer refreshes the Today chips");
});
