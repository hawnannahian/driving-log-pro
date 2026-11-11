const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const css=fs.readFileSync(__dirname+"/../styles.css","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8");
test("v1.93: expense sheet is full height, not content-sized",()=>{
  assert.match(css,/#recordDialog\[open\]\[data-mode="expense"\]\{height:calc\(100dvh - env\(safe-area-inset-top\) - 10px\)/);
  assert.ok(!/#recordDialog\[open\]\[data-mode="expense"\]\{height:auto\}/.test(css));
});
test("v1.93: footer and Settings version match",()=>{
  const v=html.match(/Version (v[\d.]+)</)[1];assert.ok(html.includes("manager · "+v+"</span></footer>"));
});
