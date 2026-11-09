"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const test=require("node:test"),assert=require("node:assert/strict");
const root=path.join(__dirname,"..");
const source=fs.readFileSync(path.join(root,"app.js"),"utf8");
const data=fs.readFileSync(path.join(root,"mawaqit-times.js"),"utf8");
const a=source.indexOf("function mawaqitDay(iso)"),b=source.indexOf("\nfunction agendaHTML",a);
assert.ok(a>=0&&b>a,"mawaqitDay/prayerBlocks must stay before agendaHTML");
const code=source.slice(a,b);
function load({minutes=30,withData=true,jumua="14:00"}={}){
 const ctx={window:{},prayerCfg:()=>({on:true,minutes,jumua,location:"lisbon",method:"mwl"}),cleanTime:x=>/^([01]\d|2[0-3]):[0-5]\d$/.test(String(x||""))?String(x):"",
  toMin:t=>{const[h,m]=t.split(":").map(Number);return h*60+m;},fromMin:m=>`${String(Math.floor((m+1440)%1440/60)).padStart(2,"0")}:${String((m+1440)%60).padStart(2,"0")}`,
  prayerDay:()=>({fajr:"05:41",duhr:"12:55",asr:"15:08",maghrib:"17:31",isha:"19:00"})};
 if(withData)vm.runInNewContext(data,ctx);
 vm.runInNewContext(code,ctx);return ctx;
}
test("data file has 12 months, valid rows and the mosque Friday time",()=>{const c=load(),m=c.window.MAWAQIT_TIMES;assert.equal(m.iqama.length,12);assert.equal(m.iqama.map(x=>x.length).join(","),"31,29,31,30,31,30,31,31,30,31,30,31");for(const mo of m.iqama)for(const r of mo)assert.match(r,/^(\d\d:\d\d ){4}\d\d:\d\d$/);assert.match(m.jumua,/^\d\d:\d\d$/);assert.equal(m.timezone,"Europe/Lisbon");});
test("a Monday uses mosque jamaat times and blocks jamaat..jamaat+minutes",()=>{const c=load({minutes:30}),bl=c.prayerBlocks("2026-11-09"),by=n=>bl.find(x=>x.name===n);assert.equal(bl.map(x=>x.name).join(","),"Fajr,Dhuhr,Asr,Maghrib,Isha");assert.equal(by("Fajr").start,"06:15");assert.equal(by("Fajr").end,"06:45");assert.equal(by("Fajr").prayerAt,"06:15");assert.equal(by("Dhuhr").start,"13:15");assert.equal(by("Asr").start,"16:15");assert.equal(by("Maghrib").start,"17:36");assert.equal(by("Isha").start,"21:00");assert.equal(by("Isha").end,"21:30");});
test("Friday replaces Dhuhr with the mosque Jumu'ah time, not the app setting",()=>{const c=load({jumua:"14:00"}),bl=c.prayerBlocks("2026-11-13");assert.ok(!bl.some(x=>x.name==="Dhuhr"));const j=bl.find(x=>x.name==="Jum'a");assert.equal(j.start,"13:30");assert.equal(j.end,"14:00");});
test("relative iqama entries (+15) were resolved to clock times",()=>{const m=load().window.MAWAQIT_TIMES;assert.equal(m.iqama[1][28],"06:15 14:00 17:15 18:39 20:15");});
test("without the data file the astronomical times and old block shape are used",()=>{const c=load({withData:false,minutes:15}),bl=c.prayerBlocks("2026-11-09"),f=bl.find(x=>x.name==="Fajr");assert.equal(f.start,"05:26");assert.equal(f.end,"05:41");assert.equal(f.prayerAt,"05:41");});
test("a date missing from the data falls back to the calculation",()=>{const c=load();assert.equal(c.mawaqitDay("2026-13-40"),null);assert.equal(c.mawaqitDay("2026-02-30"),null);assert.ok(c.mawaqitDay("2026-02-28"));});
test("prayer protection off returns no blocks",()=>{const c=load();c.prayerCfg=()=>({on:false,minutes:15,jumua:"14:00"});assert.equal(c.prayerBlocks("2026-11-09").length,0);});
