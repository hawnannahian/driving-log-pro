const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8");
test("v1.97: Calendar Add lesson uses addLessonOnSelectedDay",()=>{
  assert.match(app,/\$\("calAddBtn"\)\.onclick=addLessonOnSelectedDay;/);
  assert.ok(!/\$\("calAddBtn"\)\.onclick=\(\)=>newRecord\(cal\.day\)/.test(app));
});
test("v1.97: prefill logic keeps 10:00 when free, skips past days, prefers a 60-minute slot",()=>{
  const fn=app.match(/function addLessonOnSelectedDay\(\)\{[^\n]*\}/)[0];
  assert.match(fn,/cal\.day<dateISO\(new Date\(\)\)\)return/);
  assert.match(fn,/slots\.some\(\(\[a,b\]\)=>a<=600&&b>=660\)\)return/);
  assert.match(fn,/b-a>=60\)\|\|slots\[0\]/);
  const run=(slots,today,day)=>{const f={};const $=id=>f[id]||(f[id]={});const f2=new Function("cal","dateISO","newRecord","freeSlots","$","fromMin","syncDur",fn+";return addLessonOnSelectedDay;");
    const fm=m=>String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");f2({day},()=>today,()=>{},()=>slots,$,fm,()=>{})();return [$("fStart").value,$("fEnd").value];};
  assert.deepStrictEqual(run([[480,600],[690,780]],"2026-11-12","2026-11-13"),["08:00","09:00"]);
  assert.deepStrictEqual(run([[480,510],[690,780]],"2026-11-12","2026-11-13"),["11:30","12:30"]);
  assert.deepStrictEqual(run([[480,1320]],"2026-11-12","2026-11-13"),[undefined,undefined]);
  assert.deepStrictEqual(run([[1275,1320]],"2026-11-12","2026-11-13"),["21:15","22:00"]);
  assert.deepStrictEqual(run([[690,780]],"2026-11-12","2026-11-11"),[undefined,undefined]);
});
