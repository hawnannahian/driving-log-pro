"use strict";
// Islamic Companion tab (loaded after app.js; content is in islamic-content.js).
// Saved data lives in state.islamic so JSON backup, restore and Cloud sync carry it:
//   {v:1, fav:[dua ids], tasbih:{dhikr id:{n:count, t:target (0 = none)}}, tz:selected dhikr id}
// Reading preferences (text size, reading mode) are per device, in localStorage DB_KEY+"-islamic-prefs".
// Audio: there is one audio element in the app (#duaAudio, also used by the Overview Travel Dua player),
// so the Overview player and this tab can never play two recordings at once.
const IS_PREF_KEY=DB_KEY+"-islamic-prefs",IS_SIZES=[0.85,1,1.15,1.3,1.5];
const IS_HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
const IS_PLAY='<svg viewBox="0 0 24 24" aria-hidden="true"><path class="i-play" d="M8 5.5v13l10.5-6.5z"/><path class="i-pause" d="M7.5 5h3v14h-3zM13.5 5h3v14h-3z"/></svg>';
let isCat="all",isOpenId=null,isView="duas";

function isGet(){const d=state.islamic&&typeof state.islamic==="object"?state.islamic:{};
 return {fav:[...new Set(Array.isArray(d.fav)?d.fav.filter(x=>typeof x==="string"):[])],tasbih:d.tasbih&&typeof d.tasbih==="object"?{...d.tasbih}:{},tz:typeof d.tz==="string"?d.tz:ISLAMIC_TASBIH[0].id};}
