// Robustness check (real Chromium, synthetic data): malformed records must never throw while the app renders every tab.
// Run: node tests/browser/malformed.mjs
import http from "node:http";import fs from "node:fs";import path from "node:path";import {createRequire} from "node:module";
const require=createRequire(import.meta.url);const {chromium}=require("playwright");
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),"../..");
const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".webmanifest":"application/manifest+json",".png":"image/png",".svg":"image/svg+xml",".mp3":"audio/mpeg"};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split("?")[0]);if(p==="/")p="/index.html";const f=path.join(root,p);if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}res.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r));const port=server.address().port;
const L=(o={})=>({id:"a",type:"Lesson",date:"2026-11-20",student:"X",start:"10:00",end:"11:00",rate:20,...o});
const cases={"null date":{entries:[L({date:null})]},"empty date":{entries:[L({date:""})]},"impossible date":{entries:[L({date:"2026-02-30"})]},"null student":{entries:[L({student:null})]},"null times":{entries:[L({start:null,end:null})]},"text rate":{entries:[L({rate:"abc",done:true})]},"missing id":{entries:[{...L(),id:undefined}]},"null student name":{entries:[],students:[{id:"s",name:null}]},"course text price":{entries:[L({course:"c0",done:true})],students:[{id:"s0",name:"X"}],courses:[{id:"c0",student:"X",date:"2026-11-01",hours:10,price:"abc"}]},"payment to unknown course":{entries:[],courses:[],coursePayments:[{id:"p",course:"zzz",date:"2026-11-20",amount:50}]},"unknown entry type":{entries:[L({type:"Bogus"})]},"text fuel numbers":{entries:[{id:"f",type:"Fuel",date:"2026-11-20",cost:"abc",km:"x",litres:"y"}]}};
const browser=await chromium.launch();const fails=[];
for(const [name,d] of Object.entries(cases)){const ctx=await browser.newContext({viewport:{width:390,height:844}});const page=await ctx.newPage();const errs=[];
 page.on("pageerror",e=>errs.push(e.message.slice(0,120)));page.on("console",m=>{if(m.type()==="error"&&!/hisnmuslim|net::ERR|Failed to load|favicon/.test(m.text()))errs.push(m.text().slice(0,120));});
 await page.addInitScript(d=>localStorage.setItem("driving-log-pro-v1",JSON.stringify({students:[],courses:[],coursePayments:[],...d})),d);
 await page.goto(`http://localhost:${port}/index.html`);await page.waitForTimeout(400);
 for(const t of ["calendar","log","students","reports","islamic","overview"]){await page.evaluate(t=>document.querySelector(`.tab[data-tab="${t}"]`).click(),t);await page.waitForTimeout(120);}
 for(const v of ["fuel","students","data","summary"]){await page.evaluate(v=>{document.querySelector('.tab[data-tab="reports"]').click();setReportsView(v)},v);await page.waitForTimeout(120);}
 if(errs.length)fails.push(`${name}: ${[...new Set(errs)].join(" | ")}`);await ctx.close();}
await browser.close();server.close();
if(fails.length){console.error("MALFORMED-DATA CHECK FAILED:\n"+fails.join("\n"));process.exit(1);}
console.log(`Malformed-data check OK: ${Object.keys(cases).length} kinds of bad records render without errors.`);
