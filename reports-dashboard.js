"use strict";
// Reports dashboard (loaded after app.js and uses its helpers).
// Every figure comes from the app's own records, with the same money rules as the Log and the student profiles:
// - Revenue (earned)  = value of completed lessons (totals().income). Advance payments are not revenue by themselves.
// - Collected         = money received in the period: paid normal lessons (by lesson date) + course/package payments (by payment date).
// - Outstanding       = completed lessons not paid yet + course/package amounts still due (packages bought in the period).
// - Expenses          = cost of Fuel, Maintenance, Insurance, Refund and other expense records (totals().expenses).
// - Net profit        = Revenue − Expenses.

const DASH_CATS=["Fuel","Maintenance","Insurance","Other (incl. refunds)"];
const dashCatOf=e=>e.type==="Fuel"?0:e.type==="Repair"?1:e.type==="Insurance"?2:3;
const dashRound=n=>Math.round(n*100)/100;
let dashRange="12",dashMonth=null,dashDay=null,dashPrevTab=null;
const dashReduce=(()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches;}catch{return false;}})();

function dashCollected(p,v){
 let c=state.entries.filter(e=>e.type==="Lesson"&&isDone(e)&&e.paid&&inSel(e.date,p,v)).reduce((a,e)=>a+(e.pkg?(e.extraH||0)*rateOf(e):income(e)),0);
 for(const k of pkgs()){if(Array.isArray(k.payments))c+=k.payments.filter(x=>inSel(x.date||k.date||"",p,v)).reduce((a,x)=>a+(Number(x.amount)||0),0);else if(k.paid!==false&&inSel(k.date||"",p,v))c+=Number(k.amount||0);}
 return dashRound(c);}

function dashStats(p,v){
 const rep=state.entries.filter(e=>inSel(e.date,p,v)),t=totals(rep),done=rep.filter(e=>e.type==="Lesson"&&isDone(e)),cats=[0,0,0,0];
 rep.filter(e=>e.type!=="Lesson"&&!isBooking(e)).forEach(e=>{cats[dashCatOf(e)]+=Number(e.cost||0);});
 const owedPk=pkgs().filter(x=>inSel(x.date||"",p,v)).reduce((a,x)=>a+pkgDue(x),0);
 return {rev:dashRound(t.income),exp:dashRound(t.expenses),net:dashRound(t.income-t.expenses),col:dashCollected(p,v),out:dashRound(t.unpaid+owedPk),hours:t.hours,lessons:done.length,
  students:new Set(done.map(e=>(e.student||"").trim().toLowerCase()).filter(Boolean)).size,cats:cats.map(dashRound)};}

function dashPrev(p,v){if(p==="all"||!v)return null;if(p==="year")return String(Number(v)-1);
 if(p==="month"){const [y,m]=v.split("-").map(Number);return dateISO(new Date(y,m-2,1)).slice(0,7);}
 const d=new Date(v+"T12:00:00");return dateISO(new Date(d.getFullYear(),d.getMonth(),d.getDate()-7));}
// First and last day of the selected period (null for All time).
function dashSpan(p,v){if(p==="all"||!v)return null;if(p==="week"){const w=weekDays(v);return [w[0],w[6]];}
 if(p==="year")return [v+"-01-01",v+"-12-31"];const [y,m]=v.split("-").map(Number);return [v+"-01",dateISO(new Date(y,m,0))];}

// Numbers count up briefly when the dashboard is opened or the period changes.
function dashCount(el,val,fmt){if(!el)return;const from=Number(el.dataset.v),shown=!$("reports").classList.contains("hidden");el.dataset.v=String(val);
 if(dashReduce||!shown||!isFinite(from)||from===val){el.textContent=fmt(val);return;}
 const t0=performance.now(),key=String(val),step=t=>{if(el.dataset.v!==key)return;const k=Math.min(1,(t-t0)/600),q=1-Math.pow(1-k,3);el.textContent=fmt(from+(val-from)*q);if(k<1)requestAnimationFrame(step);};requestAnimationFrame(step);}

