const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8");
test("v1.149: the lesson-completed WhatsApp message is an editable template with {{hours}}",()=>{
  assert.ok(html.includes('id="waDoneTemplate"')&&html.includes('id="waDonePreview"'));
  assert.match(app,/const doneMsg=h=>fillWaTemplate\(waTemplates\.done,\{hours:fmtH\(h\)\}\);/);
  assert.match(app,/\(day\|time\|amount\|lessons\|hours\)/);
  assert.match(app,/done:typeof x\.done==="string"&&x\.done\.trim\(\)\?x\.done:WA_DEFAULTS\.done/);
  assert.ok(app.includes("{{hours}} ঘণ্টা"),"the default wording is unchanged");
});
