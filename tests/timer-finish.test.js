const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8");
test("v1.137: finishing at 55 minutes records the moment the 55 active minutes ended, not the moment the app was reopened",()=>{
  assert.match(app,/function finishTimerAt55\(\)\{if\(!timer\|\|timer\.completed\)return;const n=timer\.n\|\|1,idx=timer\.idx\|\|1,endAt=timer\.runFrom\?Math\.min\(Date\.now\(\),timer\.runFrom\+55\*6e4-timer\.elapsed\):Date\.now\(\);/);
  assert.match(app,/end:hhmm\(new Date\(endAt\)\),session:t\.session/);
  assert.doesNotMatch(app,/completeLesson\(t\.lessonId,\{min:55,start:t\.startText,end:hhmm\(new Date\(\)\)/,"the old 'end = now' call is gone");
});
test("v1.140: a 2 h / 3 h booking chains 55-minute sessions automatically and completes the booking once, after the last",()=>{
  assert.match(app,/n:Math\.max\(1,Math\.floor\(schedMin\(e\)\/60\)\),idx:1,sessions:\[\]/);
  assert.match(app,/if\(idx<n\)\{[^\n]*t\.idx=idx\+1;[^\n]*t\.runFrom=endAt;[^\n]*chainAnnounce\(idx,/);
  assert.match(app,/The \$\{a\} hour is completed\. The \$\{b\} hour has started\./);
  assert.match(app,/sessions:all\.length>1\?all:null/);
  assert.match(app,/if\(o\.sessions\)e\.sessions=o\.sessions/);
  assert.ok((app.match(/completeLesson\(t\.lessonId/g)||[]).length===2,"only the last session and the manual End complete the booking");
});
