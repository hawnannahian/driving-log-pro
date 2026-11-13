const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8");
test("v1.99: Receive payment button and dialog exist with the expected ids",()=>{
  for(const id of ["profileReceive","receiveDialog","receiveForm","receiveAmount","receiveRate","receiveDate","receiveLessonList","receivePreview","receiveError"])assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(!/<[^>]+ style="/.test(html.match(/<dialog id="receiveDialog"[\s\S]*?<\/dialog>/)[0]),"no inline style");
});
test("v1.99: it reuses the course ledger - no new top-level data",()=>{
  const code=app.slice(app.indexOf("// v1.99 — Receive payment"));
  assert.match(code,/state\.courses=\[\.\.\.courses\(\),c\]/);
  assert.match(code,/state\.coursePayments=\[/);
  assert.ok(!/state\.(?!courses|coursePayments)[a-zA-Z]+\s*=\s*\[/.test(code.replace(/state\.entries\.filter/g,"")),"must not create other state arrays");
  assert.match(code,/keepCopy\("receive-payment"\)/);
  assert.match(app,/\["before-receive-payment","Before a payment was received"\]/);
});
test("v1.99: only scheduled, unpaid, unlinked lessons of the same student can be covered",()=>{
  const code=app.slice(app.indexOf("const receiveEligible"),app.indexOf("const receiveHours"));
  for(const part of ["sameName(e.student,s.name)","!isDone(e)","e.done!==false","!e.course","!e.pkg","!e.paid"])assert.ok(code.includes(part),part);
});
test("v1.99: hours = amount / price per hour, and ticked lessons may not exceed them",()=>{
  assert.match(app,/round4\(amount\/rate\)/);
  assert.match(app,/need>total\+\.001/);
  assert.match(app,/chosen\.forEach\(e=>\{e\.course=c\.id;delete e\.courseAlloc;\}\)/);
});
test("v1.99: footer and Settings version match",()=>{
  const v=html.match(/Version (v[\d.]+)</)[1];assert.ok(html.includes("manager · "+v+"</span></footer>"));
});
