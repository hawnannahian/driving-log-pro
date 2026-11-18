const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const css=fs.readFileSync(__dirname+"/../styles.css","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8");
test("v1.124: the Settings On/Off toggle cannot shrink, a disabled card button looks disabled",()=>{
  assert.match(css,/#logSettingsPanel \.settings-card \.settings-toggle\{flex:none;white-space:nowrap\}/);
  assert.match(css,/#logSettingsPanel \.settings-card \.btn:disabled\{background:var\(--line-2\)/);
});
test("v1.124: the Voice card no longer lists the Bengali sentences as if they were played",()=>{
  assert.doesNotMatch(html,/class="voicelist"/);
  assert.match(html,/If a recorded voice cannot load/);
});