// quiet = save without redrawing the whole app (used for each Tasbih tap).
function isPut(d,quiet){state.islamic={v:1,fav:d.fav,tasbih:d.tasbih,tz:d.tz};if(quiet){writeState();scheduleSync();}else save();}
function isPrefs(){try{const p=JSON.parse(localStorage.getItem(IS_PREF_KEY))||{};return {size:Number.isInteger(p.size)?Math.min(IS_SIZES.length-1,Math.max(0,p.size)):1,dark:!!p.dark};}catch{return {size:1,dark:false};}}
function isSetPrefs(p){try{localStorage.setItem(IS_PREF_KEY,JSON.stringify(p));}catch{}}
const isClock=s=>{s=Math.max(0,Math.floor(Number(s)||0));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");};
const isDua=id=>ISLAMIC_DUAS.find(x=>x.id===id);
const isTag=x=>`<em class="istag ${x.kind}">${x.kind==="quran"?"কুরআন":"হাদিস"}</em>`;

function isListHTML(){
 const d=isGet(),list=ISLAMIC_DUAS.filter(x=>isCat==="all"||(isCat==="fav"?d.fav.includes(x.id):x.tags.includes(isCat)));
 if(!list.length)return `<p class="emptynote">${isCat==="fav"?"No favourites yet. Tap ♡ on a dua to keep it here.":"Nothing in this category yet."}</p>`;
 return list.map(x=>{const fav=d.fav.includes(x.id);return `<div class="isrow"><button type="button" class="isrowmain" data-isopen="${x.id}"><span class="isico" aria-hidden="true">${x.icon}</span><span class="istxt"><b>${esc(x.bn)}</b><small>${isTag(x)}${esc(x.en)} · ${esc(x.refEn)}</small></span></button>
  <span class="isside">${x.audio?`<button type="button" class="isplay" data-isplay="${x.id}" aria-label="Play ${esc(x.en)}">${IS_PLAY}</button><small class="isdur">${isClock(x.audioLen)}</small>`:`<small class="isnoaudio">No audio yet</small>`}</span>
  <button type="button" class="isfav${fav?" on":""}" data-isfav="${x.id}" aria-pressed="${fav}" aria-label="${fav?"Remove from":"Add to"} Favorites">${IS_HEART}</button></div>`;}).join("");}

function isDetailHTML(x){
 const d=isGet(),fav=d.fav.includes(x.id),parts=x.parts||[{ar:x.ar,pr:x.pr,mbn:x.mbn,men:x.men}];
 return `<div class="isdhead"><button type="button" class="isback" data-isback>‹ সব দোয়া</button><div class="istools"><button type="button" data-issize="-1" aria-label="Smaller text">A−</button><button type="button" data-issize="1" aria-label="Larger text">A+</button><button type="button" data-isdark aria-label="Reading mode" aria-pressed="${isPrefs().dark}">🌙</button><button type="button" class="isfav${fav?" on":""}" data-isfav="${x.id}" aria-pressed="${fav}" aria-label="${fav?"Remove from":"Add to"} Favorites">${IS_HEART}</button></div></div>
 <article class="isdcard"><h2>${esc(x.bn)}</h2><p class="isen">${esc(x.en)}</p>
 ${parts.map(p=>`${p.title?`<h3 class="ispart">${esc(p.title)}</h3>`:""}<div class="isarabic" lang="ar" dir="rtl">${esc(p.ar)}</div><div class="issec"><b>বাংলা উচ্চারণ</b><p>${esc(p.pr)}</p></div><div class="issec"><b>বাংলা অর্থ (ভাবানুবাদ)</b><p>${esc(p.mbn)}</p></div><div class="issec" lang="en"><b>English meaning</b><p>${esc(p.men)}</p></div>`).join("")}
 ${x.note?`<p class="isnote">${esc(x.note)}</p>`:""}<div class="issrc">${isTag(x)}<span>${esc(x.ref)}${x.grade?" · "+esc(x.grade):""}${x.reciter?" · তিলাওয়াত: "+esc(x.reciter):""}</span></div></article>
 ${x.audio?`<div class="isplayer"><div class="isprow"><button type="button" class="isskip" data-isskip="-10" aria-label="Back 10 seconds">−10</button><button type="button" class="isplay big" data-isplay="${x.id}" aria-label="Play">${IS_PLAY}</button><button type="button" class="isskip" data-isskip="10" aria-label="Forward 10 seconds">+10</button><button type="button" class="isskip" data-isreplay="${x.id}" aria-label="Play again from the start">↺</button><small>${esc(x.audioSrc||"Arabic recitation")} · offline</small></div>
  <input type="range" class="isseek" data-isseek min="0" max="100" step="0.1" value="0" aria-label="Playback position"><div class="istime"><span data-iscur>0:00</span><span>${isClock(x.audioLen)}</span></div>${x.audioNote?`<p class="isaudionote">${esc(x.audioNote)}</p>`:""}</div>`
 :`<p class="isnoaudiobox">এই দোয়ার কোনো যাচাই করা রেকর্ডিং এখনো app-এ নেই।</p>`}`;}

function isTasbihHTML(){
 const d=isGet(),cur=ISLAMIC_TASBIH.find(t=>t.id===d.tz)||ISLAMIC_TASBIH[0];
 return `<div class="tzchips" role="group" aria-label="Dhikr">${ISLAMIC_TASBIH.map(t=>`<button type="button" data-tz="${t.id}" class="${t.id===cur.id?"active":""}"><span lang="ar">${esc(t.ar)}</span><small>${esc(t.bn)}</small></button>`).join("")}</div>
 <div class="tzwrap"><button type="button" class="tzcount" id="tzTap" aria-label="Count ${esc(cur.en)}"><span class="tzring" id="tzRing"></span><span class="tzinner"><span class="tzar" lang="ar">${esc(cur.ar)}</span><b id="tzN">0</b><small id="tzOf"></small></span></button></div>
 <p class="tzdone hidden" id="tzDone">✓ Target reached</p>
 <div class="tztargets" role="group" aria-label="Target">${[33,100].map(n=>`<button type="button" data-tzt="${n}">${n}</button>`).join("")}<button type="button" data-tzt="custom">Custom</button><button type="button" data-tzt="0">No target</button></div>
 <button type="button" class="btn ghost tzreset" id="tzReset">Reset ${esc(cur.en)}</button><p class="isnote">Each dhikr keeps its own count on this device and in your backups.</p>`;}

function isTzState(){const d=isGet(),cur=ISLAMIC_TASBIH.find(t=>t.id===d.tz)||ISLAMIC_TASBIH[0],c=d.tasbih[cur.id]||{};return {d,cur,n:Number(c.n)||0,t:c.t==null?cur.target:Math.max(0,Number(c.t)||0)};}
function isTzPaint(){const {n,t}=isTzState();if(!$("tzN"))return;$("tzN").textContent=String(n);$("tzOf").textContent=t?`of ${t}`:"tap to count";$("tzRing").style.setProperty("--p",t?String(Math.min(1,n/t)*360)+"deg":"0deg");$("tzDone").classList.toggle("hidden",!(t&&n>=t));
 document.querySelectorAll("[data-tzt]").forEach(b=>b.classList.toggle("active",b.dataset.tzt==="custom"?!!t&&t!==33&&t!==100:Number(b.dataset.tzt)===t));}
function isTzSet(fn,quiet){const {d,cur}=isTzState(),c={...(d.tasbih[cur.id]||{})};if(c.t==null)c.t=cur.target;fn(c);d.tasbih[cur.id]=c;isPut(d,quiet);if(quiet)isTzPaint();}

function renderIslamic(){
 if(!$("islamic"))return;const p=isPrefs(),x=isOpenId&&isDua(isOpenId);
 document.querySelectorAll("[data-isview]").forEach(b=>{const on=b.dataset.isview===isView;b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on));});
 $("isDuas").classList.toggle("hidden",isView!=="duas"||!!x);$("isDetail").classList.toggle("hidden",isView!=="duas"||!x);$("isTasbih").classList.toggle("hidden",isView!=="tasbih");
 document.querySelectorAll("[data-iscat]").forEach(b=>b.classList.toggle("active",b.dataset.iscat===isCat));
 if(isView==="duas"&&!x)$("isList").innerHTML=isListHTML();
 if(isView==="duas"&&x){$("isDetail").innerHTML=isDetailHTML(x);$("isDetail").style.setProperty("--isz",String(IS_SIZES[p.size]));$("isDetail").classList.toggle("isdark",p.dark);}
 if(isView==="tasbih"){$("isTasbih").innerHTML=isTasbihHTML();isTzPaint();}
 isSyncAudio();}

