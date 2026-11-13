const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8");
const calSwipeDir=new Function(app.match(/function calSwipeDir\([^)]*\)\{[^\n]*\}/)[0]+";return calSwipeDir;")();
test("v1.102: slight or sloppy touches never change the month",()=>{
  assert.strictEqual(calSwipeDir(-60,0,150,390,false),0,"old 60 px threshold");
  assert.strictEqual(calSwipeDir(-100,4,200,390,false),0,"short swipe");
  assert.strictEqual(calSwipeDir(70,-2,100,390,false),0,"short swipe right");
  assert.strictEqual(calSwipeDir(-130,-120,250,390,false),0,"diagonal drag (scrolling)");
  assert.strictEqual(calSwipeDir(-250,5,900,390,false),0,"slow drag");
  assert.strictEqual(calSwipeDir(-250,5,200,390,true),0,"page scrolled during the touch");
});
test("v1.102: a deliberate mostly-horizontal swipe still works in both directions",()=>{
  assert.strictEqual(calSwipeDir(-220,10,250,390,false),1,"left swipe = next");
  assert.strictEqual(calSwipeDir(220,-10,250,390,false),-1,"right swipe = previous");
  assert.strictEqual(calSwipeDir(-120,0,200,320,false),1,"narrow phone");
});
test("v1.102: touchstart ignores multi-touch and touchcancel resets",()=>{
  assert.match(app,/e\.touches\.length===1\?\{x:/);
  assert.match(app,/box\.addEventListener\("touchcancel"/);
  assert.ok(!/Math\.abs\(dx\)>60/.test(app),"the old 60 px rule must be gone");
});
test("v1.102: footer and Settings version match",()=>{
  const v=html.match(/Version (v[\d.]+)</)[1];assert.ok(html.includes("manager · "+v+"</span></footer>"));
});
