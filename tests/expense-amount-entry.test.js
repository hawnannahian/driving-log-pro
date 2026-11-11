const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8");
test("v1.94: Amount and Odometer clear a lone 0 on focus and restore it on blur",()=>{
  assert.match(app,/\["fCost","fKm"\]\.forEach\(id=>/);
  assert.match(app,/addEventListener\("focus",\(\)=>\{if\(num\(el\.value\)===0&&el\.value\.trim\(\)!==""\)el\.value="";\}\)/);
  assert.match(app,/addEventListener\("blur",\(\)=>\{if\(el\.value\.trim\(\)===""\)el\.value="0";\}\)/);
  assert.match(html,/id="fCost"[^>]*placeholder="0"/);assert.match(html,/id="fKm"[^>]*placeholder="0"/);
});
test("v1.94: saving still reads the amount through num() so empty means 0",()=>{
  assert.match(app,/cost:!lesson&&type!=="Note"\?num\(\$\("fCost"\)\.value\)/);
});