function renderDashboard(){
 const p=$("period")?.value||"month",v=$("periodValue")?.value||"",s=dashStats(p,v);
 dashCount($("rIncome"),s.rev,euro);dashCount($("rExpenses"),s.exp,euro);dashCount($("rProfit"),s.net,euro);dashCount($("rCollected"),s.col,euro);dashCount($("rUnpaid"),s.out,euro);
 $("rProfit").classList.toggle("neg",s.net<0);
 $("rHours").textContent=fmtH(s.hours)+" h";$("rCount").textContent=String(s.lessons);$("rStudents").textContent=String(s.students);$("rAvg").textContent=s.hours>0?euro(s.rev/s.hours):"–";
 dashInsights(p,v,s);dashDonut(s);dashWeeks();dashHealth(p,v,s);dashHeat(p,v);}

function dashInsights(p,v,cur){
 const out=[],pv=dashPrev(p,v),sp=dashSpan(p,v),today=dateISO(new Date()),soFar=sp&&today>=sp[0]&&today<=sp[1]?" so far":"",name={week:"last week",month:"last month",year:"last year"}[p];
 if(pv){const pr=dashStats(p,pv),ch=(a,b)=>b>0?Math.round((a-b)/b*100):null,add=(cls,txt)=>out.push([cls,txt]);
  const r=ch(cur.rev,pr.rev);if(r)add(r>0?"good":"warn",`Revenue${soFar} is ${r>0?"up":"down"} ${Math.abs(r)}% compared with ${name} (${euro(cur.rev)} vs ${euro(pr.rev)}).`);
  const f=ch(cur.cats[0],pr.cats[0]);if(f)add(f>0?"warn":"good",`Fuel costs${soFar} are ${f>0?"higher":"lower"} than ${name} (${euro(cur.cats[0])} vs ${euro(pr.cats[0])}).`);
  const h=ch(cur.hours,pr.hours);if(h)add(h>0?"good":"warn",`Completed lesson hours${soFar} ${h>0?"increased":"decreased"} by ${Math.abs(h)}% (${fmtH(cur.hours)} h vs ${fmtH(pr.hours)} h).`);}
 if(cur.out>0)add2("warn",`${euro(cur.out)} from this period is still outstanding.`);
 const owing=state.students.map(x=>studentStats(x).unpaid).filter(x=>x>0);if(owing.length)add2("info",`${owing.length} student${owing.length===1?" has":"s have"} money outstanding in total (${euro(owing.reduce((a,x)=>a+x,0))}).`);
 function add2(c,t){out.push([c,t]);}
 if(!out.length)out.push(["info",p==="all"?"Choose a week, month or year to compare it with the period before.":"Not enough data yet to compare with the period before."]);
 $("insightList").innerHTML=out.map(([c,t])=>`<li class="${c}">${esc(t)}</li>`).join("");}

function dashDonut(s){
 const total=s.cats.reduce((a,x)=>a+x,0);$("donutBox").classList.toggle("hidden",!(total>0));if(!(total>0))return;
 let off=25,arcs="";s.cats.forEach((x,i)=>{if(x<=0)return;const pct=x/total*100;arcs+=`<circle r="15.9155" cx="21" cy="21" class="donutseg dc${i}" stroke-dasharray="${pct.toFixed(3)} ${(100-pct).toFixed(3)}" stroke-dashoffset="${off.toFixed(3)}" data-cat="${i}"></circle>`;off-=pct;});
 $("donutSvg").innerHTML=`<circle r="15.9155" cx="21" cy="21" class="donuttrack"></circle>${arcs}`;
 $("donutLegend").innerHTML=s.cats.map((x,i)=>`<button type="button" class="donutleg" data-cat="${i}"><i class="swatch dc${i}"></i><span>${DASH_CATS[i]}</span><b>${euro(x)}</b><small>${total?Math.round(x/total*100):0}%</small></button>`).join("");
 const say=i=>{$("donutCenter").innerHTML=i==null?`<small>Total</small><b>${euro(total)}</b>`:`<small>${esc(DASH_CATS[i])}</small><b>${euro(s.cats[i])}</b><small>${Math.round(s.cats[i]/total*100)}%</small>`;document.querySelectorAll("#donutBox [data-cat]").forEach(el=>el.classList.toggle("sel",i!=null&&Number(el.dataset.cat)===i));};
 say(null);document.querySelectorAll("#donutBox [data-cat]").forEach(el=>el.onclick=()=>say(Number(el.dataset.cat)));}

