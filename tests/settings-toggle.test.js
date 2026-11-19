const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),css=fs.readFileSync(__dirname+"/../styles.css","utf8");
test("v1.144: the header gear toggles Settings and returns to the screen it was opened from",()=>{
  assert.match(app,/const openSettings=\(\)=>\{if\(settingsOpen\(\)\)\{showLogRecords\(\);/);
  assert.match(app,/settingsFrom=document\.querySelector\("\.tab\.active"\)/);
});
test("v1.144: lock-screen notification controls are hidden, not removed",()=>{
  assert.ok(css.includes("#hdrBell,#pushBox{display:none!important}"));
});
