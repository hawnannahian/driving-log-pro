const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const js=fs.readFileSync(__dirname+"/../reports-dashboard.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8");
test("v1.150: Cash after expenses = Collected − Expenses; Net profit definition unchanged",()=>{
  assert.ok(html.includes('id="rCashAfter"'));
  assert.match(js,/dashCount\(\$\("rCashAfter"\),dashRound\(s\.col-s\.exp\),euro\)/);
  assert.match(js,/net:dashRound\(t\.income-t\.expenses\)/);
});
