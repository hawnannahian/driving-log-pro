const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8");
test("v1.197: Fuel form has an optional Litres field and the report tiles exist",()=>{
  for(const id of ["fLitres","rLitres","rPricePerL","rL100","rKmPerL"])assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(!/id="fLitres"[^>]*required/.test(html));
});
test("v1.197: litres is saved only on Fuel records and only when > 0 (old records keep working)",()=>{
  assert.match(app,/if\(type==="Fuel"\)\{const lt=num\(\$\("fLitres"\)\.value\);if\(lt>0\)e\.litres=round2\(lt\);\}/);
});
test("v1.197: consumption needs litres on every fill-up in the odometer span",()=>{
  assert.match(app,/lAll=fe\.length>0&&fe\.every\(e=>Number\(e\.litres\)>0\)/);
  assert.match(app,/l100:km&&km\.lAll&&km\.litres>0/);
});
