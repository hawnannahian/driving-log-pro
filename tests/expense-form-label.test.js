"use strict";
const fs=require("node:fs"),path=require("node:path"),test=require("node:test"),assert=require("node:assert/strict");
const root=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
test("New expense uses the existing amount field and storage input",()=>{
 assert.match(html,/<label class="costfield">Amount \(€\)<input type="number" id="fCost"/);
 assert.match(app,/\$\("fCost"\)\.value=e\.cost\?\?0/);
});
test("Hourly rate remains lesson-only; expense form hides lesson fields",()=>{
 assert.match(html,/class="lessonfield rate-field">Hourly rate \(€\)/);
 assert.match(app,/document\.querySelectorAll\("\.lessonfield"\)\.forEach\(el=>el\.classList\.toggle\("hidden",!on\)\)/);
});
test("Fuel odometer remains the existing Fuel-only field",()=>{
 assert.match(html,/<label class="kmfield">Odometer \(km\)<input type="number" id="fKm"/);
 assert.match(app,/el\.classList\.toggle\("hidden",type!==\"Fuel\"\)/);
});
