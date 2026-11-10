"use strict";
// Regression tests for v1.63 Smart Lesson Time (Start/End/duration sync in the New/Edit record form). Synthetic values only.
// The real functions are cut out of app.js and run against a tiny fake DOM, so a change to their logic is caught here.
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const test=require("node:test"),assert=require("node:assert/strict");
const source=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8");
const cut=(from,to)=>{const a=source.indexOf(from),b=source.indexOf(to,a);assert.ok(a>=0&&b>a,`missing ${from}`);return source.slice(a,b);};
const code=[cut("let lessonLen=60","\nfunction syncDoneBox"),cut("function syncDur(){","\n$(\"fStart\")")].join("\n");
assert.match(source,/\$\("fStart"\)\.addEventListener\("change",\(\)=>\{if\(\$\("fStart"\)\.value\)applyLessonDuration\(\);else setLessonTimeError\(""\);syncDur\(\);\}\);/,"Start change handler must re-apply the duration");
function make(){
 const els={};const $=id=>els[id]||(els[id]={value:"",textContent:"",classList:{toggle(){},add(){},remove(){}}});
 const ctx={$,toMin:t=>{const[a,b]=t.split(":").map(Number);return a*60+b;},
  fromMin:m=>`${String(Math.floor((m+1440)%1440/60)).padStart(2,"0")}:${String((m+1440)%60).padStart(2,"0")}`,
  document:{querySelectorAll:()=>[]},updateRecordDurationSummary(){},refreshPrayerGuard(){},updateCourseField(){}};
 vm.createContext(ctx);vm.runInContext(code+";this.api={apply:applyLessonDuration,sync:syncDur,len:()=>lessonLen,setLen:v=>{lessonLen=v;}};",ctx);
 const api=ctx.api;
 return {$,api,err:()=>$("lessonTimeError").textContent,
  open(start,end){const d=start&&end?ctx.toMin(end)-ctx.toMin(start):0;api.setLen(d>0&&d<=720?d:60);$("fStart").value=start;$("fEnd").value=end;},
  setStart(v){$("fStart").value=v;if(v)api.apply();api.sync();},
  setEnd(v){$("fEnd").value=v;api.sync();},
  chip(m){if(!$("fStart").value)$("fStart").value="10:00";api.setLen(m);api.apply();api.sync();}};
}
test("new lesson defaults to 60 minutes: Start 10:00 moves End to 11:00",()=>{const f=make();f.open("10:00","11:00");f.setStart("14:30");assert.equal(f.$("fEnd").value,"15:30");assert.equal(f.err(),"");});
test("editing a saved 90-minute lesson keeps 90 minutes when Start changes",()=>{const f=make();f.open("09:00","10:30");assert.equal(f.api.len(),90);f.setStart("22:00");assert.equal(f.$("fEnd").value,"23:30");});
test("the reported bug: editing Start to 22:00 no longer leaves the old End",()=>{const f=make();f.open("09:00","10:00");f.setStart("22:00");assert.equal(f.$("fEnd").value,"23:00");assert.equal(f.err(),"");});
test("manual End edit recalculates duration and the next Start change preserves it",()=>{const f=make();f.open("10:00","11:00");f.setEnd("11:45");assert.equal(f.api.len(),105);f.setStart("13:00");assert.equal(f.$("fEnd").value,"14:45");});
test("duration chip sets End from Start and becomes the current duration",()=>{const f=make();f.open("10:00","11:00");f.chip(120);assert.equal(f.$("fEnd").value,"12:00");f.setStart("15:15");assert.equal(f.$("fEnd").value,"17:15");});
test("chip with empty Start uses 10:00",()=>{const f=make();f.open("","");f.chip(30);assert.equal(f.$("fStart").value,"10:00");assert.equal(f.$("fEnd").value,"10:30");});
test("midnight boundary: End exactly 23:59 is allowed",()=>{const f=make();f.open("10:00","10:59");f.setStart("23:00");assert.equal(f.$("fEnd").value,"23:59");assert.equal(f.err(),"");});
test("crossing midnight clears End with guidance instead of clamping to 23:59",()=>{const f=make();f.open("10:00","11:00");f.setStart("23:30");assert.equal(f.$("fEnd").value,"");assert.match(f.err(),/cross midnight/);});
test("after a midnight clear the previous duration is kept; an earlier Start restores End",()=>{const f=make();f.open("10:00","11:00");f.setStart("23:30");f.setStart("20:00");assert.equal(f.$("fEnd").value,"21:00");assert.equal(f.err(),"");});
test("End not after Start shows an error and does not change the duration",()=>{const f=make();f.open("10:00","11:00");f.setEnd("09:00");assert.match(f.err(),/later than start/);assert.equal(f.api.len(),60);});
test("lessons over 12 hours are flagged and do not become the duration",()=>{const f=make();f.open("06:00","07:00");f.setEnd("19:00");assert.match(f.err(),/12 hours/);assert.equal(f.api.len(),60);});
test("exactly 12 hours is accepted",()=>{const f=make();f.open("06:00","07:00");f.setEnd("18:00");assert.equal(f.err(),"");assert.equal(f.api.len(),720);});
test("clearing Start only clears the message and leaves End alone",()=>{const f=make();f.open("10:00","11:00");f.setStart("");assert.equal(f.err(),"");assert.equal(f.$("fEnd").value,"11:00");});
test("opening a saved record with an invalid span falls back to 60 minutes",()=>{const f=make();f.open("10:00","09:00");assert.equal(f.api.len(),60);f.open("06:00","19:00");assert.equal(f.api.len(),60);});