function isOpen(id){if(!isDua(id))return;isView="duas";isOpenId=id;renderIslamic();window.scrollTo(0,0);}
function isPlayToggle(id){const x=isDua(id),a=$("duaAudio");if(!x||!x.audio||!a)return;
 if(!a.src.endsWith("/"+x.audio)){a.src=x.audio;}a.dataset.dua=id;if(a.paused)a.play().catch(()=>toast("The recording could not be played"));else a.pause();}

// Keeps every play button, the mini player and the detail player in step with the one audio element.
function isSyncAudio(){const a=$("duaAudio");if(!a)return;const id=a.dataset.dua||"vehicle",x=isDua(id),playing=!a.paused&&!a.ended,dur=isFinite(a.duration)&&a.duration>0?a.duration:(x?.audioLen||0);
 document.querySelectorAll("[data-isplay]").forEach(b=>{const on=playing&&b.dataset.isplay===id;b.classList.toggle("playing",on);b.setAttribute("aria-label",on?"Pause":"Play");});
 document.querySelectorAll("[data-isseek]").forEach(r=>{if(document.activeElement!==r)r.value=dur?String(a.currentTime/dur*100):"0";});document.querySelectorAll("[data-iscur]").forEach(s=>{s.textContent=isClock(a.currentTime);});
 const show=!!x&&!$("islamic").classList.contains("hidden")&&(playing||a.currentTime>0&&!a.ended)&&!(isOpenId===id&&isView==="duas");
 $("isMini").classList.toggle("hidden",!show);document.body.classList.toggle("is-mini-on",show);
 if(show){$("isMiniOpen").querySelector(".isico").textContent=x.icon;$("isMiniTitle").textContent=x.bn;$("isMiniTime").textContent=`${isClock(a.currentTime)} / ${isClock(dur)}`;$("isMiniBar").style.width=(dur?a.currentTime/dur*100:0)+"%";$("isMiniPlay").dataset.isplay=id;$("isMiniOpen").dataset.isopen=id;}}

