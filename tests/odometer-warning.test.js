const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8");
test("v1.173: a Fuel record with a doubtful odometer reading asks once before saving",()=>{
  assert.match(app,/if\(type==="Fuel"&&e\.km>0\)\{const w=odoWarning\(e\);if\(w&&!confirm\(w\)\)return;\}/);
  const fn=new Function("state","fmtDate",app.match(/function odoWarning\(e\)\{[\s\S]*?return "";\}/)[0]+";return odoWarning;");
  const ow=fn({entries:[{id:"a",date:"2026-05-05",km:226236},{id:"b",date:"2026-11-22",km:242637}]},d=>d);
  assert.equal(ow({id:"n",date:"2026-11-08",km:242187}),"","a normal reading passes");
  assert.match(ow({id:"n",date:"2026-11-08",km:2421870}),/higher than the previous one/,"the extra digit is caught");
  assert.match(ow({id:"n",date:"2026-12-01",km:100000}),/lower than the previous one/);
  assert.match(ow({id:"n",date:"2026-12-01",km:400000}),/higher than the previous one/);
  assert.equal(ow({id:"n",date:"2026-12-01",km:243000}),"","a normal gap of several weeks passes");
});
