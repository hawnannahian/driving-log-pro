// Browser smoke test (real Chromium). Run: node tests/browser/smoke.mjs
// Uses only synthetic data. Fails (exit 1) on any uncaught page error, console error, or horizontal overflow
// at 390x844 and 320x568 while opening all six tabs, the Reports sub-tabs and the main dialogs.
import http from "node:http";import fs from "node:fs";import path from "node:path";import {createRequire} from "node:module";
const require=createRequire(import.meta.url);const {chromium}=require("playwright");
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),"../..");
const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".webmanifest":"application/manifest+json",".png":"image/png",".svg":"image/svg+xml",".mp3":"audio/mpeg"};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split("?")[0]);if(p==="/")p="/index.html";const f=path.join(root,p);if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}res.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r));const port=server.address().port;
const seed=()=>{const d=n=>{const x=new Date();x.setDate(x.getDate()-n);return x.toISOString().slice(0,10)};const names=["Student Alpha","Student Beta","Student Gamma"];const entries=[];
 names.forEach((n,i)=>{for(let k=0;k<3;k++)entries.push({id:`e${i}_${k}`,type:"Lesson",date:d(k-1),student:n,start:`1${k}:00`,end:`1${k+1}:00`,rate:20,done:k>0,paid:i===0})});
 for(let i=0;i<3;i++)entries.push({id:`f${i}`,type:"Fuel",date:d(i*2),cost:40,km:1000+i*150,litres:18.8});entries.push({id:"x1",type:"Expense",date:d(1),cost:25});
 localStorage.setItem("driving-log-pro-v1",JSON.stringify({entries,students:names.map((n,i)=>({id:`s${i}`,name:n,phone:`+3519100000${i}`})),courses:[{id:"c1",student:"Student Alpha",name:"Course",date:d(5),hours:10,price:200}],coursePayments:[{id:"p1",course:"c1",date:d(5),amount:100}]}));};
const browser=await chromium.launch();const failures=[];
const IGNORE=/hisnmuslim|net::ERR|Failed to load resource|ERR_INTERNET|ERR_NAME|favicon/i;
for(const [w,h] of [[390,844],[320,568]]){
  const ctx=await browser.newContext({viewport:{width:w,height:h}});const page=await ctx.newPage();
  const note=m=>{if(!IGNORE.test(m))failures.push(`[${w}] ${m}`);};
  page.on("pageerror",e=>note("pageerror: "+e.message));page.on("console",m=>{if(m.type()==="error")note("console: "+m.text().slice(0,200));});
  await page.addInitScript(seed);
  await page.goto(`http://localhost:${port}/index.html`);await page.waitForTimeout(800);
  const overflow=async label=>{if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))failures.push(`[${w}] horizontal overflow on ${label}`);};
  for(const t of ["overview","calendar","log","students","reports","islamic"]){await page.evaluate(t=>document.querySelector(`.tab[data-tab="${t}"]`).click(),t);await page.waitForTimeout(250);await overflow("tab "+t);}
  await page.evaluate(()=>document.querySelector('.tab[data-tab="reports"]').click());
  for(const v of ["summary","fuel","students","data"]){await page.click(`[data-rview-go="${v}"]`);await page.waitForTimeout(200);await overflow("reports/"+v);
    const shown=await page.evaluate(v=>[...document.querySelectorAll("#reports [data-rview]")].filter(e=>e.offsetParent!==null).every(e=>e.dataset.rview===v),v);if(!shown)failures.push(`[${w}] reports/${v} shows sections of another tab`);}
  await page.evaluate(()=>document.querySelector('.tab[data-tab="students"]').click());
  await page.evaluate(()=>openProfile("s0"));await page.waitForTimeout(250);await overflow("student profile");
  for(const t of ["lessons","course","payments","overview"]){await page.evaluate(t=>document.querySelector(`[data-ptab="${t}"]`).click(),t);await page.waitForTimeout(150);}
  await page.click("#profileMore");await page.waitForTimeout(150);if(!(await page.isVisible("#profileSheet .psheet-cancel")))failures.push(`[${w}] profile more-sheet Cancel not visible`);
  await page.click("#profileSheet .psheet-cancel");
  await page.evaluate(()=>startReceive());await page.waitForTimeout(200);await overflow("receive payment");await page.evaluate(()=>document.getElementById("receiveDialog").close());
  await page.evaluate(()=>document.getElementById("profileDialog").close());
  await page.evaluate(()=>openStudent("s0"));await page.waitForTimeout(200);await overflow("edit student");await page.evaluate(()=>document.getElementById("studentDialog").close());
  await page.evaluate(()=>newRecord());await page.waitForTimeout(200);await overflow("new record");await page.evaluate(()=>document.getElementById("recordDialog").close());
  await ctx.close();
}
await browser.close();server.close();
if(failures.length){console.error("BROWSER SMOKE FAILED:\n"+failures.join("\n"));process.exit(1);}
console.log("Browser smoke OK: 6 tabs, 4 Reports views, profile/receive/student/record dialogs at 390x844 and 320x568.");
