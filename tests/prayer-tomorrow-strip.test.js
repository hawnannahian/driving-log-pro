const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8");
test("v1.107: week strip rolls from today while the selected day is within the next 7 days",()=>{
  const fn=app.match(/function calStripDays\(sel,today\)\{[^\n]*\}/)[0];
  const dateISO=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const weekDays=iso=>{const d=new Date(iso+"T12:00:00"),k=(d.getDay()+6)%7;return[...Array(7)].map((_,i)=>dateISO(new Date(d.getFullYear(),d.getMonth(),d.getDate()-k+i)));};
  const f=new Function("dateISO","weekDays",fn+";return calStripDays;")(dateISO,weekDays);
  assert.deepStrictEqual(f("2026-11-15","2026-11-15"),["2026-11-15","2026-11-16","2026-11-17","2026-11-18","2026-11-19","2026-11-20","2026-11-21"]); // Sunday: tomorrow is visible
  assert.ok(f("2026-11-21","2026-11-15").includes("2026-11-21"));
  assert.deepStrictEqual(f("2026-11-25","2026-11-15")[0],"2026-11-23"); // outside the window: that day's Mon–Sun week
  assert.deepStrictEqual(f("2026-11-10","2026-11-15")[0],"2026-11-09"); // past day: its own week
});
test("v1.107: after Isha the prayer card shows tomorrow's times with a Tomorrow label",()=>{
  assert.match(app,/isTomorrow=!!tm\.length/);
  assert.match(app,/nextMin=toMin\(f\.at\)\+1440/);
  assert.match(app,/\$\{isTomorrow\?" <em>tomorrow<\/em>":""\}/);
});
