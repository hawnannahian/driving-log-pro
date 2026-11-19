const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8"),css=fs.readFileSync(__dirname+"/../styles.css","utf8");
test("v1.138: the lesson progress road has no text and is described only by an aria-label",()=>{
  assert.match(html,/<section class="lprog hidden" id="lessonProgress" role="img" aria-label=""><div class="lp-scroll" id="lpScroll"><div class="lp-track" id="lpTrack"><\/div><\/div><\/section>/);
  const i=app.indexOf("function renderLessonProgress(list){"),fn=app.slice(i,app.indexOf("const lessonsOn = iso",i));
  const markup=fn.match(/`<span class="lp-car[^`]*`/)[0]+fn.match(/<span class="lp-flag">[^`]*`/)[0];
  assert.doesNotMatch(markup.replace(/<svg[\s\S]*?<\/svg>/g,""),/>[^<${}]*[A-Za-z0-9]/,"the markers contain no visible text (only the SVG icons)");
  assert.match(app,/aria-label",`Today's lessons: /);
});
test("v1.138: states come from the real lesson data (done / active / upcoming) and update in place so the CSS transitions run",()=>{
  assert.match(app,/function lpState\(e\)\{if\(isDone\(e\)\)return"done";if\(timer&&timer\.lessonId===e\.id\)return"active";/);
  assert.match(app,/renderLessonProgress\(todays\);/);
  assert.match(app,/else have\.forEach\(\(el,i\)=>\{el\.classList\.remove\("lp-done","lp-active","lp-next"\);el\.classList\.add\("lp-"\+states\[i\]\);\}\);/,"same lessons: classes are swapped on the existing nodes");
  assert.match(css,/\.lp-disc\{[^}]*transition:background \.35s ease/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.lp-car,\.lp-disc,\.lp-tick\{transition:none\}\}/);
});