// One click handler for the whole tab.
$("islamic").addEventListener("click",ev=>{const t=ev.target.closest("button");if(!t)return;const ds=t.dataset;
 if(ds.isview){isView=ds.isview;renderIslamic();return;}
 if(ds.iscat){isCat=ds.iscat;isOpenId=null;renderIslamic();return;}
 if(ds.isopen){isOpen(ds.isopen);return;}
 if("isback" in ds){isOpenId=null;renderIslamic();return;}
 if(ds.isfav){const d=isGet(),on=d.fav.includes(ds.isfav);d.fav=on?d.fav.filter(x=>x!==ds.isfav):[...d.fav,ds.isfav];isPut(d);toast(on?"Removed from Favorites":"Added to Favorites");return;}
 if(ds.isplay){isPlayToggle(ds.isplay);return;}
 if(ds.isreplay){const a=$("duaAudio");isPlayToggle(ds.isreplay);try{a.currentTime=0;}catch{}if(a.paused)a.play().catch(()=>{});return;}
 if(ds.isskip){const a=$("duaAudio");if(isFinite(a.duration))a.currentTime=Math.min(a.duration,Math.max(0,a.currentTime+Number(ds.isskip)));else try{a.currentTime=Math.max(0,a.currentTime+Number(ds.isskip));}catch{}isSyncAudio();return;}
 if(ds.issize){const p=isPrefs();p.size=Math.min(IS_SIZES.length-1,Math.max(0,p.size+Number(ds.issize)));isSetPrefs(p);renderIslamic();return;}
 if("isdark" in ds){const p=isPrefs();p.dark=!p.dark;isSetPrefs(p);renderIslamic();return;}
 if(ds.tz){const d=isGet();d.tz=ds.tz;isPut(d);return;}
 if(ds.tzt){if(ds.tzt==="custom"){const {t}=isTzState(),v=prompt("Target count",t?String(t):"");if(v===null)return;const n=Math.round(Number(v));if(!(n>0&&n<=100000)){toast("Enter a number from 1 to 100000");return;}isTzSet(c=>{c.t=n;},true);}else isTzSet(c=>{c.t=Number(ds.tzt);},true);return;}
 if(t.id==="tzTap"){const {n,t:goal}=isTzState();isTzSet(c=>{c.n=n+1;},true);try{navigator.vibrate?.(goal&&n+1===goal?[40,60,40]:12);}catch{}return;}
 if(t.id==="tzReset"){const {cur}=isTzState();if(!confirm(`Reset the ${cur.en} count to 0?`))return;isTzSet(c=>{c.n=0;},true);}});
$("islamic").addEventListener("input",ev=>{if(!ev.target.matches("[data-isseek]"))return;const a=$("duaAudio");if(isFinite(a.duration)&&a.duration>0)a.currentTime=Number(ev.target.value)/100*a.duration;});
["timeupdate","play","pause","ended","loadedmetadata","emptied"].forEach(e=>$("duaAudio").addEventListener(e,isSyncAudio));
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>setTimeout(isSyncAudio)));
// Overview Travel Dua player → open the same dua in the Islamic tab.
$("duaOpen").onclick=()=>{switchTab("islamic");isOpen($("duaAudio").dataset.dua||"vehicle");};
renderIslamic();
