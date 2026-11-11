const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const html=fs.readFileSync(__dirname+"/../index.html","utf8"),css=fs.readFileSync(__dirname+"/../styles.css","utf8");
test("v1.92: every record type chip has an icon and keeps data-type",()=>{
  const m=[...html.matchAll(/<button type="button" data-type="([^"]+)"><svg class="chip-ico"[^>]*>.*?<\/svg><span>([^<]+)<\/span><\/button>/g)];
  assert.deepStrictEqual(m.map(x=>x[1]),["Lesson","Fuel","Other Expense","Note","Insurance","Repair","Refund"]);
  assert.ok(!/style="/.test(html.match(/id="typeChips".*?<\/div>/s)[0]));
});
test("v1.92: Settings shows the app version matching the footer",()=>{
  const v=html.match(/id="appVersion">Driving Log Pro · Version (v[\d.]+)</)[1];
  assert.ok(html.includes("manager · "+v+"</span></footer>"));
});
test("v1.92: expense tiles and card sections exist in CSS",()=>{
  assert.match(css,/#recordDialog\[data-mode="expense"\] \.typechips button\{flex-direction:column/);
  assert.match(css,/\.app-version\{/);
});