// Completed lesson hours for each of the last 8 weeks (Monday to Sunday).
function dashWeeks(){
 const n=new Date(),rows=[];for(let i=7;i>=0;i--){const w=weekDays(dateISO(new Date(n.getFullYear(),n.getMonth(),n.getDate()-7*i))),L=state.entries.filter(e=>e.type==="Lesson"&&isDone(e)&&e.date>=w[0]&&e.date<=w[6]);rows.push({from:w[0],h:L.reduce((a,e)=>a+hours(e),0),n:L.length});}
 const top=Math.max(...rows.map(r=>r.h));$("weekBox").classList.toggle("hidden",!(top>0));if(!(top>0))return;
 const W=360,H=130,B=20,T=14,slot=W/rows.length,bw=Math.min(22,slot-12),y=h=>T+(H-T-B)*(1-h/top);
 $("weekSvg").innerHTML=rows.map((r,i)=>{const x=slot*i+(slot-bw)/2,t=y(r.h),d=new Date(r.from+"T12:00:00");return `${r.h>0?`<rect x="${x}" y="${t}" width="${bw}" height="${Math.max(2,H-B-t)}" rx="5" class="weekbar${i===rows.length-1?" now":""}"></rect><text x="${x+bw/2}" y="${t-4}" text-anchor="middle" class="charttick">${fmtH(r.h)}</text>`:""}<text x="${x+bw/2}" y="${H-6}" text-anchor="middle" class="charttick">${d.getDate()}/${d.getMonth()+1}</text><rect x="${slot*i}" y="0" width="${slot}" height="${H}" class="charthit" data-week="${i}"></rect>`;}).join("");
 const say=r=>{$("weekReadout").innerHTML=`<b>Week of ${esc(fmtDate(r.from))}</b> · ${fmtH(r.h)} h · ${r.n} completed lesson${r.n===1?"":"s"}`;};say(rows.at(-1));
 document.querySelectorAll("[data-week]").forEach(el=>el.onclick=()=>say(rows[el.dataset.week]));}

function dashHealth(p,v,s){
 const NA="Insufficient data",pv=dashPrev(p,v),pr=pv?dashStats(p,pv):null,items=[];
 items.push(["Profit margin",s.rev>0?Math.round(s.net/s.rev*100)+"%":NA,"Net profit ÷ revenue × 100",s.rev>0?(s.net>=0?"good":"warn"):""]);
 items.push(["Collection ratio",s.col+s.out>0?Math.round(s.col/(s.col+s.out)*100)+"%":NA,"Collected ÷ (collected + outstanding) × 100",s.col+s.out>0?(s.out>0?"warn":"good"):""]);
 const tr=pr&&pr.rev>0?Math.round((s.rev-pr.rev)/pr.rev*100):null;items.push(["Revenue trend",tr==null?NA:(tr>0?"+":"")+tr+"%","Revenue compared with the period before",tr==null?"":tr>=0?"good":"warn"]);
 let util=NA,how="Completed lesson hours ÷ available working hours";const sp=dashSpan(p,v),today=dateISO(new Date());
 if(sp&&state.work){const w=workCfg(),day=(toMin(w.end)-toMin(w.start))/60,last=sp[1]<today?sp[1]:today;let days=0;if(last>=sp[0])days=Math.round((new Date(last+"T12:00:00")-new Date(sp[0]+"T12:00:00"))/864e5)+1;
  if(day>0&&days>0){util=Math.round(s.hours/(day*days)*100)+"%";how=`Completed lesson hours ÷ (${fmtH(day)} working hours × ${days} day${days===1?"":"s"}; every day counted)`;}}
 else if(sp&&!state.work)how="Set your working hours in Calendar to see this";
 items.push(["Schedule utilisation",util,how,""]);
 $("healthGrid").innerHTML=items.map(([k,val,f,c])=>`<div class="healthitem ${c}${val===NA?" na":""}"><span>${k}</span><b>${esc(val)}</b><small>${esc(f)}</small></div>`).join("");}

