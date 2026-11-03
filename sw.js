const CACHE="driving-log-pro-cache-v15";
const FILES=["./","./index.html","./styles.css","./app.js","./prayer-times.js","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Show the saved copy at once (works offline), and refresh it in the background so updates arrive on the next open.
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:e.request.mode==="navigate"});
    const update=fetch(e.request).then(res=>{if(res.ok)c.put(e.request,res.clone());return res;});
    if(hit){e.waitUntil(update.catch(()=>{}));return hit;}
    return update.catch(async err=>{if(e.request.mode==="navigate")return c.match("./index.html");throw err;});
  }));
});
