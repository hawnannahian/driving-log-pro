const CACHE="nahians-schedule-cache-v37";
const FILES=["./","./index.html","./styles.css","./app.js","./full-time-students.js","./prayer-times.js","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(FILES.map(file=>new Request(file,{cache:"reload"}))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

// Always check the network first for page navigations so users receive the
// latest dashboard branding and app shell. Fall back to the cached page offline.
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET"||new URL(request.url).origin!==location.origin)return;

  if(request.mode==="navigate"){
    event.respondWith(
      fetch(request)
        .then(response=>{
          if(response.ok){
            const copy=response.clone();
            event.waitUntil(caches.open(CACHE).then(cache=>cache.put("./index.html",copy)));
          }
          return response;
        })
        .catch(async()=>{
          const cache=await caches.open(CACHE);
          return (await cache.match(request,{ignoreSearch:true}))||cache.match("./index.html");
        })
    );
    return;
  }

  // Network-first for the app shell too (not just navigations), so a fixed app.js/styles.css
  // is picked up on the very next successful load instead of waiting for the old cached copy
  // to expire on its own. Falls back to the cache when offline.
  event.respondWith(
    fetch(request)
      .then(response=>{
        if(response.ok){
          const copy=response.clone();
          event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));
        }
        return response;
      })
      .catch(async()=>{
        const cache=await caches.open(CACHE);
        const cached=await cache.match(request);
        if(cached)return cached;
        throw new Error("offline and not cached: "+request.url);
      })
  );
});