// Monthly financial calendar (Reports only; the Calendar tab is unchanged).
function dashHeat(p,v){
 if(!dashMonth||dashPrevTab!==p+"|"+v){dashMonth=p==="month"&&v?v:dateISO(new Date()).slice(0,7);dashPrevTab=p+"|"+v;dashDay=null;}
 const [y,m]=dashMonth.split("-").map(Number),first=new Date(y,m-1,1),days=new Date(y,m,0).getDate(),lead=(first.getDay()+6)%7,info={};
 for(const e of state.entries){if(!e.date.startsWith(dashMonth)||isBooking(e))continue;const d=info[e.date]||={n:0,h:0,rev:0,exp:0};if(e.type==="Lesson"){d.n++;d.h+=hours(e);d.rev+=income(e);}else d.exp+=Number(e.cost||0);}
 $("heatTitle").textContent=first.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
 let html=["M","T","W","T","F","S","S"].map(x=>`<span class="heatwd">${x}</span>`).join("")+"<span></span>".repeat(lead);
 for(let i=1;i<=days;i++){const iso=`${dashMonth}-${String(i).padStart(2,"0")}`,d=info[iso],lvl=!d||!d.h?0:d.h<=1?1:d.h<=3?2:3;html+=`<button type="button" class="heatday h${lvl}${iso===dashDay?" sel":""}" data-heat="${iso}" aria-label="${esc(fmtDate(iso))}"><span>${i}</span><i>${d&&d.rev>0?'<em class="hrev"></em>':""}${d&&d.exp>0?'<em class="hexp"></em>':""}</i></button>`;}
 $("heatGrid").innerHTML=html;
 const say=iso=>{const d=info[iso]||{n:0,h:0,rev:0,exp:0};$("heatDetail").innerHTML=`<b>${esc(fmtDate(iso))}</b><div class="heatstats"><span>Lessons<b>${d.n}</b></span><span>Hours<b>${fmtH(d.h)}</b></span><span>Revenue<b>${euro(d.rev)}</b></span><span>Expenses<b>${euro(d.exp)}</b></span><span>Net<b>${euro(d.rev-d.exp)}</b></span></div>`;};
 if(dashDay&&dashDay.startsWith(dashMonth))say(dashDay);else $("heatDetail").innerHTML=`<small class="muted">Tap a day to see its lessons, revenue and expenses.</small>`;
 document.querySelectorAll("[data-heat]").forEach(el=>el.onclick=()=>{dashDay=el.dataset.heat;document.querySelectorAll("[data-heat]").forEach(x=>x.classList.toggle("sel",x===el));say(dashDay);});}
function dashHeatMove(k){const [y,m]=dashMonth.split("-").map(Number);dashMonth=dateISO(new Date(y,m-1+k,1)).slice(0,7);dashDay=null;dashHeat($("period").value,$("periodValue").value);}

