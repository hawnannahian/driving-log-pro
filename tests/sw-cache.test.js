const test=require("node:test"),assert=require("node:assert"),fs=require("fs"),path=require("path");
const root=path.join(__dirname,"..");const sw=fs.readFileSync(root+"/sw.js","utf8"),html=fs.readFileSync(root+"/index.html","utf8");
const list=name=>JSON.parse(sw.match(new RegExp("const "+name+"=(\\[[^\\]]*\\])"))[1]);
test("v1.98: every local script/style/icon the page loads is in the shell cache list",()=>{
  const FILES=[...list("FILES"),...list("AUDIO")];
  const refs=[...html.matchAll(/(?:src|href)="(?!https?:|data:|#|mailto:|tel:)([^"?#]+)"/g)].map(m=>"./"+m[1].replace(/^\.\//,""));
  for(const r of new Set(refs)){if(r==="./")continue;assert.ok(FILES.includes(r),"missing from FILES: "+r);}
  for(const f of FILES){if(f==="./")continue;assert.ok(fs.existsSync(path.join(root,f)),"file listed but missing: "+f);}
});
test("v1.98: audio files live in their own persistent cache and exist on disk",()=>{
  const AUDIO=list("AUDIO"),FILES=list("FILES");
  assert.ok(AUDIO.length>=11);for(const a of AUDIO){assert.ok(a.endsWith(".mp3"));assert.ok(fs.existsSync(path.join(root,a)),a);assert.ok(!FILES.includes(a),"audio must not be in the versioned shell list: "+a);}
  assert.match(sw,/const AUDIO_CACHE="nahians-audio-cache-v1"/);
  assert.match(sw,/key!==CACHE&&key!==AUDIO_CACHE/);
});
test("v1.98: the app opens from the cache first (no network wait) and checks for updates itself",()=>{
  const nav=sw.match(/request\.mode==="navigate"\)\{[\s\S]*?return;\n  \}/)[0];
  assert.match(nav,/if\(cached\)return cached;/);
  assert.ok(nav.indexOf("cache.match")<nav.indexOf("return fetch(request)"));
  assert.match(fs.readFileSync(root+"/app.js","utf8"),/register\("\.\/sw\.js"\)\.then\(reg=>\{reg\.update\(\)/);
});
test("v1.98: cache version is a v<number>",()=>{assert.match(sw,/^const CACHE="nahians-schedule-cache-v\d+";/);});
