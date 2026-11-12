const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const src=fs.readFileSync(__dirname+"/../reports-dashboard.js","utf8");
const fn=src.match(/function dashCollected\(p,v\)\{[\s\S]*?return dashRound\(c\);\}/)[0];
test("v1.96: Collected includes retained receipts of lessons still in a course, by receipt date",()=>{
  assert.match(fn,/Number\(e\.courseTransferPaid\)>0&&isCourseLesson\(e\)&&inSel\(e\.courseTransferDate\|\|e\.date\|\|"",p,v\)/);
});
test("v1.96: behaviour with synthetic records",()=>{
  const state={entries:[
    {id:"a",type:"Lesson",date:"2026-11-03",course:"c1",courseTransferPaid:20,courseTransferDate:"2026-11-03"},
    {id:"b",type:"Lesson",date:"2026-10-03",course:"c1",courseTransferPaid:15,courseTransferDate:"2026-10-03"},
    {id:"c",type:"Lesson",date:"2026-11-04",course:"gone",paid:true,courseTransferPaid:20,courseTransferDate:"2026-11-04"}]};
  const run=new Function("state","isDone","isCourseLesson","inSel","rateOf","income","courses","coursePays","pkgs","dashRound",fn+";return dashCollected;");
  const col=run(state,e=>true,e=>e.course==="c1",(d,p,v)=>d.startsWith(v),()=>0,()=>20,()=>[],()=>[],()=>[],n=>Math.round(n*100)/100);
  assert.strictEqual(col("month","2026-11"),40); // 20 receipt (still in course) + 20 orphan paid lesson counted once by the paid-lesson line
  assert.strictEqual(col("month","2026-10"),15);
});
