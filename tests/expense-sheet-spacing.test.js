const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const css=fs.readFileSync(__dirname+"/../styles.css","utf8");
test("v1.91: record form grid keeps natural row heights (v1.93 made the expense sheet full height)",()=>{
  assert.match(css,/#recordDialog \.formgrid\{align-content:start;align-items:start\}/);
  assert.match(css,/#recordDialog \.typechips button\{flex:0 0 auto\}/);
});
