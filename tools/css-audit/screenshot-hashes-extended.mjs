import http from "node:http";import fs from "node:fs";import path from "node:path";import {createRequire} from "node:module";import crypto from "node:crypto";
const require=createRequire(process.cwd()+"/");const {chromium}=require("playwright");
const root=process.cwd(),cssFile=process.argv[2],outJson=process.argv[3];
const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".webmanifest":"application/manifest+json",".png":"image/png",".svg":"image/svg+xml",".mp3":"audio/mpeg"};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split("?")[0]);if(p==="/")p="/index.html";let f=path.join(root,p);if(p==="/styles.css")f=cssFile;if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}res.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r));const port=server.address().port;
const seedFull=()=>{const d=n=>{const x=new Date("2026-11-20T12:00:00Z");x.setDate(x.getDate()-n);return x.toISOString().slice(0,10)};const names=["Student Alpha","Student Beta","Student Gamma","Delta With A Long Name"];const entries=[];
 names.forEach((n,i)=>{for(let k=0;k<3;k++)entries.push({id:`e${i}_${k}`,type:"Lesson",date:d(k-1),student:n,start:`1${k}:00`,end:`1${k+1}:00`,rate:20,done:k>0,paid:i===0,course:i===0&&k===0?"c1":undefined})});
 entries.push({id:"un",type:"Lesson",date:d(0),student:"Student Beta",start:"15:00",end:"17:00",rate:20});
 for(let i=0;i<3;i++)entries.push({id:`f${i}`,type:"Fuel",date:d(i*2),cost:40,km:1000+i*150,litres:18.8});entries.push({id:"x1",type:"Expense",date:d(1),cost:25});
 localStorage.setItem("driving-log-pro-v1",JSON.stringify({entries,students:names.map((n,i)=>({id:`s${i}`,name:n,phone:`+3519100000${i}`,rate:20})),courses:[{id:"c1",student:"Student Alpha",name:"Course",date:d(5),hours:10,price:200}],coursePayments:[{id:"p1",course:"c1",date:d(5),amount:100}]}));};
const seedEmpty=()=>{localStorage.setItem("driving-log-pro-v1",JSON.stringify({entries:[],students:[],courses:[],coursePayments:[]}));};
const browser=await chromium.launch();const out={},issues=[];
const fixDate=()=>{const OD=Date;const fixed=new OD("2026-11-20T12:00:00Z").getTime();globalThis.Date=class extends OD{constructor(...a){if(a.length)super(...a);else super(fixed);}static now(){return fixed;}};};
for(const [w,h] of [[390,844],[320,568],[768,1024],[1024,768]]){
 for(const mode of ["full","empty"]){
  const ctx=await browser.newContext({viewport:{width:w,height:h},reducedMotion:"reduce"});await ctx.addInitScript(fixDate);
  const page=await ctx.newPage();await page.addInitScript(mode==="full"?seedFull:seedEmpty);
  await page.goto(`http://localhost:${port}/index.html`);await page.waitForTimeout(800);
  const K=`${w}/${mode}/`;const snap=async name=>{await page.waitForTimeout(220);out[K+name]=crypto.createHash("sha1").update(await page.screenshot()).digest("hex");};
  const go=t=>page.evaluate(t=>document.querySelector(`.tab[data-tab="${t}"]`).click(),t);
  const closeAll=()=>page.evaluate(()=>document.querySelectorAll("dialog[open]").forEach(d=>d.close()));
  for(const t of ["overview","calendar","log","students","reports","islamic"]){await go(t);await snap("tab-"+t);}
  // closed dialogs must be hidden
  const bad=await page.evaluate(()=>[...document.querySelectorAll("dialog")].filter(d=>!d.open&&getComputedStyle(d).display!=="none").map(d=>d.id));if(bad.length)issues.push(`${K} closed dialogs visible: ${bad}`);
  await go("reports");for(const v of ["summary","fuel","students","data"]){await page.click(`[data-rview-go="${v}"]`);await snap("rep-"+v);}
  await page.click('[data-rview-go="data"]');for(const c of ["backupCard","importCard","cloudCard","kmCard","lessonRecoveryCard","lessonAuditCard"]){await page.evaluate(c=>{try{openDataCard(c,true)}catch{}},c);await snap("data-"+c);}
  await page.evaluate(()=>document.getElementById("finToggle")?.click());await snap("rep-fin-open");await page.click('[data-rview-go="summary"]');
  await page.emulateMedia({media:"print"});await snap("print-reports");await page.emulateMedia({media:"screen"});
  await page.emulateMedia({colorScheme:"dark"});await go("overview");await snap("dark-overview");await page.emulateMedia({colorScheme:"light"});
  if(mode==="full"){
   await go("students");await page.evaluate(()=>openProfile("s0"));await snap("profile");for(const t of ["lessons","course","payments","overview"]){await page.evaluate(t=>document.querySelector(`[data-ptab="${t}"]`).click(),t);await snap("ptab-"+t);}
   await page.click("#profileMore");await snap("profile-sheet");await page.click("#profileSheet .psheet-cancel");
   await page.evaluate(()=>startReceive());await snap("receive");await page.fill("#receiveAmount","150");await snap("receive-over");await closeAll();
   await page.evaluate(()=>openStudent("s0"));await snap("student-edit");await page.evaluate(()=>{document.getElementById("studentError").textContent="Another student already has this name.";});await snap("student-error");await closeAll();
   await page.evaluate(()=>openDone("e0_1"));await snap("done-dialog");await closeAll();
   await page.evaluate(()=>openQuick("e0_1"));await snap("quick-dialog");await closeAll();
   await page.evaluate(()=>newRecord());await snap("record-new");await page.evaluate(()=>{document.getElementById("recordError").textContent="Check the times: a lesson needs a start and an end.";});await snap("record-error");await closeAll();
   await page.evaluate(()=>openRecord("e0_0"));await snap("record-edit-course");await closeAll();
   await page.evaluate(()=>openRecord("un"));await snap("record-edit-upcoming");await closeAll();
   await go("log");await page.click("#addRecordBtn");await snap("expense-new");for(const t of ["Fuel","Insurance","Repair","Refund"]){await page.click(`#typeChips [data-type="${t}"]`);await snap("expense-"+t);}await closeAll();
   await page.evaluate(()=>startLessonTimer("un"));await go("overview");await snap("timer-overview");await go("calendar");await snap("timer-mini-calendar");
   await page.evaluate(()=>{try{stopTimer?.()}catch{}});
   await go("calendar");for(const b of ["calMonthBtn","calWeekBtn","calDayBtn"]){await page.evaluate(b=>document.getElementById(b)?.click(),b);await snap("cal-"+b);}
   await go("log");for(const f of ["all","Lesson","expense","paid","unpaid","prepaid"]){await page.selectOption("#logFilter",f).catch(()=>{});await snap("logfilter-"+f);}
   await go("students");await page.fill("#studentSearch","zzzz").catch(()=>{});await snap("students-none");
   await go("islamic");for(const v of ["duas","tasbih","qibla"]){await page.evaluate(v=>document.querySelector(`[data-isview="${v}"]`)?.click(),v);await snap("is-"+v);}
   await go("overview");await page.keyboard.press("Tab");await page.keyboard.press("Tab");await page.keyboard.press("Tab");await snap("focus-overview");
  }
  await ctx.close();}}
await browser.close();server.close();fs.writeFileSync(outJson,JSON.stringify({out,issues},null,1));console.log(Object.keys(out).length,"screens;",issues.length,"issues",issues);
