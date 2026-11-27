import http from "node:http";import fs from "node:fs";import path from "node:path";import {createRequire} from "node:module";import crypto from "node:crypto";
const require=createRequire(process.cwd()+"/");const {chromium}=require("playwright");
const root=process.cwd(),cssFile=process.argv[2],outJson=process.argv[3];
const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".webmanifest":"application/manifest+json",".png":"image/png",".svg":"image/svg+xml",".mp3":"audio/mpeg"};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split("?")[0]);if(p==="/")p="/index.html";let f=path.join(root,p);if(p==="/styles.css")f=cssFile;if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}res.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r));const port=server.address().port;
const seed=()=>{const d=n=>{const x=new Date("2026-11-20T12:00:00Z");x.setDate(x.getDate()-n);return x.toISOString().slice(0,10)};const names=["Student Alpha","Student Beta","Student Gamma","Delta With A Long Name"];const entries=[];
 names.forEach((n,i)=>{for(let k=0;k<3;k++)entries.push({id:`e${i}_${k}`,type:"Lesson",date:d(k-1),student:n,start:`1${k}:00`,end:`1${k+1}:00`,rate:20,done:k>0,paid:i===0})});
 for(let i=0;i<3;i++)entries.push({id:`f${i}`,type:"Fuel",date:d(i*2),cost:40,km:1000+i*150,litres:18.8});entries.push({id:"x1",type:"Expense",date:d(1),cost:25});
 localStorage.setItem("driving-log-pro-v1",JSON.stringify({entries,students:names.map((n,i)=>({id:`s${i}`,name:n,phone:`+3519100000${i}`,rate:20})),courses:[{id:"c1",student:"Student Alpha",name:"Course",date:d(5),hours:10,price:200}],coursePayments:[{id:"p1",course:"c1",date:d(5),amount:100}]}));};
const browser=await chromium.launch();const out={};
for(const [w,h] of [[390,844],[320,568]]){
 const ctx=await browser.newContext({viewport:{width:w,height:h},reducedMotion:"reduce"});await ctx.addInitScript(()=>{const OD=Date;const fixed=new OD("2026-11-20T12:00:00Z").getTime();globalThis.Date=class extends OD{constructor(...a){if(a.length)super(...a);else super(fixed);}static now(){return fixed;}};});
 const page=await ctx.newPage();await page.addInitScript(seed);
 await page.goto(`http://localhost:${port}/index.html`);await page.waitForTimeout(900);
 const snap=async name=>{await page.waitForTimeout(250);const buf=await page.screenshot();out[`${w}/${name}`]=crypto.createHash("sha1").update(buf).digest("hex");};
 const go=t=>page.evaluate(t=>document.querySelector(`.tab[data-tab="${t}"]`).click(),t);
 for(const t of ["overview","calendar","log","students","reports","islamic"]){await go(t);await snap("tab-"+t);}
 await go("reports");for(const v of ["summary","fuel","students","data"]){await page.click(`[data-rview-go="${v}"]`);await snap("rep-"+v);}
 await page.evaluate(()=>document.getElementById("finToggle")?.click());await snap("rep-fin-open");await page.click('[data-rview-go="summary"]');
 await go("students");await page.evaluate(()=>openProfile("s0"));await snap("profile");
 for(const t of ["lessons","course","payments","overview"]){await page.evaluate(t=>document.querySelector(`[data-ptab="${t}"]`).click(),t);await snap("ptab-"+t);}
 await page.click("#profileMore");await snap("profile-sheet");await page.click("#profileSheet .psheet-cancel");
 await page.evaluate(()=>startReceive());await snap("receive");await page.evaluate(()=>document.getElementById("receiveDialog").close());
 await page.evaluate(()=>document.getElementById("profileDialog").close());
 await page.evaluate(()=>openStudent("s0"));await snap("student-edit");await page.evaluate(()=>document.getElementById("studentDialog").close());
 await page.evaluate(()=>newStudent());await snap("student-new");await page.evaluate(()=>document.getElementById("studentDialog").close());
 await page.evaluate(()=>newRecord());await snap("record-new-lesson");await page.evaluate(()=>document.getElementById("recordDialog").close());
 await go("log");await page.click("#addRecordBtn");await snap("expense-new");await page.click('#typeChips [data-type="Fuel"]');await snap("expense-fuel");await page.evaluate(()=>document.getElementById("recordDialog").close());
 await page.evaluate(()=>{const e=state.entries.find(x=>x.type==="Lesson");openRecord(e.id);});await snap("record-edit-lesson");await page.evaluate(()=>document.getElementById("recordDialog").close());
 await page.evaluate(()=>document.getElementById("hdrSettings").click());await snap("settings-menu");
 for(const v of ["prayer","work","voice","wa"]){await page.evaluate(v=>{try{setSettingsView(v)}catch{}},v);await snap("settings-"+v);}
 await page.evaluate(()=>document.getElementById("hdrSettings").click());
 await go("calendar");for(const b of ["calMonthBtn","calWeekBtn"]){await page.evaluate(b=>document.getElementById(b)?.click(),b);await snap("cal-"+b);}
 await go("islamic");for(const v of ["tasbih","qibla","duas"]){await page.evaluate(v=>document.querySelector(`[data-isview="${v}"]`)?.click(),v);await snap("is-"+v);}
 await ctx.close();}
await browser.close();server.close();fs.writeFileSync(outJson,JSON.stringify(out,null,1));console.log(Object.keys(out).length,"screens");
