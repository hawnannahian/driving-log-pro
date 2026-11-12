const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const src=fs.readFileSync(__dirname+"/../app.js","utf8");
const csvCell=new Function(src.match(/function csvCell\(s\)\{[^\n]*\}/)[0]+";return csvCell;")();
test("v1.95: negative numbers stay numbers in CSV",()=>{
  assert.strictEqual(csvCell(-20),'"-20"');assert.strictEqual(csvCell(0),'"0"');assert.strictEqual(csvCell(12.5),'"12.5"');
});
test("v1.95: text starting with a formula character is still neutralised",()=>{
  for(const t of ["=1+1","+1","-1","@x","\tx","\rx"])assert.ok(csvCell(t).startsWith('"\''),t);
  assert.strictEqual(csvCell('a"b'),'"a""b"');assert.strictEqual(csvCell(null),'""');
});
