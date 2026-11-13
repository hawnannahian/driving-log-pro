const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const css=fs.readFileSync(__dirname+"/../styles.css","utf8"),app=fs.readFileSync(__dirname+"/../app.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8");
const block=css.slice(css.indexOf("/* v1.104 — Premium minimal Calendar"));
test("v1.104: the premium design tokens are defined",()=>{
  for(const t of ["--pc-blue:#315ceb","--pc-bg:#f8fafc","--pc-card:#fff","--pc-navy:#1e3155","--pc-muted:#718096","--pc-green-bg:#e8f6ee","--pc-green:#16a36a","--pc-amber:#f4b942"])assert.ok(block.includes(t),t);
});
test("v1.104: header stays compact (76px, within the 75-85px target) and brand identity is kept",()=>{
  assert.match(block,/min-height:76px!important;height:calc\(76px \+ env\(safe-area-inset-top\)\)!important/);
  assert.ok(html.includes('class="brandcar"')||html.includes("brandcar"));
});
test("v1.104: four equal stat cards, reminder count, slot cards and timeline states are styled",()=>{
  assert.match(block,/#calendar \.cal-day-stats\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/);
  assert.match(block,/\.remindcount\{/);
  assert.match(block,/#calendar \.cal-slot strong\{[^}]*background:var\(--pc-blue\)/);
  for(const s of [".tlles.paid",".tlles.unpaid",".tlles.pkg"])assert.ok(block.includes("#calendar "+s),s);
});
test("v1.104: presentation only - the reminder count is the single JS change and all links/handlers are kept",()=>{
  assert.match(app,/<span class="remindcount">\$\{list\.filter\(x=>!reminded\.has\(x\.e\.id\)\)\.length\} pending<\/span>/);
  assert.match(app,/class="remindchip\$\{reminded\.has\(e\.id\)\?" sent":""\}" data-remind="\$\{esc\(e\.id\)\}" href="\$\{esc\(waLink\(n,lessonMsg\(e\)\)\)\}"/);
  assert.match(app,/\$\("calAddBtn"\)\.onclick=addLessonOnSelectedDay;/);
  assert.ok(!/style="/.test(block),"no inline styles in the css block");
});
test("v1.104: the six navigation items keep their names and order",()=>{
  const nav=html.match(/<nav class="tabbar"[\s\S]*?<\/nav>/)[0];
  const labels=[...nav.matchAll(/<span[^>]*>([^<]+)<\/span>/g)].map(m=>m[1].trim()).filter(Boolean);
  assert.deepStrictEqual(labels.slice(0,6),["Overview","Calendar","Log","Students","Reports","Islamic"]);
});
test("v1.104: footer and Settings version match",()=>{
  const v=html.match(/Version (v[\d.]+)</)[1];assert.ok(html.includes("manager · "+v+"</span></footer>"));
});
