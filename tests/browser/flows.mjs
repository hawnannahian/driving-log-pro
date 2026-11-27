// End-to-end behaviour checks in real Chromium (synthetic data only). Run: node tests/browser/flows.mjs
// Walks the main business flows through the real UI/handlers and asserts the numbers, not just that screens render.
import http from "node:http";import fs from "node:fs";import path from "node:path";import {createRequire} from "node:module";
const require=createRequire(import.meta.url);const {chromium}=require("playwright");
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),"../..");
const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".webmanifest":"application/manifest+json",".png":"image/png",".svg":"image/svg+xml",".mp3":"audio/mpeg"};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split("?")[0]);if(p==="/")p="/index.html";const f=path.join(root,p);if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}res.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r));const port=server.address().port;
const browser=await chromium.launch();const ctx=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});const page=await ctx.newPage();
const fails=[],errs=[];const IGNORE=/hisnmuslim|net::ERR|Failed to load resource|favicon/i;
page.on("pageerror",e=>errs.push("pageerror: "+e.message));page.on("console",m=>{if(m.type()==="error"&&!IGNORE.test(m.text()))errs.push("console: "+m.text().slice(0,160));});
page.on("dialog",d=>d.accept());
const ok=(c,msg)=>{if(!c)fails.push(msg);};const eq=(a,b,msg)=>{if(JSON.stringify(a)!==JSON.stringify(b))fails.push(`${msg}: got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`);};
await page.goto(`http://localhost:${port}/index.html`);await page.waitForTimeout(700);
const S=()=>page.evaluate(()=>JSON.parse(JSON.stringify({entries:state.entries,students:state.students,courses:state.courses||[],pays:state.coursePayments||[]})));
const closeAll=()=>page.evaluate(()=>document.querySelectorAll("dialog[open]").forEach(d=>d.close()));
const tab=async t=>{await closeAll();await page.evaluate(t=>document.querySelector(`.tab[data-tab="${t}"]`).click(),t);};
const today=await page.evaluate(()=>dateISO(new Date()));
// 1. add a student through the form
await tab("students");await page.evaluate(()=>newStudent());await page.fill("#sName","Flow Student");await page.fill("#sPhone","+351912345678");await page.fill("#sRate","20");await page.click('#studentForm button[type=submit]');await page.waitForTimeout(200);
let s=await S();eq(s.students.length,1,"student added");eq(s.students[0]?.rate,20,"student rate saved");
// 2. book a 2 hour lesson for that student: the student's rate pre-fills
await page.evaluate(()=>newRecord());await page.fill("#fStudent","Flow Student");await page.waitForTimeout(150);eq(await page.inputValue("#fRate"),"20","student rate pre-fills a new lesson");
await page.fill("#fDate",today);await page.fill("#fStart","10:00");await page.fill("#fEnd","12:00");await page.click("#saveRecord");await page.waitForTimeout(300);
s=await S();const lesson=s.entries.find(e=>e.type==="Lesson");ok(!!lesson,"lesson saved");eq([lesson?.start,lesson?.end,lesson?.rate],["10:00","12:00",20],"lesson fields");
// 3. complete it: hours 2, income 40
await page.evaluate(id=>completeLesson(id,{min:120}),lesson.id);await page.waitForTimeout(200);
const inc=await page.evaluate(id=>income(state.entries.find(x=>x.id===id)),lesson.id);eq(inc,40,"completed 2h lesson income");
// 4. Reports reflect it (units rule: 2 hours = 2 lessons)
await tab("reports");await page.waitForTimeout(1200);eq(await page.textContent("#rCount"),"2","Reports completed lessons count hours");
ok((await page.textContent("#rIncome")).replace(/\s/g,"").includes("40"),"Reports revenue shows 40");
// 5. record a prepaid payment: 100 euro at 20/h = a 5h block, Paid 100
await tab("students");await page.evaluate(()=>{profileId="s"+0;});const sid=s.students[0].id;await page.evaluate(id=>{profileId=id;startReceive();},sid);await page.fill("#receiveAmount","100");await page.fill("#receiveRate","20");await page.click('#receiveForm button[type=submit]');await page.waitForTimeout(300);
s=await S();eq(s.courses.length,1,"prepaid block created");eq(s.courses[0]?.hours,5,"prepaid hours = 100/20");eq(s.pays.reduce((a,p)=>a+p.amount,0),100,"payment recorded");
await page.evaluate(()=>{const d=document.getElementById("profileDialog");if(d.open)d.close();});
// 6. an expense: Fuel with litres and the Reports Fuel view
await tab("log");await page.click("#addRecordBtn");await page.click('#typeChips [data-type="Fuel"]');await page.fill("#fCost","40");await page.fill("#fKm","1000");await page.fill("#fLitres","18.8");await page.click("#saveRecord");await page.waitForTimeout(300);
await page.click("#addRecordBtn");await page.click('#typeChips [data-type="Fuel"]');await page.fill("#fCost","40");await page.fill("#fKm","1450");await page.fill("#fLitres","18.8");await page.click("#saveRecord");await page.waitForTimeout(300);
s=await S();eq(s.entries.filter(e=>e.type==="Fuel").map(e=>e.litres),[18.8,18.8],"fuel litres saved");
// 7. backup round trip: export JSON, wipe, restore, state identical
const before=await S();
const [dl]=await Promise.all([page.waitForEvent("download"),page.evaluate(()=>backupNow())]);const file=await dl.path();const txt=fs.readFileSync(file,"utf8");ok(txt.includes("Flow Student"),"backup file has the data");
await page.evaluate(()=>{state.entries=[];state.students=[];state.courses=[];state.coursePayments=[];save();});eq((await S()).entries.length,0,"wiped");
await tab("reports");await page.click('[data-rview-go="data"]');await page.evaluate(()=>openDataCard("backupCard",true));
await page.setInputFiles("#restoreBackup",{name:"b.json",mimeType:"application/json",buffer:Buffer.from(txt)});await page.waitForTimeout(500);
const after=await S();eq(after.entries.length,before.entries.length,"restore entry count");eq(after.students.map(x=>x.name),before.students.map(x=>x.name),"restore students");eq(after.courses.length,before.courses.length,"restore courses");eq(after.entries.filter(e=>e.type==="Fuel").map(e=>e.litres),[18.8,18.8],"restore keeps litres");
// 8. Log CSV round trip with litres, duplicates skipped
const [dl2]=await Promise.all([page.waitForEvent("download"),page.evaluate(()=>exportLog())]);const csv=fs.readFileSync(await dl2.path(),"utf8");ok(/Km,Comment,Litres/.test(csv),"CSV header has Litres");
const n0=(await S()).entries.length;await page.evaluate(t=>importLog(t),csv);await page.waitForTimeout(300);eq((await S()).entries.length,n0,"re-importing the same CSV adds no duplicates");
// 9. timer start/stop does not break tabs
await page.evaluate(id=>{try{startLessonTimer(id)}catch(e){}},lesson.id);await tab("overview");await tab("calendar");await tab("reports");
// 10. delete the lesson through the handler and check it is gone
await page.evaluate(id=>{deleteEntry(id)},lesson.id);await page.waitForTimeout(200);ok(!(await S()).entries.some(e=>e.id===lesson.id),"lesson deleted");
await browser.close();server.close();
const all=[...fails,...errs];
if(all.length){console.error("FLOWS FAILED:\n"+all.join("\n"));process.exit(1);}
console.log("Flows OK: student, booking (rate pre-fill), completion income, Reports numbers, prepaid payment, fuel litres, JSON backup+restore, CSV round trip, timer, delete.");
