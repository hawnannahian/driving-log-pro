const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8");
const src=app.slice(app.indexOf("function lessonsToConfirm"),app.indexOf("function renderConfirmLessons"));
test("v1.108: the completion rule itself is unchanged",()=>{
  assert.ok(app.includes('const isDone=e=>e.type==="Lesson"&&(e.done===true||(e.done!==false&&lessonEnded(e)));'));
});
test("v1.108: only ended, unconfirmed lessons of the last 3 days are asked; no top-level const (startup render must not hit a TDZ)",()=>{
  for(const p of ['e.type==="Lesson"',"e.done===undefined","e.date>=from","lessonEnded(e)","CONFIRM_DAYS=3"])assert.ok(src.includes(p),p);
  assert.ok(!/\nconst CONFIRM_DAYS/.test(app));
});
test("v1.108: Yes/No store the same fields as the lesson form and never touch confirmed lessons",()=>{
  const state={entries:[{id:"a",type:"Lesson",start:"10:00",end:"11:30"},{id:"b",type:"Lesson",start:"10:00",end:"11:00",actualMin:45},{id:"c",type:"Lesson",done:true,actualMin:30},{id:"x",type:"Fuel"}]};
  const f=new Function("state","schedMin",app.match(/function confirmLesson\(id,happened\)\{[^\n]*\}/)[0]+";return confirmLesson;")(state,e=>90);
  assert.strictEqual(f("a",true),true);assert.strictEqual(state.entries[0].done,true);assert.strictEqual(state.entries[0].actualMin,90);assert.ok(state.entries[0].completedAt);
  assert.strictEqual(f("b",false),true);assert.strictEqual(state.entries[1].done,false);assert.ok(!("actualMin" in state.entries[1]));
  assert.strictEqual(f("c",false),false);assert.strictEqual(state.entries[2].done,true);
  assert.strictEqual(f("x",true),false);assert.strictEqual(f("zz",true),false);
});
test("v1.108: No asks first and saves a safety copy; card markup has no inline style",()=>{
  const r=app.slice(app.indexOf("function renderConfirmLessons"));
  assert.match(r,/if\(!confirm\(/);assert.match(r,/keepCopy\("lesson-confirm"\)/);assert.ok(!/<[a-z][^>`]*\sstyle="/.test(r));
  assert.ok(html.includes('id="confirmLessons"'));
});
