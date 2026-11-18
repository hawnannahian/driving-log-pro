const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const read=f=>fs.readFileSync(__dirname+"/../"+f,"utf8");
const html=read("index.html"),state=read("PROJECT_STATE.md"),app=read("app.js");
test("v1.123: Settings version, footer version and the newest PROJECT_STATE entry are the same release",()=>{
  const settings=html.match(/id="appVersion">[^<]*Version (v\d+\.\d+)</),footer=html.match(/<footer>.*?· (v\d+\.\d+)<\/span><\/footer>/),top=state.match(/^## (v\d+\.\d+) /m);
  assert.ok(settings&&footer&&top,"all three version labels exist");
  assert.equal(settings[1],footer[1],"Settings and footer show the same version");
  assert.equal(top[1],footer[1],"the newest PROJECT_STATE entry matches the footer");
});
test("v1.123: the learning-activity chart label uses the singular for one lesson",()=>{
  assert.match(app,/\$\{m\.count\} lesson\$\{m\.count===1\?"":"s"\}/);
  assert.doesNotMatch(app,/\$\{m\.count\} lessons`/);
});
