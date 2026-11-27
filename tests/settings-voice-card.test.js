const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const css=fs.readFileSync(__dirname+"/../styles.css","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8");
test("v1.124: a disabled Settings card button looks disabled (the old On/Off toggle class no longer exists)",()=>{
  assert.match(css,/#logSettingsPanel \.settings-card \.btn:disabled\{background:var\(--line-2\)/);
});
test("v1.124: the Voice card no longer lists the Bengali sentences as if they were played",()=>{
  assert.doesNotMatch(html,/class="voicelist"/);
  assert.match(html,/If a recorded voice cannot load/);
});
