const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8"),sw=fs.readFileSync(__dirname+"/../sw.js","utf8"),html=fs.readFileSync(__dirname+"/../index.html","utf8");
test("v1.110: the three recorded timer voices exist, are small and are cached offline",()=>{
  for(const f of ["timer-start.mp3","timer-warning.mp3","timer-end.mp3"]){assert.ok(fs.existsSync(__dirname+"/../"+f),f);assert.ok(fs.statSync(__dirname+"/../"+f).size<200000,f+" small");assert.ok(sw.includes('"./'+f+'"'),f+" in sw AUDIO list");}
});
test("v1.110: start / 50 min / 55 min use cue 1 / 2 / 3 and keep the old timer logic",()=>{
  assert.match(app,/TIMER_CUES=\{start:"timer-start\.mp3",warn:"timer-warning\.mp3",end:"timer-end\.mp3"\}/);
  assert.match(app,/el>=50\*60000&&!timer\.spoken50\)\{timer\.spoken50=true;timerSave\(\);playCue\("warn",/);
  assert.match(app,/timerSave\(\);playCue\("end",[^)]*\);timer=null;/);
  assert.match(app,/renderNext\(\);bindRecords\(\);playCue\("start",/);
  assert.match(app,/if\(el>=55\*60000\)\{finishTimerAt55\(\);return;\}/);
});
test("v1.110: Web Audio playback, the on/off switch, speech fallback; settings text updated",()=>{
  const fn=app.match(/async function playCue\(name,fallback\)\{[^\n]*\}/)[0];
  assert.ok(fn.includes("if(!voiceOn())return;")&&fn.includes("createBufferSource")&&fn.includes("catch{if(fallback)speakBn(fallback);}"));
  assert.ok(html.includes("Play your recorded voice")&&html.includes("Test the 3 voices"));
});
test("v1.125: iPhone fix — audio session is playback, the Start tap unlocks audio, a stuck context falls back to speech",()=>{
  assert.match(app,/navigator\.audioSession\)navigator\.audioSession\.type="playback"/);
  assert.match(app,/function unlockAudio\(\)\{[^\n]*createBuffer\(1,1,22050\)/);
  assert.match(app,/function beginLessonTimer\(id\)\{[^\n]*try\{unlockAudio\(\);\}catch\{\}/);
  assert.match(app,/if\(audioCtx\.state!=="running"\)throw Error\("suspended"\)/,"a context that never starts must reach the catch (speech fallback), not stay silent");
});
