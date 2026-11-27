// Timer voice-cue timing in real Chromium with a fake clock (synthetic data). Run: node tests/browser/timer-cues.mjs
// Rule: "5 minutes left" is spoken only if the app is open within 30 s of the 50:00 mark; "lesson ended" only within 20 s of 55:00.
import http from "node:http";import fs from "node:fs";import path from "node:path";import {createRequire} from "node:module";
const require=createRequire(import.meta.url);const {chromium}=require("playwright");
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),"../..");
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split("?")[0]);if(p==="/")p="/index.html";const f=path.join(root,p);if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}res.writeHead(200,{"content-type":p.endsWith(".css")?"text/css":p.endsWith(".js")?"text/javascript":p.endsWith(".html")?"text/html":"application/octet-stream"});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r));const port=server.address().port;
const b=await chromium.launch();
const scenarios=[["open at 49:00 (on time)",49*60,["warn","end"]],["open at 50:10",50*60+10,["warn","end"]],["reopen at 51:00",51*60,["end"]],["reopen at 53:00",53*60,["end"]],["reopen at 54:30",54*60+30,["end"]],["reopen at 54:55",54*60+55,["end"]],["reopen at 55:10",55*60+10,["end"]],["reopen at 57:00",57*60,[]]];const fails=[];
for(const [name,sec,expect] of scenarios){const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();
 const NOW=Date.parse("2026-11-27T12:00:00Z");
 await p.clock.install({time:NOW});
 await p.addInitScript(()=>{window.__cues=[];const t0=()=>Date.now();const log=n=>window.__cues.push([n,Math.round(performance.now()/1000)]);const P=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){log("audio:"+(this.currentSrc||this.src||"").split("/").pop());return Promise.resolve();};const sp=window.speechSynthesis&&speechSynthesis.speak;if(sp)speechSynthesis.speak=function(u){log("speech");};});
 await p.addInitScript(([now,sec])=>{const start=now-sec*1000;const d=new Date(now).toISOString().slice(0,10);
  localStorage.setItem("driving-log-pro-v1",JSON.stringify({entries:[{id:"L1",type:"Lesson",date:d,student:"Student Alpha",start:"11:00",end:"12:00",rate:20}],students:[{id:"s0",name:"Student Alpha"}],courses:[],coursePayments:[]}));
  localStorage.setItem("driving-log-pro-v1-timer2",JSON.stringify({lessonId:"L1",session:"sess-1",label:"Student Alpha",startText:"11:00",elapsed:0,runFrom:start,n:1,idx:1,bookStart:"11:00",spoken50:false}));},[NOW,sec]);
 await p.goto(`http://localhost:${port}/index.html`);await p.waitForTimeout(200);
 await p.clock.runFor(2000);
 // advance 6 minutes in 1s ticks to see which cues fire, in order
 await p.clock.runFor(6*60*1000);
 const cues=(await p.evaluate(()=>window.__cues)).map(c=>c[0].includes("warning")?"warn":c[0].includes("end")?"end":c[0]);if(JSON.stringify(cues)!==JSON.stringify(expect))fails.push(`${name}: got ${JSON.stringify(cues)} expected ${JSON.stringify(expect)}`);await ctx.close();}
await b.close();server.close();if(fails.length){console.error("TIMER CUES FAILED:\n"+fails.join("\n"));process.exit(1);}console.log("Timer cues OK: no late '5 minutes left', never both announcements together.");
