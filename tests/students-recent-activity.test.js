const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8");
test("v1.101: Recent activity is the first and default Students sort",()=>{
  assert.match(html,/<select id="studentSort"[^>]*><option value="activity">Recent activity<\/option><option value="joined">Recently joined<\/option>/);
  assert.match(app,/sort=\$\("studentSort"\)\?\.value\|\|"activity"/);
  assert.match(app,/students\.sort\(by\[sort\]\|\|by\.activity\)/);
});
test("v1.101: recents live in their own device key, not in the app data",()=>{
  assert.match(app,/const RECENT_KEY=DB_KEY\+"-recent-students"/);
  const fn=app.match(/function noteStudentOpened\(id\)\{[^\n]*\}/)[0];
  assert.ok(fn.includes("localStorage.setItem(RECENT_KEY"));assert.ok(!/state\.|save\(\)/.test(fn),"must not touch app data or trigger a save/sync");
});
test("v1.101: activity = later of last opened and last completed lesson",()=>{
  const helpers=app.slice(app.indexOf("const RECENT_KEY"));
  const store={};const localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v);}};
  const run=new Function("localStorage","DB_KEY","lessonsOf","isDone",helpers.split("\n$(\"profileDialog\")")[0]+";return {noteStudentOpened,studentActivity,lastCompletedTs,recentStudents};");
  const lessons={Anna:[{date:"2026-11-01",end:"11:00",done:true}],Bruno:[{date:"2026-11-10",end:"11:00",done:true},{date:"2026-11-20",end:"11:00",done:false}]};
  const api=run(localStorage,"k",n=>lessons[n]||[],e=>e.done===true);
  const A={id:"a",name:"Anna"},B={id:"b",name:"Bruno"};
  assert.ok(api.studentActivity(B)>api.studentActivity(A),"completed 10 Nov beats 1 Nov; not-completed lesson is ignored");
  assert.strictEqual(api.lastCompletedTs(B),Date.parse("2026-11-10T11:00:00"));
  api.noteStudentOpened("a");assert.ok(api.studentActivity(A)>api.studentActivity(B),"opening Anna now makes her most recent");
  for(let i=0;i<60;i++)api.noteStudentOpened("x"+i);assert.ok(api.recentStudents().length<=40,"list is capped");
  store["k-recent-students"]="not json";assert.deepStrictEqual(api.recentStudents(),[],"a damaged value is ignored");
});
test("v1.101: footer and Settings version match",()=>{
  const v=html.match(/Version (v[\d.]+)</)[1];assert.ok(html.includes("manager · "+v+"</span></footer>"));
});
