const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8"),css=fs.readFileSync(__dirname+"/../styles.css","utf8");
test("v1.105: Overview has the prayer card after the next-lesson card and the old line is only hidden, not removed",()=>{
  assert.match(html,/<div id="nextCard" class="nextcard"><\/div>\s*<section class="prayercard hidden" id="prayerCard"/);
  assert.ok(html.includes('id="prayerLine"')&&html.includes('id="prayerEdit"'),"old ids kept");
  assert.ok(css.includes("#overview #prayerLine{display:none!important}"));
});
test("v1.105: the card is read-only and does not change the booking guard",()=>{
  const fn=app.slice(app.indexOf("function prayerTimesFor"),app.indexOf("setInterval(()=>{if(document.visibilityState"));
  assert.ok(!/save\(\)|state\.\w+\s*=/.test(fn),"no saving or state writes");
  assert.ok(!fn.includes("p.on)return"),"works even when booking protection is off");
  const guard=app.match(/function prayerBlocks\(iso\)\{[^\n]*\}/)[0];
  assert.ok(guard.includes("if(!p.on)return[]"),"prayerBlocks still returns nothing when protection is off (unchanged)");
});
test("v1.105: render hook, countdown and progress bar use script-driven width (CSP safe)",()=>{
  assert.match(app,/renderPrayerLine\(todayISO\);renderPrayerCard\(\);renderNext\(\);/);
  assert.match(app,/i\.style\.width=i\.dataset\.w\+"%"/);
  assert.ok(!/<[^>]+ style="/.test(app.slice(app.indexOf("function renderPrayerCard"),app.indexOf("setInterval(()=>{if(document.visibilityState"))),"no inline style attributes");
});
test("v1.105: footer and Settings version match",()=>{
  const v=html.match(/Version (v[\d.]+)</)[1];assert.ok(html.includes("manager · "+v+"</span></footer>"));
});
