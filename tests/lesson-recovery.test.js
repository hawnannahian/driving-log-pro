"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const test=require("node:test"),assert=require("node:assert/strict");
const source=fs.readFileSync(path.join(__dirname,"..","lesson-recovery.js"),"utf8");
function api(){const ctx={crypto:{randomUUID:(()=>{let n=0;return()=>"event-"+(++n);})()}};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(source,ctx);return ctx.DrivingLogRecovery;}
const lesson=(id="lesson-1")=>({id,type:"Lesson",student:"Synthetic Student",date:"2026-11-01",start:"10:00",end:"11:00",paid:true,course:"course-1"});
const at=day=>new Date(day+"T12:00:00.000Z").toISOString();
test("soft delete stores the original lesson, removes it from active entries and appends audit",()=>{
 const R=api(),data={entries:[lesson()],students:[]};assert.equal(R.recordDelete(data,data.entries[0],at("2026-11-02"),"Owner"),true);data.entries=data.entries.filter(x=>x.id!=="lesson-1");
 assert.equal(data.entries.length,0);assert.equal(data.lessonRecovery[0].lesson.student,"Synthetic Student");assert.equal(data.lessonRecovery[0].status,"deleted");assert.equal(data.lessonAudit.length,1);assert.equal(data.lessonAudit[0].action,"deleted");
});
test("a deleted lesson can be restored once and creates a second immutable event",()=>{
 const R=api(),data={entries:[],students:[]};R.recordDelete(data,lesson(),at("2026-11-02"));const result=R.restore(data,"lesson-1",at("2026-11-03"));
 assert.equal(result.ok,true);assert.equal(data.entries.length,1);assert.equal(data.lessonRecovery[0].status,"restored");assert.equal(data.lessonAudit.length,2);assert.equal(data.lessonAudit[1].action,"restored");
 assert.equal(R.restore(data,"lesson-1",at("2026-11-04")).ok,false);
});
test("deleted lesson remains recoverable before 30 days and expires at 30 days",()=>{
 const R=api(),data={entries:[]};R.recordDelete(data,lesson(),at("2026-11-01"));
 assert.equal(R.deleted(data,at("2026-11-30")).length,1);
 assert.equal(R.cleanup(data,at("2026-12-01")),1);
 assert.equal(data.lessonRecovery[0].lesson,null);assert.equal(data.lessonRecovery[0].status,"deleted");assert.equal(data.lessonAudit.at(-1).action,"expired");
 assert.equal(R.deleted(data,at("2026-12-02")).length,0);
});
test("cloud merge never resurrects a deleted lesson from a stale device",()=>{
 const R=api(),l=lesson(),base={entries:[l],lessonRecovery:[],lessonAudit:[]},local={entries:[],lessonRecovery:[],lessonAudit:[]},remote={entries:[l],lessonRecovery:[],lessonAudit:[]};
 R.recordDelete(local,l,at("2026-11-02"));const mergeList=(b,a,c)=>{const m=new Map([...a,...c].map(x=>[x.id,x]));return [...m.values()];};
 const merged=R.merge(base,local,remote,mergeList);assert.equal(merged.entries.length,0);assert.equal(merged.lessonRecovery[0].status,"deleted");
});
test("a newer restore wins over a stale cloud deletion and returns the lesson",()=>{
 const R=api(),l=lesson(),deleted={id:l.id,lesson:l,status:"deleted",deletedAt:at("2026-11-02"),updatedAt:at("2026-11-02")},restored={...deleted,status:"restored",restoredAt:at("2026-11-03"),updatedAt:at("2026-11-03")};
 const merged=R.merge({entries:[l],lessonRecovery:[],lessonAudit:[]},{entries:[l],lessonRecovery:[restored],lessonAudit:[]},{entries:[],lessonRecovery:[deleted],lessonAudit:[]},(b,a,c)=>{const m=new Map([...a,...c].map(x=>[x.id,x]));return [...m.values()];});
 assert.equal(merged.lessonRecovery[0].status,"restored");assert.equal(merged.entries.length,1);assert.equal(merged.entries[0].id,l.id);
});
test("audit merge unions immutable events from both devices without dropping either",()=>{
 const R=api(),a={id:"a",lessonId:"l",action:"deleted",at:at("2026-11-02")},b={id:"b",lessonId:"l",action:"restored",at:at("2026-11-03")};
 const merged=R.merge({}, {entries:[],lessonRecovery:[],lessonAudit:[a]}, {entries:[],lessonRecovery:[],lessonAudit:[b]},(base,left,right)=>[...new Map([...left,...right].map(x=>[x.id,x])).values()]);
 assert.equal(Array.from(merged.lessonAudit,x=>x.id).sort().join(","),"a,b");
});
test("append-only audit events survive when an older sync client omits the audit array",()=>{
 const R=api(),event={id:"historic",lessonId:"l",action:"deleted",at:at("2026-11-02")};
 const merged=R.merge({entries:[],lessonRecovery:[],lessonAudit:[event]},{entries:[],lessonRecovery:[],lessonAudit:[event]},{entries:[],lessonRecovery:[],lessonAudit:[]},(base,left,right)=>{const m=new Map([...left,...right].map(x=>[x.id,x]));return [...m.values()];});
 assert.equal(merged.lessonAudit.length,1);assert.equal(merged.lessonAudit[0].id,"historic");
});
test("legacy backups without recovery fields remain valid optional input",()=>{
 const R=api();assert.equal(R.validateRecovery(undefined),true);assert.equal(R.validateAudit(undefined),true);
 assert.equal(R.validateRecovery([{id:"x",status:"deleted",updatedAt:at("2026-11-02"),lesson:lesson("x")}]),true);
 assert.equal(R.validateAudit([{id:"e",lessonId:"x",action:"deleted",at:at("2026-11-02")}]),true);
 assert.equal(R.validateRecovery([{id:"x",status:"unknown",updatedAt:"x",lesson:null}]),false);
});
test("restoring a whole backup re-activates lessons the device had soft-deleted, so the restore sticks",()=>{
 const R=api(),local={entries:[],students:[]},l=lesson("x");R.recordDelete(local,l,at("2026-11-02"));
 assert.equal(R.adopt(local,[l],at("2026-11-05"),"Backup restore"),1);
 assert.equal(local.lessonRecovery[0].status,"restored");assert.equal(local.lessonAudit.at(-1).action,"restored");
 const merged=R.merge({}, {entries:[],lessonRecovery:local.lessonRecovery,lessonAudit:local.lessonAudit},{entries:[l],lessonRecovery:[],lessonAudit:[]},(b,a,c)=>[...new Map([...a,...c].map(x=>[x.id,x])).values()]);
 assert.equal(merged.entries.length,1);
 // the stale cloud delete (older) cannot undo it
 const stale={id:"x",lesson:l,status:"deleted",deletedAt:at("2026-11-02"),updatedAt:at("2026-11-02")};
 const after=R.merge(merged,{entries:merged.entries,lessonRecovery:merged.lessonRecovery,lessonAudit:merged.lessonAudit},{entries:[],lessonRecovery:[stale],lessonAudit:[]},(b,a,c)=>[...new Map([...a,...c].map(x=>[x.id,x])).values()]);
 assert.equal(after.entries.length,1);assert.equal(after.lessonRecovery[0].status,"restored");
});
test("an old backup does not erase existing local recovery history or audit events",()=>{
 const R=api(),local={entries:[],students:[]};R.recordDelete(local,lesson("a"),at("2026-11-02"));
 const keepRows=local.lessonRecovery.length,keepAudit=local.lessonAudit.length;
 R.adopt(local,[lesson("other")],at("2026-11-05"));
 assert.equal(local.lessonRecovery.length,keepRows);assert.equal(local.lessonAudit.length,keepAudit);assert.equal(local.lessonRecovery[0].status,"deleted");
});
test("a purged (expired) lesson cannot be restored from the Deleted lessons list",()=>{
 const R=api(),data={entries:[]};R.recordDelete(data,lesson(),at("2026-11-01"));R.cleanup(data,at("2026-12-05"));
 assert.equal(R.restore(data,"lesson-1",at("2026-12-06")).ok,false);assert.equal(data.entries.length,0);
});
test("restore never creates a duplicate lesson id",()=>{
 const R=api(),data={entries:[lesson()]};R.recordDelete(data,lesson(),at("2026-11-02"));R.restore(data,"lesson-1",at("2026-11-03"));
 assert.equal(data.entries.filter(x=>x.id==="lesson-1").length,1);
});
test("merging the same audit events twice never duplicates them",()=>{
 const R=api(),ev={id:"e1",lessonId:"l",action:"deleted",at:at("2026-11-02")},side={entries:[],lessonRecovery:[],lessonAudit:[ev]};
 const m=R.merge(side,side,side,(b,a,c)=>[...new Map([...a,...c].map(x=>[x.id,x])).values()]);assert.equal(m.lessonAudit.length,1);
});
test("the recovery module never touches the Full-Time register",()=>{
 assert.ok(!/fullTime|DrivingLogFullTime|full-time/i.test(source.replace(/\/\*[\s\S]*?\*\//,"")),"lesson-recovery.js must stay isolated from Full-Time Students");
 const R=api(),data={entries:[],students:[],fullTime:[{legacy_student_id:"ft-1",name:"Synthetic Full-Time"}]};R.recordDelete(data,lesson(),at("2026-11-02"));R.restore(data,"lesson-1",at("2026-11-03"));R.cleanup(data,at("2027-01-01"));
 assert.deepEqual(JSON.parse(JSON.stringify(data.fullTime)),[{legacy_student_id:"ft-1",name:"Synthetic Full-Time"}]);
});
test("the app keeps the storage keys and loads the module offline",()=>{
 const app=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8"),sw=fs.readFileSync(path.join(__dirname,"..","sw.js"),"utf8"),html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
 assert.match(app,/DB_KEY\s*=\s*"driving-log-pro-v1"/);assert.ok(fs.readFileSync(path.join(__dirname,"..","full-time-students.js"),"utf8").includes("driving-log-pro-full-time-v1"));
 assert.ok(sw.includes('"./lesson-recovery.js"'),"service worker must cache lesson-recovery.js");assert.ok(html.includes('src="lesson-recovery.js"'));
});
