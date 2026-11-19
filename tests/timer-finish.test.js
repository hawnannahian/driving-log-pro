const test=require("node:test"),assert=require("node:assert"),fs=require("fs");
const app=fs.readFileSync(__dirname+"/../app.js","utf8");
test("v1.137: finishing at 55 minutes records the moment the 55 active minutes ended, not the moment the app was reopened",()=>{
  assert.match(app,/function finishTimerAt55\(\)\{if\(!timer\|\|timer\.completed\)return;const endAt=timer\.runFrom\?Math\.min\(Date\.now\(\),timer\.runFrom\+55\*6e4-timer\.elapsed\):Date\.now\(\);/);
  assert.match(app,/completeLesson\(t\.lessonId,\{min:55,start:t\.startText,end:hhmm\(new Date\(endAt\)\),session:t\.session\}\)/);
  assert.doesNotMatch(app,/completeLesson\(t\.lessonId,\{min:55,start:t\.startText,end:hhmm\(new Date\(\)\)/,"the old 'end = now' call is gone");
});
