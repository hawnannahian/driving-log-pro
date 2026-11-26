const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),dash=fs.readFileSync(__dirname+"/../reports-dashboard.js","utf8");
test("v1.201: Reports and profiles count lesson hours (unitsOf), not bookings",()=>{
  assert.match(dash,/lessons:unitsOf\(done\)/);
  assert.match(dash,/count:unitsOf\(lessons\)/);
  assert.match(app,/doneUnits:unitsOf\(D\)/);
  assert.match(app,/\$\("pCount"\)\.textContent=st\.doneUnits/);
  assert.match(app,/row\("Lessons completed",st\.doneUnits\)/);
});
