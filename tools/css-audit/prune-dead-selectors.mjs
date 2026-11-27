import fs from "node:fs";import path from "node:path";
const root=process.argv[2],out=process.argv[3];
const css=fs.readFileSync(path.join(root,"styles.css"),"utf8");
const srcFiles=fs.readdirSync(root).filter(f=>/\.(js|html)$/.test(f)&&f!=="styles.css");
const src=srcFiles.map(f=>fs.readFileSync(path.join(root,f),"utf8")).join("\n");
// dynamic prefixes: any quoted/template word followed by a concatenation, e.g. "av"+n, "cal-"+x, `dc${n}`
const dyn=new Set();for(const m of src.matchAll(/["'`]([\w-]{2,})["'`]\s*\+|([\w-]{2,})\$\{|\+\s*["'`]([\w-]{2,})["'`]/g)){const p=m[1]||m[2]||m[3];if(p)dyn.add(p);}
const alive=t=>src.includes(t)||[...dyn].some(p=>t.startsWith(p));
// tokenizer -> rules
function parse(text){let i=0;const n=text.length;
 function block(){const items=[];while(i<n){skipWs();if(i>=n||text[i]==="}")break;
  if(text.startsWith("/*",i)){const e=text.indexOf("*/",i+2);items.push({t:"raw",s:text.slice(i,e+2)});i=e+2;continue;}
  let j=i,depth=0,q=null;while(j<n){const c=text[j];if(q){if(c==="\\")j++;else if(c===q)q=null;}else if(c==='"'||c==="'")q=c;else if(c==="("||c==="[")depth++;else if(c===")"||c==="]")depth--;else if((c==="{"||c===";")&&depth===0)break;j++;}
  const head=text.slice(i,j);
  if(text[j]===";"){items.push({t:"raw",s:head+";"});i=j+1;continue;}
  i=j+1;// after {
  if(/^\s*@(media|supports|layer|container)/.test(head)){const inner=block();i++;items.push({t:"at",head,items:inner});}
  else if(/^\s*@/.test(head)){// keyframes/font-face/etc: copy verbatim
   let d=1,k=i;let q2=null;while(k<n&&d>0){const c=text[k];if(q2){if(c==="\\")k++;else if(c===q2)q2=null;}else if(c==='"'||c==="'")q2=c;else if(c==="{")d++;else if(c==="}")d--;k++;}
   items.push({t:"raw",s:head+"{"+text.slice(i,k)});i=k;}
  else{let k=i,q2=null,d=0;while(k<n){const c=text[k];if(q2){if(c==="\\")k++;else if(c===q2)q2=null;}else if(c==='"'||c==="'")q2=c;else if(c==="(")d++;else if(c===")")d--;else if(c==="}"&&d<=0)break;k++;}
   items.push({t:"rule",sel:head,body:text.slice(i,k)});i=k+1;}
 }return items;}
 function skipWs(){while(i<n&&/\s/.test(text[i]))i++;}
 return block();}
const splitSel=s=>{const out=[];let d=0,b=0,cur="";for(const c of s){if(c==="(")d++;else if(c===")")d--;else if(c==="[")b++;else if(c==="]")b--;if(c===","&&d===0&&b===0){out.push(cur);cur="";}else cur+=c;}out.push(cur);return out;};
const tokensOf=sel=>{let s=sel.replace(/\[[^\]]*\]/g,"").replace(/:[\w-]+\((?:[^()]|\([^()]*\))*\)/g,"");return [...s.matchAll(/([.#])(-?[A-Za-z_][\w-]*)/g)].map(m=>m[2]);};
let removedSel=0,removedRules=0;const RESTORE=new Set((process.env.RESTORE||"").split(",").filter(Boolean).map(Number));let selId=0;const removedList=[];
function prune(items){const res=[];for(const it of items){
 if(it.t==="rule"){const sels=splitSel(it.sel).filter(s=>{let dead=tokensOf(s).some(t=>!alive(t));if(dead){const id=selId++;removedList.push(s.trim());if(RESTORE.has(id))dead=false;else removedSel++;}return !dead;});if(!sels.length){removedRules++;continue;}res.push({...it,sel:sels.join(",")});}
 else if(it.t==="at"){const inner=prune(it.items);if(inner.some(x=>x.t==="rule"||x.t==="at"||x.t==="raw"&&!x.s.startsWith("/*")))res.push({...it,items:inner});else removedRules++;}
 else res.push(it);}return res;}
const ser=items=>items.map(it=>it.t==="raw"?it.s:it.t==="at"?it.head+"{"+ser(it.items)+"}":it.sel.trim()+"{"+it.body+"}").join("\n");
const tree=parse(css);const pr=prune(tree);const res=ser(pr);
fs.writeFileSync(out,res);
console.log(JSON.stringify({before:css.length,after:res.length,removedSelectors:removedSel,removedRules,dynamicPrefixes:[...dyn].slice(0,12)}));

fs.writeFileSync(out+".list.json",JSON.stringify(removedList));
