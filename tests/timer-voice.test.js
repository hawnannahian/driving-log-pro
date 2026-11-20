const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),sw=fs.readFileSync(__dirname+"/../sw.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8");
test("v1.110: the three recorded timer voices exist, are small and are cached offline",()=>{
  for(const f of ["timer-start.mp3","timer-warning.mp3","timer-end.mp3"]){assert.ok(fs.existsSync(__dirname+"/../"+f),f);assert.ok(fs.statSync(__dirname+"/../"+f).size<200000,f+" small");assert.ok(sw.includes('"./'+f+'"'),f+" in sw AUDIO list");}
});
test("v1.110: start / 50 min / 55 min use cue 1 / 2 / 3 and keep the old timer logic",()=>{
  assert.match(app,/TIMER_CUES=\{start:"timer-start\.mp3",warn:"timer-warning\.mp3",end:"timer-end\.mp3"\}/);
  assert.match(app,/el>=50\*60000&&!timer\.spoken50\)\{timer\.spoken50=true;timerSave\(\);playCue\("warn",/);
  assert.match(app,/timerSave\(\);if\(sessionActive\(\)\)sessFinishing=true;playCue\("end",[^)]*\);timer=null;/);
  assert.match(app,/render\(\);bindRecords\(\);sessFinishing=false;sessionPlay\(\)\.then\(ok=>\{if\(!ok\)playCue\("start",/);
  assert.match(app,/if\(el>=55\*60000\)\{finishTimerAt55\(\);return;\}/);
});
test("v1.110/v1.125: HTML audio first (ignores the iPhone silent switch), then Web Audio, then speech; on/off switch; settings text",()=>{
  const fn=app.match(/async function playCue\(name,fallback,force\)\{[^\n]*\}/)[0],web=app.match(/async function playWebCue\(name\)\{[^\n]*\}/)[0];
  assert.ok(fn.includes("if(!voiceOn()||(sessionActive()&&!force))return;")&&fn.includes("await playHtmlCue(name);return;")&&fn.includes("await playWebCue(name);")&&fn.includes("catch{if(fallback)speakBn(fallback);}"));
  assert.ok(web.includes("createBufferSource"));
  assert.ok(html.includes("Play your recorded voice")&&html.includes("Test the 3 voices"));
});

test("v1.125: iPhone fix — audio session is playback, the Start tap unlocks audio, a stuck context falls back to speech",()=>{
  assert.match(app,/navigator\.audioSession\)navigator\.audioSession\.type="playback"/);
  assert.match(app,/function unlockAudio\(\)\{[^\n]*createBuffer\(1,1,22050\)/);
  assert.match(app,/function beginLessonTimer\(id\)\{[^\n]*try\{unlockAudio\(\);\}catch\{\}/);
  assert.match(app,/if\(audioCtx\.state!=="running"\)throw Error\("suspended"\)/,"a context that never starts must reach the catch (speech fallback), not stay silent");
});
test("v1.126: one 55-minute session file keeps the cues going when the phone is locked; single cues are only the fallback",()=>{
  const sw=fs.readFileSync(__dirname+"/../sw.js","utf8");
  assert.ok(fs.existsSync(__dirname+"/../timer-session.mp3"),"session file exists");
  assert.ok(fs.statSync(__dirname+"/../timer-session.mp3").size<6e6,"session file stays small");
  assert.ok(sw.includes('"./timer-session.mp3"'),"cached for offline use");
  assert.match(app,/function sessionStop\(\)\{if\(sessFinishing\)return;/,"finishing at 55 lets the last cue play out");
  assert.match(app,/sessionPlay\(\)\.then\(ok=>\{if\(!ok\)playCue\("start"/,"Start tap starts the file; the single start cue is the fallback");
  assert.match(app,/sessionStop\(\);\}else\{timer\.runFrom=Date\.now\(\);keepAwake\(\);pushTimerSync\("schedule"\);sessionPlay\(\);\}/,"pause stops it, resume restarts at the elapsed time");
  assert.match(app,/if\(!on\)\{clearInterval\(timerTick\);timerTick=null;sessionStop\(\);return;\}/,"cancel / end / delete stop it");
});
test("v1.131: Start plays only the first voice — no 'unlock' playback of the warning / end cues, and single cues never overlap",()=>{
  assert.doesNotMatch(app,/unlockCueAudio/,"the muted play of the warning/end elements was removed");
  assert.match(app,/function unlockAudio\(\)\{const c=cueCtx\(\);c\.resume\?\.\(\);/);
  assert.match(app,/function stopSingleCues\(except\)/);
  assert.match(app,/function playHtmlCue\(name\)\{const a=cueAudio\(name\);stopSingleCues\(name\);/);
  assert.match(app,/async function sessionPlay\(fromStart\)\{if\(!timer\|\|!timer\.runFrom\|\|!voiceOn\(\)\)return false;stopSingleCues\(\);/);
});
test("v1.145: late (catch-up) timer cues are not played, so reopening the app does not sound every voice at once",()=>{
  assert.match(app,/if\(el-50\*6e4<20000\)playCue\("warn"/);
  assert.match(app,/if\(Date\.now\(\)-endAt<20000\)\{if\(sessionActive\(\)\)sessFinishing=true;playCue\("end"/);
});
