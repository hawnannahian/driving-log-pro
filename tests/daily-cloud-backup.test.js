"use strict";
// Daily cloud backup (v1.68). The real functions are cut out of app.js and run against an in-memory fake GitHub contents API. Synthetic data only.
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const test=require("node:test"),assert=require("node:assert/strict");
const source=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8");
const a=source.indexOf("const SNAP_DIR="),b=source.indexOf("// end daily snapshot",a);
assert.ok(a>=0&&b>a,"daily snapshot block must stay delimited");
const code=source.slice(a,b);
const hook=source.indexOf("await dailySnapshot(merged)");assert.ok(hook>0,"cloudSync must call dailySnapshot after a successful sync");
assert.ok(source.slice(0,hook).lastIndexOf("async function cloudSync")>source.lastIndexOf("async function cloudConnect",hook)-100000,"hook sits inside cloudSync");
function make(opts={}){
 const files=new Map(),calls=[],store={};
 (opts.seed||[]).forEach(n=>files.set(`backups/driving-log-${n}.json`,{content:"{}",sha:"s"+n}));
 const status={text:"",bad:false};
 const ctx={DB_KEY:"driving-log-pro-v1",CloudError:class extends Error{constructor(s){super("err "+s);this.status=s;}},
  dateISO:d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,
  cloudCfg:()=>({repo:"x/y",token:"t"}),toB64:s=>Buffer.from(s).toString("base64"),
  $:id=>({set textContent(v){status.text=v;},classList:{toggle(_,v){status.bad=v;}}}),
  localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{delete store[k];}},
  gh:async(p,o={})=>{calls.push((o.method||"GET")+" "+p);if(opts.offline)throw new TypeError("Failed to fetch");const m=o.method||"GET",rel=p.replace("/contents/","");
   if(opts.status&&m!=="GET")return{ok:false,status:opts.status};
   if(m==="GET"&&files.has(rel))return{ok:true,status:200,json:async()=>({sha:files.get(rel).sha})};
   if(m==="GET"&&rel==="backups"){const l=[...files.keys()].filter(k=>k.startsWith("backups/")).map(k=>({type:"file",name:k.slice(8),sha:files.get(k).sha}));return l.length?{ok:true,status:200,json:async()=>l}:{ok:false,status:404};}
   if(m==="GET")return{ok:false,status:404};
   if(m==="PUT"){if(files.has(rel))return{ok:false,status:422};files.set(rel,{content:JSON.parse(o.body).content,sha:"n"+calls.length});return{ok:true,status:201};}
   if(m==="DELETE"){files.delete(rel);return{ok:true,status:200};}}};
 vm.createContext(ctx);vm.runInContext(code+";this.api={dailySnapshot,pruneSnapshots,listSnapshots,snapDay,renderSnapStatus};",ctx);
 return{files,calls,store,status,api:ctx.api,ctx};
}
const day=off=>{const d=new Date();d.setDate(d.getDate()+off);return make().ctx.dateISO(d);};
const names=f=>[...f.keys()].map(k=>k.slice(8)).sort();
test("first sync of the day writes one dated file with the snapshot JSON",async()=>{const t=make();await t.api.dailySnapshot({entries:[{id:"a"}],students:[]});assert.deepEqual(names(t.files),[`driving-log-${t.api.snapDay()}.json`]);const f=[...t.files.values()][0];assert.deepEqual(JSON.parse(Buffer.from(f.content,"base64").toString()),{entries:[{id:"a"}],students:[]});assert.equal(t.store["driving-log-pro-v1-cloud-lastsnap"],t.api.snapDay());});
test("a second sync the same day writes nothing more",async()=>{const t=make();await t.api.dailySnapshot({});const n=t.calls.length;await t.api.dailySnapshot({});assert.equal(t.calls.length,n);});
test("an existing file for today is never overwritten",async()=>{const t=make();const today=t.api.snapDay();t.files.set(`backups/driving-log-${today}.json`,{content:"KEEP",sha:"x"});await t.api.dailySnapshot({});assert.equal(t.files.get(`backups/driving-log-${today}.json`).content,"KEEP");assert.equal(t.store["driving-log-pro-v1-cloud-lastsnap"],today);});
test("offline or server error: no marker, no throw, red status; retried next time",async()=>{for(const o of [{offline:true},{status:500}]){const t=make(o);await t.api.dailySnapshot({});assert.equal(t.store["driving-log-pro-v1-cloud-lastsnap"],undefined);assert.equal(t.status.bad,true);}});
test("expired token (401) is reported",async()=>{const t=make({status:401});await t.api.dailySnapshot({});assert.match(t.status.text,/failed/);});
test("files older than 30 days are removed, newer ones and the newest 7 stay",async()=>{const old=[-40,-35,-31].map(day),recent=[-29,-10,-5,-3,-2,-1].map(day);const t=make({seed:[...old,...recent]});await t.api.dailySnapshot({});const left=names(t.files);old.forEach(d=>assert.ok(!left.includes(`driving-log-${d}.json`),d+" should be gone"));recent.forEach(d=>assert.ok(left.includes(`driving-log-${d}.json`),d+" should stay"));});
test("the newest 7 are kept even if all are older than 30 days (wrong clock safety)",async()=>{const seed=[-90,-80,-70,-60,-50,-45,-44,-43,-42].map(day);const t=make({seed});await t.api.dailySnapshot({});const left=names(t.files);assert.equal(left.length,7);assert.ok(left.includes(`driving-log-${day(-60)}.json`));assert.ok(!left.includes(`driving-log-${day(-70)}.json`));});
test("only exact backup file names are ever deleted",async()=>{const t=make({seed:[day(-90)]});t.files.set("backups/notes.txt",{content:"x",sha:"k1"});t.files.set("backups/driving-log-2020-01-01.json.bak",{content:"x",sha:"k2"});await t.api.dailySnapshot({});assert.ok(t.files.has("backups/notes.txt"));assert.ok(t.files.has("backups/driving-log-2020-01-01.json.bak"));assert.ok(!t.calls.some(c=>c.startsWith("DELETE /contents/backups/notes")));});
test("list is newest first and ignores other files",async()=>{const t=make({seed:[day(-3),day(-1),day(-2)]});t.files.set("backups/readme.md",{content:"",sha:"r"});const l=await t.api.listSnapshots();assert.deepEqual(l.map(x=>x.day),[day(-1),day(-2),day(-3)]);});
test("status line warns after 3 days without a backup",()=>{const t=make();t.store["driving-log-pro-v1-cloud-lastsnap"]=day(-4);t.api.renderSnapStatus();assert.equal(t.status.bad,true);t.store["driving-log-pro-v1-cloud-lastsnap"]=day(-1);t.api.renderSnapStatus();assert.equal(t.status.bad,false);});