// Exports. The CSV and the shared summary contain business totals only, never student names or contact details.
function dashLabel(){const p=$("period").value;return p==="all"?"All time":$("periodValue").selectedOptions[0]?.textContent||"";}
function dashCsv(){const p=$("period").value,v=$("periodValue").value,s=dashStats(p,v),rows=[["Section","Item","Value"],["Period","Report",dashLabel()],
 ["Results","Revenue (earned)",s.rev],["Results","Expenses",s.exp],["Results","Net profit",s.net],["Results","Collected",s.col],["Results","Outstanding",s.out],
 ["Activity","Completed lessons",s.lessons],["Activity","Driving hours",dashRound(s.hours)],["Activity","Active students",s.students],
 ...DASH_CATS.map((c,i)=>["Expenses by category",c,s.cats[i]]),...monthRows(12).map(r=>["Monthly",r.long,`Revenue ${dashRound(r.income)} / Expenses ${dashRound(r.expenses)} / Net ${dashRound(r.profit)}`])];
 download(`DrivingLogPro_Report_${dashLabel().replace(/[^\w-]+/g,"_")}.csv`,"﻿"+rows.map(r=>r.map(csvCell).join(",")).join("\r\n"),"text/csv;charset=utf-8");}
function dashSummaryText(){const s=dashStats($("period").value,$("periodValue").value);
 return `Driving Log Pro · ${dashLabel()}\nRevenue: ${euro(s.rev)}\nExpenses: ${euro(s.exp)}\nNet profit: ${euro(s.net)}\nCollected: ${euro(s.col)}\nOutstanding: ${euro(s.out)}\nCompleted lessons: ${s.lessons} · ${fmtH(s.hours)} h`;}
async function dashShare(){const text=dashSummaryText();try{if(navigator.share){await navigator.share({title:"Business summary",text});return;}}catch(err){if(err&&err.name==="AbortError")return;}
 try{await navigator.clipboard.writeText(text);toast("Summary copied");}catch{toast("Sharing is not available here");}}
// Extra PDF section: expense breakdown and the last 6 months.
function dashPdfExtra(cur,y,p,v,c){const s=dashStats(p,v),total=s.cats.reduce((a,x)=>a+x,0);
 cur.push({x:40,y,text:"Expenses by category",size:10,bold:true,color:c.NAVY},{x:300,y,text:"Revenue trend · last 6 months",size:10,bold:true,color:c.NAVY});let yl=y-15,yr=y-15;
 DASH_CATS.forEach((k,i)=>{cur.push({x:40,y:yl,text:k,size:8.5,color:c.NAVY},{x:190,y:yl,text:c.m(s.cats[i])+" EUR"+(total?"  ("+Math.round(s.cats[i]/total*100)+"%)":""),size:8.5,color:c.NAVY});yl-=13;});
 monthRows(6).forEach(r=>{cur.push({x:300,y:yr,text:r.long,size:8.5,color:c.NAVY},{x:400,y:yr,text:`${c.m(r.income)} / ${c.m(r.expenses)} / ${c.m(r.profit)}`,size:8.5,color:c.NAVY});yr-=13;});
 cur.push({x:300,y:yr,text:"Revenue / Expenses / Net (EUR)",size:7.5,color:c.GREY});return Math.min(yl,yr-13)-14;}

$("dashCsv").onclick=dashCsv;$("dashShare").onclick=dashShare;$("dashPrint").onclick=()=>window.print();
$("heatPrev").onclick=()=>dashHeatMove(-1);$("heatNext").onclick=()=>dashHeatMove(1);
document.querySelectorAll("[data-range]").forEach(b=>b.onclick=()=>{dashRange=b.dataset.range;document.querySelectorAll("[data-range]").forEach(x=>x.classList.toggle("active",x===b));renderChart();});
// Opening Reports counts the main figures up from zero.
document.querySelector('.tab[data-tab="reports"]')?.addEventListener("click",()=>{["rIncome","rExpenses","rProfit","rCollected","rUnpaid"].forEach(id=>{$(id).dataset.v="0";});setTimeout(renderDashboard,30);});
renderDashboard();
