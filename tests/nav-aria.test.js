const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const html=fs.readFileSync(__dirname+"/../index.html","utf8"),app=fs.readFileSync(__dirname+"/../app.js","utf8");
test("v1.114: the tab that is active on first paint is announced as the current page",()=>{
  assert.match(html,/<button class="tab active" data-tab="overview" aria-current="page">/);
  assert.equal((html.match(/<button class="tab[^"]*" data-tab=[^>]*aria-current/g)||[]).length,1,"only the active tab has aria-current in the markup");
});
test("v1.114: switchTab keeps aria-current in sync with the active tab",()=>{
  assert.match(app,/if\(on\)b\.setAttribute\("aria-current","page"\);else b\.removeAttribute\("aria-current"\)/);
});
